"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { TimeSlider } from "@/components/map/TimeSlider";
import { HotspotDrawer } from "@/components/map/HotspotDrawer";
import { LiveDemoTrigger } from "@/components/map/LiveDemoTrigger";
import { Hotspot, Facility, FilterState } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { translations, Language } from "@/lib/translations";
import { 
  Filter, 
  Layers, 
  Search, 
  Flame, 
  Building2, 
  SlidersHorizontal, 
  RotateCcw,
  ShieldAlert,
  Calendar,
  Zap,
  Activity,
  Radio,
  Sparkles
} from "lucide-react";

// Dynamic import of Leaflet Map to avoid SSR issues
const LeafletMapView = dynamic(
  () => import("@/components/map/LeafletMapView").then((mod) => mod.LeafletMapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#050811] flex items-center justify-center text-white font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
          <span>INITIALIZING SPACEBORNE GIS SATELLITE TILES...</span>
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const [lang, setLang] = useState<Language>("en");
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "ALL",
    facilityType: "ALL",
    minFrp: 0,
    confidenceThreshold: 0,
    selectedDate: null,
    onlyAlerts: false,
  });

  const t = translations[lang];

  // Fetch Hotspots and Facilities from Supabase
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [hotspotsRes, facilitiesRes] = await Promise.all([
        supabase.from("hotspots").select("*").order("created_at", { ascending: false }).limit(5000),
        supabase.from("facilities").select("*"),
      ]);


      if (hotspotsRes.data) {
        setHotspots(hotspotsRes.data as Hotspot[]);
      }
      if (facilitiesRes.data) {
        setFacilities(facilitiesRes.data as Facility[]);
      }
    } catch (err) {
      console.error("Error fetching telemetry", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Supabase Realtime Subscription for Hotspots
    const channel = supabase
      .channel("realtime-hotspots")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hotspots" },
        (payload) => {
          setHotspots((prev) => [payload.new as Hotspot, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute available unique dates for Time-Slider
  const availableDates = useMemo(() => {
    const datesSet = new Set<string>();
    hotspots.forEach((h) => {
      if (h.acq_date) datesSet.add(h.acq_date);
    });
    return Array.from(datesSet).sort();
  }, [hotspots]);

  // Filtered hotspots list
  const filteredHotspots = useMemo(() => {
    return hotspots.filter((h) => {
      // Category filter
      if (filters.category !== "ALL" && h.predicted_label !== filters.category) {
        return false;
      }
      // Only Alerts toggle
      if (filters.onlyAlerts && h.predicted_label !== "Industrial-Alert") {
        return false;
      }
      // Facility Type filter
      if (
        filters.facilityType !== "ALL" &&
        h.nearest_facility_type !== filters.facilityType
      ) {
        return false;
      }
      // Min FRP filter
      if (h.frp < filters.minFrp) {
        return false;
      }
      // Date filter (from TimeSlider or picker)
      if (filters.selectedDate && h.acq_date !== filters.selectedDate) {
        return false;
      }
      // Search term
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const facName = (h.nearest_facility_name || "").toLowerCase();
        const label = h.predicted_label.toLowerCase();
        if (!facName.includes(query) && !label.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [hotspots, filters]);

  const activeAlertsCount = useMemo(() => {
    return hotspots.filter((h) => h.predicted_label === "Industrial-Alert").length;
  }, [hotspots]);

  const handleAcknowledgeAlert = async (hotspotId: string) => {
    try {
      await supabase
        .from("alerts")
        .update({ status: "acknowledged", acknowledged_at: new Date().toISOString() })
        .eq("hotspot_id", hotspotId);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050811] overflow-hidden text-white font-sans">
      {/* Navigation Bar */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        activeAlertsCount={activeAlertsCount}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      {/* Main Mission Control Map Viewport */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Leaflet Satellite Map */}
        <div className="flex-1 h-full relative">
          <LeafletMapView
            hotspots={filteredHotspots}
            facilities={facilities}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
            showFacilities={showFacilities}
            onToggleFacilities={() => setShowFacilities(!showFacilities)}
          />

          {/* Top-Left Floating Controls: Filters & Live Demo Trigger */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2.5">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-xl border text-xs font-mono font-semibold transition-all shadow-2xl ${
                filterPanelOpen || filters.category !== "ALL" || filters.onlyAlerts
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-orange-500/10"
                  : "bg-navy-950/90 text-slate-300 hover:text-white border-surface-border hover:bg-surface-light"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{t.filterTitle}</span>
              {(filters.category !== "ALL" || filters.onlyAlerts) && (
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              )}
            </button>

            {/* Live Demo Trigger (Bypasses 6-hour cron for judges) */}
            <LiveDemoTrigger onIngestComplete={fetchData} lang={lang} />

            {/* Active Points Count Pill with Live Satellite Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-950/90 backdrop-blur-xl border border-surface-border text-xs font-mono text-slate-300 shadow-2xl">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-orange-400 font-bold">{filteredHotspots.length}</span>
              <span>/ {hotspots.length} NASA VIIRS Detections</span>
            </div>
          </div>

          {/* Collapsible Filter Panel */}
          {filterPanelOpen && (
            <div className="absolute top-16 left-4 z-30 w-80 bg-navy-950/95 backdrop-blur-2xl border border-surface-border rounded-2xl p-4 shadow-2xl text-white font-sans space-y-3.5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <span className="text-xs font-mono font-bold uppercase text-orange-400 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {t.filterTitle}
                </span>
                <button
                  onClick={() =>
                    setFilters({
                      search: "",
                      category: "ALL",
                      facilityType: "ALL",
                      minFrp: 0,
                      confidenceThreshold: 0,
                      selectedDate: null,
                      onlyAlerts: false,
                    })
                  }
                  className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Search input */}
              <div>
                <input
                  type="text"
                  placeholder="Search plant or location..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full bg-slate-900/90 border border-surface-border rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Classification Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full bg-slate-900/90 border border-surface-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
                >
                  <option value="ALL">{t.categoryAll}</option>
                  <option value="Industrial-Alert">{t.categoryAlert}</option>
                  <option value="Industrial-Normal">{t.categoryNormal}</option>
                  <option value="Agri-Burning">{t.categoryAgri}</option>
                  <option value="Wildfire">{t.categoryWild}</option>
                </select>
              </div>

              {/* Min FRP Slider */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>{t.minFrp}</span>
                  <span className="text-orange-400 font-bold">{filters.minFrp} MW</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={filters.minFrp}
                  onChange={(e) => setFilters({ ...filters, minFrp: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Only Alerts Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onlyAlerts}
                  onChange={(e) => setFilters({ ...filters, onlyAlerts: e.target.checked })}
                  className="accent-red-500 rounded"
                />
                <span className="text-xs font-mono text-red-400 font-medium">
                  Show High-Risk Industrial Alerts Only
                </span>
              </label>
            </div>
          )}

          {/* Bottom Floating Time Slider (20-Day Playback) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl">
            <TimeSlider
              dates={availableDates}
              selectedDate={filters.selectedDate}
              onDateChange={(date) => setFilters({ ...filters, selectedDate: date })}
              lang={lang}
            />
          </div>
        </div>

        {/* Explainability Side Drawer */}
        {selectedHotspot && (
          <HotspotDrawer
            hotspot={selectedHotspot}
            onClose={() => setSelectedHotspot(null)}
            lang={lang}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}
      </div>
    </div>
  );
}
