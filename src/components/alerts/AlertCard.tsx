"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Building2, 
  Calendar, 
  Clock, 
  Flame, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Clock3,
  MessageSquare,
  Copy,
  Check,
  Radio,
  Sparkles,
  Zap,
  Trees,
  Wheat,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { Alert, Hotspot } from "@/types/database";
import { getStatusColor, getLabelColor, formatFRP, formatTime } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";

interface AlertCardProps {
  alert: Alert & { hotspot?: Hotspot };
  onUpdateStatus: (alert: Alert) => void;
  lang?: Language;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onUpdateStatus,
  lang = "en",
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const t = translations[lang];
  const hotspot = alert.hotspot;
  const statusColor = getStatusColor(alert.status);
  const labelColor = getLabelColor(hotspot?.predicted_label || "Industrial-Alert");

  const isAlert = hotspot?.predicted_label === "Industrial-Alert" || !hotspot;
  const isNight = hotspot?.daynight === "N";
  const frpVal = hotspot?.frp || 0;
  const isHighIntensity = frpVal >= 50.0;
  const confPct = Math.round((hotspot?.prediction_confidence || 0.95) * 100);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "🔴 Action Required";
      case "acknowledged":
        return "🔵 Acknowledged";
      case "investigating":
        return "🟡 Under Investigation";
      case "resolved":
        return "🟢 Resolved";
      default:
        return status.toUpperCase();
    }
  };

  const copyCoordinates = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hotspot) return;
    const text = `Lat: ${hotspot.latitude.toFixed(5)}, Lon: ${hotspot.longitude.toFixed(5)} | FRP: ${hotspot.frp.toFixed(1)} MW | ${hotspot.nearest_facility_name || 'Industrial Area'} (${hotspot.distance_to_facility_km?.toFixed(2)} km) | Category: ${hotspot.predicted_label}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // FRP Percentage for visual power bar (capped at 100 for bar width)
  const frpBarWidth = Math.min(100, Math.max(8, Math.round((frpVal / 120) * 100)));

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0b1329]/95 via-[#070c1b]/95 to-[#040711]/98 border transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.01] flex flex-col justify-between group ${
      isAlert
        ? "border-red-500/40 hover:border-red-400 shadow-red-950/20"
        : hotspot?.predicted_label === "Agri-Burning"
        ? "border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/20"
        : "border-amber-500/40 hover:border-amber-400 shadow-amber-950/20"
    }`}>
      {/* Ambient background glow */}
      <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-opacity ${
        isAlert ? "bg-red-600/20 group-hover:bg-red-500/30" : "bg-cyan-600/15 group-hover:bg-cyan-500/25"
      }`} />

      {/* Top Header Banner */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Status & Label Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wide border shadow-sm ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
              {getStatusLabel(alert.status)}
            </span>

            {hotspot?.predicted_label && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${labelColor.bg} ${labelColor.text} ${labelColor.border}`}>
                {hotspot.predicted_label}
              </span>
            )}

            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800/40">
              {confPct}% AI Conf
            </span>
          </div>

          {/* Acquisition Timestamp & Pass */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-200 font-semibold">{hotspot?.acq_date || alert.created_at.slice(0, 10)}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{formatTime(hotspot?.acq_time || "1200")}</span>
          </div>
        </div>

        {/* Facility Target Information */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-100 group-hover:text-orange-400 transition-colors flex items-center gap-2">
              {hotspot?.nearest_facility_type?.includes("Forest") ? (
                <Trees className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : hotspot?.nearest_facility_type?.includes("Agri") ? (
                <Wheat className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span className="truncate">
                {hotspot?.nearest_facility_name || "Unregistered Industrial Sector"}
              </span>
            </h3>

            {/* Quick Copy Coordinates Button */}
            {hotspot && (
              <button
                onClick={copyCoordinates}
                className="px-2 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-[11px] font-mono text-slate-400 hover:text-cyan-300 border border-surface-border flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Copy Telemetry & GIS Coordinates"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied!" : `${hotspot.latitude.toFixed(3)}°, ${hotspot.longitude.toFixed(3)}°`}</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-cyan-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              {hotspot?.distance_to_facility_km !== null && hotspot?.distance_to_facility_km !== undefined
                ? `${hotspot.distance_to_facility_km.toFixed(2)} km to ${hotspot.nearest_facility_type || 'facility'}`
                : "Regional sector coordinates"}
            </span>

            {isNight && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
                🌙 Night Flare
              </span>
            )}
          </div>
        </div>

        {/* FRP Thermal Gauge Bar */}
        {hotspot && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-surface-border space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Fire Radiative Power (FRP)
              </span>
              <span className={`font-black text-sm ${isHighIntensity ? "text-red-400 animate-pulse" : "text-orange-400"}`}>
                {formatFRP(hotspot.frp)}
              </span>
            </div>

            {/* Visual Power Level Gauge */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden p-0.5 border border-surface-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isHighIntensity
                    ? "bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 shadow-sm shadow-red-500"
                    : "bg-gradient-to-r from-amber-400 to-orange-500"
                }`}
                style={{ width: `${frpBarWidth}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Sensor: {hotspot.satellite} ({hotspot.instrument || "VIIRS"})</span>
              {hotspot.bright_ti4 && <span>Ch4: {hotspot.bright_ti4.toFixed(1)} K</span>}
            </div>
          </div>
        )}

        {/* Explainability / Investigation Notes */}
        {alert.notes && (
          <div className="p-3 rounded-xl bg-navy-950/90 border border-orange-500/20 text-xs text-slate-300 font-sans space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-orange-400 uppercase tracking-wider font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SPCB Incident Log</span>
            </div>
            <p className="line-clamp-2 text-slate-300 text-[11px] leading-relaxed">
              {alert.notes}
            </p>
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="p-3 sm:px-5 sm:py-3.5 border-t border-surface-border bg-slate-950/70 flex items-center justify-between gap-2.5">
        <button
          onClick={() => onUpdateStatus(alert)}
          className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-orange-600/80 to-amber-600/80 hover:from-orange-500 hover:to-amber-500 text-xs font-mono font-bold text-white border border-orange-400/40 shadow-md shadow-orange-600/20 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Update Status</span>
        </button>

        {hotspot && (
          <Link
            href={`/incident?id=${hotspot.id}`}
            className="py-2 px-3 rounded-xl bg-surface-light hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-surface-border text-xs font-mono font-medium transition-colors flex items-center gap-1"
            title="Inspect Satellite Telemetry & Statutory PDF"
          >
            <span>Dossier</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
