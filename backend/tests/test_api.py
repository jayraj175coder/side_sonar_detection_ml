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
    assert "status" in data
    assert data["service"] == "SONARX"
    assert "model_loaded" in data


def test_model_info_endpoint():
    response = client.get("/api/model")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data
    assert "baseline_metrics" in data
    assert "debris_metrics" in data
    assert data["baseline_metrics"]["precision"] == 0.718
    assert data["debris_metrics"]["precision"] == 0.742


def test_datasets_catalog_endpoint():
    response = client.get("/api/datasets")
    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    assert "sss_crab_pot_debris" in data["datasets"]
    assert "ghost_net_research_status" in data


def test_scans_and_stats_empty():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_scans" in data
    assert "objects_detected" in data


def test_predict_empty_file():
    response = client.post(
        "/api/predict",
        files={"file": ("test.png", b"", "image/png")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_live_onnx_inference_debris_pipeline():
    img = Image.new("RGB", (640, 480), color=(20, 30, 40))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("live_sonar_scan.png", buf.getvalue(), "image/png")},
        data={
            "confidence": "0.05",
            "latitude": "17.6868",
            "longitude": "83.2185",
            "pipeline": "debris",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert data["filename"] == "live_sonar_scan.png"
    assert data["pipeline"] == "debris"
    assert "clutter_filtered_count" in data
    assert data["location"]["latitude"] == 17.6868
    assert data["location"]["longitude"] == 83.2185


def test_live_onnx_inference_baseline_pipeline():
    img = Image.new("RGB", (640, 480), color=(20, 30, 40))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("live_baseline_scan.png", buf.getvalue(), "image/png")},
        data={
            "confidence": "0.15",
            "pipeline": "baseline",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert data["pipeline"] == "baseline"


def test_scan_repository_and_report_workflow():
    sample_scan = PredictionResponse(
        scan_id="SCAN-TEST-DEBRIS-01",
        filename="test_acoustic.png",
        image_width=800,
        image_height=600,
        inference_ms=12.4,
        detections=[
            Detection(
                id="det_1",
                type="anthropogenic_debris",
                confidence=0.89,
                bbox=BoundingBox(x1=100, y1=150, x2=250, y2=300),
                confidence_tier="HIGH",
                is_anomaly=False,
            ),
        ],
        location=Location(latitude=17.6868, longitude=83.2185),
        created_at="2026-08-27T12:00:00Z",
        confidence_threshold=0.25,
        total_detections=1,
        debris_count=1,
        highest_confidence=0.89,
        pipeline="debris",
        clutter_filtered_count=2,
        verification_status="ai_candidate",
        status="completed",
    )

    # Save
    scan_repository.save(sample_scan)

    # Get
    fetched = scan_repository.get("SCAN-TEST-DEBRIS-01")
    assert fetched is not None
    assert fetched.filename == "test_acoustic.png"

    # Report
    report_res = client.get("/api/scans/SCAN-TEST-DEBRIS-01/report")
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert "analyst_summary" in report_data
    assert "disclaimer" in report_data
    assert "clutter_filtering_summary" in report_data

    # Delete
    del_res = client.delete("/api/scans/SCAN-TEST-DEBRIS-01")
    assert del_res.status_code == 200
    assert scan_repository.get("SCAN-TEST-DEBRIS-01") is None
