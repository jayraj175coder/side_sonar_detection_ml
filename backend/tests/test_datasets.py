import pytest
from app.datasets.catalog import OPEN_SONAR_DATASETS, SIH_TARGET_CLASSES, GHOST_NET_RESEARCH_STATUS
from app.datasets.adapters import SonarDatasetAdapter, GhostNetIntakeAdapter


def test_opensonardatasets_catalog_structure():
    assert len(OPEN_SONAR_DATASETS) >= 4
    assert "sss_crab_pot_debris" in OPEN_SONAR_DATASETS
    assert "seabed_objects_klsg" in OPEN_SONAR_DATASETS
    
    crab_pot_ds = OPEN_SONAR_DATASETS["sss_crab_pot_debris"]
    assert "Side-Scan Sonar" in crab_pot_ds.sonar_modality
    assert "derelict_fishing_gear" in crab_pot_ds.target_mapping.values()
    assert crab_pot_ds.num_images > 1000


def test_dataset_adapter_mapping():
    adapter = SonarDatasetAdapter("sss_crab_pot_debris")
    
    mapping = adapter.map_source_label_to_sih("crab_pot")
    assert mapping is not None
    class_id, class_name = mapping
    assert class_name == "derelict_fishing_gear"


def test_ghost_net_intake_adapter():
    intake = GhostNetIntakeAdapter()
    spec = intake.get_ingestion_specification()
    assert "Ghost Net" in spec["target_object"]
    assert intake.validate_net_annotation("yolo_txt", {}) is True
    assert intake.validate_net_annotation("unknown_format", {}) is False
