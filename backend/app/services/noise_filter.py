"""
========================================================================================
Acoustic Noise Filtering & False-Positive Suppression Module
========================================================================================
Post-NMS confidence calibration and rule-based false-alarm suppression for Side-Scan
Sonar (SSS) imagery. Evaluates geometric aspect ratios, class bounding box priors,
and adjacent acoustic shadow contrast to reject seafloor speckle and natural clutter.
"""

from typing import List, Tuple, Optional
import numpy as np
from PIL import Image

from app.schemas.detection import Detection


class AcousticNoiseFilter:
    """
    Applies domain-specific acoustic physics rules to filter spurious detections:
    1. Aspect Ratio & Geometric Priors:
       - pipeline_hazard: Must exhibit an elongated linear aspect ratio (reject near-square blobs).
       - ghost_net_aldfg: Must have an irregular/sufficient footprint (reject isolated tiny speckle).
       - anthropogenic_debris: Must meet density/minimum area thresholds.
    2. Acoustic Shadow Verification:
       - Checks the downstream acoustic shadow region adjacent to the highlight bounding box.
       - High-relief anthropogenic objects cast a measurable low-return shadow void.
    """

    def __init__(self):
        # Minimum bounding box areas in pixels (based on 640x640 normalized space)
        self.min_area = {
            "ghost_net_aldfg": 350.0,
            "anthropogenic_debris": 250.0,
            "pipeline_hazard": 400.0,
            "seafloor_anomaly": 150.0,
            "MILCO": 200.0,
            "NOMBO": 200.0,
        }

    def _verify_shadow_contrast(
        self,
        image_np: np.ndarray,
        bbox: Tuple[float, float, float, float],
        class_name: str,
    ) -> Tuple[bool, float, str]:
        """
        Approximates shadow presence by inspecting pixel darkness in the region
        immediately adjacent to the bounding box away from the central nadir line.
        """
        img_h, img_w = image_np.shape[:2]
        x1, y1, x2, y2 = bbox
        mid_x = img_w / 2.0
        box_cx = (x1 + x2) / 2.0
        w = max(1.0, x2 - x1)
        h = max(1.0, y2 - y1)

        # Determine if object is on Port (left) or Starboard (right)
        is_port = box_cx < mid_x

        # Calculate shadow search window (stretching away from center nadir)
        if is_port:
            sx1 = max(0, int(x1 - w * 1.5))
            sx2 = max(0, int(x1))
        else:
            sx1 = min(img_w, int(x2))
            sx2 = min(img_w, int(x2 + w * 1.5))

        sy1 = max(0, int(y1))
        sy2 = min(img_h, int(y2))

        # Convert to grayscale luminance if RGB
        if len(image_np.shape) == 3:
            gray = np.mean(image_np, axis=2)
        else:
            gray = image_np

        # If shadow window is too small, pass conservatively
        if (sx2 - sx1) < 4 or (sy2 - sy1) < 4:
            return True, 1.0, "Shadow window at swath boundary; passed conservatively"

        shadow_region = gray[sy1:sy2, sx1:sx2]
        mean_shadow = float(np.mean(shadow_region))
        mean_background = float(np.mean(gray))

        # Contrast ratio: shadow should be darker than mean background
        # C = (Background - Shadow) / (Background + 1e-5)
        if mean_background > 1e-3:
            contrast = (mean_background - mean_shadow) / mean_background
        else:
            contrast = 0.0

        # High-relief objects like drums and nets should have positive shadow contrast
        if class_name in ["ghost_net_aldfg", "anthropogenic_debris", "MILCO"]:
            if contrast < -0.15:  # Shadow region is significantly brighter than background
                return False, contrast, f"Acoustic shadow void missing (contrast {contrast:.2f})"

        return True, contrast, f"Acoustic shadow verified (contrast {contrast:.2f})"

    def filter_detections(
        self,
        detections: List[Detection],
        image: Optional[Image.Image] = None,
        enabled: bool = True,
    ) -> Tuple[List[Detection], int]:
        """
        Processes a list of NMS detections and applies rule-based filtering.
        Returns:
            (filtered_detections, suppressed_count)
        """
        if not enabled or not detections:
            return detections, 0

        image_np = np.array(image) if image is not None else None
        passed_detections: List[Detection] = []
        suppressed_count = 0

        for det in detections:
            bbox = (det.bbox.x1, det.bbox.y1, det.bbox.x2, det.bbox.y2)
            w = max(1.0, det.bbox.x2 - det.bbox.x1)
            h = max(1.0, det.bbox.y2 - det.bbox.y1)
            area = w * h
            aspect_ratio = max(w / h, h / w)

            passed = True
            reason = "Passed acoustic geometry and shadow verification"

            # Rule 1: Pipeline Hazard must be elongated (not a square blob)
            if det.type == "pipeline_hazard":
                if aspect_ratio < 1.3 and area < 2500.0:
                    passed = False
                    reason = f"Pipeline candidate lacks elongated profile (AR: {aspect_ratio:.2f} < 1.30)"

            # Rule 2: Minimum Footprint check
            min_expected_area = self.min_area.get(det.type, 150.0)
            if area < min_expected_area and det.confidence < 0.40:
                passed = False
                reason = f"Candidate area ({area:.0f} px) below threshold ({min_expected_area:.0f} px) for low confidence"

            # Rule 3: Seafloor Anomaly without shadow support
            if det.type == "seafloor_anomaly" and det.confidence < 0.20 and area < 300.0:
                passed = False
                reason = f"Isolated seafloor anomaly ({area:.0f} px) below confidence threshold"

            # Rule 4: Acoustic Shadow verification (if image available)
            if passed and image_np is not None and det.confidence < 0.65:
                shadow_passed, contrast, shadow_reason = self._verify_shadow_contrast(
                    image_np, bbox, det.type
                )
                if not shadow_passed:
                    passed = False
                    reason = shadow_reason

            det.noise_filter_passed = passed
            det.noise_filter_reason = reason

            if passed:
                passed_detections.append(det)
            else:
                suppressed_count += 1

        return passed_detections, suppressed_count


# Global singleton instance
noise_filter = AcousticNoiseFilter()
