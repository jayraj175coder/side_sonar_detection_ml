import json
import sqlite3
import threading
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.schemas.detection import (
    PredictionResponse,
    ScanSummary,
    StatsResponse,
    BoundingBox,
    Detection,
    Location,
)


class BaseScanRepository(ABC):
    @abstractmethod
    def save(self, scan: PredictionResponse) -> PredictionResponse:
        pass

    @abstractmethod
    def get(self, scan_id: str) -> Optional[PredictionResponse]:
        pass

    @abstractmethod
    def list_all(self, limit: int = 100, offset: int = 0) -> List[PredictionResponse]:
        pass

    @abstractmethod
    def delete(self, scan_id: str) -> bool:
        pass

    @abstractmethod
    def get_stats(self) -> StatsResponse:
        pass


class SQLiteScanRepository(BaseScanRepository):
    """
    ACID-compliant SQLite relational repository for SONARX subsea acoustic telemetry.
    Persists scans, detections, and reports in normalized tables with WAL mode for
    high-concurrency real-time edge processing. Also syncs with scans.json for dual compatibility.
    """

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or settings.resolved_data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.db_path = self.data_dir / "sonarx.db"
        self.json_file = self.data_dir / "scans.json"
        self._lock = threading.Lock()
        self._init_db()
        self._migrate_json_if_needed()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        return conn

    def _init_db(self) -> None:
        with self._lock:
            conn = self._get_connection()
            try:
                with conn:
                    conn.executescript("""
                        CREATE TABLE IF NOT EXISTS scans (
                            scan_id TEXT PRIMARY KEY,
                            filename TEXT NOT NULL,
                            model_name TEXT,
                            model_version TEXT,
                            image_width INTEGER,
                            image_height INTEGER,
                            inference_ms REAL,
                            confidence_threshold REAL,
                            total_detections INTEGER,
                            ghost_net_count INTEGER DEFAULT 0,
                            debris_count INTEGER DEFAULT 0,
                            pipeline_count INTEGER DEFAULT 0,
                            anomaly_count INTEGER DEFAULT 0,
                            milco_count INTEGER DEFAULT 0,
                            nombo_count INTEGER DEFAULT 0,
                            highest_confidence REAL,
                            latitude REAL,
                            longitude REAL,
                            heading REAL,
                            geotag_source TEXT,
                            noise_filtering_applied INTEGER DEFAULT 1,
                            false_positives_suppressed INTEGER DEFAULT 0,
                            status TEXT DEFAULT 'completed',
                            raw_json TEXT NOT NULL,
                            created_at TEXT NOT NULL
                        );

                        CREATE TABLE IF NOT EXISTS detections (
                            id TEXT PRIMARY KEY,
                            scan_id TEXT NOT NULL,
                            type TEXT NOT NULL,
                            confidence REAL NOT NULL,
                            confidence_tier TEXT,
                            x1 REAL NOT NULL,
                            y1 REAL NOT NULL,
                            x2 REAL NOT NULL,
                            y2 REAL NOT NULL,
                            noise_filter_passed INTEGER DEFAULT 1,
                            noise_filter_reason TEXT,
                            FOREIGN KEY (scan_id) REFERENCES scans (scan_id) ON DELETE CASCADE
                        );

                        CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
                        CREATE INDEX IF NOT EXISTS idx_detections_scan_id ON detections(scan_id);
                        CREATE INDEX IF NOT EXISTS idx_detections_type ON detections(type);
                    """)
            finally:
                conn.close()

    def _migrate_json_if_needed(self) -> None:
        """Migrate any existing scans from scans.json into SQLite on initial run."""
        with self._lock:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) as cnt FROM scans")
                count = cursor.fetchone()["cnt"]
                if count == 0 and self.json_file.exists():
                    try:
                        with open(self.json_file, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            for item in data:
                                scan = PredictionResponse(**item)
                                self._insert_scan_db(conn, scan)
                        conn.commit()
                    except Exception:
                        pass
            finally:
                conn.close()

    def _insert_scan_db(self, conn: sqlite3.Connection, scan: PredictionResponse) -> None:
        raw_json = scan.model_dump_json()
        lat = scan.location.latitude if scan.location else None
        lon = scan.location.longitude if scan.location else None
        heading = scan.location.heading if scan.location else None

        conn.execute("""
            INSERT OR REPLACE INTO scans (
                scan_id, filename, model_name, model_version, image_width, image_height,
                inference_ms, confidence_threshold, total_detections,
                ghost_net_count, debris_count, pipeline_count, anomaly_count,
                milco_count, nombo_count, highest_confidence, latitude, longitude,
                heading, geotag_source, noise_filtering_applied, false_positives_suppressed,
                status, raw_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            scan.scan_id, scan.filename, scan.model_name, scan.model_version,
            scan.image_width, scan.image_height, scan.inference_ms,
            scan.confidence_threshold, scan.total_detections,
            scan.ghost_net_count, scan.debris_count, scan.pipeline_count,
            scan.anomaly_count, scan.milco_count, scan.nombo_count,
            scan.highest_confidence, lat, lon, heading,
            scan.geotag_source, 1 if scan.noise_filtering_applied else 0,
            scan.false_positives_suppressed, scan.status, raw_json, scan.created_at
        ))

        conn.execute("DELETE FROM detections WHERE scan_id = ?", (scan.scan_id,))
        for d in scan.detections:
            conn.execute("""
                INSERT INTO detections (
                    id, scan_id, type, confidence, confidence_tier,
                    x1, y1, x2, y2, noise_filter_passed, noise_filter_reason
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                d.id, scan.scan_id, d.type, d.confidence, d.confidence_tier,
                d.bbox.x1, d.bbox.y1, d.bbox.x2, d.bbox.y2,
                1 if d.noise_filter_passed else 0, d.noise_filter_reason
            ))

    def _sync_json_backup(self, conn: sqlite3.Connection) -> None:
        """Keeps scans.json updated alongside SQLite for dual compatibility."""
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT raw_json FROM scans ORDER BY created_at DESC")
            rows = cursor.fetchall()
            scans_list = [json.loads(row["raw_json"]) for row in rows]
            with open(self.json_file, "w", encoding="utf-8") as f:
                json.dump(scans_list, f, indent=2)
        except Exception:
            pass

    def save(self, scan: PredictionResponse) -> PredictionResponse:
        with self._lock:
            conn = self._get_connection()
            try:
                with conn:
                    self._insert_scan_db(conn, scan)
                    self._sync_json_backup(conn)
                return scan
            finally:
                conn.close()

    def get(self, scan_id: str) -> Optional[PredictionResponse]:
        with self._lock:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT raw_json FROM scans WHERE scan_id = ?", (scan_id,))
                row = cursor.fetchone()
                if row:
                    return PredictionResponse(**json.loads(row["raw_json"]))
                return None
            finally:
                conn.close()

    def list_all(self, limit: int = 100, offset: int = 0) -> List[PredictionResponse]:
        with self._lock:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT raw_json FROM scans ORDER BY created_at DESC LIMIT ? OFFSET ?",
                    (limit, offset)
                )
                rows = cursor.fetchall()
                return [PredictionResponse(**json.loads(r["raw_json"])) for r in rows]
            finally:
                conn.close()

    def delete(self, scan_id: str) -> bool:
        with self._lock:
            conn = self._get_connection()
            try:
                with conn:
                    cursor = conn.cursor()
                    cursor.execute("DELETE FROM scans WHERE scan_id = ?", (scan_id,))
                    deleted = cursor.rowcount > 0
                    if deleted:
                        self._sync_json_backup(conn)
                    return deleted
            finally:
                conn.close()

    def get_stats(self) -> StatsResponse:
        with self._lock:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT
                        COUNT(*) as total_scans,
                        COALESCE(SUM(total_detections), 0) as objects_detected,
                        COALESCE(SUM(ghost_net_count), 0) as ghost_net_total,
                        COALESCE(SUM(debris_count), 0) as debris_total,
                        COALESCE(SUM(pipeline_count), 0) as pipeline_total,
                        COALESCE(SUM(anomaly_count), 0) as anomaly_total,
                        COALESCE(SUM(milco_count), 0) as milco_total,
                        COALESCE(SUM(nombo_count), 0) as nombo_total,
                        COALESCE(AVG(inference_ms), 0.0) as avg_inf
                    FROM scans
                """)
                row = cursor.fetchone()
                total_scans = row["total_scans"] if row else 0

                if total_scans == 0:
                    return StatsResponse(
                        total_scans=0,
                        objects_detected=0,
                        ghost_net_detections=0,
                        debris_detections=0,
                        pipeline_detections=0,
                        anomaly_detections=0,
                        milco_detections=0,
                        nombo_detections=0,
                        avg_confidence=0.0,
                        avg_inference_ms=0.0,
                        class_distribution={
                            "ghost_net_aldfg": 0,
                            "anthropogenic_debris": 0,
                            "pipeline_hazard": 0,
                            "seafloor_anomaly": 0,
                            "MILCO": 0,
                            "NOMBO": 0,
                        },
                        recent_scans=[],
                    )

                cursor.execute("SELECT AVG(confidence) as avg_conf FROM detections")
                avg_conf_row = cursor.fetchone()
                avg_conf = float(avg_conf_row["avg_conf"]) if (avg_conf_row and avg_conf_row["avg_conf"] is not None) else 0.0

                cursor.execute("SELECT raw_json FROM scans ORDER BY created_at DESC LIMIT 10")
                recent_rows = cursor.fetchall()
                recent_scans = []
                for r in recent_rows:
                    s = PredictionResponse(**json.loads(r["raw_json"]))
                    d_confs = [d.confidence for d in s.detections]
                    avg_c = round(sum(d_confs) / len(d_confs), 3) if d_confs else 0.0
                    recent_scans.append(
                        ScanSummary(
                            scan_id=s.scan_id,
                            filename=s.filename,
                            created_at=s.created_at,
                            detection_count=s.total_detections,
                            highest_confidence=s.highest_confidence,
                            avg_confidence=avg_c,
                            inference_ms=s.inference_ms,
                            location=s.location,
                            status=s.status,
                        )
                    )

                class_dist = {
                    "ghost_net_aldfg": int(row["ghost_net_total"]),
                    "anthropogenic_debris": int(row["debris_total"]),
                    "pipeline_hazard": int(row["pipeline_total"]),
                    "seafloor_anomaly": int(row["anomaly_total"]),
                    "MILCO": int(row["milco_total"]),
                    "NOMBO": int(row["nombo_total"]),
                }

                return StatsResponse(
                    total_scans=total_scans,
                    objects_detected=int(row["objects_detected"]),
                    ghost_net_detections=int(row["ghost_net_total"]),
                    debris_detections=int(row["debris_total"]),
                    pipeline_detections=int(row["pipeline_total"]),
                    anomaly_detections=int(row["anomaly_total"]),
                    milco_detections=int(row["milco_total"]),
                    nombo_detections=int(row["nombo_total"]),
                    avg_confidence=round(avg_conf, 3),
                    avg_inference_ms=round(float(row["avg_inf"]), 1),
                    class_distribution=class_dist,
                    recent_scans=recent_scans,
                )
            finally:
                conn.close()


# Global repository instance using SQLite
scan_repository = SQLiteScanRepository()

# Backward-compatible alias
LocalScanRepository = SQLiteScanRepository

