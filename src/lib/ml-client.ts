import { MLPredictionResponse } from "@/types/database";

const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "https://ml-service-tqlq.onrender.com";

export interface PredictParams {
  frp: number;
  confidence: number;
  month?: number;
  daynight?: 'D' | 'N';
  satellite?: string;
  distance_to_facility_km: number;
  nearest_facility_type?: string;
  is_persistent?: boolean;
  region_category?: string;
}

export async function checkMLServiceHealth(): Promise<{ status: string; online: boolean }> {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      return { status: data.status || "healthy", online: true };
    }
  } catch (err) {
    console.warn("ML Service health ping failed, using edge inference engine", err);
  }
  return { status: "embedded-engine", online: false };
}

export async function predictHotspot(params: PredictParams): Promise<MLPredictionResponse> {
  const predictUrl = `${ML_SERVICE_URL}/predict`;
  console.log(`[ML Client Request Payload -> ${predictUrl}]:`, JSON.stringify(params, null, 2));

  try {
    const res = await fetch(predictUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(45000), // 45s for Render cold-starts
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[ML Client Error <- ${predictUrl} HTTP ${res.status}]:`, errorText);
      throw new Error(`ML Microservice returned HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log(`[ML Client Response <- ${predictUrl}]:`, JSON.stringify(data, null, 2));

    return {
      predicted_label: data.predicted_label,
      confidence_score: data.confidence_score ?? 0.85,
      class_probabilities: data.class_probabilities || {},
      explainability_factors: data.explainability_factors || [],
      plain_english_reason: data.plain_english_reason || `Classified as ${data.predicted_label}`,
      is_high_risk: data.is_high_risk ?? (data.predicted_label === "Industrial-Alert"),
    };
  } catch (err: any) {
    console.error(`[ML Client Call Failed at ${predictUrl}]:`, err);
    throw new Error(`Failed to classify hotspot via ML microservice at ${predictUrl}: ${err.message}`);
  }
}

