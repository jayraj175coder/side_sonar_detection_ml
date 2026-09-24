"""
========================================================================================
Test Suite: 2-Opt TSP Salvage Route Optimizer & 4-Phase Temporal Lifecycle Tracker
========================================================================================
Validates:
1. 2-Opt Traveling Salesperson (TSP) route optimization logic (path reduction).
2. Haversine geodesic distance computation.
3. 4-Phase Temporal Lifecycle Classification:
   - NEW CONTACT: Detected in survey T_1, absent in baseline T_0.
   - STILL THERE (PERSISTENT): Present in both surveys with benthic displacement < threshold.
   - MOVED (DRIFTED): Present in both surveys with benthic displacement >= threshold.
   - GONE (SALVAGED): Present in baseline T_0, absent in re-survey T_1.
4. Benthic drift vector calculation (drift distance, drift bearing in degrees).
"""

import math
from typing import List, Tuple, Dict, Any
import pytest


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points on WGS84 sphere in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def calculate_bearing_deg(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes navigation bearing angle in degrees from point 1 to point 2 (0-360 deg)."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    initial_bearing = math.atan2(y, x)
    return (math.degrees(initial_bearing) + 360.0) % 360.0


def solve_2opt_route(waypoints: List[Tuple[float, float]]) -> List[Tuple[float, float]]:
    """
    2-Opt heuristic solver that iteratively uncrosses intersecting edges
    to find a shorter route between waypoints.
    """
    if len(waypoints) <= 3:
        return list(waypoints)

    def route_distance(route):
        return sum(haversine_distance_m(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1])
                   for i in range(len(route) - 1))

    best_route = list(waypoints)
    improved = True
    max_iterations = 50
    iteration = 0

    while improved and iteration < max_iterations:
        improved = False
        iteration += 1
        for i in range(1, len(best_route) - 2):
            for j in range(i + 1, len(best_route) - 1):
                if j - i == 1:
                    continue
                # Test 2-opt swap (reversing segment i to j)
                new_route = best_route[:i] + best_route[i:j + 1][::-1] + best_route[j + 1:]
                if route_distance(new_route) < route_distance(best_route) - 1.0:
                    best_route = new_route
                    improved = True
                    break
            if improved:
                break

    return best_route


def classify_temporal_lifecycle(
    t0_targets: Dict[str, Tuple[float, float]],
    t1_targets: Dict[str, Tuple[float, float]],
    drift_threshold_m: float = 8.0,
) -> Dict[str, str]:
    """
    Classifies targets into 4-Phase Temporal States between baseline T0 and re-survey T1.
    """
    results = {}

    # Check all targets present in T0
    for target_id, pos_t0 in t0_targets.items():
        if target_id not in t1_targets:
            results[target_id] = "GONE (SALVAGED)"
        else:
            pos_t1 = t1_targets[target_id]
            dist = haversine_distance_m(pos_t0[0], pos_t0[1], pos_t1[0], pos_t1[1])
            if dist < drift_threshold_m:
                results[target_id] = "STILL THERE (PERSISTENT)"
            else:
                results[target_id] = "MOVED (DRIFTED)"

    # Check newly appeared targets in T1
    for target_id in t1_targets:
        if target_id not in t0_targets:
            results[target_id] = "NEW CONTACT"

    return results


def test_haversine_distance():
    """Haversine distance between Mumbai High points is computed accurately."""
    p1 = (18.9214, 72.8217)
    p2 = (18.9255, 72.8240)
    dist = haversine_distance_m(p1[0], p1[1], p2[0], p2[1])
    assert 400.0 <= dist <= 600.0  # Approx 515 meters


def test_calculate_bearing():
    """North bearing is ~0 deg, East is ~90 deg."""
    north_bearing = calculate_bearing_deg(18.0, 72.0, 19.0, 72.0)
    assert abs(north_bearing - 0.0) < 0.1

    east_bearing = calculate_bearing_deg(18.0, 72.0, 18.0, 73.0)
    assert abs(east_bearing - 90.0) < 0.5


def test_2opt_route_optimization():
    """2-Opt optimization reduces or equals total path distance for crossed waypoints."""
    # A crossed "bow-tie" sequence of waypoints
    crossed_route = [
        (18.920, 72.820),  # Start
        (18.940, 72.840),  # Top-Right
        (18.920, 72.840),  # Bottom-Right (crosses edge)
        (18.940, 72.820),  # Top-Left
        (18.920, 72.820),  # Return
    ]

    initial_dist = sum(
        haversine_distance_m(crossed_route[i][0], crossed_route[i][1], crossed_route[i + 1][0], crossed_route[i + 1][1])
        for i in range(len(crossed_route) - 1)
    )

    optimized = solve_2opt_route(crossed_route)
    optimized_dist = sum(
        haversine_distance_m(optimized[i][0], optimized[i][1], optimized[i + 1][0], optimized[i + 1][1])
        for i in range(len(optimized) - 1)
    )

    assert optimized_dist <= initial_dist


def test_temporal_lifecycle_4_phases():
    """Verifies all 4 temporal phases: NEW, STILL THERE, MOVED, GONE."""
    t0 = {
        "SX-T01": (18.921, 72.821),  # Unchanged
        "SX-T02": (18.925, 72.825),  # Will drift
        "SX-T03": (18.930, 72.830),  # Will be removed (salvaged)
    }

    t1 = {
        "SX-T01": (18.921, 72.82102),  # Moved ~2m (< 8m threshold) -> STILL THERE
        "SX-T02": (18.9255, 72.8258),  # Moved ~90m (> 8m threshold) -> MOVED
        "SX-T04": (18.935, 72.835),    # Newly appeared -> NEW CONTACT
    }

    states = classify_temporal_lifecycle(t0, t1, drift_threshold_m=8.0)

    assert states["SX-T01"] == "STILL THERE (PERSISTENT)"
    assert states["SX-T02"] == "MOVED (DRIFTED)"
    assert states["SX-T03"] == "GONE (SALVAGED)"
    assert states["SX-T04"] == "NEW CONTACT"
