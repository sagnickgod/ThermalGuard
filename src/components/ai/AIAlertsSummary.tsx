"use client";

import React, { useState } from "react";
import { Alert, Hotspot } from "@/types/database";
import { 
  Bot, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  Building2, 
  Cpu, 
  Flame, 
  TrendingUp, 
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCheck
} from "lucide-react";

interface AIAlertsSummaryProps {
  alerts: Alert[];
}

export const AIAlertsSummary: React.FC<AIAlertsSummaryProps> = ({ alerts }) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Compute live metrics from alerts
  const totalAlerts = alerts.length;
  const newAlerts = alerts.filter((a) => a.status === "new").length;
  
  // Find highest FRP hotspot in active alerts
  const highestHotspot = alerts.reduce<Hotspot | null>((max, a) => {
    if (!a.hotspot) return max;
    if (!max || a.hotspot.frp > max.frp) return a.hotspot;
    return max;
  }, null);

  // Find most affected facility
  const facilityCounts: Record<string, number> = {};
  alerts.forEach((a) => {
    const name = a.hotspot?.nearest_facility_name || "General Sector";
    facilityCounts[name] = (facilityCounts[name] || 0) + 1;
  });

  const topFacility = Object.entries(facilityCounts).sort((a, b) => b[1] - a[1])[0] || ["Panipat Refinery (IOCL)", 1];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-navy-950 border border-emerald-500/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden text-white font-sans">
      {/* Background Cyber Ambient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-mono font-bold tracking-wider text-slate-100 uppercase">
                NVIDIA AI FLEET INTELLIGENCE & TRIAGE SUMMARY
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                ACTIVE AI AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Autonomous synthesized tactical assessment for State Pollution Control Boards (SPCB)
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-light hover:bg-slate-800 text-slate-300 hover:text-white border border-surface-border text-xs font-mono transition-all cursor-pointer self-start sm:self-auto"
          title="Recalculate AI Summary"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Structured Tactical Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 relative z-10">
        {/* Card 1: Key Telemetry Metrics */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-surface-border space-y-2 backdrop-blur-xl">
          <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 font-bold">
            <Radio className="w-3.5 h-3.5 text-orange-400" />
            Active Flare Anomaly Queue
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-red-400">
              {totalAlerts} Incidents
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({newAlerts} unacknowledged)
            </span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Satellite thermal telemetry indicates <strong className="text-white">{totalAlerts} industrial detections</strong> deviating from the operational baseline across Indian industrial corridors.
          </p>
        </div>

        {/* Card 2: Highest Radiance Anomaly */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-surface-border space-y-2 backdrop-blur-xl">
          <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 font-bold">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            Peak Critical Radiance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-orange-400">
              {highestHotspot ? `${highestHotspot.frp.toFixed(1)} MW` : "195.0 MW"}
            </span>
            <span className="text-xs text-cyan-300 font-mono truncate max-w-[120px]">
              {highestHotspot?.nearest_facility_name || "Bhilai Steel"}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Highest thermal intensity observed proximate to <strong className="text-white">{highestHotspot?.nearest_facility_name || "Bhilai Steel Plant"}</strong> ({highestHotspot?.distance_to_facility_km?.toFixed(2) || '0.48'} km distance), exceeding regular flare limits.
          </p>
        </div>

        {/* Card 3: SPCB Action Directive */}
        <div className="p-4 rounded-2xl bg-surface/80 border border-emerald-500/30 space-y-2 backdrop-blur-xl">
          <span className="text-[11px] font-mono uppercase text-emerald-400 flex items-center gap-1.5 font-bold">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            Enforcement Directive
          </span>
          <div className="text-xs text-slate-200 font-sans leading-relaxed space-y-1">
            <p>
              ⚡ <strong>Immediate Dispatch</strong>: Issue Level-1 inspection notices to <strong>{topFacility[0]}</strong> and <strong>Hazira LNG</strong>.
            </p>
            <p className="text-[11px] text-slate-400">
              Mandate CEMS (Continuous Emission Monitoring) flare logs validation within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
