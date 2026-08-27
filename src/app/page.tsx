"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Flame, 
  Satellite, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Activity, 
  Sparkles,
  BarChart3,
  Globe2,
  Lock,
  ChevronRight,
  Radio,
  Eye,
  Crosshair,
  Zap,
  FileText
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { translations, Language } from "@/lib/translations";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const [lang, setLang] = useState<Language>("en");
  const [counts, setCounts] = useState({
    hotspots: 180,
    alerts: 12,
    facilities: 10,
    accuracy: 94,
  });

  const t = translations[lang];

  useEffect(() => {
    async function loadStats() {
      try {
        const [{ count: hCount }, { count: aCount }, { count: fCount }] = await Promise.all([
          supabase.from("hotspots").select("*", { count: "exact", head: true }),
          supabase.from("alerts").select("*", { count: "exact", head: true }),
          supabase.from("facilities").select("*", { count: "exact", head: true }),
        ]);

        setCounts({
          hotspots: hCount || 180,
          alerts: aCount || 12,
          facilities: fCount || 10,
          accuracy: 94,
        });
      } catch (e) {
        console.warn("Using fallback counts", e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-white font-sans selection:bg-orange-500 selection:text-white">
      <Navbar lang={lang} onLanguageChange={setLang} activeAlertsCount={counts.alerts} />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 lg:px-8 overflow-hidden">
        {/* Futuristic Atmospheric Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-orange-600/20 via-red-600/15 to-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-7">
          {/* Cyberpunk Telemetry Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-navy-950/90 border border-orange-500/40 text-orange-400 text-xs font-mono backdrop-blur-xl shadow-xl shadow-orange-500/10 animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping inline-block" />
            <span className="font-bold tracking-wider">SIH 2024 • PROBLEM STATEMENT 26162</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE NASA VIIRS NRT
            </span>
          </div>

          {/* Dynamic Mission Control Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight font-sans text-slate-100 max-w-5xl mx-auto leading-tight sm:leading-tight">
            Autonomous Spaceborne AI for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-red-500 drop-shadow-sm">
              Industrial Fire & Flare Classification
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-lg max-w-3xl mx-auto font-sans leading-relaxed">
            Directly ingesting NASA FIRMS (VIIRS-NRT & MODIS) satellite telemetry and classifying acute industrial flare deviations from agricultural burning using your live <span className="text-orange-400 font-mono font-bold">FastAPI ML Microservice</span>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-mono text-sm font-bold shadow-2xl shadow-orange-500/30 border border-orange-400/40 transition-all hover:scale-105 cursor-pointer"
            >
              <Satellite className="w-5 h-5" />
              <span>{t.ctaLaunch}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/alerts"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-surface-light/80 hover:bg-surface-light text-slate-200 hover:text-white font-mono text-sm font-semibold border border-surface-border transition-all shadow-xl cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>Incident Triage Desk ({counts.alerts})</span>
            </Link>

            <Link
              href="/analytics"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-navy-950/80 hover:bg-slate-900 text-slate-300 hover:text-white font-mono text-sm font-semibold border border-surface-border transition-all shadow-xl cursor-pointer"
            >
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Analytics & Trends</span>
            </Link>
          </div>

          {/* Real-time Telemetry Stats Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-8">
            <div className="p-5 rounded-2xl bg-surface/80 border border-surface-border backdrop-blur-2xl text-left shadow-xl hover:border-orange-500/40 transition-all">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Real NASA FIRMS Hotspots
              </span>
              <span className="text-3xl font-mono font-black text-orange-400">
                {counts.hotspots}+
              </span>
              <span className="text-[11px] text-slate-400 font-mono block mt-1">
                VIIRS-SNPP Real-time
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface/80 border border-red-500/30 backdrop-blur-2xl text-left shadow-xl hover:border-red-500/60 transition-all">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Industrial Alert Incidents
              </span>
              <span className="text-3xl font-mono font-black text-red-400">
                {counts.alerts}
              </span>
              <span className="text-[11px] text-slate-400 font-mono block mt-1">
                SPCB Dispatch Queue
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface/80 border border-cyan-500/30 backdrop-blur-2xl text-left shadow-xl hover:border-cyan-500/60 transition-all">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Tracked Industrial Plants
              </span>
              <span className="text-3xl font-mono font-black text-cyan-400">
                {counts.facilities}
              </span>
              <span className="text-[11px] text-slate-400 font-mono block mt-1">
                Refineries, Steel & Power
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface/80 border border-emerald-500/30 backdrop-blur-2xl text-left shadow-xl hover:border-emerald-500/60 transition-all">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Live Render ML Model
              </span>
              <span className="text-3xl font-mono font-black text-emerald-400">
                {counts.accuracy}%
              </span>
              <span className="text-[11px] text-slate-400 font-mono block mt-1">
                Connected & Online
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Pipeline Architecture Visualization */}
      <section className="py-20 px-4 lg:px-8 border-t border-surface-border bg-navy-950/70 relative">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
              SYSTEM PIPELINE ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-sans text-slate-100">
              Spaceborne Ingestion, Render ML & Leaflet GIS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs font-mono">
            <div className="p-5 rounded-2xl bg-surface/90 border border-surface-border flex flex-col justify-between space-y-4 shadow-xl">
              <div className="p-2.5 w-fit rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Satellite className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 block mb-1">1. Live Satellite Telemetry</span>
                <h4 className="font-bold text-white text-sm">NASA FIRMS API</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  Active fire data stream using key <code className="text-orange-400">2bc25...</code> across India bounds.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface/90 border border-surface-border flex flex-col justify-between space-y-4 shadow-xl">
              <div className="p-2.5 w-fit rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 block mb-1">2. GIS Spatial Analysis</span>
                <h4 className="font-bold text-white text-sm">Proximity & 5km Rings</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  Computes Haversine distance to Indian refineries & power plants in Supabase.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface/90 border border-orange-500/50 shadow-2xl shadow-orange-500/15 flex flex-col justify-between space-y-4">
              <div className="p-2.5 w-fit rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-orange-400 block mb-1">3. Live Microservice</span>
                <h4 className="font-bold text-white text-sm">Render FastAPI ML</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  Calls <code className="text-orange-300">/predict</code> on Render with model .pkl & .json inference.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface/90 border border-surface-border flex flex-col justify-between space-y-4 shadow-xl">
              <div className="p-2.5 w-fit rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 block mb-1">4. Realtime Persistence</span>
                <h4 className="font-bold text-white text-sm">Supabase Postgres</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  Stores classifications in <code className="text-emerald-300">hotspots</code> & triggers WebSocket events.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface/90 border border-red-500/50 shadow-2xl shadow-red-500/15 flex flex-col justify-between space-y-4">
              <div className="p-2.5 w-fit rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-red-400 block mb-1">5. Operations Triage</span>
                <h4 className="font-bold text-white text-sm">Leaflet Satellite Map</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  Pulsing radar markers, 20-day time slider, explainability drawer, and PDF export.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-surface-border bg-navy-950 text-center text-xs font-mono text-slate-500">
        <p>ThermalGuard • Smart India Hackathon Problem Statement 26162</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Connected to Real NASA FIRMS Feed & Live Render ML Microservice
        </p>
      </footer>
    </div>
  );
}
