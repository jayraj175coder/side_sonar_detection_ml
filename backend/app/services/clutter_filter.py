from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from pydantic import BaseModel

from app.schemas.detection import BoundingBox, Detection


class ClutterFilterConfig(BaseModel):
    min_box_pixels: int = 16  # Suppress single-pixel acoustic speckle (< 4x4 px)
    max_box_area_ratio: float = 0.85  # Suppress whole-swath scanning artifacts
    max_aspect_ratio: float = 10.0  # Suppress thin nadir boundary bleed (w/h or h/w > 10)
    high_conf_threshold: float = 0.70
    med_conf_threshold: float = 0.35
    low_conf_threshold: float = 0.10


class ClutterFilterResult(BaseModel):
    detections: List[Detection]
    total_raw_evaluated: int
    clutter_rejected_count: int
    peak_confidence: float
    high_conf_count: int
    med_conf_count: int
    anomaly_tier_count: int


class AcousticClutterFilter:
    """
    Modular post-processing and false-positive reduction layer for underwater sonar imagery.
    Filters out natural seabed rock formations, sediment ridges, water column nadir bleed,
    and sub-pixel acoustic speckle before assigning tiered anomaly classifications.
    """

    def __init__(self, config: Optional[ClutterFilterConfig] = None):
        self.config = config or ClutterFilterConfig()

    def determine_confidence_tier(self, confidence: float) -> Tuple[str, bool]:
        """
        Determines the confidence tier and whether candidate is categorized
        as a verified object vs a potential anomaly requiring human analyst review.
        """
        if confidence >= self.config.high_conf_threshold:
            return "HIGH", False
        elif confidence >= self.config.med_conf_threshold:
            return "MEDIUM", False
        else:
            return "POTENTIAL_ANOMALY", True

    def filter_detections(
        self,
        raw_detections: List[Detection],
        image_width: int,
        image_height: int,
        confidence_threshold: float = 0.10,
    ) -> ClutterFilterResult:
        """
        Applies modular acoustic clutter rejection and confidence tiering.
        """
        total_raw = len(raw_detections)
        clutter_rejected = 0
        filtered_list: List[Detection] = []
        peak_conf = 0.0

        img_area = max(1.0, float(image_width * image_height))

        for det in raw_detections:
            if det.confidence > peak_conf:
                peak_conf = det.confidence

            # 1. Confidence Cutoff
            if det.confidence < confidence_threshold:
                continue

            # 2. Box Dimension & Boundary Validation
            b = det.bbox
            bw = max(1.0, b.x2 - b.x1)
            bh = max(1.0, b.y2 - b.y1)
            box_area = bw * bh

            # Filter out sub-pixel speckle
            if box_area < self.config.min_box_pixels:
                clutter_rejected += 1
                continue

            # Filter out full-swath sweep artifacts
            if (box_area / img_area) > self.config.max_box_area_ratio:
                clutter_rejected += 1
                continue

            # Filter out extreme aspect ratio slivers (nadir edge bleed)
            aspect_ratio = max(bw / bh, bh / bw)
            if aspect_ratio > self.config.max_aspect_ratio:
                clutter_rejected += 1
                continue

            # 3. Anomaly & Tier Categorization
            tier, is_anomaly = self.determine_confidence_tier(det.confidence)

            # Build enriched detection
            enriched_det = Detection(
                id=det.id,
                type="potential_anomaly" if is_anomaly and det.type == "potential_anomaly" else det.type,
                confidence=det.confidence,
                bbox=det.bbox,
                confidence_tier=tier,
                is_anomaly=is_anomaly,
            )
            filtered_list.append(enriched_det)

        high_count = sum(1 for d in filtered_list if getattr(d, 'confidence_tier', '') == 'HIGH')
        med_count = sum(1 for d in filtered_list if getattr(d, 'confidence_tier', '') == 'MEDIUM')
        anomaly_count = sum(1 for d in filtered_list if getattr(d, 'is_anomaly', False))

        return ClutterFilterResult(
            detections=filtered_list,
            total_raw_evaluated=total_raw,
            clutter_rejected_count=clutter_rejected,
            peak_confidence=round(peak_conf, 3),
            high_conf_count=high_count,
            med_conf_count=med_count,
            anomaly_tier_count=anomaly_count,
        )


# Global clutter filter instance
clutter_filter = AcousticClutterFilter()
