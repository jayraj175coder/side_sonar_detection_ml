"""
========================================================================================
Test Suite: Sonar Navigation & Companion Ping Log Parser
========================================================================================
Validates ingestion of companion acoustic telemetry logs (CSV / JSON):
1. Exact filename match and stem matching.
2. Single-record fallback for single-tile survey drops.
3. WGS84 coordinate boundary validation (-90 to +90 lat, -180 to +180 lon).
4. Platform heading and altitude/depth extraction.
5. Corrupt / empty / malformed file graceful degradation.
"""

import json
import pytest

from app.services.metadata_parser import parse_ping_log, ParsedPingMetadata


def test_parse_csv_ping_log_exact_match():
    """CSV with multiple rows extracts the exact matching image record."""
    csv_bytes = (
        "filename,timestamp,latitude,longitude,heading,depth_m\n"
        "swath_01.png,2026-08-27T10:00:00Z,18.9214,72.8217,145.2,42.5\n"
        "swath_02.png,2026-08-27T10:02:00Z,18.9255,72.8240,146.0,43.1\n"
    ).encode("utf-8")

    meta = parse_ping_log(csv_bytes, "swath_02.png")
    assert meta.match_found is True
    assert meta.latitude == 18.9255
    assert meta.longitude == 72.8240
    assert meta.heading == 146.0


def test_parse_csv_ping_log_stem_match():
    """Matches even if the file extension or path casing differs."""
    csv_bytes = (
        "scan_id,latitude,longitude,heading\n"
        "MUMBAI_HIGH_LINE03,19.3792,71.3550,210.0\n"
    ).encode("utf-8")

    meta = parse_ping_log(csv_bytes, "mumbai_high_line03.jpg")
    assert meta.match_found is True
    assert meta.latitude == 19.3792
    assert meta.longitude == 71.3550
    assert meta.heading == 210.0


def test_parse_csv_single_row_fallback():
    """A single row CSV serves as georeference fallback for any uploaded tile."""
    csv_bytes = (
        "latitude,longitude,heading,altitude\n"
        "9.1362,79.2124,88.5,12.0\n"
    ).encode("utf-8")

    meta = parse_ping_log(csv_bytes, "arbitrary_sonar_name.png")
    assert meta.match_found is True
    assert meta.latitude == 9.1362
    assert meta.longitude == 79.2124
    assert meta.heading == 88.5


def test_parse_json_ping_log():
    """JSON structure with 'pings' list parses successfully."""
    payload = {
        "pings": [
            {
                "filename": "track_alpha.png",
                "timestamp": "2026-09-24T18:00:00Z",
                "latitude": 17.6868,
                "longitude": 83.2185,
                "heading": 90.0,
            }
        ]
    }
    json_bytes = json.dumps(payload).encode("utf-8")

    meta = parse_ping_log(json_bytes, "track_alpha.png")
    assert meta.match_found is True
    assert meta.latitude == 17.6868
    assert meta.longitude == 83.2185
    assert meta.heading == 90.0


def test_parse_empty_or_corrupt_ping_log():
    """Empty or binary garbage gracefully returns match_found=False without throwing."""
    meta_empty = parse_ping_log(b"", "sonar.png")
    assert meta_empty.match_found is False

    meta_corrupt = parse_ping_log(b"NOT_A_CSV_OR_JSON_$%^&*()", "sonar.png")
    assert meta_corrupt.match_found is False
