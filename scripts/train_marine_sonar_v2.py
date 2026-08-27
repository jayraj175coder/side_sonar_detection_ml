"""
=============================================================================
Marine Sonar V2 — Side-Scan Sonar Object Detection Training Pipeline
=============================================================================
This pipeline trains YOLOv8 on curated Side-Scan Sonar datasets from
OpenSonarDatasets (REMARO Network) for the Smart India Hackathon.

Target Classes:
  0: pipeline              (Source: SubPipe SSS dataset)
  1: derelict_fishing_gear (Source: GhostVision sss-crab-pot-detection-ds)
  2: shipwreck             (Source: AI4Shipwrecks polygon-to-bbox conversion)
  3: anthropogenic_anomaly (Source: SeabedObjects-KLSG anthropogenic subset)

Requirements:
  pip install ultralytics onnx onnxruntime albumentations pyyaml
"""

import os
import sys
import json
import shutil
import argparse
from pathlib import Path
from typing import Dict, List, Tuple
import yaml


def generate_v2_data_yaml(output_dir: Path) -> Path:
    """Generates the data.yaml configuration file for Ultralytics YOLOv8 training."""
    yaml_dict = {
        "path": str(output_dir.resolve()),
        "train": "images/train",
        "val": "images/val",
        "test": "images/test",
        "names": {
            0: "pipeline",
            1: "derelict_fishing_gear",
            2: "shipwreck",
            3: "anthropogenic_anomaly",
        },
    }
    
    yaml_path = output_dir / "marine_sonar_v2_data.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(yaml_dict, f, default_flow_style=False)
    
    print(f"[✓] Generated dataset configuration: {yaml_path}")
    return yaml_path


def convert_polygon_mask_to_bbox(
    points: List[Tuple[float, float]], img_w: int, img_h: int
) -> Tuple[float, float, float, float]:
    """
    Converts segmentation polygon coordinates (e.g. from AI4Shipwrecks)
    into normalized YOLO bounding box [cx, cy, w, h].
    """
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    
    x_min, x_max = min(xs), max(xs)
    y_min, y_max = min(ys), max(ys)
    
    cx = ((x_min + x_max) / 2.0) / img_w
    cy = ((y_min + y_max) / 2.0) / img_h
    w = (x_max - x_min) / img_w
    h = (y_max - y_min) / img_h
    
    return max(0.0, min(1.0, cx)), max(0.0, min(1.0, cy)), max(0.0, min(1.0, w)), max(0.0, min(1.0, h))


def train_yolo_model(
    data_yaml: Path,
    epochs: int = 100,
    imgsz: int = 640,
    batch: int = 16,
    device: str = "0",
    output_onnx_path: str = "backend/models/marine_sonar_v2.onnx",
):
    """
    Executes YOLOv8n training and exports best weights to ONNX format.
    """
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[!] Ultralytics not installed. Run: pip install ultralytics")
        return

    print(f"[*] Initializing YOLOv8n on {device} for {epochs} epochs...")
    model = YOLO("yolov8n.pt")
    
    # Train model
    results = model.train(
        data=str(data_yaml),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        project="runs/marine_sonar_v2",
        name="train_exp",
        exist_ok=True,
        plots=True,
    )
    
    # Evaluate validation metrics
    metrics = model.val()
    print("\n=======================================================")
    print("  Marine Sonar V2 Validation Results")
    print(f"  Precision: {metrics.box.mp:.4f}")
    print(f"  Recall:    {metrics.box.mr:.4f}")
    print(f"  mAP50:     {metrics.box.map50:.4f}")
    print(f"  mAP50-95:  {metrics.box.map:.4f}")
    print("=======================================================\n")
    
    # Export to ONNX
    best_pt = Path(results.save_dir) / "weights" / "best.pt"
    print(f"[*] Exporting best weights from {best_pt} to ONNX...")
    exported_path = model.export(format="onnx", imgsz=imgsz, dynamic=False, simplify=True)
    
    # Copy to backend/models/marine_sonar_v2.onnx
    dest_path = Path(output_onnx_path)
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(exported_path, dest_path)
    print(f"[✓] Successfully deployed Marine Sonar V2 model to: {dest_path.resolve()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Marine Sonar V2 model")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--device", type=str, default="0" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu")
    parser.add_argument("--data-dir", type=str, default="./dataset_v2")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)
    
    yaml_file = generate_v2_data_yaml(data_dir)
    print("\nTo execute training on Google Colab / GPU server:")
    print(f"  python scripts/train_marine_sonar_v2.py --epochs {args.epochs} --device 0\n")
