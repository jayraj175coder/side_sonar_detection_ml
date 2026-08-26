import json
import threading
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.schemas.detection import PredictionResponse, ScanSummary, StatsResponse


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


class LocalScanRepository(BaseScanRepository):
    """
    Thread-safe in-memory scan repository with optional JSON persistence.
    Designed for zero-dependency prototype usage and easy migration to PostgreSQL / PostGIS.
    """

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or settings.resolved_data_dir
        self.data_file = self.data_dir / "scans.json"
        self._lock = threading.Lock()
        self._scans: Dict[str, PredictionResponse] = {}
        self._load_from_disk()

    def _load_from_disk(self) -> None:
        try:
            self.data_dir.mkdir(parents=True, exist_ok=True)
            if self.data_file.exists():
                with open(self.data_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        scan = PredictionResponse(**item)
                        self._scans[scan.scan_id] = scan
        except Exception:
            # Fallback to empty in-memory state on read error
            self._scans = {}

    def _persist_to_disk(self) -> None:
        try:
            self.data_dir.mkdir(parents=True, exist_ok=True)
            serializable = [scan.model_dump() for scan in self._scans.values()]
            with open(self.data_file, "w", encoding="utf-8") as f:
                json.dump(serializable, f, indent=2, default=str)
        except Exception:
            pass

    def save(self, scan: PredictionResponse) -> PredictionResponse:
        with self._lock:
            self._scans[scan.scan_id] = scan
            self._persist_to_disk()
            return scan

    def get(self, scan_id: str) -> Optional[PredictionResponse]:
        with self._lock:
            return self._scans.get(scan_id)

    def list_all(self, limit: int = 100, offset: int = 0) -> List[PredictionResponse]:
        with self._lock:
            # Sort newest first
            sorted_scans = sorted(
                self._scans.values(),
                key=lambda s: s.created_at,
                reverse=True,
            )
            return sorted_scans[offset : offset + limit]

    def delete(self, scan_id: str) -> bool:
        with self._lock:
            if scan_id in self._scans:
                del self._scans[scan_id]
                self._persist_to_disk()
                return True
            return False

    def get_stats(self) -> StatsResponse:
        with self._lock:
            scans = list(self._scans.values())
            total_scans = len(scans)
            if total_scans == 0:
                return StatsResponse(
                    total_scans=0,
                    objects_detected=0,
                    milco_detections=0,
                    nombo_detections=0,
                    avg_confidence=0.0,
                    avg_inference_ms=0.0,
                    class_distribution={"MILCO": 0, "NOMBO": 0},
                    recent_scans=[],
                )

            total_objects = sum(s.total_detections for s in scans)
            milco_total = sum(s.milco_count for s in scans)
            nombo_total = sum(s.nombo_count for s in scans)

            all_confidences = [
                d.confidence for s in scans for d in s.detections
            ]
            avg_conf = (
                sum(all_confidences) / len(all_confidences)
                if all_confidences
                else 0.0
            )
            avg_inf = (
                sum(s.inference_ms for s in scans) / total_scans
                if total_scans
                else 0.0
            )

            sorted_scans = sorted(
                scans, key=lambda s: s.created_at, reverse=True
            )
            recent_summaries = [
                ScanSummary(
                    scan_id=s.scan_id,
                    filename=s.filename,
                    created_at=s.created_at,
                    detection_count=s.total_detections,
                    milco_count=s.milco_count,
                    nombo_count=s.nombo_count,
                    highest_confidence=s.highest_confidence,
                    avg_confidence=round(
                        sum(d.confidence for d in s.detections) / len(s.detections),
                        3,
                    )
                    if s.detections
                    else 0.0,
                    inference_ms=s.inference_ms,
                    location=s.location,
                    status=s.status,
                )
                for s in sorted_scans[:10]
            ]

            return StatsResponse(
                total_scans=total_scans,
                objects_detected=total_objects,
                milco_detections=milco_total,
                nombo_detections=nombo_total,
                avg_confidence=round(avg_conf, 3),
                avg_inference_ms=round(avg_inf, 1),
                class_distribution={"MILCO": milco_total, "NOMBO": nombo_total},
                recent_scans=recent_summaries,
            )


# Global repository instance
scan_repository = LocalScanRepository()
