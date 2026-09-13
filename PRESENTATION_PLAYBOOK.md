# SONARX — Operational Evaluation & Live Presentation Playbook

## How to Present SONARX to Evaluators & Demonstrate Key Features

This guide gives you the **exact script and step-by-step workflow** to present SONARX during operational hydrographic reviews (Benchmark Ref: OPR-26057).

---

## 🎯 The 5-Act Presentation Flow (3-Minute Script)

### Act 1: The Problem & Acoustic Physics (30 Seconds)
> *"Judges, satellite optical cameras cannot see underwater. Oceanographers rely on Side-Scan Sonar (SSS). But standard computer vision models like COCO YOLO fail catastrophically on sonar imagery because they mistake natural sand ripples and rock outcrops for debris.*
>
> *Generic tools just draw boxes on images. **SONARX is an acoustic perception and geotagging pipeline** that combines YOLOv8s deep learning with acoustic shadow physics verification to eliminate false alarms."*

---

### Act 2: Triggering the Live Guided Demo (60 Seconds)
1. **Click `START LIVE DEMO`** in the top header of SONARX (cyan button).
2. The UI switches into the **Guided 8-Stage Acoustic Pipeline**:

| Stage | What to point out on screen | What to say |
|---|---|---|
| **01 INGEST** | High-res dual-frequency 900 kHz SSS waterfall canvas | *"Stage 1 ingests full-swath acoustic transect logs with USBL navigation tags."* |
| **02 PREPROCESS** | Speckle noise reduction & TVG normalization | *"Stage 2 applies Lee speckle filtering and Time-Varied Gain correction."* |
| **03 DETECT** | 37 raw candidate bounding boxes appear | *"Stage 3 runs our 11.2M parameter YOLOv8s ONNX engine, finding 37 acoustic return anomalies."* |
| **04 FILTER** | 20 rock/sand false alarms disappear | *"Stage 4 is our Acoustic Noise Filter — it checks highlight-to-shadow contrast opposite nadir and rejects 20 natural seafloor false alarms."* |
| **05 CLASSIFY** | 17 targets sorted by MoES debris taxonomy | *"Stage 5 categorizes surviving contacts into Ghost Nets, Anthropogenic Debris, Pipelines, and Anomalies."* |
| **06 EVIDENCE** | Hero Target #07 (Ghost Net ALDFG) inspect card | *"Stage 6 isolates our hero target: an entangled Ghost Net with 94.7% confidence and 2.31m shadow length."* |
| **07 GEOTAG** | Leaflet Map & 3D Bathymetric Mesh | *"Stage 7 solves slant-to-ground range ($G=\sqrt{R^2-H^2}$) and projects WGS84 GPS coordinates (18.9217°N, 72.8214°E)."* |
| **08 REPORT** | Structured Dossier Export | *"Stage 8 compiles a structured, exportable intelligence dossier."* |

---

### Act 3: Live Upload & Real-Time Inference (45 Seconds)
1. Click **`UPLOAD & ANALYZE`** in the top header (or navigate to the Scan tab).
2. Drag and drop any sonar test image (e.g. `02_shipwreck.jpg` or `04_ghost_net.jpg`).
3. Point out:
   - **Inference Latency**: `~35 ms` CPU processing time (torch-free ONNX Runtime).
   - **Target Badges**: Class name, confidence score, and confidence tier (HIGH/MEDIUM).
   - **False Positives Suppressed Count**: Shows real-time acoustic noise filter stats.

---

### Act 4: Human Analyst Review & Audit Queue (30 Seconds)
1. Click on any contact in the target queue or map to open the **Contact Inspector** drawer.
2. Point out the **HUMAN ANALYST AUDIT QUEUE** card:
   - Click **`Confirm Target`** (Green): Marks target as `VERIFIED TARGET` with glow state.
   - Click **`Reject False Alarm`** (Red): Marks target as `REJECTED FALSE ALARM`.
3. Explain to judges:
   > *"In real maritime operations, AI is decision-support, not an autonomous judge. SONARX includes a human-in-the-loop audit log where naval analysts confirm or reject contacts, saving decisions as fine-tuning ground-truth labels."*

---

### Act 5: Executive Intelligence Dossier Export (15 Seconds)
1. Click **`Export Dossier`** or navigate to `http://localhost:8000/api/scans/<id>/report/html` (or click `EXPORT OFFICIAL INCIDENT REPORT`).
2. Show the printable **Ministry of Earth Sciences (MoES) / NIOT Intelligence Dossier**:
   - Executive analyst summary
   - WGS84 GPS location table
   - Contact inventory list
   - Model benchmark badge (74.1% mAP50, 77.7% Precision)

---

## 🛡️ Answers to Tough Judge Questions

| Question | Winning Answer |
|---|---|
| *"What is your mAP50 score?"* | *"On our held-out test split of 700 unseen SSS images from 5,205 tiles, SONARX achieves **74.09% mAP50** and **77.73% Precision** using YOLOv8s."* |
| *"How do you handle false positives from rocks?"* | *"We check highlight-shadow coupling physics: an object MUST cast a dark shadow opposite towfish nadir matching $L = \frac{h \cdot G}{H - h}$. If there is no shadow void, it's rejected as natural rock clutter."* |
| *"Can this run onboard an AUV without internet?"* | *"Yes. We converted the model to FP32/FP16 ONNX Runtime. It runs CPU-only in **~35ms per tile** with zero cloud or GPU dependencies, ready for Jetson Nano / Raspberry Pi onboard a towfish."* |
| *"Where did you get your dataset?"* | *"We assembled a 5,205-tile multi-source dataset from 5 oceanographic sources (SubPipe, NOAA Thunder Bay AI4Shipwrecks, Kaggle mine, Roboflow SSS, hard negative seabed patches) under CC-BY-SA-4.0 licensing."* |
