"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Hotspot, Facility } from "@/types/database";
import { translations, Language } from "@/lib/translations";
import { Trophy, AlertTriangle, Building2, Flame, Cpu, Radio } from "lucide-react";

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

  // 1. Dynamic Class Distribution Data from Real Database
  const classCounts: Record<string, number> = {};

  hotspots.forEach((h) => {
    const label = h.predicted_label || "Other/Uncategorized";
    classCounts[label] = (classCounts[label] || 0) + 1;
  });

  const getPieColor = (name: string) => {
    if (name === "Industrial-Alert") return "#ef4444";
    if (name === "Industrial-Normal") return "#f59e0b";
    if (name === "Agri-Burning") return "#10b981";
    if (name === "Wildfire") return "#d946ef";
    return "#64748b";
  };


  const pieData = Object.entries(classCounts).map(([name, value]) => ({
    name,
    value,
    color: getPieColor(name),
  }));

  // 2. Trend Over Time Data
  const dateMap: Record<string, { date: string; alerts: number; normal: number; agri: number; others: number }> = {};

  hotspots.forEach((h) => {
    const d = h.acq_date || "2026-08-26";
    if (!dateMap[d]) {
      dateMap[d] = { date: d.slice(5), alerts: 0, normal: 0, agri: 0, others: 0 };
    }
    if (h.predicted_label === "Industrial-Alert") dateMap[d].alerts++;
    else if (h.predicted_label === "Industrial-Normal") dateMap[d].normal++;
    else if (h.predicted_label === "Agri-Burning") dateMap[d].agri++;
    else dateMap[d].others++;
  });

  const lineData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  // 3. Facility-type breakdown
  const typeMap: Record<string, number> = {};
  facilities.forEach((f) => {
    typeMap[f.type] = (typeMap[f.type] || 0) + 1;
  });

  const barData = Object.entries(typeMap).map(([type, count]) => ({
    type,
    count,
  }));

  // 4. Top Facilities Leaderboard
  const facilityCounts: Record<string, { name: string; type: string; count: number; maxFrp: number; state: string }> = {};

  facilities.forEach((f) => {
    facilityCounts[f.name] = {
      name: f.name,
      type: f.type,
      count: 0,
      maxFrp: 0,
      state: f.state,
    };
  });

  hotspots.forEach((h) => {
    if (h.nearest_facility_name && facilityCounts[h.nearest_facility_name]) {
      facilityCounts[h.nearest_facility_name].count++;
      facilityCounts[h.nearest_facility_name].maxFrp = Math.max(
        facilityCounts[h.nearest_facility_name].maxFrp,
        h.frp
      );
    }
  });

  const leaderboard = Object.values(facilityCounts)
    .sort((a, b) => b.count - a.count || b.maxFrp - a.maxFrp)
    .slice(0, 5);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Row: Class Distribution + Temporal Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart: Real Model Classification Breakdown */}
        <div className="lg:col-span-5 bg-surface/90 backdrop-blur-2xl border border-surface-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-mono font-bold uppercase text-slate-100">
                Render ML Inference Distribution
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
              {hotspots.length} Real Detections
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#080c14" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050811",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between p-2 rounded-xl bg-surface-light/40 border border-surface-border">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="truncate text-slate-300">{d.name}</span>
                </div>
                <span className="font-bold text-white ml-2">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart: Daily Anomaly Trend */}
        <div className="lg:col-span-7 bg-surface/90 backdrop-blur-2xl border border-surface-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-mono font-bold uppercase text-slate-100">
                NASA FIRMS Satellite Observation Timeline
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              VIIRS-SNPP Real-time Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050811",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
                <Line type="monotone" dataKey="others" name="Thermal Detections" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="normal" name="Industrial-Normal" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="agri" name="Agri-Burning" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="alerts" name="Industrial-Alert" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-sky-400 rounded" />
              <span className="text-sky-400">Total Satellite Detections</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-500 rounded" />
              <span className="text-amber-400">Industrial Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded" />
              <span className="text-emerald-400">Agri Burning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Facility Risk Leaderboard + Facility Types */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-7 bg-surface/90 backdrop-blur-2xl border border-surface-border rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-mono font-bold uppercase text-slate-100">
                {t.topRiskFacilities} (5km Perimeter Proximity)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Live SPCB Ranking
            </span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((item, idx) => (
              <div
                key={item.name}
                className="p-3.5 rounded-2xl bg-surface-light/40 border border-surface-border flex items-center justify-between hover:border-orange-500/40 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                    idx === 0
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : idx === 1
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {item.type} • {item.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Max FRP</span>
                    <span className="text-xs font-bold text-orange-400">
                      {item.maxFrp > 0 ? `${item.maxFrp.toFixed(1)} MW` : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Hotspots</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                      {item.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facility Types Bar Chart */}
        <div className="lg:col-span-5 bg-surface/90 backdrop-blur-2xl border border-surface-border rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-3">
            <h3 className="text-sm font-mono font-bold uppercase text-slate-100">
              Monitored Industrial Sectors
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">
              {facilities.length} Assets
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis dataKey="type" type="category" stroke="#64748b" fontSize={10} width={90} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050811",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
