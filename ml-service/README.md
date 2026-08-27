# ThermalGuard ML Microservice (SIH 26162)

FastAPI-powered machine learning microservice for **AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources using NASA FIRMS data**.

## Architecture Role
This service serves as the core inference node in the ThermalGuard pipeline:
```
NASA FIRMS Feed ──► Supabase Edge Ingest ──► FastAPI (/predict) ──► Supabase DB ──► Next.js Frontend
```

## Features
- **Endpoints**:
  - `GET /health`: Health status, model load status, and uptime check.
  - `POST /predict`: Real-time single hotspot classification + explainability factors.
  - `POST /batch-predict`: Batch classification of incoming FIRMS satellite vectors.
- **Explainability Engine**: Translates thermal metrics (FRP, proximity, persistence, diurnal night flare) into clear human-understandable reasoning.
- **Fail-safe Fallback**: Embedded physics & spatial reasoning heuristics execute if the model file is not present or reloading.

## Quickstart (Local)
```bash
cd ml-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Swagger API docs available at: `http://localhost:8000/docs`

## Deploy to Render.com
1. Push this folder to a GitHub repository.
2. In Render dashboard: **New +** ➔ **Web Service** ➔ Select repository.
3. Choose **Python** runtime:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set environment variable:
   - `MODEL_PATH`: `fire_classifier_model.pkl`
5. Live Render URL: `https://ml-service-tqlq.onrender.com`
