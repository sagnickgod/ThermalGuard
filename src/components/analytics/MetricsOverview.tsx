"use client";

import React from "react";
import { translations, Language } from "@/lib/translations";
import { 
  Flame, 
  ShieldAlert, 
  Building2, 
  Cpu, 
  Radio, 
  TrendingUp, 
  Trees, 
  Wheat, 
  Activity,
  Zap,
  Sparkles,
  Award
} from "lucide-react";

interface MetricsOverviewProps {
  totalHotspots: number;
  activeAlerts: number;
  totalFacilities: number;
  avgConfidence: number;
  lang?: Language;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  totalHotspots,
  activeAlerts,
  totalFacilities,
  avgConfidence,
  lang = "en",
}) => {
  const t = translations[lang];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total NASA FIRMS Telemetry */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950/90 via-slate-900/80 to-navy-900/90 border border-surface-border p-5 shadow-2xl backdrop-blur-xl group hover:border-cyan-500/50 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            NASA FIRMS Multi-Sensor
          </span>
          <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Cpu className="w-4 h-4" />
          </span>
        </div>

        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-3xl sm:text-4xl font-mono font-black text-slate-100 tracking-tight">
            {totalHotspots.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-cyan-400 font-semibold">Active Points</span>
        </div>

        <p className="text-xs text-slate-400 font-sans mt-2 relative z-10 leading-relaxed">
          VIIRS 375m (SNPP, N20, N21) & MODIS 1km calibrated infrared feeds.
        </p>

        <div className="mt-3 pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
          <span>Telemetry Stream</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Synchronized
          </span>
        </div>
      </div>

      {/* Metric 2: Industrial Escalations */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950/90 via-slate-900/80 to-navy-900/90 border border-red-500/40 p-5 shadow-2xl backdrop-blur-xl group hover:border-red-500/70 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-red-600/25 transition-all" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-[11px] font-mono uppercase text-red-400 font-bold tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
            Industrial-Alert Queue
          </span>
          <span className="p-2 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 shadow-lg shadow-red-500/20">
            <Flame className="w-4 h-4" />
          </span>
        </div>

        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-3xl sm:text-4xl font-mono font-black text-red-400 tracking-tight">
            {activeAlerts}
          </span>
          <span className="text-xs font-mono text-orange-400 font-semibold">SPCB Escalated</span>
        </div>

        <p className="text-xs text-slate-400 font-sans mt-2 relative z-10 leading-relaxed">
          Acute flare volume spikes exceeding 30-day baseline envelopes by &gt;250%.
        </p>

        <div className="mt-3 pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
          <span>Dispatch Protocol</span>
          <span className="text-red-400 font-bold">Auto-Triage Active</span>
        </div>
      </div>

      {/* Metric 3: Monitored Asset Registry */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950/90 via-slate-900/80 to-navy-900/90 border border-surface-border p-5 shadow-2xl backdrop-blur-xl group hover:border-orange-500/50 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/20 transition-all" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-orange-400" />
            Monitored GIS Zones
          </span>
          <span className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-lg shadow-orange-500/10">
            <Activity className="w-4 h-4" />
          </span>
        </div>

        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-3xl sm:text-4xl font-mono font-black text-slate-100 tracking-tight">
            {totalFacilities}
          </span>
          <span className="text-xs font-mono text-orange-400 font-semibold">Industrial & Forest</span>
        </div>

        <p className="text-xs text-slate-400 font-sans mt-2 relative z-10 leading-relaxed">
          Refineries, Steel Plants, Tiger Reserves & Agricultural Corridors.
        </p>

        <div className="mt-3 pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
          <span>Buffer Zones</span>
          <span className="text-cyan-300 font-bold">5km - 25km GIS Rings</span>
        </div>
      </div>

      {/* Metric 4: Render ML Model Confidence */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950/90 via-slate-900/80 to-navy-900/90 border border-emerald-500/30 p-5 shadow-2xl backdrop-blur-xl group hover:border-emerald-500/60 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Render ML Accuracy
          </span>
          <span className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Award className="w-4 h-4" />
          </span>
        </div>

        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-tight">
            {Math.round(avgConfidence * 100)}%
          </span>
          <span className="text-xs font-mono text-emerald-400/80 font-semibold">Mean Confidence</span>
        </div>

        <p className="text-xs text-slate-400 font-sans mt-2 relative z-10 leading-relaxed">
          RandomForest + GradientBoost ensemble hosted live on Render microservice.
        </p>

        <div className="mt-3 pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
          <span>Inference Latency</span>
          <span className="text-emerald-400 font-bold">~42ms / Prediction</span>
        </div>
      </div>
    </div>
  );
};
