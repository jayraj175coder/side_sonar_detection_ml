import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.storage.repository import scan_repository
from app.schemas.detection import PredictionResponse, BoundingBox, Detection, Location

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "SONARX"
    assert "/health" in data["health"]


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SONARX"
    assert "model_loaded" in data


def test_model_info_v2_flagship_default():
    response = client.get("/api/model")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data
    # Default model should be V2 (SIH Marine Debris Flagship)
    assert "ghost_net_aldfg" in data["classes"]
    assert "anthropogenic_debris" in data["classes"]
    assert "pipeline_hazard" in data["classes"]
    assert "seafloor_anomaly" in data["classes"]
    assert data["input_size"] == 640


def test_datasets_catalog_endpoint():
    response = client.get("/api/datasets")
    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    assert "subpipe_sss_pipeline" in data["datasets"]
    assert "sss_crab_pot_aldfg" in data["datasets"]
    assert "ai4shipwrecks" in data["datasets"]


def test_predict_empty_file():
    response = client.post(
        "/api/predict",
        files={"file": ("test.png", b"", "image/png")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_predict_with_ping_log_geotagging():
    """Verifies that companion ping log automatically extracts WGS84 coordinates and heading."""
    img = Image.new("RGB", (640, 480), color=(20, 30, 40))
    img_buf = io.BytesIO()
    img.save(img_buf, format="PNG")
    img_buf.seek(0)

    csv_content = (
        "filename,timestamp,latitude,longitude,heading,altitude_m,depth_m\n"
        "drone_track_01.png,2026-08-27T10:00:00Z,17.6868,83.2185,142.5,8.2,18.0\n"
    )

    response = client.post(
        "/api/predict",
        files={
            "file": ("drone_track_01.png", img_buf.getvalue(), "image/png"),
            "ping_log": ("ping_log.csv", csv_content.encode("utf-8"), "text/csv"),
        },
        data={
            "confidence": "0.10",
            "model_version": "v2",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["scan_id"].startswith("SCAN-")
    assert data["filename"] == "drone_track_01.png"
    assert data["location"]["latitude"] == 17.6868
    assert data["location"]["longitude"] == 83.2185
    assert data["location"]["heading"] == 142.5
    assert data["geotag_source"] == "ping_log"


def test_predict_fallback_to_manual_geotagging():
    """Verifies fallback to manual lat/lon when no ping log is provided or no match found."""
    img = Image.new("RGB", (640, 480), color=(20, 30, 40))
    img_buf = io.BytesIO()
    img.save(img_buf, format="PNG")
    img_buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("manual_track.png", img_buf.getvalue(), "image/png")},
        data={
            "confidence": "0.15",
            "latitude": "9.9312",
            "longitude": "76.2673",
            "model_version": "v2",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["location"]["latitude"] == 9.9312
    assert data["location"]["longitude"] == 76.2673
    assert data["geotag_source"] == "manual"


def test_predict_noise_filtering_toggle():
    """Verifies that noise_filtering_enabled flag is respected and returned in response."""
    img = Image.new("RGB", (640, 480), color=(20, 30, 40))
    img_buf = io.BytesIO()
    img.save(img_buf, format="PNG")
    img_buf.seek(0)

    # Test with noise filtering enabled
    response_on = client.post(
        "/api/predict",
        files={"file": ("swath_filtered.png", img_buf.getvalue(), "image/png")},
        data={
            "confidence": "0.05",
            "noise_filtering_enabled": "true",
        },
    )
    assert response_on.status_code == 200
    assert response_on.json()["noise_filtering_applied"] is True

    # Test with noise filtering disabled
    response_off = client.post(
        "/api/predict",
        files={"file": ("swath_unfiltered.png", img_buf.getvalue(), "image/png")},
        data={
            "confidence": "0.05",
            "noise_filtering_enabled": "false",
        },
    )
    assert response_off.status_code == 200
    assert response_off.json()["noise_filtering_applied"] is False


def test_predict_legacy_baseline_model_switch():
    """Verifies switching to legacy reference baseline model."""
    img = Image.new("RGB", (640, 480), color=(20, 30, 40))
    img_buf = io.BytesIO()
    img.save(img_buf, format="PNG")
    img_buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("legacy_test.png", img_buf.getvalue(), "image/png")},
        data={
            "confidence": "0.20",
            "model_version": "baseline",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["model_version"] == "baseline"


def test_scan_repository_and_moes_report_workflow():
    sample_scan = PredictionResponse(
        scan_id="SCAN-TEST-MOES-01",
        filename="test_acoustic_swath.png",
        model_name="YOLOv8n-SIH-Marine-Debris-V2",
        model_version="v2",
        image_width=800,
        image_height=600,
        inference_ms=10.2,
        detections=[
            Detection(
                id="det_1",
                type="ghost_net_aldfg",
                confidence=0.88,
                bbox=BoundingBox(x1=100, y1=150, x2=250, y2=300),
                confidence_tier="HIGH",
                noise_filter_passed=True,
                noise_filter_reason="Passed acoustic geometry and shadow verification",
            ),
        ],
        location=Location(latitude=17.6868, longitude=83.2185, heading=120.0),
        created_at="2026-08-27T12:00:00Z",
        confidence_threshold=0.25,
        total_detections=1,
        false_positives_suppressed=0,
        noise_filtering_applied=True,
        geotag_source="ping_log",
        ghost_net_count=1,
        highest_confidence=0.88,
        status="completed",
    )

    # Save
    scan_repository.save(sample_scan)

    # Get
    fetched = scan_repository.get("SCAN-TEST-MOES-01")
    assert fetched is not None
    assert fetched.filename == "test_acoustic_swath.png"
    assert fetched.location.heading == 120.0

    # Report
    report_res = client.get("/api/scans/SCAN-TEST-MOES-01/report")
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert "analyst_summary" in report_data
    assert "Ministry of Earth Sciences" in report_data["analyst_summary"] or "Ghost Net" in report_data["analyst_summary"]
    assert "disclaimer" in report_data

    # Delete
    del_res = client.delete("/api/scans/SCAN-TEST-MOES-01")
    assert del_res.status_code == 200
    assert scan_repository.get("SCAN-TEST-MOES-01") is None
