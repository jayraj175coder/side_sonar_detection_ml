import time
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.detection import (
    PredictionResponse,
    ScanSummary,
    StatsResponse,
    ReportResponse,
)
from app.storage.repository import scan_repository

router = APIRouter(tags=["Scans & Reports"])


@router.get("/scans", response_model=List[PredictionResponse])
def list_scans(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> List[PredictionResponse]:
    """Retrieves all past analyzed sonar scans sorted newest first."""
    return scan_repository.list_all(limit=limit, offset=offset)


@router.get("/scans/{scan_id}", response_model=PredictionResponse)
def get_scan(scan_id: str) -> PredictionResponse:
    """Retrieves detailed detection result for a specific scan ID."""
    scan = scan_repository.get(scan_id)
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID '{scan_id}' not found.",
        )
    return scan


@router.delete("/scans/{scan_id}", status_code=status.HTTP_200_OK)
def delete_scan(scan_id: str):
    """Deletes a scan from the repository."""
    deleted = scan_repository.delete(scan_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID '{scan_id}' not found.",
        )
    return {"status": "success", "message": f"Scan '{scan_id}' deleted."}


@router.get("/stats", response_model=StatsResponse)
def get_statistics() -> StatsResponse:
    """Computes real aggregate metrics across all processed sonar scans."""
    return scan_repository.get_stats()


@router.get("/scans/{scan_id}/report", response_model=ReportResponse)
def generate_scan_report(scan_id: str) -> ReportResponse:
    """
    Generates a structured marine intelligence inspection report for a given scan.
    """
    scan = scan_repository.get(scan_id)
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID '{scan_id}' not found.",
        )

    # Generate analyst narrative summary based on real detections
    milco_count = scan.milco_count
    nombo_count = scan.nombo_count
    total = scan.total_detections

    if total == 0:
        analyst_summary = (
            f"Sonar scan '{scan.filename}' was analyzed at confidence threshold "
            f"{scan.confidence_threshold:.2f}. No seafloor anomalies or mine-like "
            f"contacts were detected. The survey track appears clear of surface-identifiable obstacles."
        )
    else:
        risk_level = "HIGH PRIORITY" if milco_count > 0 else "ROUTINE OBSTACLE"
        analyst_summary = (
            f"Automated YOLOv8n acoustic inspection identified {total} target(s) in '{scan.filename}'. "
            f"Classification breakdown: {milco_count} MILCO (Mine-Like Contact) target(s) and "
            f"{nombo_count} NOMBO (Non-Mine Bottom Obstacle) target(s). "
            f"Assessment status: [{risk_level}]. Highest target confidence: {scan.highest_confidence * 100:.1f}%. "
            f"Inference latency: {scan.inference_ms:.1f} ms."
        )

    return ReportResponse(
        scan=scan,
        generated_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        analyst_summary=analyst_summary,
        metrics={
            "total_detections": total,
            "milco_count": milco_count,
            "nombo_count": nombo_count,
            "highest_confidence": scan.highest_confidence,
            "inference_ms": scan.inference_ms,
            "has_geolocation": scan.location.latitude is not None
            and scan.location.longitude is not None,
        },
    )
