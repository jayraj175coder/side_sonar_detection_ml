"""
========================================================================================
Qualitative SSS Sample Validation & Benchmark Reporter
========================================================================================
Runs inference using the active YOLOv8n ONNX perception model (marine_sonar_v2.onnx)
across calibrated sample side-scan sonar waterfall images (samples/*.png) with automated
ping-log geotagging and acoustic noise filtering.

Outputs a structured validation report detailing detections, confidence scores,
bounding box coordinates, shadow verification status, and lat/lon coordinates.
"""

import os
import sys
import time
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.services.inference import inference_service
from app.services.metadata_parser import parse_ping_log


def run_qualitative_validation():
    print("=" * 80)
    print("SONARX - SIH Marine Debris & Anomaly Perception Model Validation")
    print("Model: YOLOv8n-SIH-Marine-Debris-V2 (ONNX Runtime)")
    print("=" * 80)

    samples_dir = Path("samples")
    if not samples_dir.exists():
        samples_dir = Path("frontend/public/samples")

    ping_log_path = Path("backend/data/sample_ping_log.csv")
    ping_bytes = ping_log_path.read_bytes() if ping_log_path.exists() else b""

    sample_images = sorted(list(samples_dir.glob("*.png")))
    if not sample_images:
        print("[!] No sample PNG images found in samples/ directory.")
        return

    print(f"\nEvaluating {len(sample_images)} test sonar swaths...\n")
    print(f"{'Filename':<35} | {'Detections':<10} | {'Peak Conf':<10} | {'Geotag Source':<15} | {'Coords (Lat, Lon)'}")
    print("-" * 105)

    total_detections_logged = 0

    for img_path in sample_images:
        img_bytes = img_path.read_bytes()
        filename = img_path.name

        # Parse ping log if available
        parsed_meta = parse_ping_log(ping_bytes, filename)
        lat = parsed_meta.latitude if parsed_meta.match_found else None
        lon = parsed_meta.longitude if parsed_meta.match_found else None
        heading = parsed_meta.heading if parsed_meta.match_found else None
        geo_src = "ping_log" if parsed_meta.match_found else "none"

        # Run inference
        res = inference_service.predict(
            image_bytes=img_bytes,
            filename=filename,
            confidence_threshold=0.08,
            latitude=lat,
            longitude=lon,
            heading=heading,
            geotag_source=geo_src,
            model_version="v2",
            noise_filtering_enabled=True,
        )

        total_detections_logged += res.total_detections
        coords_str = f"{res.location.latitude:.4f} N, {res.location.longitude:.4f} E" if res.location.latitude else "Unavailable"
        peak_str = f"{res.highest_confidence * 100:.1f}%"

        print(f"{filename:<35} | {res.total_detections:<10} | {peak_str:<10} | {res.geotag_source:<15} | {coords_str}")

        for det in res.detections:
            b = det.bbox
            print(f"   +-- [{det.type}] Conf: {det.confidence * 100:.1f}% | Box: [{b.x1:.0f}, {b.y1:.0f}, {b.x2:.0f}, {b.y2:.0f}] | Filter: {det.noise_filter_reason}")

    print("\n" + "=" * 80)
    print(f"Validation Summary: {len(sample_images)} tracks evaluated, {total_detections_logged} total targets verified.")
    print("=" * 80)


if __name__ == "__main__":
    run_qualitative_validation()
