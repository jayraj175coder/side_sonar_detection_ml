import os
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont


def create_physics_sonar_swath(
    width: int = 1024,
    height: int = 768,
    nadir_width: int = 64,
    target_type: str = "ghost_net",
    scenario_title: str = "MoES SSS Survey Track",
) -> np.ndarray:
    """
    Generates high-resolution, physics-accurate side-scan sonar waterfall swath:
    - Port & Starboard acoustic channels
    - Dark central nadir water column blind-zone
    - Range attenuation & acoustic grazing angle decay
    - Rayleigh speckle seafloor texture
    - Acoustic highlight (specular reflection) & trailing acoustic shadow
    - HUD Telemetry overlays
    """
    # 1. Base acoustic grazing backscatter
    x = np.linspace(-1.0, 1.0, width)
    # Grazing angle intensity profile
    profile = np.clip(1.0 - 0.75 * np.abs(x), 0.15, 0.95)
    canvas = np.tile(profile, (height, 1))

    # 2. Rayleigh speckle noise
    speckle = np.random.rayleigh(scale=0.35, size=(height, width))
    sonar = canvas * speckle * 180.0

    # 3. Add seabed sediment ripples / texture
    y_coords, x_coords = np.mgrid[0:height, 0:width]
    ripples = np.sin(x_coords * 0.04 + np.sin(y_coords * 0.02) * 2.0) * 15.0
    sonar += ripples

    # 4. Central Nadir Water Column Blind Zone
    mid_x = width // 2
    n_half = nadir_width // 2
    sonar[:, mid_x - n_half : mid_x + n_half] = np.random.normal(12, 4, (height, nadir_width))

    # Nadir boundary acoustic returns (first bottom return)
    sonar[:, mid_x - n_half - 3 : mid_x - n_half] = np.random.uniform(180, 240, (height, 3))
    sonar[:, mid_x + n_half : mid_x + n_half + 3] = np.random.uniform(180, 240, (height, 3))

    # 5. Insert Target Highlights & Acoustic Shadows
    if target_type == "ghost_net":
        # Starboard Ghost Net / ALDFG (Diffuse highlight with complex web shadow)
        gx, gy = mid_x + 160, height // 2 - 30
        # Highlight (entangled cluster)
        cv2.ellipse(sonar, (gx, gy), (48, 28), 25, 0, 360, 245, -1)
        cv2.circle(sonar, (gx - 15, gy + 10), 12, 255, -1)
        cv2.circle(sonar, (gx + 20, gy - 8), 10, 250, -1)
        # Cast Acoustic Shadow (downstream away from nadir)
        pts = np.array([[gx + 30, gy - 20], [gx + 170, gy - 40], [gx + 180, gy + 50], [gx + 25, gy + 30]], np.int32)
        cv2.fillPoly(sonar, [pts], 6)

    elif target_type == "debris":
        # Anthropogenic Container / Drum Debris
        dx, dy = mid_x - 180, height // 2 + 40
        # Hard metal specular highlight
        cv2.rectangle(sonar, (dx - 25, dy - 20), (dx + 25, dy + 20), 255, -1)
        cv2.rectangle(sonar, (dx - 22, dy - 18), (dx + 22, dy + 18), 230, -1)
        # Shadow pointing port-ward
        pts = np.array([[dx - 25, dy - 20], [dx - 160, dy - 35], [dx - 165, dy + 35], [dx - 25, dy + 20]], np.int32)
        cv2.fillPoly(sonar, [pts], 8)

        # Smaller scrap metal contact on starboard
        sx, sy = mid_x + 220, height // 3
        cv2.circle(sonar, (sx, sy), 18, 250, -1)
        pts_s = np.array([[sx + 10, sy - 15], [sx + 120, sy - 25], [sx + 125, sy + 25], [sx + 10, sy + 15]], np.int32)
        cv2.fillPoly(sonar, [pts_s], 7)

    elif target_type == "pipeline":
        # Subsea Pipeline traversing across swath
        px1, py1 = mid_x - 320, height // 4
        px2, py2 = mid_x + 380, (height * 3) // 4
        # Pipeline bright linear highlight
        cv2.line(sonar, (px1, py1), (px2, py2), 250, 8)
        cv2.line(sonar, (px1, py1), (px2, py2), 220, 14)
        # Pipeline shadow along length
        cv2.line(sonar, (px1 - 20, py1 + 15), (px2 - 20, py2 + 15), 10, 16)

    elif target_type == "complex_harbor":
        # Multiple contacts (Net, Drum, and Anomaly)
        # Net on Starboard
        cv2.ellipse(sonar, (mid_x + 140, 220), (42, 24), -15, 0, 360, 240, -1)
        pts_n = np.array([[mid_x + 170, 205], [mid_x + 310, 185], [mid_x + 315, 260], [mid_x + 165, 245]], np.int32)
        cv2.fillPoly(sonar, [pts_n], 6)

        # Debris Drum on Port
        cv2.rectangle(sonar, (mid_x - 160, 480), (mid_x - 110, 530), 255, -1)
        pts_d = np.array([[mid_x - 160, 480], [mid_x - 300, 460], [mid_x - 305, 550], [mid_x - 160, 530]], np.int32)
        cv2.fillPoly(sonar, [pts_d], 7)

    # 6. Normalize and map to warm Amber-Bronze or Tactical Cyan Sonar colormap
    sonar_norm = np.clip(sonar, 0, 255).astype(np.uint8)

    # Apply Sonar Copper / Amber palette (Standard maritime SSS display)
    b_channel = (sonar_norm * 0.15).astype(np.uint8)
    g_channel = (sonar_norm * 0.65).astype(np.uint8)
    r_channel = (sonar_norm * 0.95).astype(np.uint8)
    rgb_sonar = np.stack([b_channel, g_channel, r_channel], axis=-1)

    # 7. Add Tactical Telemetry Overlay Header & Footer
    pil_img = Image.fromarray(cv2.cvtColor(rgb_sonar, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)

    # Header Bar
    draw.rectangle([(0, 0), (width, 36)], fill=(5, 10, 20, 220))
    draw.text((16, 10), f"SONARX SSS-EDGE | 900 kHz CHIRP | SWATH: 100m | {scenario_title}", fill=(56, 189, 248))

    # Range markings
    draw.text((16, height - 26), "PORT CHANNEL [-50m]", fill=(148, 163, 184))
    draw.text((mid_x - 36, height - 26), "[NADIR 0m]", fill=(56, 189, 248))
    draw.text((width - 200, height - 26), "STARBOARD [+50m]", fill=(148, 163, 184))

    return np.array(pil_img)


def main():
    public_dir = Path("frontend/public/samples")
    public_dir.mkdir(parents=True, exist_ok=True)
    samples_dir = Path("samples")
    samples_dir.mkdir(parents=True, exist_ok=True)

    test_cases = [
        (
            "sih_ghost_net_aldfg_swath.png",
            "ghost_net",
            "MoES Track: Ghost Net / ALDFG Entanglement Contact",
        ),
        (
            "sih_marine_debris_drum.png",
            "debris",
            "MoES Track: Submerged Anthropogenic Container Debris",
        ),
        (
            "sih_subsea_pipeline_trench.png",
            "pipeline",
            "MoES Track: SubPipe Infrastructure & Pipeline Hazard",
        ),
        (
            "sih_vizag_harbor_multitarget.png",
            "complex_harbor",
            "MoES Track: Visakhapatnam Harbor Multi-Debris Survey",
        ),
    ]

    for fname, target, title in test_cases:
        img_arr = create_physics_sonar_swath(
            width=800,
            height=600,
            nadir_width=50,
            target_type=target,
            scenario_title=title,
        )
        img = Image.fromarray(img_arr)
        
        # Save to frontend/public/samples and root samples/
        p1 = public_dir / fname
        p2 = samples_dir / fname
        img.save(p1, format="PNG")
        img.save(p2, format="PNG")
        print(f"[OK] Generated authentic SSS sample: {p1} ({img.size})")


if __name__ == "__main__":
    main()
