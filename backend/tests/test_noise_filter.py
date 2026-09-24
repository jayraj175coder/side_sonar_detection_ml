"""
========================================================================================
Test Suite: Acoustic Noise Filtering & Physics-Grounded False-Alarm Suppression
========================================================================================
Validates domain-specific acoustic physics rules for Side-Scan Sonar (SSS):
1. Aspect ratio geometric priors (e.g., pipeline hazard must be linear/elongated).
2. Minimum area thresholds to suppress high-frequency speckle and ripple noise.
3. Acoustic shadow contrast verification (highlight-shadow pairing).
4. False-positive suppression rate and statistics accounting.
"""

import numpy as np
import pytest
from PIL import Image

from app.schemas.detection import Detection, BoundingBox
from app.services.noise_filter import AcousticNoiseFilter


@pytest.fixture
def noise_filter():
    return AcousticNoiseFilter()


def test_noise_filter_initialization(noise_filter):
    """Verifies default area thresholds for MoES marine debris taxonomy."""
    assert "ghost_net_aldfg" in noise_filter.min_area
    assert "pipeline_hazard" in noise_filter.min_area
    assert "anthropogenic_debris" in noise_filter.min_area
    assert noise_filter.min_area["ghost_net_aldfg"] >= 300.0


def test_suppress_small_speckle_noise(noise_filter):
    """Low-confidence tiny bounding boxes caused by speckle noise should be suppressed."""
    tiny_detection = Detection(
        id="det_speckle",
        type="ghost_net_aldfg",
        confidence=0.35,  # Low confidence (< 0.40) + tiny area (< 350 px)
        bbox=BoundingBox(x1=100, y1=100, x2=110, y2=110),  # Area = 100 px < 350 px threshold
    )
    dummy_img = np.ones((640, 640), dtype=np.uint8) * 128

    filtered_dets, suppressed_count = noise_filter.filter_detections(
        [tiny_detection], dummy_img
    )

    # Suppressed detections are removed from the passing list
    assert len(filtered_dets) == 0
    assert suppressed_count == 1
    assert tiny_detection.noise_filter_passed is False
    assert "area" in tiny_detection.noise_filter_reason.lower()


def test_pass_valid_ghost_net_geometry(noise_filter):
    """Sufficiently large ghost net detection with valid footprint passes."""
    valid_net = Detection(
        id="det_net_01",
        type="ghost_net_aldfg",
        confidence=0.92,
        bbox=BoundingBox(x1=100, y1=100, x2=150, y2=160),  # Area = 3000 px > 350 px
    )
    # Background 120, shadow region darker (40)
    img = np.ones((640, 640), dtype=np.uint8) * 120
    # Create dark shadow to the right of the object
    img[100:160, 150:220] = 30

    filtered_dets, suppressed_count = noise_filter.filter_detections(
        [valid_net], img
    )

    assert len(filtered_dets) == 1
    assert filtered_dets[0].noise_filter_passed is True
    assert suppressed_count == 0


def test_pipeline_aspect_ratio_rejection(noise_filter):
    """Subsea pipeline must be elongated; a square block must be rejected."""
    square_pipeline = Detection(
        id="det_pipe_square",
        type="pipeline_hazard",
        confidence=0.75,
        bbox=BoundingBox(x1=200, y1=200, x2=235, y2=235),  # 35x35 = aspect ratio 1.0 (square)
    )
    img = np.ones((640, 640), dtype=np.uint8) * 128

    filtered_dets, suppressed_count = noise_filter.filter_detections(
        [square_pipeline], img
    )

    # Square pipeline candidate is suppressed
    assert len(filtered_dets) == 0
    assert suppressed_count == 1
    assert square_pipeline.noise_filter_passed is False
    assert "elongated profile" in square_pipeline.noise_filter_reason.lower() or "ar:" in square_pipeline.noise_filter_reason.lower()


def test_pipeline_valid_linear_geometry(noise_filter):
    """Subsea pipeline with high aspect ratio passes geometric filter."""
    linear_pipe = Detection(
        id="det_pipe_linear",
        type="pipeline_hazard",
        confidence=0.88,
        bbox=BoundingBox(x1=100, y1=200, x2=320, y2=225),  # 220x25 = aspect ratio 8.8 (elongated pipe)
    )
    img = np.ones((640, 640), dtype=np.uint8) * 128

    filtered_dets, suppressed_count = noise_filter.filter_detections(
        [linear_pipe], img
    )

    assert len(filtered_dets) == 1
    assert filtered_dets[0].noise_filter_passed is True
    assert suppressed_count == 0


def test_shadow_contrast_verification(noise_filter):
    """Acoustic shadow contrast verification correctly detects dark voids."""
    img = np.ones((400, 400), dtype=np.uint8) * 140
    # Target highlight at center-port
    bbox = (150.0, 150.0, 180.0, 180.0)
    # Target is port side (cx=165 < 200), so shadow should be to the left
    img[150:180, 100:150] = 20  # Strong dark shadow void

    passed, contrast, reason = noise_filter._verify_shadow_contrast(
        img, bbox, "ghost_net_aldfg"
    )

    assert passed is True
    assert contrast > 0.3  # Clear contrast against background
