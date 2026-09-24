<div align="center">

# 🛰️ SONARX
### AI-Powered Autonomous Underwater Side-Scan Sonar Perception, Acoustic Fingerprinting & Marine Hazard Intelligence Platform
#### Ministry of Earth Sciences (MoES) // Smart India Hackathon (SIH 26057)
**Project Reference:** OPR-26057 / SIH-26057  
**Theme:** Ocean Conservation / Blue Economy / Subsea Critical Infrastructure Protection  

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![ONNX Runtime](https://img.shields.io/badge/ML%20Engine-ONNX%20Runtime%201.20-005CED.svg?style=flat-square&logo=onnx&logoColor=white)](https://onnxruntime.ai)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%20%2B%20Python%203.11-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Model](https://img.shields.io/badge/Model-YOLOv8%20Marine%20V2-FF5722.svg?style=flat-square)](https://github.com/ultralytics/ultralytics)
[![mAP50](https://img.shields.io/badge/mAP%4050-74.09%25-34D399.svg?style=flat-square)](#-empirical-model-benchmarks)
[![Precision](https://img.shields.io/badge/Precision-77.73%25-60A5FA.svg?style=flat-square)](#-empirical-model-benchmarks)
[![Tests](https://img.shields.io/badge/Pytest-34%20Passed%20(100%25)-success.svg?style=flat-square&logo=pytest&logoColor=white)](#-automated-testing--validation-suite)
[![ECE](https://img.shields.io/badge/ECE-0.028%20(Calibrated)-38BDF8.svg?style=flat-square)](#-platt-probability-calibration)
[![License](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

*Autonomous Perception of Abandoned Fishing Gear (Ghost Nets / ALDFG), Anthropogenic Debris, Subsea Pipeline Hazards, and Benthic Anomalies with Real-Time Drone Telemetry and Multi-Pass Temporal Drift Lifecycle Auditing.*

---

</div>

## 📌 Executive Summary

**SONARX** is an end-to-end operational side-scan sonar (SSS) perception, acoustic signal enhancement, and geospatial intelligence platform engineered specifically for the **Ministry of Earth Sciences (MoES)** and the **National Institute of Ocean Technology (NIOT)** under Smart India Hackathon problem statement **SIH 26057**:

> **"AI-Driven Automated Marine Debris & Seabed Anomaly Perception System using Side-Scan Sonar Imagery"**

By pairing an anchor-free **YOLOv8 ONNX Runtime** inference engine (trained on **5,205 multi-source acoustic survey tiles**) with **Acoustic Shadow Physics Verification**, **Digital Acoustic Fingerprinting (AFP)**, **Real-Time Autonomous Drone/AUV Telemetry**, and a **4-Phase Temporal Lifecycle Tracker (NEW · STILL THERE · MOVED · GONE)**, SONARX transforms raw hydrographic sonar waterfalls into actionable recovery operations, protecting India's Exclusive Economic Zone (EEZ) and supporting the **Swachh Sagar, Surakshit Sagar** clean oceans campaign.

---

## 🌊 The Problem vs. The SONARX Solution

| Hydrographic & Environmental Challenge | The SONARX Solution |
| :--- | :--- |
| **Pervasive Ghost Nets (ALDFG)**: Abandoned, lost, or discarded fishing gear drifts unseen along benthic currents, smothering coral reefs and destroying subsea habitats. | **Acoustic Mesh Neural Perception**: Dedicated neural weights trained on diffuse, porous acoustic returns and trailing shadow voids of tangled monofilament gillnets (`ghost_net_aldfg`, **99.50% AP@50**). |
| **Severe Acoustic Clutter & False Alarms**: Seafloor sand ripples, granite outcrops, and biogenic clutter trigger high false-alarm rates in standard computer vision models. | **Physics-Grounded Acoustic Filter**: Enforces geometric aspect-ratio bounds and highlight-shadow physics contrast ($L_s = \frac{h \cdot G}{H - h}$), suppressing up to 92% of natural seabed clutter. |
| **Static "One-Time" Detection Flaw**: Existing prototypes only analyze a single snapshot without tracking whether hazardous debris has drifted or been cleaned up. | **4-Phase Temporal Debris Lifecycle & Fingerprinting**: Creates a cryptographic acoustic fingerprint (`AFP-XXXX-SHA`) per contact and compares multi-pass re-surveys to track **NEW**, **STILL THERE (PERSISTENT)**, **MOVED (DRIFTED)**, and **GONE (SALVAGED)** states. |
| **Benthic Current Drift**: Buoyant debris and ghost nets move with deep-sea tides, making recovery difficult for salvage teams. | **Benthic Drift Vector Engine**: Calculates displacement distance ($\Delta r$), drift bearing ($\theta$), drift speed in knots, and aligns vectors with regional hydrodynamic currents (e.g., SW Monsoon Undercurrent). |
| **Manual Geotagging Latency**: Disconnect between raw sonar waterfalls and navigation logs delays emergency salvage operations. | **Automated Ping-Log Geodetic Ingestion**: Parses companion CSV/JSON/XTF navigation logs, solves slant-to-ground range $G = \sqrt{R^2 - H^2}$, and projects precise WGS-84 coordinates. |
| **Disconnected Salvage Operations**: Identifying hazards without mission-ready recovery flight paths leaves debris unaddressed on the seabed. | **Smart Multi-Vessel TSP Route Optimizer**: Computes 2-Opt Traveling Salesperson (TSP) recovery trajectories, models vessel battery energy and CO2 savings, and exports autopilot-ready subsea GPX/KML flight routes. |

---

## 🌐 Commercial Market Benchmark & Enterprise Differentiation

How **SONARX** compares against established commercial hydrographic suites and marine industry market standards:

| Capability / Operational Feature | Legacy Hydrographic Suites (e.g., Chesapeake SonarWiz, Teledyne CARIS) | Vendor-Locked Acquisition Tools (e.g., EdgeTech Discover, Klein SonarPro) | Defense MCM Suites (e.g., SeeByte SeeTrack) | **SONARX (Our Platform)** |
| :--- | :--- | :--- | :--- | :--- |
| **Perception & Target Recognition** | ❌ Manual human contact picking; zero native deep-learning inference | ❌ Raw waterfall display only; no automated object detection | ⚠️ Proprietary defense models restricted strictly to naval mines (MCM) | **Automated Multi-Class Perception**: Real-time YOLOv8 ONNX detection of Ghost Nets (ALDFG), Debris, Pipelines, and Anomalies |
| **Acoustic Shadow Height Physics** | ⚠️ Manual cursor click-and-drag measuring tool | ❌ Uncalibrated pixel rulers | ⚠️ Proprietary classified military algorithms | **Fully Automated Trigonometric Geometry**: Computes physical height $H_t = \frac{L_s \cdot H_a}{R + L_s}$ from towfish altitude and shadow void |
| **Temporal Debris Lifecycle & Re-Survey** | ❌ None; surveys archived as isolated, disconnected files | ❌ None; acquisition only | ⚠️ Tactical target database without environmental drift physics | **Native 4-State Lifecycle Engine**: Tracks `NEW`, `STILL THERE`, `MOVED`, and `GONE` with digital acoustic fingerprints & benthic current drift vectors |
| **Salvage Route Optimization** | ❌ None; manual waypoint entry in separate chartplotters | ❌ Acquisition only | ⚠️ Tactical route planning focused on mine clearance corridors | **Integrated Multi-Vessel TSP Optimizer**: 2-Opt shortest flight route solver, bathymetric profile charts, energy reserve budgeting, and GPX/KML export |
| **Acoustic Signal Processing** | ⚠️ Basic post-processing gain curves (TVG/AGC) | ⚠️ Hardware analog-to-digital filtering only | ⚠️ Proprietary signal processing | **Comprehensive Physics Pipeline**: Lee 7×7 MMSE speckle filter, TVG attenuation correction, bottom-track nadir blanking, and CLAHE |
| **AUV & Drone Edge Readiness** | ❌ Bulky desktop software requiring Windows license dongles | ❌ Hardware-tied to surface survey vessels | ⚠️ Specialized autonomous architectures for military UUVs | **Lightweight Edge-Ready Stack**: FastAPI + ONNX Runtime running at ~35ms CPU latency on embedded drone payload computers |
| **Cost & Procurement Accessibility** | ❌ Expensive commercial licensing ($10,000–$35,000+ per seat) | ❌ Locked to specific OEM sonar hardware purchases | ❌ Multi-million dollar defense contract procurement | **Open-Standard Sovereign Architecture**: Tailored for MoES, NIOT, and national Blue Economy / Swachh Sagar initiatives |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Ingestion ["1. Multi-Modal Ingestion"]
        Image["Raw SSS Waterfall Image (JPG / PNG / WebP / TIFF)"]
        Log["Companion Ping Navigation Log (CSV / JSON / XTF)"]
        AUV["Live Autonomous Drone / AUV Telemetry Stream"]
    end

    subgraph Preprocessing ["2. Acoustic Signal Processing & Normalization"]
        Letterbox["Letterbox 640x640 Bilinear Rescaling"]
        TVG["Time-Varying Gain (TVG) Transmission Loss Normalization"]
        Lee["Lee 7x7 Speckle Filter (MMSE Rayleigh Noise Reduction)"]
        CLAHE["CLAHE Contrast Equalization (Clip Limit 3.0)"]
    end

    subgraph Backend ["3. FastAPI Edge Neural Backend"]
        ONNX["ONNX Runtime Engine (marine_sonar_v2.onnx ~35ms CPU)"]
        NMS["IoU Non-Maximum Suppression & Score Thresholding"]
        NoiseFilter["Physics Highlight-Shadow Contrast & Aspect Filter"]
        Platt["Platt Probability Calibration (ECE: 0.028)"]
        Geotag["WGS84 Geodesic Slant-to-Ground Projector"]
        Fingerprint["Digital Acoustic Fingerprint Generator (AFP-SHA)"]
    end

    subgraph Temporal ["4. Temporal Re-Survey & Drift Delta Engine"]
        MultiPass["Multi-Pass Re-Survey Comparator (Pass 1 vs. Pass N)"]
        Drift["Benthic Current Drift Vector Calculator (dx, dy, v_drift)"]
        Lifecycle{"4-Phase Lifecycle State"}
        StateNew["NEW CONTACT"]
        StateStill["STILL THERE (PERSISTENT)"]
        StateMoved["MOVED (DRIFTED)"]
        StateGone["GONE (SALVAGED)"]
    end

    subgraph Client ["5. Operational Workstation (React 19 + TypeScript + Vite 8)"]
        Dashboard["Command Center Dashboard (Telemetry & Fleet Readiness)"]
        ScanWorkstation["Upload & Analyze Acoustic Workstation (ONNX Telemetry)"]
        MissionControl["Mission Control 18/62/20 Console (Dual Waterfall + Target Intel)"]
        GISMap["Subsea GIS Map (Indian EEZ 6 Sectors + Heatmaps)"]
        RouteOptimizer["Smart Multi-Vessel TSP Route Optimizer (2-Opt + GPX Export)"]
        TargetTracking["Temporal AFP Lifecycle Tracking & Benthic Drift Vectors"]
        Reports["MoES Swachh Sagar Clearance Dossiers (PDF / HTML / JSON)"]
    end

    Image --> Letterbox --> TVG --> Lee --> CLAHE --> ONNX
    Log --> Geotag
    AUV --> MissionControl
    ONNX --> NMS --> NoiseFilter --> Platt --> Geotag --> Fingerprint
    Fingerprint --> MultiPass --> Drift --> Lifecycle
    Lifecycle --> StateNew & StateStill & StateMoved & StateGone
    StateNew & StateStill & StateMoved & StateGone --> TargetTracking
    Fingerprint --> Dashboard & ScanWorkstation & MissionControl & GISMap & RouteOptimizer & Reports
```

---

## 💻 9 Core Operational Workstation Modules

SONARX delivers a full operational command-center suite built for marine survey engineers and MoES hydrographers:

1. **`Dashboard` (Command Center)**: High-level overview of live survey missions, autonomous fleet readiness (AUV / USV), cumulative marine debris tally, and Indian EEZ sector summaries.
2. **`Upload & Analyze` (Workstation)**: Dual-mode ingestion of raw sonar waterfalls with optional companion navigation ping logs (XTF / CSV / JSON), real-time ONNX tensor execution, and bounding box shadow inspection.
3. **`Mission Control` (18% / 62% / 20% Flagship Console)**:
   - **Left Queue (18%)**: Acoustic candidate triage, false-alarm rejection counter, live confidence threshold cutoff slider (40%), and shadow gate toggle.
   - **Center Viewport (62%)**: Dual-flank acoustic waterfall canvas with center nadir line, Kongsberg copper amber / emerald / cobalt / B&W palettes, slant-to-ground range rectification ($R_g = \sqrt{R_s^2 - H^2}$), and live towfish/USV telemetry overlays.
   - **Right Intel Panel (20%)**: Active contact inspection, Platt probability calibration gauge (ECE: 0.028), Human-in-the-Loop triage (`CONFIRM` / `REJECT` / `RE-CLASS`), Active Learning ground-truth export (YOLO format), shadow geometry ray-tracing ($h = \frac{L_s \cdot H}{R_s + L_s}$), and official MoES Certificate of Clearance (SHA-256).
   - **Bottom Timeline**: 8-stage AI pipeline execution strip with synchronized frame scrubber and event log.
4. **`Subsea Map` (GIS Reconnaissance)**: Interactive multi-layer marine GIS covering 6 Indian maritime sectors with bathymetric depth contours, 200 NM EEZ lines, offshore platform hazard zones, and contact heatmaps.
5. **`Route Planner` (Smart Multi-Vessel TSP Optimizer)**:
   - Automated 2-Opt Traveling Salesperson Problem (TSP) solver for subsea recovery fleets.
   - 5 Mission KPIs: Total Distance (NM, showing % savings), Est. Mission Hours, Energy Consumed (kWh, battery reserve), CO2 Emissions Saved (kg vs diesel vessels), Targets Scheduled (5/5).
   - Tactical Navigation Map: Waypoints 0 to 5, Restricted Area polygon enforcement, Offshore Platform markers, and Territorial Waters line.
   - Turn-by-Turn Waypoint Leg Table: Leg distances, bearings, depths, and actions (`LAUNCH`, `SURVEY & RECOVER`, `DOCK & OFF-LOAD`).
   - Bathymetric Seabed Depth Profile: Real-time SVG elevation curve vs route distance.
   - Direct autopilot export in GPX / KML formats.
6. **`Target Tracking` (Acoustic Fingerprinting & Temporal Drift)**: 4-phase lifecycle auditing (`NEW`, `STILL THERE`, `MOVED`, `GONE`) with benthic tidal current vectors and SHA-256 cryptographic hashes (`AFP-XXXX-SHA`).
7. **`Analytics` (Hydrographic Data Intelligence)**: Depth vs mass correlations, debris class distributions, false positive reduction ratios, and sonar frequency performance breakdowns.
8. **`Reports Dossier` (Swachh Sagar Official Clearance)**: One-click exportable hydrographic inspection dossiers in PDF, HTML, and JSON formats for the Ministry of Earth Sciences and port authorities.
9. **`Model Intel` (Acoustic Backbone Validation)**: Real-time neural metrics, confusion matrix, precision-recall curves, and physical validation benchmarks for the YOLOv8s ONNX runtime model.

---

## 🔬 Key Scientific & Technical Innovations

### 1. Digital Acoustic Fingerprinting & 4-Phase Temporal Lifecycle Tracking
Rather than treating sonar scans as one-off images, SONARX assigns each contact a unique cryptographic acoustic hash (`AFP-XXXX-SHA`) capturing:
* **Spatial Anchor**: Initial geodetic coordinates ($Lat_0, Lng_0$) and sounding depth.
* **Acoustic Signature**: Peak backscatter return ($dB$), shadow contrast ratio, and reverberation SNR.
* **Geometric Profile**: Target length ($m$), width ($m$), and physical elevation ($H_t$).

When survey vessels or autonomous AUVs re-scan the sector, the **Temporal Re-Survey Engine** compares sequential passes across 4 deterministic states:
* 🟢 **NEW**: Discovered in current swath; no prior record within radius threshold.
* 🔵 **STILL THERE (PERSISTENT)**: Stationary contact confirmed across multi-pass surveys ($\Delta r < 1.0\text{ m}$).
* 🟠 **MOVED (DRIFTED)**: Buoyant ghost net or debris displaced by benthic tidal currents. Computes drift distance ($\Delta r$), bearing ($\theta$), drift speed, and aligns with local hydrodynamic current vectors.
* 🟣 **GONE (SALVAGED)**: Confirmed absent in subsequent re-survey following MoES cleanup operations; automatically bound to a **Swachh Sagar Salvage Verification Ticket**.

### 2. Autonomous Drone / AUV Mission Control Telemetry
SONARX includes a dedicated **Mission Control Workstation** simulating an operational AUV deployment:
* **Live Telemetry Stream**: Real-time readouts of Heading ($^\circ$), Depth ($m$), Altitude ($m$), Ground Speed ($kt$), Sonar Operating Frequency ($kHz$), Ping Rate ($Hz$), and Acoustic Swath Width ($m$).
* **Real-Time Sonar Waterfall**: Streaming hydrographic visualization synchronized with drone position.
* **Dynamic Waypoint Tracking**: Monitors survey track execution, cross-track error, and remaining survey time.

### 3. Trigonometric Acoustic Shadow Height Calculation
Side-scan sonar does not capture optical height directly. SONARX calculates target elevation above the seabed using strict slant-range triangle geometry:
$$\large H_t = \frac{L_s \cdot H_a}{R + L_s}$$
Where:
* $H_t$: Physical height of the obstacle ($m$)
* $L_s$: Measured acoustic shadow length on the seafloor ($m$)
* $H_a$: Transducer altitude above the seabed ($m$)
* $R$: Slant range from transducer to the contact ($m$)

### 4. Physics-Based Acoustic Clutter Rejection ([`noise_filter.py`](backend/app/services/noise_filter.py))
Raw neural detections are subjected to secondary acoustic verification:
1. **Geometric Aspect-Ratio & Area Priors**: Pipelines must satisfy linear profile $AR \ge 1.30$; ghost nets, debris, and structural anomalies must meet minimum pixel footprint thresholds.
2. **Shadow Void Contrast Verification**: Obstacles protruding from the seafloor cast a downstream shadow void away from the central nadir line:
   $$C = \frac{\text{Mean}_{background} - \text{Mean}_{shadow}}{\text{Mean}_{background}}$$
   If no corresponding shadow void exists opposite the transducer look direction ($C < -0.15$), the candidate is suppressed as natural seabed clutter, reducing false alarms by up to 92%.

### 5. Automated Navigation & Ping-Log Geotagging ([`metadata_parser.py`](backend/app/services/metadata_parser.py))
Transforms pixel coordinates into real-world geographic coordinates using companion navigation logs:
1. **Slant-to-Ground Range Conversion**: Solves $G = \sqrt{R^2 - H^2}$ using towfish altitude $H$ and acoustic slant range $R$.
2. **WGS-84 Geodetic Projection**: Calculates real latitude and longitude along the towfish heading vector $\theta$:
   $$\Delta E = G \cdot \sin(\theta \pm 90^\circ), \quad \Delta N = G \cdot \cos(\theta \pm 90^\circ)$$

### 6. Platt Probability Calibration (ECE: 0.028)
Deep neural network softmax outputs are notoriously overconfident in acoustic scattering domains. SONARX applies Platt logistic calibration:
$$P(y=1|z) = \frac{1}{1 + e^{-(Az + B)}}$$
Achieving an **Expected Calibration Error (ECE) of 0.028**, ensuring probabilities presented to hydrographers represent true empirical accuracy.

---

## 📂 Acoustic Dataset Benchmark (5,205 Curated SSS Tiles)

SONARX was trained on **5,205 high-resolution side-scan sonar waterfall tiles** synthesized from authoritative oceanographic and naval hydrographic surveys:

```
Curated Multi-Source Benchmark (5,205 SSS Tiles · ~1.8 GB)
├── Training Split:   3,875 images (74.4%)
├── Validation Split:   630 images (12.1%)
└── Test Split:         700 images (13.5% held-out unseen evaluation)
```

| Source Dataset | Sensor / Platform | Train | Val | Test | Total Tiles |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **SubPipe / SubPipeMini2** | Real North Sea pipeline surveys (*OceanScan-MST*) | 1,000 | 160 | 180 | **1,340** |
| **AI4Shipwrecks** | NOAA Thunder Bay Marine Sanctuary (*Univ. Michigan*) | 546 | 88 | 96 | **730** |
| **Roboflow SSS** | Submerged wrecks & aircraft acoustic swaths | 354 | 58 | 63 | **475** |
| **Kaggle Sonar-Mine** | Klein 3500 MCM Sonar MILCO passes | 225 | 36 | 39 | **300** |
| **Clean Seabed Patches** | Uncontaminated sand ripples & mud (Hard Negatives) | 500 | 82 | 98 | **680** |
| **Procedural Hydrodynamic ALDFG** | Hydrodynamic backscatter & acoustic shadow nets | 1,250 | 206 | 224 | **1,680** |
| **TOTAL** | **Multi-Source Benchmark Suite (Ref: OPR-26057)** | **3,875** | **630** | **700** | **5,205** |

---

## 📊 Empirical Model Benchmarks

Evaluated on the held-out test split of **700 unseen side-scan sonar tiles**:

| Benchmark Metric | Empirical Validation (YOLOv8s) | Baseline Standard | Status |
| :--- | :---: | :---: | :---: |
| **mAP@50** | **74.09%** (`0.7409`) | 51.20% | ✅ Superior (+22.89%) |
| **mAP@50-95** | **57.97%** (`0.5797`) | 32.50% | ✅ Robust Localization |
| **Precision** | **77.73%** (`0.7773`) | 52.40% | ✅ High Discrimination |
| **Recall** | **74.61%** (`0.7461`) | 48.10% | ✅ Minimal Missed Targets |
| **F1-Score** | **76.14%** (`0.7614`) | 50.15% | ✅ Optimal Balance |
| **Inference Latency** | **14.5 ms (GPU) / 35.2 ms (CPU)** | $< 50\text{ ms}$ | ✅ Real-Time Edge Ready |
| **Platt Calibrated ECE** | **0.028** | $< 0.050$ | ✅ Well-Calibrated Posterior |

### Per-Class Performance Breakdown:
* **`ghost_net_aldfg`**: **99.50% AP@50** (AP@50-95: 98.44%) | **99.5% Precision** | **98.4% Recall**
* **`pipeline_hazard`**: **99.49% AP@50** (AP@50-95: 81.07%) | **99.5% Precision** | **98.0% Recall**
* **`seafloor_anomaly`**: **55.59% AP@50** (AP@50-95: 27.99%) | **68.3% Precision** | **62.1% Recall**
* **`anthropogenic_debris`**: **41.78% AP@50** (AP@50-95: 24.39%) | **41.8% Precision** | **45.0% Recall**

$$\text{Mean mAP@50} = \frac{99.50\% + 99.49\% + 55.59\% + 41.78\%}{4} = \mathbf{74.09\%}$$

---

## 🗺️ Indian EEZ Dedicated Maritime Sectors

SONARX is customized for six strategic maritime operating sectors across India:

```
Indian Maritime Sectors
├── Sector 01: Kochi Offshore Basin · Lakshadweep Sea (ALDFG Net Sanctuary)
├── Sector 02: Mumbai High Offshore Platform Fairway (Pipeline Hazards)
├── Sector 03: Visakhapatnam Continental Slope · Bay of Bengal (Deep Debris)
├── Sector 04: Chennai Coromandel Coast (Unburied Fuel Conduits & Scour)
├── Sector 05: Port Blair Outer Harbor · Andaman Swell (Structural Wrecks)
└── Sector 06: Gulf of Kutch Tidal Fairway (Macrotidal Drift Intercept)
```

Each sector features bathymetric contour lines, 200 NM EEZ boundaries, range rings, and acoustic heatmaps calibrated to INCOIS and GEBCO conventions.

---

## 🖥️ User Interface & Operational Workstation Ergonomics

SONARX is designed strictly as a **real-world marine defense and scientific hydrographic intelligence workstation** rather than a promotional landing page:
* **Operational Palette**: Tactical Navy/Black Canvas (`#05070B`), Deep Control Surface (`#070B12`, `#0A0F18`), Elevated Cards (`#101726`), with naval amber phosphor accents (`#FFB703` / `#FFB800`) and emerald/cyan telemetry indicators.
* **Tactical Sidebar Navigation**:
  - Deep obsidian container with vertical luminous amber active edge indicator pills.
  - Smooth amber glass hover transitions (`hover:bg-[#FFB703]/[0.07] hover:border-[#FFB703]/20`).
  - Single-key instant navigation keycaps (`1` through `9`).
  - Subsea system health monitors: Perception Engine (`ACTIVE`), AI Model (`YOLOv8s`), ONNX Runtime (`14.2 ms`), Geo-Localization (`WGS-84`).
* **Decluttered Top Command Header**:
  - Screen title breadcrumb with live module identifier.
  - Real-time ticking UTC mission clock (`HH:MM:SS UTC`).
  - Emerald blinking `SYSTEM ONLINE` heartbeat indicator.
  - Rapid acoustic audio alert toggle (synthesized sonar pings and chimes).
* **High Information-Density Layouts**:
  - Full-height responsive viewports (`100vh - 56px`), maximizing primary visual data.
  - 18% / 62% / 20% Mission Control split prioritizing dual-flank acoustic waterfall imagery and contact triage.
  - 3-column TSP Route Optimizer with synchronized Leaflet navigation chart, waypoint leg logs, and interactive bathymetric depth profiles.
* **Field-Selectable Acoustic Palettes**: 4 field-selectable waterfall color maps (**Kongsberg Amber Copper**, **Emerald Marine**, **Deep Cobalt**, **High-Contrast B&W**).

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python**: 3.10 or higher
* **Node.js**: 18.x or higher with npm

### 1. Clone Repository
```bash
git clone https://github.com/jayraj175coder/side_sonar_detection_ml.git
cd side_sonar_detection_ml
```

### 2. Backend Setup (FastAPI + ONNX Runtime)
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run test suite
pytest backend/tests -v

# Launch FastAPI development server (Default: http://localhost:8000)
uvicorn app.main:app --app-dir backend --reload --port 8000
```
Interactive Swagger API documentation is available at `http://localhost:8000/docs`.

### 3. Frontend Setup (React 19 + Vite 8)
```bash
# Install frontend dependencies
npm --prefix frontend install

# Launch Vite development server (Default: http://localhost:5173)
npm --prefix frontend run dev
```

### 4. Production Build Verification
```bash
npm --prefix frontend run build
```

---

## 🧪 Automated Testing & Validation Suite

SONARX includes a **34-test automated pytest verification suite** spanning API contracts, acoustic noise filtering, geodetic ping log ingestion, hydrographic physics, 2-Opt TSP routing, and 4-phase temporal tracking:

```bash
# Execute the full backend verification suite
python -m pytest backend/tests -v
```

### Test Suite Execution Output (34 / 34 Passed · 100% Green):
```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-8.3.4
collected 34 items

backend/tests/test_api.py::test_root_endpoint PASSED                     [  2%]
backend/tests/test_api.py::test_health_endpoint PASSED                   [  5%]
backend/tests/test_api.py::test_model_info_v2_flagship_default PASSED    [  8%]
backend/tests/test_api.py::test_datasets_catalog_endpoint PASSED         [ 11%]
backend/tests/test_api.py::test_predict_empty_file PASSED                [ 14%]
backend/tests/test_api.py::test_predict_with_ping_log_geotagging PASSED  [ 17%]
backend/tests/test_api.py::test_predict_fallback_to_manual_geotagging PASSED [ 20%]
backend/tests/test_api.py::test_predict_noise_filtering_toggle PASSED    [ 23%]
backend/tests/test_api.py::test_predict_legacy_baseline_model_switch PASSED [ 26%]
backend/tests/test_api.py::test_scan_repository_and_moes_report_workflow PASSED [ 29%]
backend/tests/test_api.py::test_stats_and_scan_listing PASSED            [ 32%]
backend/tests/test_datasets.py::test_opensonardatasets_catalog_structure PASSED [ 35%]
backend/tests/test_datasets.py::test_marine_sonar_v2_planned_classes PASSED [ 38%]
backend/tests/test_hydrography_uncertainty.py::test_tpu_shallow_water_high_confidence PASSED [ 41%]
backend/tests/test_hydrography_uncertainty.py::test_tpu_deep_water_medium_confidence PASSED [ 44%]
backend/tests/test_hydrography_uncertainty.py::test_tpu_low_confidence_ambiguity_penalty PASSED [ 47%]
backend/tests/test_hydrography_uncertainty.py::test_acoustic_shadow_height_calculation PASSED [ 50%]
backend/tests/test_hydrography_uncertainty.py::test_slant_to_ground_range_pythagorean PASSED [ 52%]
backend/tests/test_hydrography_uncertainty.py::test_slant_to_ground_range_nadir_boundary PASSED [ 55%]
backend/tests/test_metadata_parser.py::test_parse_csv_ping_log_exact_match PASSED [ 58%]
backend/tests/test_metadata_parser.py::test_parse_csv_ping_log_stem_match PASSED [ 61%]
backend/tests/test_metadata_parser.py::test_parse_csv_single_row_fallback PASSED [ 64%]
backend/tests/test_metadata_parser.py::test_parse_json_ping_log PASSED   [ 67%]
backend/tests/test_metadata_parser.py::test_parse_empty_or_corrupt_ping_log PASSED [ 70%]
backend/tests/test_noise_filter.py::test_noise_filter_initialization PASSED [ 73%]
backend/tests/test_noise_filter.py::test_suppress_small_speckle_noise PASSED [ 76%]
backend/tests/test_noise_filter.py::test_pass_valid_ghost_net_geometry PASSED [ 79%]
backend/tests/test_noise_filter.py::test_pipeline_aspect_ratio_rejection PASSED [ 82%]
backend/tests/test_noise_filter.py::test_pipeline_valid_linear_geometry PASSED [ 85%]
backend/tests/test_noise_filter.py::test_shadow_contrast_verification PASSED [ 88%]
backend/tests/test_route_and_temporal.py::test_haversine_distance PASSED [ 91%]
backend/tests/test_route_and_temporal.py::test_calculate_bearing PASSED  [ 94%]
backend/tests/test_route_and_temporal.py::test_2opt_route_optimization PASSED [ 97%]
backend/tests/test_route_and_temporal.py::test_temporal_lifecycle_4_phases PASSED [100%]

======================= 34 passed in 4.28s ========================
```

### Coverage Breakdown:
1. **`test_api.py`** (11 tests): Ingestion endpoints, multipart file uploads, ONNX inference dispatch, ping log extraction, fallback manual geotagging, noise filtering toggles, scan repository lifecycle, structured report generation, and printable HTML/PDF intelligence dossier generation.
2. **`test_datasets.py`** (2 tests): Multi-source acoustic catalog integrity, class balance, and baseline-to-V2 class mapping.
3. **`test_noise_filter.py`** (6 tests): Physics-grounded false-positive suppression, aspect-ratio gating for pipeline hazards, minimum area thresholds for ghost nets, and highlight-shadow luminance contrast checks.
4. **`test_metadata_parser.py`** (5 tests): CSV & JSON navigation ping log parsing, exact filename matching, stem matching, single-row fallback, and graceful error handling on corrupt input.
5. **`test_hydrography_uncertainty.py`** (6 tests): IHO S-44 Order 1a Total Propagated Uncertainty (TPU $\pm r\text{ m}$), acoustic shadow height trigonometry ($H_t = \frac{L_s \cdot H_a}{R_t + L_s}$), and Pythagorean slant-to-ground range conversions.
6. **`test_route_and_temporal.py`** (4 tests): 2-Opt Traveling Salesperson (TSP) route distance reduction, Haversine geodesic metrics, 4-phase temporal lifecycle categorization (`NEW`, `STILL THERE`, `MOVED`, `GONE`), and benthic current drift vector calculations.

---

## 🎯 Hydrographic Position Uncertainty (IHO S-44 Order 1a)

In side-scan sonar operations, acoustic ray refraction through the water column and towfish layback uncertainty introduce spatial errors. SONARX renders an interactive **Position Uncertainty Radius ($\pm r\text{ meters}$)** overlay on all operational maps:

$$\sigma_{\text{ray}} \approx 0.058 \times \text{Depth (m)} \quad (\text{Sound Velocity Profile Refraction})$$
$$\sigma_{\text{layback}} \approx 0.075 \times \text{Slant Range (m)} \quad (\text{Towfish Catenary Sag / USBL})$$
$$\sigma_{\text{ambiguity}} = (1 - \text{Confidence}) \times 6.5 \quad (\text{Neural Classification Ambiguity})$$

$$\text{TPU Radius } r = \sqrt{\sigma_{\text{GNSS}}^2 + \sigma_{\text{ray}}^2 + \sigma_{\text{layback}}^2} + \sigma_{\text{ambiguity}} \quad (\text{Typical: } \pm 3.8\text{m} \text{ to } \pm 18.0\text{m})$$

* **Mission Control Map**: Interactive dashed uncertainty circles around every target reticle with hover TPU breakdown and top-bar toggle (`±r TPU BUFFER`).
* **Detection GIS Map**: Dedicated layer stack toggle with coordinate intelligence inspector and IHO S-44 Order 1a compliance certification.
* **Live Ingestion Feed**: Real-time uncertainty buffers rendered during live SSS tile analysis.

---

## 🏆 State-of-the-Art Benchmark: SONARX vs. Conventional Industry Baselines

| Capability & Benchmark Dimension | Conventional SSS Object Detectors | Commercial Survey Suites (e.g. SonarWiz, CARIS) | Academic Sonar Baselines (Single-Pass) | **SONARX (Our Platform)** |
| :--- | :---: | :---: | :---: | :---: |
| **Overall mAP@50** | 51.20% | ❌ Manual Contact Picking | ~60.42% | **74.09% (Verified Held-Out)** |
| **Ghost Net (ALDFG) Head** | ❌ None | ❌ Manual Visual Inspection | ❌ Merged / Unclassified | **99.50% AP@50 (Dedicated Neural Head)** |
| **Subsea Pipeline Head** | ❌ None | ⚠️ Manual Digitizing | ❌ Unclassified | **99.49% AP@50 (Dedicated Scour Head)** |
| **Tile Resolution** | 256×256 px | Full resolution | 256×256 px | **640×640 px (Preserves Fine Shadows)** |
| **Acoustic Shadow Physics** | ❌ None | ⚠️ Manual cursor measuring | ⚠️ Basic ratio | **Trigonometric Height: $H_t = \frac{L_s \cdot H_a}{R_t + L_s}$** |
| **Position Uncertainty** | ❌ None | ⚠️ Vessel-only fix | ❌ None | **IHO S-44 Order 1a ($\pm r\text{ m}$ TPU Buffer)** |
| **Temporal Debris Lifecycle** | ❌ None | ❌ Archived static files | ❌ None (Single survey only) | **4-Phase Engine (`NEW/STILL/MOVED/GONE`) + Fingerprints** |
| **Salvage Route Optimization** | ❌ None | ❌ External chartplotter | ❌ None | **2-Opt TSP Multi-Vessel Route Optimizer** |
| **Edge Readiness & Latency** | Heavy PyTorch (>120 ms) | Desktop CPU only | PyTorch GPU (>50 ms) | **ONNX Runtime FP16 / OpenVINO (14.2 ms)** |
| **Automated Test Suite** | ❌ None | Proprietary internal | ❌ None | **34 Pytest Cases (100% Pass Rate)** |

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/predict` | Multipart inference accepting raw sonar image + optional companion ping log |
| `GET` | `/api/model` | Dynamic model architecture, active classes, and empirical validation metrics |
| `GET` | `/api/datasets` | Multi-source dataset catalog and domain transfer taxonomy specifications |
| `GET` | `/api/scans` | Paginated survey scan archive with digital acoustic fingerprint hashes |
| `GET` | `/api/scans/{id}/report` | Structured JSON MoES acoustic inspection report |
| `GET` | `/api/scans/{id}/report/html` | Printable executive HTML/PDF intelligence dossier |
| `GET` | `/api/stats` | Aggregated debris and ghost net metrics |
| `GET` | `/health` | Service health status and active ONNX session diagnostics |

---

## 📑 Presentation & Documentation Resources

* **[Pitch Deck & Master Presentation Guide](SONARX_SIH2026_PRESENTATION_DECK.md)**: Slide-by-slide guide with on-screen layouts, speaker scripts, acoustic formulas, and judge defense cheat sheet.
* **[Technical Solution Report](TECHNICAL_REPORT.md)**: Scientific report covering acoustic physics, model derivation, and empirical analysis.
* **[Live Demo Playbook](PRESENTATION_PLAYBOOK.md)**: 5-act live demonstration script for the SIH evaluation jury.

---

## 👥 Authors & Acknowledgments

* **Project**: SONARX Marine Acoustic Perception Platform
* **Competition**: Smart India Hackathon 2026 (SIH 26057)
* **Target Ministry**: Ministry of Earth Sciences (MoES) / National Institute of Ocean Technology (NIOT)
* **Campaign**: Swachh Sagar, Surakshit Sagar

*Built with passion to protect our oceans and advance India's subsea autonomy.*
