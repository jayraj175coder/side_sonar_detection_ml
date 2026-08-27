"""
========================================================================================
SIH Marine Debris & Ghost Net AI Detection Model — Enhanced Dataset & YOLOv8 Trainer
========================================================================================
Aligns with Ministry of Earth Sciences (MoES) Problem Statement:
"AI-Powered Automated Underwater Marine Debris and Anomaly Detection System using Side-Scan Sonar Imagery"

Target Classes:
  0: ghost_net_aldfg      - Abandoned/Lost/Discarded Fishing Gear (ALDFG) & entangled nets
  1: anthropogenic_debris - Man-made containers, scrap metals, drums, and plastic debris
  2: pipeline_hazard      - Subsea pipelines & exposed infrastructure (SubPipe SSS)
  3: seafloor_anomaly     - Acoustic shadow anomalies & unclassified contacts
"""

import os
import math
import random
import yaml
import shutil
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw


def generate_sss_swath(
    width: int = 640,
    height: int = 640,
    seed: int = 42,
) -> Image.Image:
    """Generates authentic side-scan sonar waterfall background."""
    np.random.seed(seed)
    # Range backscatter profile
    x = np.linspace(-1.0, 1.0, width)
    profile = np.clip(1.0 - 0.7 * np.abs(x), 0.2, 0.95)
    base = np.tile(profile, (height, 1))

    # Speckle noise
    speckle = np.random.rayleigh(scale=0.4, size=(height, width))
    sonar = base * speckle * 160.0

    # Nadir line
    mid_x = width // 2
    n_half = 16
    sonar[:, mid_x - n_half : mid_x + n_half] = np.random.normal(15, 5, (height, n_half * 2))

    # Nadir boundary highlights
    sonar[:, mid_x - n_half - 2 : mid_x - n_half] = np.random.uniform(170, 230, (height, 2))
    sonar[:, mid_x + n_half : mid_x + n_half + 2] = np.random.uniform(170, 230, (height, 2))

    sonar_norm = np.clip(sonar, 5, 255).astype(np.uint8)
    # Sonar colormap
    b = (sonar_norm * 0.2).astype(np.uint8)
    g = (sonar_norm * 0.65).astype(np.uint8)
    r = (sonar_norm * 0.95).astype(np.uint8)
    rgb = np.stack([r, g, b], axis=-1)
    return Image.fromarray(rgb)


def inject_acoustic_target(
    img: Image.Image,
    class_id: int,
    bbox: tuple,
) -> None:
    """Draws acoustic highlight and shadow for specific target class."""
    draw = ImageDraw.Draw(img)
    x1, y1, x2, y2 = bbox
    w = x2 - x1
    h = y2 - y1
    cx = (x1 + x2) / 2.0
    img_w, _ = img.size
    is_port = cx < (img_w / 2.0)

    # Shadow offset
    s_offset = -int(w * 1.8) if is_port else int(w * 1.8)

    # 1. Shadow (Dark void)
    if is_port:
        s_box = [max(0, x1 + s_offset), y1 + 2, x1, y2 - 2]
    else:
        s_box = [x2, y1 + 2, min(img_w, x2 + s_offset), y2 - 2]
    draw.rectangle(s_box, fill=(8, 12, 18))

    # 2. Target Highlight
    if class_id == 0:  # Ghost Net (Web of highlights)
        draw.ellipse([x1, y1, x2, y2], fill=(255, 240, 180), outline=(255, 255, 220), width=2)
        draw.line([x1 + 4, y1 + 4, x2 - 4, y2 - 4], fill=(255, 255, 200), width=2)
        draw.line([x1 + 4, y2 - 4, x2 - 4, y1 + 4], fill=(255, 255, 200), width=2)
    elif class_id == 1:  # Anthropogenic Debris (Solid bright metal)
        draw.rectangle([x1, y1, x2, y2], fill=(255, 255, 230), outline=(255, 255, 255), width=2)
    elif class_id == 2:  # Pipeline Hazard (Long linear structure)
        draw.rectangle([x1, y1, x2, y2], fill=(240, 240, 210), outline=(255, 255, 240), width=3)
    else:  # Seafloor Anomaly
        draw.ellipse([x1, y1, x2, y2], fill=(220, 220, 190), outline=(240, 240, 210), width=2)


def generate_dataset():
    dataset_dir = Path("dataset_sih_v2")
    if dataset_dir.exists():
        shutil.rmtree(dataset_dir)

    for split in ["train", "val"]:
        (dataset_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (dataset_dir / "labels" / split).mkdir(parents=True, exist_ok=True)

    counts = {"train": 100, "val": 25}

    for split, count in counts.items():
        for i in range(count):
            seed = (1000 if split == "train" else 5000) + i
            img = generate_sss_swath(640, 640, seed=seed)
            img_w, img_h = img.size

            num_objs = random.randint(1, 3)
            labels = []

            for _ in range(num_objs):
                cls_id = random.randint(0, 3)
                w = random.randint(35, 80)
                h = random.randint(35, 75)

                if random.random() < 0.5:
                    x1 = random.randint(40, 260)
                else:
                    x1 = random.randint(380, 560)
                y1 = random.randint(60, 520)
                x2 = min(img_w - 10, x1 + w)
                y2 = min(img_h - 10, y1 + h)

                inject_acoustic_target(img, cls_id, (x1, y1, x2, y2))

                # Normalize for YOLO
                cx = ((x1 + x2) / 2.0) / img_w
                cy = ((y1 + y2) / 2.0) / img_h
                norm_w = (x2 - x1) / img_w
                norm_h = (y2 - y1) / img_h
                labels.append(f"{cls_id} {cx:.6f} {cy:.6f} {norm_w:.6f} {norm_h:.6f}")

            img_fname = f"sss_{split}_{i:04d}.jpg"
            lbl_fname = f"sss_{split}_{i:04d}.txt"

            img.save(dataset_dir / "images" / split / img_fname, quality=95)
            with open(dataset_dir / "labels" / split / lbl_fname, "w") as f:
                f.write("\n".join(labels))

    data_yaml = {
        "path": str(dataset_dir.resolve()),
        "train": "images/train",
        "val": "images/val",
        "names": {
            0: "ghost_net_aldfg",
            1: "anthropogenic_debris",
            2: "pipeline_hazard",
            3: "seafloor_anomaly",
        },
    }
    with open(dataset_dir / "data.yaml", "w") as f:
        yaml.dump(data_yaml, f, default_flow_style=False)

    print(f"[OK] Generated {counts['train']} train & {counts['val']} val images.")


def train_and_export():
    from ultralytics import YOLO

    print("[*] Training YOLOv8n on SSS dataset (20 epochs)...")
    model = YOLO("yolov8n.pt")

    results = model.train(
        data="dataset_sih_v2/data.yaml",
        epochs=20,
        imgsz=320,
        batch=16,
        project="runs/sih_marine_debris",
        name="train_v2",
        exist_ok=True,
        verbose=False,
    )

    best_pt = Path("runs/sih_marine_debris/train_v2/weights/best.pt")
    if not best_pt.exists():
        best_pt = Path(model.trainer.save_dir) / "weights" / "best.pt"

    trained_model = YOLO(str(best_pt))
    print("[*] Exporting ONNX model...")
    onnx_file = trained_model.export(format="onnx", imgsz=640, simplify=True)

    dest_onnx = Path("backend/models/marine_sonar_v2.onnx")
    dest_onnx.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(onnx_file, dest_onnx)
    print(f"[OK] Trained ONNX deployed to: {dest_onnx.resolve()}")


if __name__ == "__main__":
    generate_dataset()
    train_and_export()
