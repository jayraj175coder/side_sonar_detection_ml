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


# Curated Side-Scan Sonar (SSS) Datasets Catalog from OpenSonarDatasets & Research Literature
OPEN_SONAR_DATASETS: Dict[str, DatasetMetadata] = {
    "sss_crab_pot_debris": DatasetMetadata(
        id="sss_crab_pot_debris",
        name="GhostVision SSS Crab Pot / ALDFG Dataset",
        source_url="https://huggingface.co/datasets/pingsonnar/sss-crab-pot-detection-ds",
        paper_url="https://doi.org/10.3390/rs15112837",
        sonar_modality="Side-Scan Sonar (SSS)",
        num_images=2840,
        annotation_format="YOLO (normalized xywh bounding boxes)",
        original_classes=["crab_pot", "derelict_trap"],
        target_task="Object Detection & Spatial Mapping",
        license="CC BY 4.0",
        geographic_source="Puget Sound & Washington Coastal Waters, USA",
        target_mapping={
            "crab_pot": "derelict_fishing_gear",
            "derelict_trap": "derelict_fishing_gear",
        },
        preprocessing="455/800 kHz acoustic waterfall extraction, letterbox 640x640, intensity normalization",
        limitations="Primarily focused on derelict pot traps; does not contain flexible loose net fragments",
        relevance_to_sih="Directly matches Abandoned, Lost, or Discarded Fishing Gear (ALDFG) detection objective."
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
        geographic_source="Synthetic & Coastal High-Frequency SSS Survey Archives",
        target_mapping={
            "wreck": "anthropogenic_structure",
            "mine": "potential_anomaly",
            "human_body": "anthropogenic_debris",
            "seafloor": "natural_seabed",
        },
        preprocessing="Converted from raw GeoTIFF tiles to 640x640 RGB normalized tensors",
        limitations="Contains legacy mine/wreck taxonomy; requires remapping to anthropogenic anomaly categories",
        relevance_to_sih="Provides baseline contrast between seabed clutter and high-backscatter man-made objects."
    ),
    "marine_pulse": DatasetMetadata(
        id="marine_pulse",
        name="Marine_PULSE Underwater Infrastructure & Seabed Anomalies",
        source_url="https://doi.org/10.5281/zenodo.7922705",
        paper_url="https://doi.org/10.1016/j.oceaneng.2023.115432",
        sonar_modality="Side-Scan Sonar (SSS)",
        num_images=627,
        annotation_format="Pixel Masks / VOC XML",
        original_classes=["pipes", "mounds", "platforms"],
        target_task="Segmentation & Detection",
        license="CC BY-NC 4.0",
        geographic_source="North Sea Continental Shelf Surveys",
        target_mapping={
            "pipes": "infrastructure_debris",
            "mounds": "natural_seabed_clutter",
            "platforms": "anthropogenic_structure",
        },
        preprocessing="Acoustic slant-range correction, histogram equalization, bounding-box envelope derivation",
        limitations="Industrial infrastructure focus; low representation of plastic/net debris",
        relevance_to_sih="Useful for testing false-positive rejection of seabed mounds and detecting linear man-made debris."
    ),
    "aquascan_1k": DatasetMetadata(
        id="aquascan_1k",
        name="AquaScan-1K Small Anthropogenic Object Benchmark",
        source_url="https://doi.org/10.5281/zenodo.8329184",
        paper_url="https://doi.org/10.1109/JOE.2024.3382910",
        sonar_modality="Side-Scan Sonar (SSS)",
        num_images=1042,
        annotation_format="COCO JSON",
        original_classes=["target_object", "acoustic_shadow", "seabed_clutter"],
        target_task="Small Target Detection & Shadow Association",
        license="CC BY 4.0",
        geographic_source="Freshwater Lakes & Coastal Shallow Estuaries (455-1075 kHz)",
        target_mapping={
            "target_object": "anthropogenic_debris",
            "acoustic_shadow": "acoustic_shadow_feature",
            "seabed_clutter": "natural_seabed",
        },
        preprocessing="Multi-frequency normalization, highlight-shadow pair association",
        limitations="Focused on compact small objects; lacks soft textile/net morphology",
        relevance_to_sih="Excellent benchmark for validating highlight-shadow acoustic coupling to reduce false positives."
    ),
    "ai4shipwrecks": DatasetMetadata(
        id="ai4shipwrecks",
        name="AI4Shipwrecks Large Sunken Object Benchmark",
        source_url="https://doi.org/10.5281/zenodo.7809121",
        paper_url="https://doi.org/10.1038/s41597-023-02482-6",
        sonar_modality="Side-Scan Sonar (SSS)",
        num_images=760,
        annotation_format="GeoJSON / YOLO",
        original_classes=["shipwreck_hull", "debris_field"],
        target_task="Anomaly Detection & Semantic Segmentation",
        license="Open Access (NAIRR Pilot)",
        geographic_source="Thunder Bay National Marine Sanctuary (Lake Huron)",
        target_mapping={
            "shipwreck_hull": "anthropogenic_structure",
            "debris_field": "anthropogenic_debris",
        },
        preprocessing="Mosaic tile cropping, 640x640 letterbox conversion",
        limitations="Large macro-scale structures; does not represent small discarded debris",
        relevance_to_sih="Evaluates macro-anomaly bounding box stability and complex shadow segmentation."
    ),
}


# Target Taxonomy Mapping for the SIH Marine Debris Pipeline
SIH_TARGET_CLASSES = {
    0: "anthropogenic_debris",
    1: "derelict_fishing_gear",
    2: "anthropogenic_structure",
    3: "potential_anomaly",
}

# Scientific Documentation for Ghost Nets & Research Roadmap
GHOST_NET_RESEARCH_STATUS = {
    "use_case_priority": "High / Critical SIH Requirement",
    "problem_description": "Abandoned, lost, or discarded fishing gear (ALDFG), specifically ghost nets, drift nets, and monofilament lines that entangle marine fauna and damage vessel propellers.",
    "current_dataset_reality": "Open academic Side-Scan Sonar datasets currently provide validated annotations for derelict rigid fishing gear (crab pots, traps, cables) and anthropogenic debris fields, but public pixel-annotated sonar datasets for loose ghost nets remain extremely scarce in academic literature (often held in proprietary/NGO recovery surveys like GhostNetZero).",
    "scientific_integrity_stance": "SONARX strictly avoids fabricating synthetic 'ghost_net' class labels on models trained on other objects. Instead, it utilizes verified ALDFG/debris datasets, tags unconfirmed complex backscatter anomalies as 'potential_anomaly', and provides an open intake adapter ready to ingest ghost net field datasets.",
    "integration_roadmap": "A dedicated GhostNetAdapter is implemented in backend/app/datasets/adapters.py to support immediate plug-in ingestion when fine-grained net survey data is supplied."
}
