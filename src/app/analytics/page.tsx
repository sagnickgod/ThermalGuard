"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MetricsOverview } from "@/components/analytics/MetricsOverview";
import { ChartsSection } from "@/components/analytics/ChartsSection";
import { Hotspot, Facility } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { translations, Language } from "@/lib/translations";
import { BarChart3, RefreshCw, Cpu, ShieldAlert, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  const [lang, setLang] = useState<Language>("en");
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const t = translations[lang];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [hRes, fRes] = await Promise.all([
        supabase.from("hotspots").select("*").order("acq_date", { ascending: true }),
        supabase.from("facilities").select("*"),
      ]);
      if (hRes.data) setHotspots(hRes.data as Hotspot[]);
      if (fRes.data) setFacilities(fRes.data as Facility[]);
    } catch (e) {
      console.error("Error loading analytics data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeAlerts = hotspots.filter((h) => h.predicted_label === "Industrial-Alert").length;
  const avgConfidence = hotspots.length
    ? hotspots.reduce((acc, h) => acc + h.prediction_confidence, 0) / hotspots.length
    : 0.95;

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-white">
      <Navbar lang={lang} onLanguageChange={setLang} activeAlertsCount={activeAlerts} onRefresh={loadData} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <BarChart3 className="w-5 h-5" />
              <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-slate-100">
                SATELLITE THERMAL INTELLIGENCE & ANALYTICS
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Aggregated thermal trends, sector portfolios & predictive risk matrices (SIH 26162)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono">
              FastAPI ML Model v1.0.0
            </span>
          </div>
        </div>

        {/* Telemetry Overview Cards */}
        <MetricsOverview
          totalHotspots={hotspots.length}
          activeAlerts={activeAlerts}
          totalFacilities={facilities.length}
          avgConfidence={avgConfidence}
          lang={lang}
        />

        {/* Dynamic Charts Section */}
        {isLoading ? (
          <div className="h-96 rounded-2xl bg-surface/50 border border-surface-border animate-pulse flex items-center justify-center">
            <span className="text-xs font-mono text-slate-500">Loading satellite data telemetry...</span>
          </div>
        ) : (
          <ChartsSection hotspots={hotspots} facilities={facilities} lang={lang} />
        )}
      </main>
    </div>
  );
}
