import { calculateHaversineDistance } from "./utils";
import { Facility, Hotspot } from "@/types/database";

const FIRMS_MAP_KEY = process.env.FIRMS_MAP_KEY || "2bc25f7af118faf28d9b36473b6fe85f";
const RENDER_ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "https://ml-service-tqlq.onrender.com";

export interface RawFIRMSDetection {
  latitude: number;
  longitude: number;
  bright_ti4?: number;
  bright_ti5?: number;
  scan?: number;
  track?: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: number;
  version?: string;
  frp: number;
  daynight: 'D' | 'N';
}

/**
 * Fetch comprehensive multi-sensor real NASA FIRMS feeds (VIIRS SNPP, NOAA-20, NOAA-21, MODIS)
 */
export async function fetchLiveFIRMSData(days = 5): Promise<RawFIRMSDetection[]> {
  const sources = [
    { name: "SNPP", instrument: "VIIRS", url: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_MAP_KEY}/VIIRS_SNPP_NRT/68,7,98,37/${days}` },
    { name: "N20", instrument: "VIIRS", url: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_MAP_KEY}/VIIRS_NOAA20_NRT/68,7,98,37/${days}` },
    { name: "N21", instrument: "VIIRS", url: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_MAP_KEY}/VIIRS_NOAA21_NRT/68,7,98,37/${days}` },
    { name: "Terra/Aqua", instrument: "MODIS", url: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_MAP_KEY}/MODIS_NRT/68,7,98,37/${days}` },
  ];

  const detections: RawFIRMSDetection[] = [];

  for (const src of sources) {
    try {
      const res = await fetch(src.url, { next: { revalidate: 300 } });
      if (!res.ok) continue;

      const csvText = await res.text();
      const lines = csvText.trim().split("\n");
      if (lines.length <= 1) continue;

      const headers = lines[0].split(",").map((h) => h.trim());
      const latIdx = headers.indexOf("latitude");
      const lonIdx = headers.indexOf("longitude");
      const frpIdx = headers.indexOf("frp");
      const confIdx = headers.indexOf("confidence");
      const dateIdx = headers.indexOf("acq_date");
      const timeIdx = headers.indexOf("acq_time");
      const satIdx = headers.indexOf("satellite");
      const dnIdx = headers.indexOf("daynight");
      const ti4Idx = headers.indexOf("bright_ti4") !== -1 ? headers.indexOf("bright_ti4") : headers.indexOf("brightness");
      const ti5Idx = headers.indexOf("bright_ti5") !== -1 ? headers.indexOf("bright_ti5") : headers.indexOf("bright_t31");
      const scanIdx = headers.indexOf("scan");
      const trackIdx = headers.indexOf("track");

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim());
        if (parts.length < headers.length) continue;

        const lat = parseFloat(parts[latIdx]);
        const lon = parseFloat(parts[lonIdx]);
        const frp = parseFloat(parts[frpIdx]) || 5.0;
        
        let confRaw = parts[confIdx];
        let conf = 80;
        if (confRaw === "l" || confRaw === "low") conf = 40;
        else if (confRaw === "n" || confRaw === "nominal") conf = 75;
        else if (confRaw === "h" || confRaw === "high") conf = 95;
        else conf = parseFloat(confRaw) || 80;

        const date = parts[dateIdx] || new Date().toISOString().split("T")[0];
        const time = parts[timeIdx] || "1200";
        const sat = parts[satIdx] || src.name;
        const dn = (parts[dnIdx] || "D").toUpperCase() as "D" | "N";
        const ti4 = ti4Idx !== -1 ? parseFloat(parts[ti4Idx]) : undefined;
        const ti5 = ti5Idx !== -1 ? parseFloat(parts[ti5Idx]) : undefined;
        const scan = scanIdx !== -1 ? parseFloat(parts[scanIdx]) : undefined;
        const track = trackIdx !== -1 ? parseFloat(parts[trackIdx]) : undefined;

        if (!isNaN(lat) && !isNaN(lon)) {
          detections.push({
            latitude: lat,
            longitude: lon,
            bright_ti4: !isNaN(ti4 as number) ? ti4 : undefined,
            bright_ti5: !isNaN(ti5 as number) ? ti5 : undefined,
            scan: !isNaN(scan as number) ? scan : undefined,
            track: !isNaN(track as number) ? track : undefined,
            frp,
            confidence: conf,
            acq_date: date,
            acq_time: time,
            satellite: sat === "N" ? "SNPP" : sat,
            instrument: src.instrument,
            daynight: dn,
          });
        }
      }
    } catch (e) {
      console.warn("Failed fetching from source", src.name, e);
    }
  }

  return detections;
}

