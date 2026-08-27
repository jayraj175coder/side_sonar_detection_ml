import pytest
from app.schemas.detection import BoundingBox, Detection
from app.services.clutter_filter import AcousticClutterFilter, ClutterFilterConfig


def test_clutter_filter_rejection_tiny_box():
    filt = AcousticClutterFilter(ClutterFilterConfig(min_box_pixels=16))
    
    # 2x2 box = 4 pixels (below 16 px threshold)
    tiny_det = Detection(
        id="tiny_1",
        type="anthropogenic_debris",
        confidence=0.85,
        bbox=BoundingBox(x1=10.0, y1=10.0, x2=12.0, y2=12.0),
    )
    
    # Normal 40x40 box = 1600 pixels
    valid_det = Detection(
        id="valid_1",
        type="anthropogenic_debris",
        confidence=0.85,
        bbox=BoundingBox(x1=50.0, y1=50.0, x2=90.0, y2=90.0),
    )
    
    res = filt.filter_detections([tiny_det, valid_det], image_width=800, image_height=600)
    assert res.total_raw_evaluated == 2
    assert res.clutter_rejected_count == 1
    assert len(res.detections) == 1
    assert res.detections[0].id == "valid_1"


def test_clutter_filter_aspect_ratio_rejection():
    filt = AcousticClutterFilter(ClutterFilterConfig(max_aspect_ratio=10.0))
    
    # Thin nadir stripe: width=2, height=100 -> aspect ratio 50 (rejected)
    sliver_det = Detection(
        id="sliver_1",
        type="potential_anomaly",
        confidence=0.60,
        bbox=BoundingBox(x1=100.0, y1=50.0, x2=102.0, y2=150.0),
    )
    
    res = filt.filter_detections([sliver_det], image_width=800, image_height=600)
    assert res.clutter_rejected_count == 1
    assert len(res.detections) == 0


def test_confidence_tier_assignment():
    filt = AcousticClutterFilter()
    
    tier_high, is_anom_high = filt.determine_confidence_tier(0.88)
    assert tier_high == "HIGH"
    assert is_anom_high is False
    
    tier_med, is_anom_med = filt.determine_confidence_tier(0.50)
    assert tier_med == "MEDIUM"
    assert is_anom_med is False
    
    tier_low, is_anom_low = filt.determine_confidence_tier(0.20)
    assert tier_low == "POTENTIAL_ANOMALY"
    assert is_anom_low is True
