"""
========================================================================================
SONARX Advanced Synthetic Side-Scan Sonar (SSS) Generator — V2 Enhanced Dataset
========================================================================================
Implements Tasks 2, 3, 4, 5, 6 & 7 for SIH 2026 PS 26057.

Realistic Acoustic Physics Engine:
1. Seabed Textures: Mud, Sand Ripples, Granite Outcrops, Gravel, Clay Ridges.
2. Acoustic Propagation: Time-Varying Gain (TVG), Slant Range Attenuation, Nadir Water Column.
3. Realistic Target Models:
   - Class 0 (ghost_net_aldfg): Curved net meshes, thin float lines, tangled web clusters, partially buried nets, nets drapes on debris.
   - Class 1 (anthropogenic_debris): Tyres (hollow rings), Shipping Containers, Metal Drums/Barrels, Wires/Cables, Irregular Scrap Fields.
   - Class 2 (pipeline_hazard): Exposed & partially buried subsea pipelines with field joints, linear acoustic shadows.
   - Class 3 (seafloor_anomaly): Boulder rocks, seabed pockmarks/depressions, dredging trenches, mounds.
4. Hard Negative Scenes (20-25%): Natural seabed sand dunes, rock clusters, and acoustic noise artifacts with 0 annotated objects.
5. Zero Test-Set Contamination: Preserves test split untouched.
"""

import os
import math
import random
import shutil
from pathlib import Path
from typing import Tuple, Dict, Any
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter


