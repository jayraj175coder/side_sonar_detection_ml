"""
========================================================================================
Test Suite: Hydrographic Acoustic Physics & Position Uncertainty (IHO S-44 Order 1a)
========================================================================================
Validates core hydrographic mathematical formulations implemented in SONARX:
1. Total Propagated Uncertainty (TPU) radius (±r meters):
   - Acoustic ray bending through thermocline velocity gradients.
   - Towfish layback and catenary sag uncertainty.
   - Classification confidence ambiguity scaling.
2. Acoustic Shadow Height Trigonometry:
   - Target height H_t = (L_s * H_a) / (R_t + L_s)
3. Slant-to-Ground Range Conversion:
   - G = sqrt(R_s^2 - H_a^2)
"""

import math
import pytest


def calculate_tpu_uncertainty_radius(depth_m: float, slant_range_m: float, confidence: float) -> float:
    """
    Python reference implementation of the IHO S-44 Order 1a Total Propagated Uncertainty (TPU).
    Matches the frontend computeUncertaintyRadiusM implementation in data/targets.ts.
    """
    conf = confidence if confidence <= 1.0 else confidence / 100.0
    ray_bending_error = depth_m * 0.058
    layback_error = slant_range_m * 0.075
    gnss_base = 1.2
    ambiguity_error = (1.0 - conf) * 6.5

    tpu = math.sqrt(gnss_base**2 + ray_bending_error**2 + layback_error**2) + ambiguity_error
    return min(22.0, max(3.8, round(tpu, 1)))


def calculate_shadow_height(shadow_length_m: float, altitude_m: float, slant_range_m: float) -> float:
    """
    Computes target height proud of the seafloor using acoustic shadow trigonometry:
    H_t = (L_s * H_a) / (R_t + L_s)
    Where:
      L_s = Shadow length on seafloor
      H_a = Towfish altitude above seabed
      R_t = Slant range to target highlight
    """
    if slant_range_m + shadow_length_m <= 0:
        return 0.0
    return (shadow_length_m * altitude_m) / (slant_range_m + shadow_length_m)


def slant_to_ground_range(slant_range_m: float, altitude_m: float) -> float:
    """
    Calculates horizontal ground range from nadir trackline:
    G = sqrt(R_s^2 - H_a^2)
    """
    if slant_range_m <= altitude_m:
        return 0.0
    return math.sqrt(slant_range_m**2 - altitude_m**2)


def test_tpu_shallow_water_high_confidence():
    """In shallow water (15m) with high confidence (95%), uncertainty should be small (4-6m)."""
    r = calculate_tpu_uncertainty_radius(depth_m=15.0, slant_range_m=20.0, confidence=0.95)
    assert 3.8 <= r <= 6.0


def test_tpu_deep_water_medium_confidence():
    """In continental shelf depth (80m) with 70% confidence, uncertainty expands to 7-11m."""
    r = calculate_tpu_uncertainty_radius(depth_m=80.0, slant_range_m=65.0, confidence=0.70)
    assert 7.0 <= r <= 11.0


def test_tpu_low_confidence_ambiguity_penalty():
    """Low confidence targets (50%) incur an ambiguity buffer increase."""
    r_high = calculate_tpu_uncertainty_radius(depth_m=40.0, slant_range_m=25.0, confidence=0.95)
    r_low = calculate_tpu_uncertainty_radius(depth_m=40.0, slant_range_m=25.0, confidence=0.50)
    assert r_low > r_high


def test_acoustic_shadow_height_calculation():
    """
    Known acoustic target test:
    Towfish altitude H_a = 8.0 m
    Slant range R_t = 24.0 m
    Shadow length L_s = 3.0 m
    H_t = (3.0 * 8.0) / (24.0 + 3.0) = 24.0 / 27.0 = 0.888 m (~0.89 m proud height)
    """
    h_t = calculate_shadow_height(shadow_length_m=3.0, altitude_m=8.0, slant_range_m=24.0)
    assert round(h_t, 2) == 0.89


def test_slant_to_ground_range_pythagorean():
    """
    Towfish altitude H_a = 6.0 m
    Slant range R_s = 10.0 m
    Ground range G = sqrt(100 - 36) = sqrt(64) = 8.0 m
    """
    g = slant_to_ground_range(slant_range_m=10.0, altitude_m=6.0)
    assert round(g, 1) == 8.0


def test_slant_to_ground_range_nadir_boundary():
    """Slant range equal to altitude means target is directly at nadir (G = 0)."""
    g = slant_to_ground_range(slant_range_m=10.0, altitude_m=10.0)
    assert g == 0.0
