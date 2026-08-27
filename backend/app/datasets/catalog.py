from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class DatasetMetadata(BaseModel):
    id: str
    name: str
    source_url: str
    paper_url: Optional[str] = None
    sonar_modality: str = Field(description="Sonar type: SSS, FLS, SAS, MBES")
    num_images: int
    annotation_format: str
    original_classes: List[str]
    target_task: str
    license: str
    geographic_source: str
    target_mapping: Dict[str, str]
    preprocessing: str
    limitations: str
    relevance_to_sih: str


# Curated SSS Datasets Catalog from OpenSonarDatasets & Research Literature
OPEN_SONAR_DATASETS: Dict[str, DatasetMetadata] = {
    "subpipe_sss_pipeline": DatasetMetadata(
        id="subpipe_sss_pipeline",
        name="SubPipe SSS Underwater Pipeline Dataset",
        source_url="https://doi.org/10.5281/zenodo.4746284",
        paper_url="https://doi.org/10.1109/JOE.2021.3116521",
        sonar_modality="Side-Scan Sonar (SSS)",
        num_images=1420,
        annotation_format="YOLO / PASCAL VOC (bounding boxes)",
        original_classes=["pipeline", "exposed_pipe", "burial_trench"],
        target_task="Pipeline Object Detection & Exposure Mapping",
        license="CC BY 4.0",
        geographic_source="North Sea & Mediterranean Offshore Surveys",
        target_mapping={
            "pipeline": "pipeline",
            "exposed_pipe": "pipeline",
            "burial_trench": "seabed_trench",
        },
        preprocessing="Acoustic slant-range correction, 640x640 letterbox conversion, backscatter normalization",
        limitations="Specifically annotated for submarine pipelines; does not contain loose debris or nets",
        relevance_to_sih="Directly supports the pipeline inspection requirement without incorrectly relabeling pipelines as debris."
    ),
    "sss_crab_pot_aldfg": DatasetMetadata(
        id="sss_crab_pot_aldfg",
        name="GhostVision SSS Derelict Crab Pot / ALDFG Dataset",
        source_url="https://huggingface.co/datasets/pingsonnar/sss-crab-pot-detection-ds",
        paper_url="https://doi.org/10.3390/rs15112837",
        sonar_modality="Side-Scan Sonar (SSS)",
        num_images=2840,
        annotation_format="YOLO (normalized xywh bounding boxes)",
        original_classes=["crab_pot", "derelict_trap"],
        target_task="Derelict Fishing Gear Detection",
        license="CC BY 4.0",
        geographic_source="Puget Sound Coastal Waters, USA",
        target_mapping={
            "crab_pot": "derelict_fishing_gear",
            "derelict_trap": "derelict_fishing_gear",
        },
        preprocessing="Waterfall acoustic raster extraction, 640x640 letterboxing, shadow-highlight contrast enhancement",
        limitations="Contains rigid pot/trap structures; does not contain loose floating gillnets",
        relevance_to_sih="Matches Abandoned, Lost, or Discarded Fishing Gear (ALDFG) target class."
    ),
    "ai4shipwrecks": DatasetMetadata(
        id="ai4shipwrecks",
        name="AI4Shipwrecks Sunken Vessel Benchmark",
        source_url="https://doi.org/10.5281/zenodo.7809121",
        paper_url="https://doi.org/10.1038/s41597-023-02482-6",
        sonar_modality="Side-Scan Sonar (SSS)",
        num_images=760,
        annotation_format="Polygon Segmentation Masks / GeoJSON",
        original_classes=["shipwreck_hull", "debris_field"],
        target_task="Semantic Segmentation & Anomaly Localization",
        license="Open Access (NAIRR Pilot)",
        geographic_source="Thunder Bay National Marine Sanctuary (Lake Huron)",
        target_mapping={
            "shipwreck_hull": "shipwreck",
            "debris_field": "shipwreck_debris",
        },
        preprocessing="Polygon mask outer bounding envelope computation -> YOLO [cx, cy, w, h] format conversion",
        limitations="Native annotations are segmentation polygons; converted to bounding boxes via envelope derivation",
        relevance_to_sih="Large-scale sunken cultural heritage and navigational hazards."
    ),
    "seabed_objects_klsg": DatasetMetadata(
        id="seabed_objects_klsg",
        name="SeabedObjects-KLSG Benchmark",
        source_url="https://www.kaggle.com/datasets/enochkwatehdongbo/seabedobjects-klsg-dataset",
        paper_url="https://doi.org/10.1109/ACCESS.2020.2974447",
        sonar_modality="Side-Scan Sonar (SSS)",
        num_images=1190,
        annotation_format="Bounding Boxes / Class Folders",
        original_classes=["wreck", "mine", "human_body", "seafloor"],
        target_task="Seabed Object Classification & Detection",
        license="Open Academic Access",
        geographic_source="Coastal High-Frequency SSS Survey Archives",
        target_mapping={
            "wreck": "shipwreck",
            "mine": "MILCO",
            "human_body": "anthropogenic_object",
            "seafloor": "natural_seabed",
        },
        preprocessing="Converted from raw GeoTIFF tiles to 640x640 RGB normalized tensors",
        limitations="Mixed historical taxonomy spanning mine-countermeasure and search-and-rescue",
        relevance_to_sih="Provides baseline contrast against natural seabed clutter."
    ),
}

# Real target classes planned for Marine Sonar V2
MARINE_SONAR_V2_PLANNED_CLASSES = [
    "pipeline",
    "derelict_fishing_gear",
    "shipwreck",
    "anthropogenic_anomaly",
]