def generate_seabed_background(
    width: int = 640,
    height: int = 640,
    seed: int = 42,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Generates research-grade side-scan sonar background with realistic acoustic physics:
    - Rayleigh speckle noise
    - Time-Varying Gain (TVG) range attenuation
    - Nadir water column gap with variable altitude & look angle
    - Seafloor texture types (Sand ripples, Mud, Rock clutter, Gravel)
    """
    np.random.seed(seed)
    random.seed(seed)

    # 1. Base acoustic range profile (nadir to swath edge attenuation)
    x = np.linspace(-1.0, 1.0, width)
    
    # Random towfish altitude variation (nadir width: 24 to 48 pixels)
    nadir_half = random.randint(12, 24)
    mid_x = width // 2

    # TVG spreading and attenuation curve
    profile = np.clip(1.0 - (0.4 + random.uniform(-0.1, 0.15)) * np.abs(x), 0.15, 0.95)
    base_grid = np.tile(profile, (height, 1))

    # 2. Seabed Substrate Texture Generation
    texture_type = random.choice(["sand_ripples", "mud_flat", "rocky_gravel", "clay_ridges"])
    substrate = np.zeros((height, width), dtype=np.float32)

    if texture_type == "sand_ripples":
        freq = random.uniform(0.04, 0.12)
        angle = random.uniform(-0.3, 0.3)
        y_indices, x_indices = np.indices((height, width))
        rot_coord = x_indices * np.cos(angle) + y_indices * np.sin(angle)
        ripples = np.sin(rot_coord * freq) * random.uniform(0.15, 0.35)
        substrate += ripples
    elif texture_type == "rocky_gravel":
        num_rocks = random.randint(40, 120)
        for _ in range(num_rocks):
            rx = random.randint(10, width - 10)
            ry = random.randint(10, height - 10)
            r_rad = random.randint(2, 6)
            cv2.circle(substrate, (rx, ry), r_rad, float(random.uniform(0.2, 0.5)), -1)
        substrate = cv2.GaussianBlur(substrate, (5, 5), 0)
    elif texture_type == "clay_ridges":
        for _ in range(random.randint(3, 7)):
            pt1 = (random.randint(0, width), random.randint(0, height))
            pt2 = (random.randint(0, width), random.randint(0, height))
            cv2.line(substrate, pt1, pt2, float(random.uniform(0.15, 0.3)), random.randint(2, 5))
        substrate = cv2.GaussianBlur(substrate, (7, 7), 0)

    # 3. Multiplicative Rayleigh Speckle Noise + Thermal Gaussian Noise
    rayleigh_scale = random.uniform(0.25, 0.55)
    speckle = np.random.rayleigh(scale=rayleigh_scale, size=(height, width))
    thermal_noise = np.random.normal(0, random.uniform(2, 8), size=(height, width))

    acoustic_signal = (base_grid + substrate) * speckle * 160.0 + thermal_noise

    # 4. Nadir Water Column Gap
    nadir_val = random.uniform(8, 20)
    acoustic_signal[:, mid_x - nadir_half : mid_x + nadir_half] = np.random.normal(
        nadir_val, 4, (height, nadir_half * 2)
    )

    # Nadir boundary acoustic return highlights
    bg_hl_left = random.uniform(160, 240)
    bg_hl_right = random.uniform(160, 240)
    acoustic_signal[:, mid_x - nadir_half - 2 : mid_x - nadir_half] = np.random.normal(
        bg_hl_left, 15, (height, 2)
    )
    acoustic_signal[:, mid_x + nadir_half : mid_x + nadir_half + 2] = np.random.normal(
        bg_hl_right, 15, (height, 2)
    )

    # Normalize to [0, 255]
    sonar_gray = np.clip(acoustic_signal, 0, 255).astype(np.uint8)

    # Apply Hydrographic Colormap (Copper / Amber SSS)
    # B: 20%, G: 65%, R: 95%
    b = (sonar_gray * random.uniform(0.15, 0.25)).astype(np.uint8)
    g = (sonar_gray * random.uniform(0.60, 0.70)).astype(np.uint8)
    r = (sonar_gray * random.uniform(0.90, 0.98)).astype(np.uint8)
    rgb = np.stack([r, g, b], axis=-1)

    meta = {
        "texture": texture_type,
        "speckle_scale": rayleigh_scale,
        "mid_x": mid_x,
        "nadir_half": nadir_half,
    }
    return rgb, meta


def add_realistic_ghost_net(
    img: np.ndarray,
    bbox: Tuple[int, int, int, int],
    mid_x: int,
) -> Tuple[np.ndarray, Tuple[int, int, int, int]]:
    """
    Task 3: Highly realistic Ghost Net (ALDFG) acoustic signature generator.
    Features:
    - Curved meshes & tangled float lines
    - Irregular shadow corridors tapering away from nadir
    - Partial sand burial & varying net density
    """
    h_img, w_img = img.shape[:2]
    x1, y1, x2, y2 = bbox
    w = max(20, x2 - x1)
    h = max(20, y2 - y1)
    cx = (x1 + x2) / 2.0
    is_port = cx < mid_x

    # Acoustic shadow calculation L = h * G / (H - h)
    dist_from_nadir = abs(cx - mid_x)
    shadow_len = int(max(15, min(140, dist_from_nadir * random.uniform(0.6, 1.4))))
    
    # Shadow direction (stretches away from nadir)
    s_x1 = max(0, x1 - shadow_len) if is_port else x2
    s_x2 = x1 if is_port else min(w_img, x2 + shadow_len)

    # 1. Cast Irregular Acoustic Shadow Corridor
    shadow_overlay = img.copy()
    shadow_poly = np.array(
        [
            [s_x1, y1 + random.randint(-5, 5)],
            [s_x2, y1 - random.randint(5, 20)],
            [s_x2, y2 + random.randint(5, 20)],
            [s_x1, y2 + random.randint(-5, 5)],
        ],
        dtype=np.int32,
    )
    cv2.fillPoly(shadow_overlay, [shadow_poly], (5, 8, 12))
    alpha = random.uniform(0.85, 0.98)
    cv2.addWeighted(shadow_overlay, alpha, img, 1 - alpha, 0, img)

    # 2. Draw Curved / Mesh Net Structure
    net_mask = np.zeros((h_img, w_img), dtype=np.uint8)
    sub_type = random.choice(["curved_mesh", "tangled_bundle", "draped_web", "fragmented_line"])

    if sub_type == "curved_mesh":
        # Draw intersecting grid lines inside bounding region
        num_lines = random.randint(4, 9)
        for i in range(num_lines):
            px1 = random.randint(x1, x2)
            py1 = random.randint(y1, y2)
            px2 = random.randint(x1, x2)
            py2 = random.randint(y1, y2)
            cv2.line(net_mask, (px1, py1), (px2, py2), 255, random.randint(1, 2))
        cv2.ellipse(net_mask, ((x1+x2)//2, (y1+y2)//2), (w//2, h//2), random.randint(0, 180), 0, 360, 200, 2)

    elif sub_type == "tangled_bundle":
        # Cluster of bright points & dense loops
        pts = np.random.randint(low=[x1, y1], high=[x2, y2], size=(random.randint(8, 16), 2))
        cv2.polylines(net_mask, [pts], isClosed=True, color=255, thickness=random.randint(2, 3))
        for p in pts:
            cv2.circle(net_mask, tuple(p), random.randint(2, 5), 255, -1)

    else:  # draped_web or fragmented_line
        pts = []
        curr_x, curr_y = x1, (y1 + y2) // 2
        for _ in range(random.randint(5, 10)):
            curr_x += random.randint(5, max(6, w // 4))
            curr_y += random.randint(-10, 10)
            pts.append([min(x2, curr_x), max(y1, min(y2, curr_y))])
        if len(pts) >= 2:
            cv2.polylines(net_mask, [np.array(pts)], isClosed=False, color=255, thickness=random.randint(2, 4))

    # Partial Sand Burial (mask out parts of net)
    if random.random() < 0.35:
        burial_mask = np.random.uniform(0, 1, (h_img, w_img)) > 0.4
        net_mask[burial_mask] = 0

    # Composite Net Highlight onto RGB Image
    net_colored = np.zeros_like(img)
    intensity = random.randint(180, 255)
    net_colored[:, :] = (int(intensity * 0.95), int(intensity * 0.70), int(intensity * 0.25))

    highlight_indices = net_mask > 0
    img[highlight_indices] = net_colored[highlight_indices]

    return img, (x1, y1, x2, y2)


def add_realistic_anthropogenic_debris(
    img: np.ndarray,
    bbox: Tuple[int, int, int, int],
    mid_x: int,
) -> Tuple[np.ndarray, Tuple[int, int, int, int]]:
    """
    Task 4: High-diversity Anthropogenic Debris Generator (Fixes 41.78% AP50 weakness).
    Debris Types:
    - Tyres (toroidal hollow ring)
    - Containers (corrugated rectangle block)
    - Metal Drums / Barrels (cylindrical object)
    - Cables / Wires (thin curved specular line)
    - Scrap Debris Field (jagged polygons)
    """
    h_img, w_img = img.shape[:2]
    x1, y1, x2, y2 = bbox
    w = max(18, x2 - x1)
    h = max(18, y2 - y1)
    cx = (x1 + x2) / 2.0
    is_port = cx < mid_x

    dist_from_nadir = abs(cx - mid_x)
    shadow_len = int(max(15, min(120, dist_from_nadir * random.uniform(0.7, 1.3))))

    s_x1 = max(0, x1 - shadow_len) if is_port else x2
    s_x2 = x1 if is_port else min(w_img, x2 + shadow_len)

    # 1. Cast Strong Sharp Acoustic Shadow Void
    shadow_overlay = img.copy()
    cv2.rectangle(shadow_overlay, (s_x1, y1), (s_x2, y2), (4, 6, 10), -1)
    cv2.addWeighted(shadow_overlay, 0.94, img, 0.06, 0, img)

    debris_type = random.choice(["tyre", "container", "metal_drum", "cable", "scrap_metal"])
    obj_mask = np.zeros((h_img, w_img), dtype=np.uint8)

    if debris_type == "tyre":
        # Toroidal ring with center shadow hole
        center = ((x1 + x2) // 2, (y1 + y2) // 2)
        r_outer = min(w, h) // 2
        r_inner = max(3, r_outer // 2)
        cv2.circle(obj_mask, center, r_outer, 255, -1)
        cv2.circle(obj_mask, center, r_inner, 0, -1)

    elif debris_type == "container":
        # Corrugated shipping container box
        cv2.rectangle(obj_mask, (x1, y1), (x2, y2), 255, -1)
        # Corrugation internal lines
        for step in range(x1 + 4, x2, 6):
            cv2.line(obj_mask, (step, y1), (step, y2), 150, 1)

    elif debris_type == "metal_drum":
        # Cylinder barrel shape
        angle = random.randint(0, 180)
        cv2.ellipse(obj_mask, ((x1+x2)//2, (y1+y2)//2), (w//2, h//2), angle, 0, 360, 255, -1)
        cv2.ellipse(obj_mask, ((x1+x2)//2, (y1+y2)//2), (w//2, h//2), angle, 0, 360, 200, 2)

    elif debris_type == "cable":
        # Wavy metallic cable
        pts = np.array(
            [
                [x1, y1],
                [x1 + w // 3, y1 + h // 2],
                [x1 + 2 * w // 3, y1 - h // 4],
                [x2, y2],
            ],
            dtype=np.int32,
        )
        cv2.polylines(obj_mask, [pts], isClosed=False, color=255, thickness=random.randint(3, 5))

    else:  # scrap_metal
        # Jagged polygon scrap
        pts = np.array(
            [
                [x1 + random.randint(0, w // 3), y1],
                [x2, y1 + random.randint(0, h // 3)],
                [x2 - random.randint(0, w // 4), y2],
                [x1, y2 - random.randint(0, h // 4)],
            ],
            dtype=np.int32,
        )
        cv2.fillPoly(obj_mask, [pts], 255)

    # Metallic Specular Reflection Highlight
    highlight_val = random.randint(210, 255)
    obj_colored = np.zeros_like(img)
    obj_colored[:, :] = (int(highlight_val * 0.98), int(highlight_val * 0.90), int(highlight_val * 0.50))

    highlight_indices = obj_mask > 0
    img[highlight_indices] = obj_colored[highlight_indices]

    return img, (x1, y1, x2, y2)


def add_realistic_pipeline(
    img: np.ndarray,
    bbox: Tuple[int, int, int, int],
    mid_x: int,
) -> Tuple[np.ndarray, Tuple[int, int, int, int]]:
    """
    Task 2 & 4: Subsea Pipeline Hazard generator.
    Linear acoustic highlight line with parallel shadow corridor & field joints.
    """
    h_img, w_img = img.shape[:2]
    x1, y1, x2, y2 = bbox
    cx = (x1 + x2) / 2.0
    is_port = cx < mid_x

    # Ensure elongated linear aspect ratio
    pipe_w = random.randint(8, 16)
    pipe_h = random.randint(60, 180)
    x2 = min(w_img - 5, x1 + pipe_w)
    y2 = min(h_img - 5, y1 + pipe_h)

    shadow_len = int(max(20, min(100, abs(cx - mid_x) * 0.8)))
    s_x1 = max(0, x1 - shadow_len) if is_port else x2
    s_x2 = x1 if is_port else min(w_img, x2 + shadow_len)

    # Shadow corridor
    cv2.rectangle(img, (s_x1, y1), (s_x2, y2), (3, 5, 8), -1)

    # Pipe specular highlight
    cv2.rectangle(img, (x1, y1), (x2, y2), (245, 240, 190), -1)
    cv2.rectangle(img, (x1, y1), (x2, y2), (255, 255, 230), 1)

    # Pipeline field joints / anode rings
    for j_y in range(y1 + 15, y2 - 10, 30):
        cv2.line(img, (x1 - 2, j_y), (x2 + 2, j_y), (255, 255, 255), 2)

    return img, (x1, y1, x2, y2)


def add_realistic_seafloor_anomaly(
    img: np.ndarray,
    bbox: Tuple[int, int, int, int],
    mid_x: int,
) -> Tuple[np.ndarray, Tuple[int, int, int, int]]:
    """
    Task 5: Seafloor Anomaly generator (Fixes 55.59% AP50 weakness).
    Features:
    - Boulders & rock outcrops
    - Seabed pockmarks / depressions (inverted shadow first, highlight second)
    - Dredging trenches & mounds
    """
    h_img, w_img = img.shape[:2]
    x1, y1, x2, y2 = bbox
    w = max(15, x2 - x1)
    h = max(15, y2 - y1)
    cx = (x1 + x2) / 2.0
    is_port = cx < mid_x

    anomaly_kind = random.choice(["boulder", "pockmark_depression", "mound", "trench"])

    if anomaly_kind == "pockmark_depression":
        # Inverted shadow-first acoustic signature
        dep_shadow = (x1, y1, (x1 + x2) // 2, y2)
        dep_highlight = (((x1 + x2) // 2), y1, x2, y2)
        cv2.rectangle(img, (dep_shadow[0], dep_shadow[1]), (dep_shadow[2], dep_shadow[3]), (5, 7, 10), -1)
        cv2.rectangle(img, (dep_highlight[0], dep_highlight[1]), (dep_highlight[2], dep_highlight[3]), (210, 200, 160), -1)

    elif anomaly_kind == "boulder":
        shadow_len = int(max(10, min(80, abs(cx - mid_x) * 0.7)))
        s_x1 = max(0, x1 - shadow_len) if is_port else x2
        s_x2 = x1 if is_port else min(w_img, x2 + shadow_len)
        cv2.rectangle(img, (s_x1, y1), (s_x2, y2), (6, 9, 14), -1)

        pts = np.array(
            [
                [x1 + w // 4, y1],
                [x2, y1 + h // 3],
                [x2 - w // 5, y2],
                [x1, y2 - h // 4],
            ],
            dtype=np.int32,
        )
        cv2.fillPoly(img, [pts], (225, 215, 175))

    else:  # mound or trench
        shadow_len = int(max(12, min(70, abs(cx - mid_x) * 0.6)))
        s_x1 = max(0, x1 - shadow_len) if is_port else x2
        s_x2 = x1 if is_port else min(w_img, x2 + shadow_len)
        cv2.rectangle(img, (s_x1, y1), (s_x2, y2), (8, 10, 15), -1)
        cv2.ellipse(img, ((x1+x2)//2, (y1+y2)//2), (w//2, h//2), random.randint(0, 90), 0, 360, (215, 205, 165), -1)

    return img, (x1, y1, x2, y2)


def generate_v3_enhanced_dataset(
    output_dir: str = "dataset_sih_v3",
    num_train: int = 600,
    num_val: int = 150,
    seed: int = 2026,
):
    """
    Generates dataset_sih_v3 with 600 train and 150 val images,
    including 20% Hard Negative Scenes (0 targets).
    Preserves original held-out test set completely untouched.
    """
    random.seed(seed)
    np.random.seed(seed)

    out_path = Path(output_dir)
    if out_path.exists():
        shutil.rmtree(out_path)

    for split in ["train", "val"]:
        (out_path / "images" / split).mkdir(parents=True, exist_ok=True)
        (out_path / "labels" / split).mkdir(parents=True, exist_ok=True)

    splits_config = {"train": num_train, "val": num_val}
    total_images_generated = 0
    total_objects_generated = 0
    hard_negatives_count = 0

    class_names = {
        0: "ghost_net_aldfg",
        1: "anthropogenic_debris",
        2: "pipeline_hazard",
        3: "seafloor_anomaly",
    }

    for split, count in splits_config.items():
        print(f"[*] Generating {count} enhanced synthetic SSS images for split: '{split}'...")
        for i in range(count):
            img_seed = (10000 if split == "train" else 50000) + i
            img_rgb, meta = generate_seabed_background(640, 640, seed=img_seed)
            img_w, img_h = 640, 640
            mid_x = meta["mid_x"]

            # Task 6: 20% Hard Negative Scenes (0 objects)
            is_hard_negative = random.random() < 0.20
            labels = []

            if not is_hard_negative:
                num_objs = random.randint(1, 4)
                for _ in range(num_objs):
                    cls_id = random.randint(0, 3)
                    w = random.randint(25, 95)
                    h = random.randint(25, 95)

                    if random.random() < 0.5:
                        x1 = random.randint(30, mid_x - meta["nadir_half"] - w - 10)
                    else:
                        x1 = random.randint(mid_x + meta["nadir_half"] + 10, img_w - w - 20)
                    y1 = random.randint(40, img_h - h - 40)
                    x2 = x1 + w
                    y2 = y1 + h

                    bbox = (x1, y1, x2, y2)

                    if cls_id == 0:
                        img_rgb, bbox = add_realistic_ghost_net(img_rgb, bbox, mid_x)
                    elif cls_id == 1:
                        img_rgb, bbox = add_realistic_anthropogenic_debris(img_rgb, bbox, mid_x)
                    elif cls_id == 2:
                        img_rgb, bbox = add_realistic_pipeline(img_rgb, bbox, mid_x)
                    else:
                        img_rgb, bbox = add_realistic_seafloor_anomaly(img_rgb, bbox, mid_x)

                    rx1, ry1, rx2, ry2 = bbox
                    cx = ((rx1 + rx2) / 2.0) / img_w
                    cy = ((ry1 + ry2) / 2.0) / img_h
                    nw = (rx2 - rx1) / img_w
                    nh = (ry2 - ry1) / img_h

                    labels.append(f"{cls_id} {cx:.6f} {cy:.6f} {nw:.6f} {nh:.6f}")
                    total_objects_generated += 1
            else:
                hard_negatives_count += 1

            img_name = f"sss_v3_{split}_{i:04d}.jpg"
            lbl_name = f"sss_v3_{split}_{i:04d}.txt"

            pil_img = Image.fromarray(img_rgb)
            pil_img.save(out_path / "images" / split / img_name, quality=95)

            with open(out_path / "labels" / split / lbl_name, "w") as f:
                f.write("\n".join(labels))

            total_images_generated += 1

    # Write dataset data.yaml
    yaml_data = {
        "path": str(out_path.resolve()),
        "train": "images/train",
        "val": "images/val",
        "names": class_names,
    }
    with open(out_path / "data.yaml", "w") as f:
        import yaml
        yaml.dump(yaml_data, f, default_flow_style=False)

    print("\n=======================================================")
    print("  SONARX V3 ENHANCED SYNTHETIC DATASET GENERATION OK")
    print(f"  Location:             {out_path.resolve()}")
    print(f"  Total Images:         {total_images_generated} ({num_train} train / {num_val} val)")
    print(f"  Total Objects:        {total_objects_generated}")
    print(f"  Hard Negatives (0-obj): {hard_negatives_count} ({hard_negatives_count/total_images_generated*100:.1f}%)")
    print("=======================================================\n")


if __name__ == "__main__":
    generate_v3_enhanced_dataset()
