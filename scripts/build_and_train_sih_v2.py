"""
========================================================================================
SIH Marine Debris & Ghost Net AI Detection Model — Dataset Synthesizer & YOLOv8 Trainer
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
from PIL import Image, ImageDraw


def generate_sss_acoustic_swath(
    width: int = 640,
    height: int = 640,
    seed: int = 42,
) -> Image.Image:
    """
    Generates an authentic Side-Scan Sonar (SSS) acoustic raster swath with:
    - Central nadir water column blind-zone (low acoustic return)
    - Slant-range acoustic speckle and sediment texture
    - Seafloor gain roll-off
    """
    np.random.seed(seed)
    speckle = np.random.gamma(shape=2.0, scale=18.0, size=(height, width)).astype(np.float32)
    
    x = np.linspace(0, 10, width)
    y = np.linspace(0, 10, height)
    xx, yy = np.meshgrid(x, y)
    sediment = 15.0 * np.sin(xx * 1.5 + np.random.uniform(0, 3)) + 10.0 * np.cos(yy * 0.8)
    
    base_intensity = 60.0 + sediment + speckle
    
    nadir_center = width // 2
    nadir_width = np.random.randint(18, 30)
    for col in range(width):
        dist_from_nadir = abs(col - nadir_center)
        if dist_from_nadir < nadir_width:
            factor = (dist_from_nadir / nadir_width) ** 1.5
            base_intensity[:, col] *= factor * 0.15
            
    base_intensity = np.clip(base_intensity, 5, 255).astype(np.uint8)
    return Image.fromarray(base_intensity).convert("RGB")


def add_acoustic_object(
    img: Image.Image,
    class_id: int,
    bbox: tuple,
) -> Image.Image:
    """
    Adds acoustic highlight (high reflection) and trailing acoustic shadow (low return)
    characteristic of Side-Scan Sonar physics.
    """
    draw = ImageDraw.Draw(img)
    x1, y1, x2, y2 = bbox
    w = x2 - x1
    h = y2 - y1
    img_w, img_h = img.size
    is_port_side = (x1 + x2) / 2.0 < (img_w / 2.0)
    
    shadow_offset = -int(w * 1.6) if is_port_side else int(w * 1.6)
    
    # 1. Draw Acoustic Shadow (dark zero-return void behind object)
    if is_port_side:
        shadow_box = [max(0, x1 + shadow_offset), y1, x1, y2]
    else:
        shadow_box = [x2, y1, min(img_w, x2 + shadow_offset), y2]
        
    draw.rectangle(shadow_box, fill=(8, 12, 18))
    
    # 2. Draw Acoustic Highlight (bright reflective return)
    if class_id == 0:  # Ghost net / ALDFG: diffuse mesh-like tangled texture
        draw.ellipse([x1, y1, x2, y2], fill=(235, 240, 250), outline=(255, 255, 255))
        for _ in range(5):
            lx1 = random.randint(x1, x2)
            ly1 = random.randint(y1, y2)
            lx2 = random.randint(x1, x2)
            ly2 = random.randint(y1, y2)
            draw.line([(lx1, ly1), (lx2, ly2)], fill=(255, 255, 255), width=2)
            
    elif class_id == 1:  # Anthropogenic Debris: rectangular container / drum
        draw.rectangle([x1, y1, x2, y2], fill=(245, 245, 255), outline=(255, 255, 255))
        
    elif class_id == 2:  # Pipeline Hazard: linear infrastructure
        draw.rectangle([x1, y1, x2, y2], fill=(230, 235, 245))
        draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255), width=3)
        
    elif class_id == 3:  # Seafloor Anomaly: irregular acoustic shape
        draw.polygon([(x1, y1 + h//2), (x1 + w//2, y1), (x2, y1 + h//3), (x1 + 2*w//3, y2), (x1 + w//4, y2)], fill=(220, 230, 240))
        
    return img


def generate_sih_dataset(root_dir: Path, num_train: int = 60, num_val: int = 15):
    """Creates a structured YOLO dataset for SIH marine debris & ghost net detection."""
    for split in ["train", "val"]:
        (root_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (root_dir / "labels" / split).mkdir(parents=True, exist_ok=True)
        
    class_names = [
        "ghost_net_aldfg",
        "anthropogenic_debris",
        "pipeline_hazard",
        "seafloor_anomaly",
    ]
    
    total_imgs = {"train": num_train, "val": num_val}
    
    for split, count in total_imgs.items():
        for idx in range(count):
            seed = idx + (1000 if split == "val" else 0)
            random.seed(seed)
            np.random.seed(seed)
            
            img = generate_sss_acoustic_swath(320, 320, seed=seed)
            labels = []
            
            num_objs = random.randint(1, 2)
            for _ in range(num_objs):
                class_id = random.randint(0, 3)
                
                if random.random() < 0.5:
                    cx_px = random.randint(40, 120)
                else:
                    cx_px = random.randint(200, 280)
                    
                cy_px = random.randint(50, 270)
                
                if class_id == 2:
                    w_px = random.randint(15, 30)
                    h_px = random.randint(45, 90)
                elif class_id == 0:
                    w_px = random.randint(25, 45)
                    h_px = random.randint(25, 45)
                else:
                    w_px = random.randint(15, 35)
                    h_px = random.randint(15, 35)
                    
                x1 = max(5, cx_px - w_px // 2)
                y1 = max(5, cy_px - h_px // 2)
                x2 = min(315, cx_px + w_px // 2)
                y2 = min(315, cy_px + h_px // 2)
                
                img = add_acoustic_object(img, class_id, (x1, y1, x2, y2))
                
                norm_cx = (x1 + x2) / 2.0 / 320.0
                norm_cy = (y1 + y2) / 2.0 / 320.0
                norm_w = (x2 - x1) / 320.0
                norm_h = (y2 - y1) / 320.0
                
                labels.append(f"{class_id} {norm_cx:.5f} {norm_cy:.5f} {norm_w:.5f} {norm_h:.5f}")
                
            img_path = root_dir / "images" / split / f"sih_sss_{split}_{idx:04d}.png"
            lbl_path = root_dir / "labels" / split / f"sih_sss_{split}_{idx:04d}.txt"
            
            img.save(img_path)
            with open(lbl_path, "w") as lf:
                lf.write("\n".join(labels) + "\n")
                
    yaml_config = {
        "path": str(root_dir.resolve()),
        "train": "images/train",
        "val": "images/val",
        "names": {i: name for i, name in enumerate(class_names)},
    }
    
    yaml_path = root_dir / "data.yaml"
    with open(yaml_path, "w") as yf:
        yaml.dump(yaml_config, yf, default_flow_style=False)
        
    print(f"[OK] SIH SSS Dataset generated with {num_train} train and {num_val} val images at: {root_dir}")
    return yaml_path


def train_and_export_v2(yaml_path: Path, output_onnx: Path, epochs: int = 5):
    """Trains YOLOv8n on the generated dataset and exports to ONNX."""
    from ultralytics import YOLO
    
    print("[*] Initializing YOLOv8n architecture for SIH MoES Marine Debris detection...")
    model = YOLO("yolov8n.pt")
    
    print(f"[*] Starting fast model training for {epochs} epochs...")
    results = model.train(
        data=str(yaml_path),
        epochs=epochs,
        imgsz=320,
        batch=16,
        project="runs/sih_marine_debris",
        name="train_v2",
        exist_ok=True,
        verbose=False,
    )
    
    print("[*] Evaluating validation metrics...")
    metrics = model.val()
    print(f"  mAP@0.50: {metrics.box.map50:.4f}")
    print(f"  Precision: {metrics.box.mp:.4f}")
    print(f"  Recall:    {metrics.box.mr:.4f}")
    
    print("[*] Exporting model to ONNX format...")
    exported_onnx = model.export(format="onnx", imgsz=640, dynamic=False, simplify=True)
    
    output_onnx.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(exported_onnx, output_onnx)
    print(f"[OK] Successfully deployed trained ONNX model to: {output_onnx.resolve()}")


if __name__ == "__main__":
    dataset_dir = Path("dataset_sih_v2")
    if dataset_dir.exists():
        shutil.rmtree(dataset_dir)
    yaml_file = generate_sih_dataset(dataset_dir, num_train=60, num_val=15)
    target_onnx = Path("backend/models/marine_sonar_v2.onnx")
    train_and_export_v2(yaml_file, target_onnx, epochs=5)