/**
 * Classify real detection strictly with the live Render ML Microservice.
 * All classification decisions come exclusively from the deployed model API.
 */
export async function classifyWithRenderML(
  detection: RawFIRMSDetection,
  facilities: Facility[]
) {
  let nearestFac: Facility | null = null;
  let minDistance = 999999;

  for (const fac of facilities) {
    const dist = calculateHaversineDistance(
      detection.latitude,
      detection.longitude,
      fac.latitude,
      fac.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestFac = fac;
    }
  }

  const isIndustrialNear = minDistance <= 3.5 && (!nearestFac?.category || nearestFac.category === "industrial");
  const isForestNear = minDistance <= 15.0 && nearestFac?.category === "forest";
  const isAgriNear = minDistance <= 25.0 && nearestFac?.category === "agriculture";

  const isPersistent = isIndustrialNear && detection.frp < 90.0;
  const month = parseInt(detection.acq_date.split("-")[1] || "8", 10);

  // Region category feature calculation
  let regionCategory = "general";
  if (isForestNear || (detection.latitude >= 28 && detection.latitude <= 32 && detection.longitude >= 78 && detection.longitude <= 82)) {
    regionCategory = "Wildfire";
  } else if (isAgriNear || (detection.latitude >= 29 && detection.latitude <= 32 && detection.longitude >= 74 && detection.longitude <= 78)) {
    regionCategory = "Agri-Burning";
  } else if (isIndustrialNear) {
    regionCategory = "industrial_corridor";
  }

  // Satellite normalization for Render microservice
  let satClean = detection.satellite;
  if (satClean.includes("SNPP") || satClean === "N") satClean = "SNPP";
  else if (satClean.includes("20")) satClean = "N20";
  else if (satClean.includes("21")) satClean = "N21";
  else satClean = "Terra";

  const payload = {
    frp: detection.frp,
    confidence: detection.confidence,
    month: month,
    daynight: detection.daynight,
    satellite: satClean,
    distance_to_facility_km: minDistance < 9999 ? Number(minDistance.toFixed(2)) : 50.0,
    nearest_facility_type: nearestFac?.type || "General",
    is_persistent: isPersistent ? 1 : 0,
    region_category: regionCategory,
    latitude: detection.latitude,
    longitude: detection.longitude,
  };

  const predictUrl = `${RENDER_ML_URL}/predict`;
  console.log(`[ML API Request Payload -> ${predictUrl}]:`, JSON.stringify(payload, null, 2));

  let predictedLabel: string;
  let predConfidence: number;
  let classProbabilities: Record<string, number> = {};
  let explainReason = "";

  try {
    const res = await fetch(predictUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000), // 45s to accommodate Render free-tier cold starts
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[ML API Error Response <- ${predictUrl} HTTP ${res.status}]:`, errorText);
      throw new Error(`ML Microservice returned HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log(`[ML API Response <- ${predictUrl}]:`, JSON.stringify(data, null, 2));

    predictedLabel = data.predicted_label;
    predConfidence = data.confidence_score ?? 0.85;
    classProbabilities = data.class_probabilities || {};
    explainReason = data.plain_english_reason || (
      data.explainability_factors && data.explainability_factors.length > 0
        ? data.explainability_factors.join(". ")
        : `Classified as ${predictedLabel} with ${(predConfidence * 100).toFixed(1)}% model confidence.`
    );
  } catch (err: any) {
    console.error(`[ML API Execution Failed at ${predictUrl}]:`, err);
    throw new Error(`Failed to classify hotspot via ML Model API (${predictUrl}): ${err.message}`);
  }

  return {
    detection,
    nearestFac,
    minDistance: minDistance < 9999 ? minDistance : null,
    isPersistent,
    regionCategory,
    predicted_label: predictedLabel,
    prediction_confidence: predConfidence,
    class_probabilities: classProbabilities,
    explainReason,
  };
}

