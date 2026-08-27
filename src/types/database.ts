export type UserRole = 'admin' | 'analyst';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  organization: string | null;
  created_at: string;
}

export type FacilityCategory = 'industrial' | 'forest' | 'agriculture' | 'coalfield';

export interface Facility {
  id: string;
  name: string;
  type: string; // Refinery, Steel Plant, Power Plant, Forest Reserve, Agricultural Belt, etc.
  category?: FacilityCategory;
  state: string;
  latitude: number;
  longitude: number;
  risk_notes: string | null;
  created_at: string;
}

export type PredictedLabel = 
  | 'Industrial-Alert' 
  | 'Industrial-Normal' 
  | 'Agri-Burning' 
  | 'Wildfire' 
  | 'Other'
  | 'Other/Uncategorized';

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  frp: number; // Fire Radiative Power in MW
  confidence: number; // 0-100%
  acq_date: string; // YYYY-MM-DD
  acq_time: string; // HHMM
  satellite: string; // SNPP, N20, N21, Terra, Aqua
  instrument?: string; // VIIRS or MODIS
  daynight: 'D' | 'N';
  bright_ti4?: number | null; // Channel 4 Brightness Temp (Kelvin)
  bright_ti5?: number | null; // Channel 5 Brightness Temp (Kelvin)
  scan?: number | null; // Pixel size along scan (km)
  track?: number | null; // Pixel size along track (km)
  distance_to_facility_km: number | null;
  nearest_facility_name: string | null;
  nearest_facility_type: string | null;
  is_persistent: boolean;
  region_category: string | null;
  predicted_label: PredictedLabel;
  prediction_confidence: number; // 0.0 to 1.0
  class_probabilities?: Record<string, number> | null;
  explainability_summary: string | null;
  created_at: string;
}


export type AlertStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved';

export interface Alert {
  id: string;
  hotspot_id: string;
  status: AlertStatus;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  notes: string | null;
  created_at: string;
  hotspot?: Hotspot;
  profile?: Profile;
}

export interface AlertNotification {
  id: string;
  alert_id: string;
  sent_to_email: string;
  sent_at: string;
  method: string;
}

export interface MLPredictionResponse {
  predicted_label: PredictedLabel;
  confidence_score: number;
  class_probabilities: Record<string, number>;
  explainability_factors?: string[];
  plain_english_reason?: string;
  is_high_risk?: boolean;
}

export interface FilterState {
  search: string;
  category: string;
  facilityType: string;
  minFrp: number;
  confidenceThreshold: number;
  selectedDate: string | null;
  onlyAlerts: boolean;
  satelliteFilter?: string;
}
