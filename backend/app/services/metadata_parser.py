"""
========================================================================================
Sonar Metadata & Ping Log Parser for Automated Geotagging
========================================================================================
Parses companion acoustic ping logs (CSV / JSON) accompanying side-scan sonar (SSS)
drone waterfall imagery to automatically extract WGS84 geographic coordinates, platform
heading, and timestamp telemetry without requiring manual operator input.

Supported Schema (CSV Header or JSON Keys):
  - filename / frame_index / scan_id : Identifier matching the sonar image file
  - timestamp (ISO-8601 or epoch)     : Acquisition time (e.g. "2026-08-27T08:30:00Z")
  - latitude                          : Geographic latitude in decimal degrees (-90.0 to 90.0)
  - longitude                         : Geographic longitude in decimal degrees (-180.0 to 180.0)
  - heading (optional)                : Drone / platform heading angle in degrees (0 to 360)
  - altitude / depth (optional)       : Transducer altitude above seabed / depth in meters
"""

import csv
import io
import json
from pathlib import Path
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ParsedPingMetadata(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    heading: Optional[float] = None
    timestamp: Optional[str] = None
    match_found: bool = False
    source_record: Optional[Dict[str, Any]] = None


def parse_ping_log(
    file_bytes: bytes,
    target_filename: str,
) -> ParsedPingMetadata:
    """
    Parses CSV or JSON ping log content and matches coordinates for target_filename.
    Supports exact filename matching, stem matching, and single-row fallback.
    """
    if not file_bytes:
        return ParsedPingMetadata(match_found=False)

    content_str = ""
    for encoding in ["utf-8", "latin-1", "ascii"]:
        try:
            content_str = file_bytes.decode(encoding)
            break
        except UnicodeDecodeError:
            continue

    if not content_str:
        return ParsedPingMetadata(match_found=False)

    target_name_clean = Path(target_filename).name.lower().strip()
    target_stem = Path(target_filename).stem.lower().strip()

    # 1. Try parsing as JSON
    trimmed = content_str.strip()
    if trimmed.startswith("{") or trimmed.startswith("["):
        try:
            data = json.loads(trimmed)
            records = data if isinstance(data, list) else data.get("pings", data.get("records", [data]))
            for rec in records:
                if not isinstance(rec, dict):
                    continue
                rec_fn = str(rec.get("filename", rec.get("frame_index", rec.get("scan_id", "")))).lower().strip()
                rec_stem = Path(rec_fn).stem.lower().strip()

                is_match = (
                    rec_fn == target_name_clean
                    or rec_stem == target_stem
                    or len(records) == 1
                )

                if is_match and "latitude" in rec and "longitude" in rec:
                    return ParsedPingMetadata(
                        latitude=float(rec["latitude"]),
                        longitude=float(rec["longitude"]),
                        heading=float(rec["heading"]) if "heading" in rec and rec["heading"] is not None else None,
                        timestamp=str(rec.get("timestamp", "")),
                        match_found=True,
                        source_record=rec,
                    )
        except Exception:
            pass

    # 2. Try parsing as CSV
    try:
        reader = csv.DictReader(io.StringIO(content_str))
        rows = list(reader)
        if not rows:
            return ParsedPingMetadata(match_found=False)

        for row in rows:
            # Case-insensitive column key lookup
            row_lower = {str(k).lower().strip(): v for k, v in row.items() if k is not None}
            fn_val = row_lower.get("filename", row_lower.get("frame_index", row_lower.get("scan_id", "")))
            fn_val_clean = str(fn_val).lower().strip()
            fn_stem = Path(fn_val_clean).stem.lower().strip()

            is_match = (
                fn_val_clean == target_name_clean
                or fn_stem == target_stem
                or len(rows) == 1  # Single-row log automatically matches
            )

            if is_match:
                lat_str = row_lower.get("latitude", row_lower.get("lat"))
                lon_str = row_lower.get("longitude", row_lower.get("lon", row_lower.get("long")))
                heading_str = row_lower.get("heading", row_lower.get("hdg"))
                ts_str = row_lower.get("timestamp", row_lower.get("time"))

                if lat_str is not None and lon_str is not None:
                    try:
                        lat = float(lat_str)
                        lon = float(lon_str)
                        hdg = float(heading_str) if heading_str else None
                        return ParsedPingMetadata(
                            latitude=lat,
                            longitude=lon,
                            heading=hdg,
                            timestamp=ts_str,
                            match_found=True,
                            source_record=row_lower,
                        )
                    except ValueError:
                        continue
    except Exception:
        pass

    return ParsedPingMetadata(match_found=False)
