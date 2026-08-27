"use client";

import React from "react";
import { Flame, ShieldAlert, Building2, CheckCircle2, TrendingUp, Cpu } from "lucide-react";
import { translations, Language } from "@/lib/translations";

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

  const cards = [
    {
      title: t.activeAlerts,
      value: activeAlerts,
      icon: ShieldAlert,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      sub: "Requires SPCB / Industrial Action",
      pulse: true,
    },
    {
      title: t.totalHotspots,
      value: totalHotspots,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      sub: "NASA FIRMS VIIRS/MODIS 20d",
      pulse: false,
    },
    {
      title: t.facilitiesMonitored,
      value: totalFacilities,
      icon: Building2,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      sub: "Refineries, Steel & Power",
      pulse: false,
    },
    {
      title: t.detectionAccuracy,
      value: `${Math.round(avgConfidence * 100)}%`,
      icon: Cpu,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      sub: "FastAPI ML Microservice",
      pulse: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`p-5 rounded-2xl bg-surface/90 backdrop-blur-md border ${card.border} shadow-xl flex items-center justify-between text-white transition-all hover:scale-[1.02]`}
          >
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block mb-1">
                {card.title}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-mono font-black ${card.color}`}>
                  {card.value}
                </span>
                {card.pulse && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                {card.sub}
              </span>
            </div>

            <div className={`p-3.5 rounded-xl ${card.bg} border ${card.border} ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
