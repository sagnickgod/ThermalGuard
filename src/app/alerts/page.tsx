"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AlertCard } from "@/components/alerts/AlertCard";
import { StatusModal } from "@/components/alerts/StatusModal";
import { Alert, AlertStatus, Hotspot } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { translations, Language } from "@/lib/translations";
import { 
  ShieldAlert, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  Calendar,
  Flame,
  Building2,
  Download,
  CheckCheck,
  Radio,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Trees,
  Wheat,
  X,
  ChevronDown
} from "lucide-react";

export default function AlertsPage() {
  const [lang, setLang] = useState<Language>("en");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBatchUpdating, setIsBatchUpdating] = useState<boolean>(false);

  // Advanced Filters State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [datePreset, setDatePreset] = useState<string>("ALL");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [selectedSingleDate, setSelectedSingleDate] = useState<string>("ALL");
  const [minFrp, setMinFrp] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const t = translations[lang];

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select(`
          *,
          hotspot:hotspots(*)
        `)
        .order("created_at", { ascending: false })
        .limit(5000);

      if (data) {
        setAlerts(data as any);
      }
    } catch (err) {
      console.error("Error fetching alerts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("alerts-realtime-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleSaveStatus = async (alertId: string, status: AlertStatus, notes: string) => {
    try {
      await supabase
        .from("alerts")
        .update({
          status,
          notes,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      await fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Acknowledge all currently filtered active alerts
  const handleBulkAcknowledge = async () => {
    const unacknowledged = filteredAlerts.filter((a) => a.status === "new" || a.status === "investigating");
    if (unacknowledged.length === 0) {
      alert("All currently filtered alerts are already acknowledged or resolved.");
      return;
    }

    if (!confirm(`Acknowledge and mark ${unacknowledged.length} filtered alerts as Acknowledged?`)) {
      return;
    }

    setIsBatchUpdating(true);
    try {
      const ids = unacknowledged.map((a) => a.id);
      await supabase
        .from("alerts")
        .update({
          status: "acknowledged",
          acknowledged_at: new Date().toISOString(),
          notes: "Bulk acknowledged via Duty Officer Command Center",
        })
        .in("id", ids);

      await fetchAlerts();
    } catch (err) {
      console.error("Bulk acknowledge error", err);
    } finally {
      setIsBatchUpdating(false);
    }
  };

  // Export Filtered Alerts as CSV Dossier
  const handleExportCSV = () => {
    if (filteredAlerts.length === 0) {
      alert("No alerts to export.");
      return;
    }

    const headers = [
      "Alert ID",
      "Status",
      "Classification Label",
      "Confidence %",
      "Facility Name",
      "Facility Type",
      "Distance (km)",
      "Latitude",
      "Longitude",
      "FRP (MW)",
      "Acquisition Date",
      "Acquisition Time",
      "Satellite",
      "Pass",
      "Notes",
    ];

    const rows = filteredAlerts.map((a) => {
      const h = a.hotspot;
      return [
        `"${a.id}"`,
        `"${a.status}"`,
        `"${h?.predicted_label || 'Industrial-Alert'}"`,
        `"${Math.round((h?.prediction_confidence || 0.95) * 100)}"`,
        `"${(h?.nearest_facility_name || 'Industrial Zone').replace(/"/g, '""')}"`,
        `"${h?.nearest_facility_type || 'General'}"`,
        `"${h?.distance_to_facility_km?.toFixed(2) || 'N/A'}"`,
        h?.latitude || "",
        h?.longitude || "",
        h?.frp?.toFixed(1) || "",
        `"${h?.acq_date || a.created_at.slice(0, 10)}"`,
        `"${h?.acq_time || '1200'}"`,
        `"${h?.satellite || 'VIIRS'}"`,
        `"${h?.daynight === 'N' ? 'Night' : 'Day'}"`,
        `"${(a.notes || '').replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ThermalGuard_Alerts_Triage_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Distinct Available Dates for Dropdown
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    alerts.forEach((a) => {
      const d = a.hotspot?.acq_date || a.created_at.slice(0, 10);
      if (d) dates.add(d);
    });
    return Array.from(dates).sort().reverse();
  }, [alerts]);

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setDatePreset("ALL");
    setCustomStartDate("");
    setCustomEndDate("");
    setSelectedSingleDate("ALL");
    setMinFrp(0);
    setSearchQuery("");
    setSortBy("newest");
  };

  // Comprehensive Filtering & Sorting Logic
  const filteredAlerts = useMemo(() => {
    const now = new Date();

    return alerts
      .filter((a) => {
        const h = a.hotspot;
        const alertDateStr = h?.acq_date || a.created_at.slice(0, 10);
        const alertDate = new Date(alertDateStr);

        // 1. Status Filter
        if (statusFilter !== "ALL" && a.status !== statusFilter) {
          return false;
        }

        // 2. Category Filter
        if (categoryFilter !== "ALL") {
          const label = h?.predicted_label || "Industrial-Alert";
          if (label !== categoryFilter) return false;
        }

        // 3. Date Preset Filter
        if (datePreset === "TODAY") {
          const todayStr = now.toISOString().slice(0, 10);
          if (alertDateStr !== todayStr) return false;
        } else if (datePreset === "48H") {
          const diffDays = (now.getTime() - alertDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 2) return false;
        } else if (datePreset === "7D") {
          const diffDays = (now.getTime() - alertDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (datePreset === "30D") {
          const diffDays = (now.getTime() - alertDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        }

        // 4. Custom Date Range Filter
        if (customStartDate && alertDateStr < customStartDate) {
          return false;
        }
        if (customEndDate && alertDateStr > customEndDate) {
          return false;
        }

        // 5. Single Date Selector
        if (selectedSingleDate !== "ALL" && alertDateStr !== selectedSingleDate) {
          return false;
        }

        // 6. Min FRP Filter
        if (minFrp > 0 && (h?.frp || 0) < minFrp) {
          return false;
        }

        // 7. Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const facName = (h?.nearest_facility_name || "").toLowerCase();
          const facType = (h?.nearest_facility_type || "").toLowerCase();
          const label = (h?.predicted_label || "").toLowerCase();
          const sat = (h?.satellite || "").toLowerCase();
          const notes = (a.notes || "").toLowerCase();
          const id = a.id.toLowerCase();
          const coords = `${h?.latitude},${h?.longitude}`;

          const matches =
            facName.includes(q) ||
            facType.includes(q) ||
            label.includes(q) ||
            sat.includes(q) ||
            notes.includes(q) ||
            id.includes(q) ||
            coords.includes(q);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const hA = a.hotspot;
        const hB = b.hotspot;

        if (sortBy === "frp_desc") {
          return (hB?.frp || 0) - (hA?.frp || 0);
        }
        if (sortBy === "confidence_desc") {
          return (hB?.prediction_confidence || 0) - (hA?.prediction_confidence || 0);
        }
        if (sortBy === "distance_asc") {
          return (hA?.distance_to_facility_km || 999) - (hB?.distance_to_facility_km || 999);
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        // default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [
    alerts,
    statusFilter,
    categoryFilter,
    datePreset,
    customStartDate,
    customEndDate,
    selectedSingleDate,
    minFrp,
    searchQuery,
    sortBy,
  ]);

  // Statistics KPI computation
  const stats = useMemo(() => {
    const total = alerts.length;
    const active = alerts.filter((a) => a.status === "new" || a.status === "investigating").length;
    const resolved = alerts.filter((a) => a.status === "resolved" || a.status === "acknowledged").length;

    let maxFrp = 0;
    const facilitiesSet = new Set<string>();

    alerts.forEach((a) => {
      if (a.hotspot?.frp && a.hotspot.frp > maxFrp) {
        maxFrp = a.hotspot.frp;
      }
      if (a.hotspot?.nearest_facility_name) {
        facilitiesSet.add(a.hotspot.nearest_facility_name);
      }
    });

    return {
      total,
      active,
      resolved,
      maxFrp,
      threatenedFacilities: facilitiesSet.size,
    };
  }, [alerts]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-white font-sans selection:bg-orange-500 selection:text-white">
      <Navbar lang={lang} onLanguageChange={setLang} activeAlertsCount={stats.active} onRefresh={fetchAlerts} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header HUD Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1426] via-[#091122] to-[#060b18] border border-surface-border p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/20">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wide text-slate-100 flex items-center gap-3">
                    <span>EMERGENCY DISPATCH & INCIDENT TRIAGE</span>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950/90 text-red-400 border border-red-800/80 uppercase">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Live Feed
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Continuous AI verification • NASA FIRMS Thermal Anomaly Stream • MoEFCC & SPCB Protocol
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleBulkAcknowledge}
                disabled={isBatchUpdating || filteredAlerts.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold border border-cyan-400/30 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
                title="Acknowledge all alerts currently visible in the active filter"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Bulk Acknowledge ({filteredAlerts.filter(a => a.status === 'new' || a.status === 'investigating').length})</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-light hover:bg-slate-800 text-slate-200 hover:text-white font-mono text-xs font-bold border border-surface-border transition-all cursor-pointer"
                title="Export filtered alerts as statutory CSV triage report"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Export CSV ({filteredAlerts.length})</span>
              </button>
            </div>
          </div>

          {/* Futuristic KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-surface-border/80">
            <div className="p-3.5 rounded-2xl bg-surface-light/30 border border-red-500/30 backdrop-blur-md">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                🔴 Unresolved Alerts
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-red-400">
                  {stats.active}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  of {stats.total} total
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-light/30 border border-orange-500/30 backdrop-blur-md">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                🔥 Peak Thermal Output
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-orange-400">
                  {stats.maxFrp.toFixed(1)} <span className="text-sm font-bold">MW</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  FRP Flare
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-light/30 border border-cyan-500/30 backdrop-blur-md">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                🏭 Facilities Monitored
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-cyan-400">
                  {stats.threatenedFacilities}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Active Asset Zones
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-light/30 border border-emerald-500/30 backdrop-blur-md">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                ✅ Resolved / Handled
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-emerald-400">
                  {stats.resolved}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Logged & Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Filter Command Bar */}
        <div className="bg-surface/90 backdrop-blur-xl border border-surface-border rounded-3xl p-5 space-y-4 shadow-2xl">
          {/* Top Row: Status Tabs & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "ALL", label: `ALL INCIDENTS (${alerts.length})` },
                { key: "new", label: `🔴 ACTION REQUIRED (${alerts.filter(a => a.status === 'new').length})` },
                { key: "investigating", label: `🟡 INVESTIGATING (${alerts.filter(a => a.status === 'investigating').length})` },
                { key: "acknowledged", label: `🔵 ACKNOWLEDGED (${alerts.filter(a => a.status === 'acknowledged').length})` },
                { key: "resolved", label: `🟢 RESOLVED (${alerts.filter(a => a.status === 'resolved').length})` },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    statusFilter === s.key
                      ? "bg-orange-500 text-slate-950 shadow-md shadow-orange-500/25 scale-[1.02]"
                      : "bg-surface-light text-slate-300 hover:text-white border border-surface-border hover:bg-slate-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plant, state, satellite, note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-surface-border rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Second Row: Threat Categories & Quick Date Range Presets */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-surface-border/60">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Category:
              </span>
              {[
                { key: "ALL", label: "All Threat Types" },
                { key: "Industrial-Alert", label: "🚨 Industrial-Alert" },
                { key: "Industrial-Normal", label: "🏭 Industrial-Normal" },
                { key: "Agri-Burning", label: "🌾 Agri-Burning" },
                { key: "Wildfire", label: "🌲 Wildfire" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    categoryFilter === cat.key
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20"
                      : "bg-surface-light/60 text-slate-400 hover:text-slate-200 border border-surface-border"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                Timeframe:
              </span>
              {[
                { key: "ALL", label: "All Time" },
                { key: "TODAY", label: "Today" },
                { key: "48H", label: "48h" },
                { key: "7D", label: "7 Days" },
                { key: "30D", label: "30 Days" },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setDatePreset(p.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    datePreset === p.key
                      ? "bg-orange-500 text-slate-950 font-bold shadow-sm shadow-orange-500/20"
                      : "bg-surface-light/60 text-slate-400 hover:text-slate-200 border border-surface-border"
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                  showAdvancedFilters || customStartDate || customEndDate || minFrp > 0 || selectedSingleDate !== "ALL"
                    ? "bg-orange-500/20 text-orange-300 border-orange-500/50"
                    : "bg-surface-light text-slate-300 border-surface-border hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Date Range & Controls</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Advanced Date Range & FRP Sliders Panel (Collapsible) */}
          {showAdvancedFilters && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-orange-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                {/* Custom Start Date */}
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    Custom Start Date:
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Custom End Date */}
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    Custom End Date:
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Specific Observation Date Picker */}
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Specific Satellite Pass Date:
                  </label>
                  <select
                    value={selectedSingleDate}
                    onChange={(e) => setSelectedSingleDate(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">All Available Dates ({availableDates.length})</option>
                    {availableDates.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                    Sort Telemetry Order:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="newest">Newest Incidents First</option>
                    <option value="oldest">Oldest Incidents First</option>
                    <option value="frp_desc">Highest Thermal Intensity (FRP ↓)</option>
                    <option value="confidence_desc">Highest AI Model Confidence</option>
                    <option value="distance_asc">Closest Proximity to Facility</option>
                  </select>
                </div>
              </div>

              {/* Min FRP Threshold Slider */}
              <div className="pt-3 border-t border-surface-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 max-w-md space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Min Thermal FRP Intensity Filter:
                    </span>
                    <span className="font-bold text-orange-400 text-sm">
                      {minFrp > 0 ? `≥ ${minFrp} MW` : "All Intensities"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minFrp}
                    onChange={(e) => setMinFrp(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-light hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono border border-surface-border transition-colors self-end"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Counter & Active Filter Tags Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">
              Showing {filteredAlerts.length} of {alerts.length} Incidents
            </span>
            {filteredAlerts.length < alerts.length && (
              <span className="text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded-full border border-orange-800/40 text-[10px]">
                Active Filters Applied
              </span>
            )}
          </div>

          <div className="text-slate-500 hidden sm:block">
            Auto-refreshing via Supabase Realtime WebSocket
          </div>
        </div>

        {/* Alerts Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3 font-mono text-xs text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto" />
            <p>Syncing Real-Time Incident Telemetry...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onUpdateStatus={handleUpdateStatus}
                lang={lang}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 px-6 rounded-3xl bg-surface/50 border border-surface-border text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-mono text-slate-200">
                No Incidents Matching Active Criteria
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                Try adjusting your date range, status, FRP threshold or search query to view other alerts in the log.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Update Workflow Status Modal */}
      {isModalOpen && (
        <StatusModal
          alert={selectedAlert}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveStatus}
        />
      )}
    </div>
  );
}
