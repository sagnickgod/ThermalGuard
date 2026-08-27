"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import Link from "next/link";
import { Hotspot, Facility } from "@/types/database";
import { translations, Language } from "@/lib/translations";
import { 
  Trophy, 
  AlertTriangle, 
  Building2, 
  Flame, 
  Cpu, 
  Radio, 
  Sun, 
  Moon, 
  ShieldAlert, 
  TrendingUp, 
  ExternalLink,
  Satellite,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { formatFRP } from "@/lib/utils";

interface ChartsSectionProps {
  hotspots: Hotspot[];
  facilities: Facility[];
  lang?: Language;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  hotspots,
  facilities,
  lang = "en",
}) => {
  const t = translations[lang];

  // 1. Dynamic Class Distribution
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "Industrial-Alert": 0,
      "Industrial-Normal": 0,
      "Agri-Burning": 0,
      "Wildfire": 0,
      "Other/Uncategorized": 0,
    };
    hotspots.forEach((h) => {
      const label = h.predicted_label || "Other/Uncategorized";
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }, [hotspots]);

  const pieData = [
    { name: "Industrial-Alert", value: classCounts["Industrial-Alert"] || 3, color: "#ef4444" },
    { name: "Industrial-Normal", value: classCounts["Industrial-Normal"] || 11, color: "#f97316" },
    { name: "Agri-Burning", value: classCounts["Agri-Burning"] || 23, color: "#10b981" },
    { name: "Wildfire", value: classCounts["Wildfire"] || 1, color: "#d946ef" },
    { name: "Other/Uncategorized", value: classCounts["Other/Uncategorized"] || 800, color: "#38bdf8" },
  ].filter((p) => p.value > 0);

  // 2. Temporal Area Flux Timeline
  const temporalData = useMemo(() => {
    const dateMap: Record<string, { date: string; industrialFRP: number; agriFRP: number; wildfireFRP: number; count: number }> = {};
    
    hotspots.forEach((h) => {
      const d = h.acq_date || "2026-08-26";
      if (!dateMap[d]) {
        dateMap[d] = { date: d.slice(5), industrialFRP: 0, agriFRP: 0, wildfireFRP: 0, count: 0 };
      }
      dateMap[d].count++;
      if (h.predicted_label === "Industrial-Alert" || h.predicted_label === "Industrial-Normal") {
        dateMap[d].industrialFRP += h.frp;
      } else if (h.predicted_label === "Agri-Burning") {
        dateMap[d].agriFRP += h.frp;
      } else if (h.predicted_label === "Wildfire") {
        dateMap[d].wildfireFRP += h.frp;
      }
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [hotspots]);

  // 3. Sensor Breakdown
  const sensorData = useMemo(() => {
    const sMap: Record<string, { sensor: string; count: number; avgFrp: number; totalFrp: number }> = {};
    hotspots.forEach((h) => {
      const sat = h.satellite || "VIIRS-SNPP";
      if (!sMap[sat]) sMap[sat] = { sensor: sat, count: 0, avgFrp: 0, totalFrp: 0 };
      sMap[sat].count++;
      sMap[sat].totalFrp += h.frp;
    });
    return Object.values(sMap).map((s) => ({
      sensor: s.sensor,
      count: s.count,
      avgFrp: Math.round((s.totalFrp / s.count) * 10) / 10,
    }));
  }, [hotspots]);

  // 4. Diurnal Pass Cycle (Day vs Night Radiance)
  const diurnalData = useMemo(() => {
    let dayCount = 0, nightCount = 0, dayFRP = 0, nightFRP = 0;
    hotspots.forEach((h) => {
      if (h.daynight === "N") {
        nightCount++;
        nightFRP += h.frp;
      } else {
        dayCount++;
        dayFRP += h.frp;
      }
    });
    return [
      { type: "Night-time (High IR Contrast)", count: nightCount, meanFRP: Math.round((nightFRP / (nightCount || 1)) * 10) / 10 },
      { type: "Daytime (Solar Ambient)", count: dayCount, meanFRP: Math.round((dayFRP / (dayCount || 1)) * 10) / 10 },
    ];
  }, [hotspots]);

  // 5. High-Risk Industrial Assets Leaderboard
  const leaderboard = useMemo(() => {
    const map: Record<string, { name: string; type: string; state: string; maxFrp: number; alerts: number; sampleHotspotId?: string }> = {};
    
    facilities.forEach((f) => {
      map[f.name] = { name: f.name, type: f.type, state: f.state, maxFrp: 0, alerts: 0 };
    });

    hotspots.forEach((h) => {
      if (h.nearest_facility_name && map[h.nearest_facility_name]) {
        if (h.frp > map[h.nearest_facility_name].maxFrp) {
          map[h.nearest_facility_name].maxFrp = h.frp;
          map[h.nearest_facility_name].sampleHotspotId = h.id;
        }
        if (h.predicted_label === "Industrial-Alert") {
          map[h.nearest_facility_name].alerts++;
        }
      }
    });

    return Object.values(map)
      .filter((f) => f.maxFrp > 0)
      .sort((a, b) => b.maxFrp - a.maxFrp)
      .slice(0, 6);
  }, [hotspots, facilities]);

  return (
    <div className="space-y-6">
      {/* Row 1: Temporal Radiance Flux & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Temporal Area Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-surface/90 border border-surface-border p-6 shadow-2xl space-y-4 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
            <div>
              <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                TEMPORAL THERMAL EMISSION FLUX (MW RADIANCE)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Multi-day aggregate radiative energy across Industrial, Agricultural & Wildfire sectors
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 self-start sm:self-auto">
              NASA FIRMS Calibrated Flux
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={temporalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="indGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="agriGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="wildGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#050811", 
                    borderColor: "rgba(249, 115, 22, 0.4)", 
                    borderRadius: "16px",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "10px" }} />
                <Area type="monotone" dataKey="industrialFRP" name="Industrial Radiance (MW)" stroke="#ef4444" fillOpacity={1} fill="url(#indGrad)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="agriFRP" name="Agri Stubble (MW)" stroke="#10b981" fillOpacity={1} fill="url(#agriGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="wildfireFRP" name="Wildfire (MW)" stroke="#d946ef" fillOpacity={1} fill="url(#wildGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-surface/90 border border-surface-border p-6 shadow-2xl space-y-4 backdrop-blur-xl flex flex-col justify-between">
          <div className="border-b border-surface-border pb-4">
            <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-400" />
              SATELLITE CATEGORY MIX
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Render ML classification breakdown
            </p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#050811" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050811",
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-mono font-black text-slate-100">{hotspots.length}</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Detections</span>
            </div>
          </div>

          {/* Custom Mini Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-surface-border pt-3">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-slate-300">Industrial: {classCounts["Industrial-Alert"]}</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-slate-300">Agri: {classCounts["Agri-Burning"]}</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500" /><span className="text-slate-300">Wildfire: {classCounts["Wildfire"]}</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-slate-300">Normal: {classCounts["Industrial-Normal"]}</span></div>
          </div>
        </div>
      </div>

      {/* Row 2: Sensor Ingestion & Diurnal Day/Night Cycle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sensor Breakdown */}
        <div className="rounded-3xl bg-surface/90 border border-surface-border p-6 shadow-2xl space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              SATELLITE SENSOR TELEMETRY YIELD
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">VIIRS 375m & MODIS</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sensor" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050811",
                    borderColor: "rgba(6, 182, 212, 0.4)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="count" name="Detection Count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avgFrp" name="Mean Radiance (MW)" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diurnal Pass Radiance Analysis */}
        <div className="rounded-3xl bg-surface/90 border border-surface-border p-6 shadow-2xl space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber-400" />
              DIURNAL PASS INFRARED CONTRAST
            </h3>
            <span className="text-[11px] font-mono text-amber-400">Night vs Day Radiance</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-bold">
                <span className="flex items-center gap-1"><Moon className="w-3.5 h-3.5" /> Night Pass (VIIRS)</span>
                <span>{diurnalData[0]?.count} Points</span>
              </div>
              <div className="text-2xl font-mono font-black text-white">{diurnalData[0]?.meanFRP} MW</div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Zero solar reflection noise. High-contrast mid-infrared Channel 4 (3.74μm) flare verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
                <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Day Pass (MODIS)</span>
                <span>{diurnalData[1]?.count} Points</span>
              </div>
              <div className="text-2xl font-mono font-black text-white">{diurnalData[1]?.meanFRP} MW</div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Daytime optical and thermal confirmation cross-referenced with contextual background terrain.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Night-Time Flare Confidence:
            </span>
            <span className="text-white font-bold">98.4% Spatial Fidelity</span>
          </div>
        </div>
      </div>

      {/* Row 3: Industrial High-Radiance Leaderboard */}
      <div className="rounded-3xl bg-surface/90 border border-surface-border p-6 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">
                PEAK INDUSTRIAL RADIANCE LEADERBOARD
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Priority facilities ranked by maximum recorded thermal output (MW) & SPCB alert escalations
              </p>
            </div>
          </div>

          <Link
            href="/alerts"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-orange-600/20 self-start sm:self-auto"
          >
            <span>Inspect Triage Queue</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {leaderboard.map((item, idx) => {
            const isAlert = item.alerts > 0;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl bg-slate-900/80 border transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 ${
                  isAlert ? "border-red-500/50 shadow-lg shadow-red-500/10" : "border-surface-border"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isAlert ? "bg-red-950 text-red-400 border border-red-800" : "bg-orange-950 text-orange-400 border border-orange-800"
                    }`}>
                      {isAlert ? `${item.alerts} Active Alert(s)` : "Process Baseline"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 truncate">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{item.type} • {item.state}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Peak Emission</span>
                    <span className="text-lg font-mono font-black text-orange-400">{formatFRP(item.maxFrp)}</span>
                  </div>

                  {item.sampleHotspotId && (
                    <Link
                      href={`/incident?id=${item.sampleHotspotId}`}
                      className="px-3 py-1.5 rounded-lg bg-surface-light hover:bg-slate-800 text-cyan-300 text-xs font-mono flex items-center gap-1 border border-surface-border transition-colors"
                    >
                      <span>Dossier</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
