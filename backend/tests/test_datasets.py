import pytest
from app.datasets.catalog import OPEN_SONAR_DATASETS, MARINE_SONAR_V2_PLANNED_CLASSES


def test_opensonardatasets_catalog_structure():
    assert len(OPEN_SONAR_DATASETS) >= 4
    assert "subpipe_sss_pipeline" in OPEN_SONAR_DATASETS
    assert "sss_crab_pot_aldfg" in OPEN_SONAR_DATASETS
    assert "ai4shipwrecks" in OPEN_SONAR_DATASETS

    subpipe = OPEN_SONAR_DATASETS["subpipe_sss_pipeline"]
    assert "Side-Scan Sonar" in subpipe.sonar_modality
    assert "pipeline" in subpipe.target_mapping.values()
    assert subpipe.num_images > 1000

    crab_pot = OPEN_SONAR_DATASETS["sss_crab_pot_aldfg"]
    assert "derelict_fishing_gear" in crab_pot.target_mapping.values()


def test_marine_sonar_v2_planned_classes():
    assert "pipeline" in MARINE_SONAR_V2_PLANNED_CLASSES
    assert "derelict_fishing_gear" in MARINE_SONAR_V2_PLANNED_CLASSES
    assert "shipwreck" in MARINE_SONAR_V2_PLANNED_CLASSES
