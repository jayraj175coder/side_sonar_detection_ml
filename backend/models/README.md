# SONARX Trained Detection Models

This directory is designated for trained object detection model artifacts for the SONARX Side-Scan Sonar Intelligence platform.

## Expected Model File
- **File Name**: `best.onnx`
- **Expected Path**: `backend/models/best.onnx`
- **Architecture**: YOLOv8n (exported to ONNX)
- **Input Size**: 640 × 640
- **Target Classes**:
  - `MILCO` (Mine-Like Contact)
  - `NOMBO` (Non-Mine Bottom Obstacle)
- **Approximate Size**: ~11.7 MB

## Setup Instructions
1. Download or export `best.onnx` from your training run (e.g., Google Colab / Drive).
2. Place `best.onnx` directly into this directory:
   ```text
   backend/models/best.onnx
   ```
3. Configure `MODEL_PATH` in `backend/.env` (or via environment variables):
   ```env
   MODEL_PATH=./models/best.onnx
   CONFIDENCE_THRESHOLD=0.25
   ```

## Deployment & Verification
- For local development, `MODEL_PATH` resolves relative to the backend root directory (`backend/`).
- In cloud deployments (e.g. Render), ensure `best.onnx` is located at `backend/models/best.onnx` or specify an absolute path in `MODEL_PATH`.
- Do not commit fake or placeholder `.onnx` files.
