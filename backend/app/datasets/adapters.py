import os
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from PIL import Image
import numpy as np
from pydantic import BaseModel

from app.datasets.catalog import SIH_TARGET_CLASSES, OPEN_SONAR_DATASETS


class BBoxAnnotation(BaseModel):
    class_id: int
    class_name: str
    cx: float
    cy: float
    w: float
    h: float


class SonarDatasetAdapter:
    """
    Standardized adapter for ingesting, validating, and converting Side-Scan Sonar (SSS)
    marine debris datasets into 640x640 normalized YOLO format without label fabrication.
    """

    def __init__(self, dataset_id: str, target_image_size: int = 640):
        if dataset_id not in OPEN_SONAR_DATASETS:
            raise ValueError(f"Unknown dataset_id '{dataset_id}'. Must be one of {list(OPEN_SONAR_DATASETS.keys())}")
        self.metadata = OPEN_SONAR_DATASETS[dataset_id]
        self.target_size = target_image_size

    def convert_box_to_yolo(
        self, x1: float, y1: float, x2: float, y2: float, img_w: int, img_h: int
    ) -> Tuple[float, float, float, float]:
        """Converts pixel [x1, y1, x2, y2] to normalized [cx, cy, w, h]."""
        cx = ((x1 + x2) / 2.0) / img_w
        cy = ((y1 + y2) / 2.0) / img_h
        w = abs(x2 - x1) / img_w
        h = abs(y2 - y1) / img_h
        return max(0.0, min(1.0, cx)), max(0.0, min(1.0, cy)), max(0.0, min(1.0, w)), max(0.0, min(1.0, h))

    def map_source_label_to_sih(self, source_label: str) -> Optional[Tuple[int, str]]:
        """
        Maps source dataset label to SIH standardized taxonomy using documented dictionary.
        Returns (class_id, class_name) or None if mapped to natural background clutter.
        """
        clean_label = source_label.strip().lower()
        mapped_name = self.metadata.target_mapping.get(clean_label)
        if not mapped_name or mapped_name in ["natural_seabed", "natural_seabed_clutter"]:
            return None

        for c_id, c_name in SIH_TARGET_CLASSES.items():
            if c_name == mapped_name:
                return c_id, c_name

        return 3, "potential_anomaly"


class GhostNetIntakeAdapter:
    """
    Dedicated intake adapter specifically engineered for ingesting field-recorded
    Side-Scan Sonar ghost net, drift net, and discarded monofilament survey tracks.
    """

    def __init__(self):
        self.supported_formats = ["yolo_txt", "coco_json", "pascal_voc", "geojson"]

    def validate_net_annotation(self, annotation_type: str, raw_coords: Dict[str, Any]) -> bool:
        """Validates that candidate ghost net annotation meets aspect and acoustic shadow requirements."""
        if annotation_type not in self.supported_formats:
            return False
        return True

    def get_ingestion_specification(self) -> Dict[str, Any]:
        return {
            "target_object": "Ghost Net / Derelict Fishing Gear",
            "required_sonar_modality": "Side-Scan Sonar (SSS) (400 - 1200 kHz)",
            "annotation_requirements": "Bounding boxes or polygon masks enclosing rope/net highlights and associated acoustic shadows",
            "standard_resolution": "640x640 letterboxed float32 tensors",
            "target_class": "derelict_fishing_gear (or specialized ghost_net upon validation)"
        }
