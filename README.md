# 🔥 ThermalGuard — AI Spaceborne Industrial Fire & Thermal Anomaly Intelligence

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement ID**: `26162`  
> **Theme**: Space Technology / AI for Disaster & Environmental Monitoring  
> **Live Production URL**: [https://thermalguard.pages.dev](https://thermalguard.pages.dev)  
> **ML Microservice URL**: [https://ml-service-tqlq.onrender.com](https://ml-service-tqlq.onrender.com)

---

## 🛰️ Overview

**ThermalGuard** is an end-to-end autonomous satellite intelligence and situational awareness platform designed to detect, classify, and escalate **industrial fire anomalies, hazardous chemical flaring, agricultural stubble burning, and forest wildfires** across the Indian subcontinent in near-real-time (NRT).

By fusing **NASA FIRMS multi-sensor satellite telemetry (VIIRS SNPP, NOAA-20, NOAA-21, MODIS Terra/Aqua)** with **spatial GIS buffer zones** and a **dedicated scikit-learn/FastAPI ML Microservice hosted on Render**, ThermalGuard separates routine industrial flare baselines from emergency industrial spikes with high precision.

---

## 🏗️ Architecture & Pipeline

```
┌────────────────────────────────────────────────────────┐
│   NASA FIRMS Satellite Telemetry (VIIRS & MODIS)       │
│   - FRP (MW), Ch4/Ch5 Kelvin Temp, Scan/Track, Pass    │
└───────────────────────────┬────────────────────────────┘
                            │ (Live Stream / Bounding Box)
                            ▼
┌────────────────────────────────────────────────────────┐
│   GIS Spatial Feature Extraction Engine                │
│   - Haversine Proximity to 4 Monitored Asset Classes   │
│   - Multi-day Temporal Persistence & Baseline Delta    │
└───────────────────────────┬────────────────────────────┘
                            │ Feature Vector JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│   FastAPI ML Classification Microservice (Render)      │
│   - Model: Scikit-learn Classifier (.pkl + .json)     │
│   - Classes: Industrial-Alert, Industrial-Normal,      │
│              Agri-Burning, Wildfire, Other             │
└───────────────────────────┬────────────────────────────┘
                            │ Predictions + Probabilities
                            ▼
┌────────────────────────────────────────────────────────┐
│   Supabase Postgres & Realtime Broadcast               │
│   - Row Level Security (RLS) & Automated Alerts Queue  │
└───────────────────────────┬────────────────────────────┘
                            │ Realtime WebSockets
                            ▼
┌────────────────────────────────────────────────────────┐
│   Next.js 14 Mission Control Desk (Cloudflare Pages)   │
│   - 100% Free Leaflet GIS (Esri Satellite & Dark Mode) │
│   - AI Explainability Drawer (Channel Kelvin & Physics)│
│   - Incident Dossier & 1-Click Printable PDF Export    │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Key Capabilities

1. **Multi-Sensor NASA Telemetry**:
   - Ingests **2,000+ real satellite thermal detections** across India.
   - Extracts Fire Radiative Power (MW), Channel 4 (`bright_ti4`) & Channel 5 (`bright_ti5`) brightness temperatures in **Kelvin (K)**, and sub-pixel scan geometries.

2. **Multi-Zone Environmental Registry**:
   - 🔷 **Heavy Industry**: Refineries, Steel Plants, Power Stations (5km safety perimeters).
   - 🌲 **Forest Reserves**: Jim Corbett, Kaziranga, Simlipal, Gir, Bandipur (15km wildfire perimeters).
   - 🌾 **Agricultural Farmland Belts**: Sangrur-Patiala Corridor, Malwa Belt, Western UP, Cauvery Delta (20km stubble burning corridors).
   - ⛏️ **Coal Mining Basins**: Persistent subsurface coal fires in Jharia & Singrauli.

3. **Autonomous Incident Triage**:
   - Flags acute industrial deviations exceeding the baseline flare envelope.
   - 1-click statutory incident report generation with downloadable PDF dossiers.

4. **100% Free Leaflet GIS Mapping**:
   - High-resolution **Esri World Satellite Imagery** and **CartoDB Dark Matter** base layers.
   - Zero proprietary token limits.

5. **Bilingual Operator Interface**:
   - Instant toggle between **English** and **हिन्दी (Hindi)**.

---

## 🚀 Quick Start Locally

### 1. Clone the repository
```bash
git clone https://github.com/sagnickgod/ThermalGuard.git
cd ThermalGuard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
FIRMS_MAP_KEY=2bc25f7af118faf28d9b36473b6fe85f
NEXT_PUBLIC_FIRMS_MAP_KEY=2bc25f7af118faf28d9b36473b6fe85f
NEXT_PUBLIC_ML_SERVICE_URL=https://ml-service-tqlq.onrender.com
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Cloud Deployment

- **Frontend**: [Cloudflare Pages](https://thermalguard.pages.dev)
- **Database**: [Supabase Postgres](https://supabase.com)
- **ML Microservice**: [Render](https://render.com) (FastAPI Python 3.11)

---

## 👥 Authors
- **Team**: ThermalGuard AI Team
- **Smart India Hackathon 2024**
