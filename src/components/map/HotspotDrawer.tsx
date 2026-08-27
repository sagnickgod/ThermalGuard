"use client";

import React from "react";
import Link from "next/link";
import { 
  X, 
  Flame, 
  Building2, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Calendar, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText,
  Thermometer,
  Radio,
  Trees,
  Wheat,
  Layers
} from "lucide-react";
import { Hotspot } from "@/types/database";
import { getLabelColor, formatFRP, formatTime } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";

interface HotspotDrawerProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  lang?: Language;
  onAcknowledgeAlert?: (hotspotId: string) => void;
}

export const HotspotDrawer: React.FC<HotspotDrawerProps> = ({
  hotspot,
  onClose,
  lang = "en",
  onAcknowledgeAlert,
}) => {
  if (!hotspot) return null;

  const t = translations[lang];
  const colors = getLabelColor(hotspot.predicted_label);
  const isAlert = hotspot.predicted_label === "Industrial-Alert";
  const confidencePct = Math.round(hotspot.prediction_confidence * 100);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-navy-950/95 backdrop-blur-2xl border-l border-surface-border text-white shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right font-sans">
      {/* Header */}
      <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface/50">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${colors.bg} ${colors.text} border ${colors.border}`}>
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                {hotspot.predicted_label}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                {confidencePct}% AI Conf
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Lat: {hotspot.latitude.toFixed(4)}°N • Lon: {hotspot.longitude.toFixed(4)}°E
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-light transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Explainability Engine Highlight */}
        <div className="p-4 rounded-2xl bg-surface/90 border border-orange-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-orange-400">
              <Cpu className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                {t.explainabilityTitle}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Render ML Microservice
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {hotspot.explainability_summary || (
              isAlert 
                ? `Hotspot located ${hotspot.distance_to_facility_km?.toFixed(2)} km from ${hotspot.nearest_facility_name || 'industrial facility'} exhibits anomalous thermal intensity (${hotspot.frp.toFixed(1)} MW) requiring verification.`
                : `Thermal signature of ${hotspot.frp.toFixed(1)} MW matches expected baseline parameters.`
            )}
          </p>

          {/* Model Class Probabilities */}
          {hotspot.class_probabilities && Object.keys(hotspot.class_probabilities).length > 0 && (
            <div className="mt-3 pt-3 border-t border-orange-500/20 space-y-1.5 font-mono text-[11px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Model Multi-Class Probabilities
              </span>
              <div className="space-y-1">
                {Object.entries(hotspot.class_probabilities).map(([cls, prob]) => {
                  const pct = Math.round(prob * 100);
                  const isTop = cls === hotspot.predicted_label;
                  return (
                    <div key={cls} className="flex items-center justify-between text-[10px]">
                      <span className={`${isTop ? "text-orange-300 font-bold" : "text-slate-400"}`}>
                        {cls}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isTop ? "bg-orange-500" : "bg-slate-600"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`w-8 text-right ${isTop ? "text-orange-400 font-bold" : "text-slate-400"}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>


        {/* Core Radiative & Spatial Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-surface-light/40 border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              {t.frpText}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-black text-orange-400">
                {formatFRP(hotspot.frp)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-light/40 border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              {t.proximityText}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-black text-cyan-400">
                {hotspot.distance_to_facility_km !== null ? `${hotspot.distance_to_facility_km.toFixed(2)} km` : "Far (Rural)"}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed NASA Satellite Sensor Telemetry (New!) */}
        <div className="p-3.5 rounded-2xl bg-surface-light/30 border border-surface-border space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-surface-border pb-1.5 text-slate-300">
            <span className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-slate-200">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              NASA FIRMS Sensor Telemetry
            </span>
            <span className="text-[10px] text-orange-400">
              {hotspot.satellite} ({hotspot.instrument || "VIIRS"})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {hotspot.bright_ti4 && (
              <div className="flex justify-between text-slate-400 p-1.5 rounded bg-slate-900/60 border border-surface-border">
                <span>Ch4 Temp:</span>
                <span className="text-amber-300 font-bold">{hotspot.bright_ti4.toFixed(1)} K</span>
              </div>
            )}
            {hotspot.bright_ti5 && (
              <div className="flex justify-between text-slate-400 p-1.5 rounded bg-slate-900/60 border border-surface-border">
                <span>Ch5 Temp:</span>
                <span className="text-amber-300 font-bold">{hotspot.bright_ti5.toFixed(1)} K</span>
              </div>
            )}
            {hotspot.scan && (
              <div className="flex justify-between text-slate-400 p-1.5 rounded bg-slate-900/60 border border-surface-border">
                <span>Scan / Track:</span>
                <span className="text-slate-200">{hotspot.scan} × {hotspot.track} km</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400 p-1.5 rounded bg-slate-900/60 border border-surface-border">
              <span>Pass Type:</span>
              <span className="text-slate-200">{hotspot.daynight === 'N' ? 'Night (High Contrast)' : 'Daytime'}</span>
            </div>
          </div>
        </div>

        {/* Nearest Monitored Asset / Zone */}
        {hotspot.nearest_facility_name && (
          <div className="p-3.5 rounded-2xl bg-surface-light/30 border border-surface-border space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                {hotspot.nearest_facility_type?.includes("Forest") ? (
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                ) : hotspot.nearest_facility_type?.includes("Agri") ? (
                  <Wheat className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                )}
                Monitored Reference Zone
              </span>
              <span className="font-mono text-cyan-300 text-[11px]">
                {hotspot.nearest_facility_type}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-100">
              {hotspot.nearest_facility_name}
            </p>
          </div>
        )}

        {/* Acquisition Time */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            {hotspot.acq_date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {formatTime(hotspot.acq_time)}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-surface-border bg-surface/80 space-y-2">
        {isAlert && onAcknowledgeAlert && (
          <button
            onClick={() => onAcknowledgeAlert(hotspot.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all font-mono cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            {t.acknowledgeBtn}
          </button>
        )}

        <Link
          href={`/incident?id=${hotspot.id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-surface-light hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 border border-surface-border transition-colors font-mono"
        >
          <FileText className="w-4 h-4 text-orange-400" />
          <span>View Incident Dossier & Export PDF</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
