"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { Hotspot, Facility } from "@/types/database";
import { formatFRP, formatTime, getLabelColor } from "@/lib/utils";
import { 
  Layers, 
  Eye, 
  Building2, 
  Flame, 
  ShieldAlert, 
  MapPin, 
  Compass, 
  Crosshair, 
  Trees, 
  Wheat, 
  SlidersHorizontal,
  Sparkles,
  Zap,
  Radio,
  ExternalLink,
  ChevronDown,
  Info,
  Filter
} from "lucide-react";

interface LeafletMapViewProps {
  hotspots: Hotspot[];
  facilities: Facility[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
  showFacilities?: boolean;
  onToggleFacilities?: () => void;
  flyToTarget?: { lat: number; lon: number; zoom?: number } | null;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  hotspots,
  facilities,
  selectedHotspot,
  onSelectHotspot,
  showFacilities = true,
  onToggleFacilities,
  flyToTarget,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const facilitiesLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [activeTileLayer, setActiveTileLayer] = useState<"dark" | "satellite" | "topo">("satellite");
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [showUncategorized, setShowUncategorized] = useState<boolean>(true);
  const [activeCategories, setActiveCategories] = useState<{ [key: string]: boolean }>({
    "Industrial-Alert": true,
    "Industrial-Normal": true,
    "Agri-Burning": true,
    "Wildfire": true,
    "Other/Uncategorized": true,
  });
  const [showDensityControls, setShowDensityControls] = useState<boolean>(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    const L = require("leaflet");

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629], // Center of India
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // Default to Satellite Imagery (Esri World Imagery)
      const esriSatellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18 }
      );
      esriSatellite.addTo(map);
      tileLayerRef.current = esriSatellite;

      // Layer groups for markers
      facilitiesLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Tile Base Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (activeTileLayer === "satellite") {
      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18 }
      ).addTo(map);
    } else if (activeTileLayer === "dark") {
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, subdomains: "abcd" }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        { maxZoom: 17 }
      ).addTo(map);
    }
  }, [activeTileLayer]);

  // Update Facility, Forest & Agricultural Zone Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !facilitiesLayerRef.current) return;
    const L = require("leaflet");
    const layer = facilitiesLayerRef.current;
    layer.clearLayers();

    if (!showFacilities) return;

    facilities.forEach((fac) => {
      const isForest = fac.category === "forest" || fac.type.includes("Forest");
      const isAgri = fac.category === "agriculture" || fac.type.includes("Agri");
      const isCoal = fac.type.includes("Coal");

      const themeColor = isForest ? "#10b981" : isAgri ? "#f59e0b" : isCoal ? "#a855f7" : "#06b6d4";
      const bufferRadius = isForest ? 15000 : isAgri ? 20000 : 5000;

      // Proximity Buffer Ring
      const circle = L.circle([fac.latitude, fac.longitude], {
        radius: bufferRadius,
        color: themeColor,
        weight: 1.2,
        dashArray: "4, 6",
        fillColor: themeColor,
        fillOpacity: 0.04,
      });
      circle.addTo(layer);

      // Custom DivIcon
      const customIcon = L.divIcon({
        className: "custom-fac-icon",
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-xl bg-slate-950/95 border shadow-xl flex items-center justify-center transition-transform hover:scale-110" style="border-color: ${themeColor}; color: ${themeColor};">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <div class="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-navy-950/95 border text-[10px] font-mono font-bold px-2 py-0.5 rounded whitespace-nowrap opacity-80 group-hover:opacity-100 shadow-md pointer-events-none" style="border-color: ${themeColor}60; color: ${themeColor};">
              ${fac.name.split(" ")[0]} (${fac.type})
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon: customIcon });
      marker.bindPopup(`
        <div class="p-3 font-sans text-slate-100 bg-[#050811] rounded-xl border border-cyan-500/40 text-xs shadow-2xl space-y-1.5 min-w-[200px]">
          <div class="font-bold text-sm" style="color: ${themeColor};">${fac.name}</div>
          <div class="font-mono text-[11px] text-slate-300">${fac.type} • ${fac.state}</div>
          <div class="font-mono text-[10px] text-cyan-300">GIS: ${fac.latitude.toFixed(4)}°N, ${fac.longitude.toFixed(4)}°E</div>
          <div class="text-[11px] text-slate-300 border-t border-slate-800 pt-1.5 mt-1">${fac.risk_notes || "Continuous satellite perimeter monitoring zone."}</div>
        </div>
      `, { className: "custom-leaflet-popup" });

      marker.addTo(layer);
    });
  }, [facilities, showFacilities]);

  // Filtered hotspots based on user controls
  const visibleHotspots = useMemo(() => {
    return hotspots.filter((h) => {
      const conf = (h.prediction_confidence || 0.85) * 100;
      if (conf < minConfidence) return false;

      const label = h.predicted_label || "Other/Uncategorized";
      const isUncategorized = label === "Other" || label === "Other/Uncategorized";

      if (isUncategorized && !showUncategorized) return false;
      if (isUncategorized && activeCategories["Other/Uncategorized"] === false) return false;
      if (!isUncategorized && activeCategories[label] === false) return false;

      return true;
    });
  }, [hotspots, minConfidence, showUncategorized, activeCategories]);

  // Update Real NASA Hotspots Markers with High-Performance Leaflet Rendering
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = require("leaflet");
    const layer = markersLayerRef.current;
    layer.clearLayers();

    // Render hotspots
    visibleHotspots.forEach((h) => {
      const label = h.predicted_label || "Other/Uncategorized";
      const isAlert = label === "Industrial-Alert";
      const isNormal = label === "Industrial-Normal";
      const isAgri = label === "Agri-Burning";
      const isWild = label === "Wildfire";
      const isUncategorized = !isAlert && !isNormal && !isAgri && !isWild;

      const isSelected = selectedHotspot?.id === h.id;
      const confPct = Math.round((h.prediction_confidence || 0.85) * 100);

      // Distinct, non-overlapping color coding
      // 1. Industrial-Alert: Neon Red (#ef4444)
      // 2. Industrial-Normal: Neon Amber/Orange (#f97316)
      // 3. Agri-Burning: Vibrant Electric Emerald (#10b981)
      // 4. Wildfire: Distinct Vibrant Neon Fuchsia/Magenta (#d946ef)
      // 5. Other/Uncategorized: Vibrant Electric Sky Blue (#38bdf8)
      let dotColor = "#38bdf8";
      let ringColor = "rgba(56, 189, 248, 0.5)";
      let size = 11;
      let pulseHtml = "";

      if (isAlert) {
        dotColor = "#ef4444";
        ringColor = "rgba(239, 68, 68, 0.7)";
        size = 30;
        // Urgent animated ping beacon
        pulseHtml = `<div class="absolute inset-0 rounded-full bg-red-500 opacity-80 animate-ping"></div><div class="absolute -inset-1 rounded-full border-2 border-red-400 opacity-60 animate-pulse"></div>`;
      } else if (isNormal) {
        dotColor = "#f97316";
        ringColor = "rgba(249, 115, 22, 0.6)";
        size = 22;
        // Warm steady breathing pulse
        pulseHtml = `<div class="absolute -inset-1.5 rounded-full bg-orange-500/40 opacity-75 animate-pulse"></div>`;
      } else if (isAgri) {
        dotColor = "#10b981";
        ringColor = "rgba(16, 185, 129, 0.6)";
        size = 20;
        // Radiant emerald pulse
        pulseHtml = `<div class="absolute -inset-1.5 rounded-full bg-emerald-500/40 opacity-75 animate-pulse"></div>`;
      } else if (isWild) {
        dotColor = "#d946ef"; // Distinct Fuchsia/Magenta
        ringColor = "rgba(217, 70, 239, 0.7)";
        size = 22;
        // Vivid Magenta beacon pulse
        pulseHtml = `<div class="absolute inset-0 rounded-full bg-fuchsia-500 opacity-75 animate-ping"></div>`;
      } else {
        // Regional Background Telemetry: Electric Sky Blue with luminous glow ring
        dotColor = "#38bdf8";
        ringColor = "rgba(56, 189, 248, 0.6)";
        size = 11;
        pulseHtml = `<div class="absolute -inset-1 rounded-full bg-sky-400/30 opacity-60 animate-pulse"></div>`;
      }

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: ${size}px; height: ${size}px;">
          ${pulseHtml}
          ${isSelected ? `<div class="absolute -inset-2 rounded-full border-2 border-cyan-400 border-dashed animate-spin"></div>` : ""}
          <div class="relative w-full h-full rounded-full flex items-center justify-center border ${isUncategorized ? 'border-sky-300 shadow-lg' : 'border-white/90 shadow-2xl'} transition-transform group-hover:scale-125" style="background-color: ${dotColor}; box-shadow: 0 0 10px ${ringColor};">
            ${size >= 16 ? `<div class="w-1.5 h-1.5 bg-white rounded-full"></div>` : ""}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: "custom-hotspot-marker",
        html: markerHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([h.latitude, h.longitude], { icon });

      // Rich Interactive Popup with full coordinates and details
      const popupHtml = `
        <div class="p-3.5 font-sans bg-[#050811] text-white rounded-2xl border border-surface-border shadow-2xl min-w-[240px] space-y-2 text-xs">
          <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span class="font-mono font-bold uppercase text-[11px] px-2 py-0.5 rounded" style="background-color: ${dotColor}25; color: ${dotColor}; border: 1px solid ${dotColor}60;">
              ${label}
            </span>
            <span class="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
              ${confPct}% AI Conf
            </span>
          </div>

          <div class="space-y-1 font-mono text-[11px]">
            <div class="flex justify-between text-slate-300">
              <span class="text-slate-400">GIS Coordinates:</span>
              <span class="text-white font-bold">${h.latitude.toFixed(4)}°N, ${h.longitude.toFixed(4)}°E</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span class="text-slate-400">Thermal Output (FRP):</span>
              <span class="text-orange-400 font-bold">${formatFRP(h.frp)}</span>
            </div>
            ${h.nearest_facility_name ? `
              <div class="flex justify-between text-slate-300">
                <span class="text-slate-400">Nearest Asset:</span>
                <span class="text-cyan-300 font-semibold truncate max-w-[120px]">${h.nearest_facility_name}</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span class="text-slate-400">Proximity:</span>
                <span class="text-slate-200">${h.distance_to_facility_km?.toFixed(2)} km</span>
              </div>
            ` : ''}
            <div class="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800">
              <span>Pass: ${h.acq_date} (${h.daynight === 'N' ? '🌙 Night' : '☀️ Day'})</span>
              <span>${h.satellite}</span>
            </div>
          </div>

          <button id="btn-inspect-hotspot-${h.id}" class="w-full mt-2 py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono text-[11px] font-bold text-center transition-colors cursor-pointer block">
            Inspect Incident Dossier ➔
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "custom-leaflet-popup",
        offset: [0, -size / 2],
      });

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-inspect-hotspot-${h.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectHotspot(h);
          };
        }
      });

      marker.on("click", () => {
        onSelectHotspot(h);
      });

      marker.addTo(layer);
    });
  }, [visibleHotspots, selectedHotspot, onSelectHotspot]);

  // Fly to selected hotspot
  useEffect(() => {
    if (selectedHotspot && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedHotspot.latitude, selectedHotspot.longitude], 11, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedHotspot]);

  // Fly to target requested by AI Incident Commander
  useEffect(() => {
    if (flyToTarget && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([flyToTarget.lat, flyToTarget.lon], flyToTarget.zoom || 11, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [flyToTarget]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => {
    mapInstanceRef.current?.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
  };

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Counts for quick legend stats
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "Industrial-Alert": 0,
      "Industrial-Normal": 0,
      "Agri-Burning": 0,
      "Wildfire": 0,
      "Other/Uncategorized": 0,
    };

    hotspots.forEach((h) => {
      const l = h.predicted_label || "Other/Uncategorized";
      if (counts[l] !== undefined) {
        counts[l]++;
      } else {
        counts["Other/Uncategorized"]++;
      }
    });

    return counts;
  }, [hotspots]);

  return (
    <div className="relative w-full h-full bg-[#050811] overflow-hidden select-none">
      {/* Leaflet Map Root */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Cyber Grid Scanlines Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-15"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.15) 0%, transparent 70%),
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 50px 50px, 50px 50px",
        }}
      />

      {/* Top Right: Interactive Category Visibility Chips */}
      <div className="absolute top-4 right-36 z-20 hidden xl:flex items-center gap-1.5 bg-navy-950/95 backdrop-blur-xl p-1.5 rounded-2xl border border-surface-border shadow-2xl">
        <button
          onClick={() => toggleCategory("Industrial-Alert")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeCategories["Industrial-Alert"]
              ? "bg-red-500/20 text-red-400 border border-red-500/60 shadow-md shadow-red-500/20"
              : "bg-surface-light/40 text-slate-500 border border-transparent hover:text-slate-300"
          }`}
          title="Toggle Industrial Alert Thermal Incidents"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span>Alerts ({categoryCounts["Industrial-Alert"]})</span>
        </button>

        <button
          onClick={() => toggleCategory("Industrial-Normal")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeCategories["Industrial-Normal"]
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/60 shadow-md shadow-orange-500/20"
              : "bg-surface-light/40 text-slate-500 border border-transparent hover:text-slate-300"
          }`}
          title="Toggle Standard Operational Industrial Flares"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Industrial Flare ({categoryCounts["Industrial-Normal"]})</span>
        </button>

        <button
          onClick={() => toggleCategory("Agri-Burning")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeCategories["Agri-Burning"]
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/60 shadow-md shadow-emerald-500/20"
              : "bg-surface-light/40 text-slate-500 border border-transparent hover:text-slate-300"
          }`}
          title="Toggle Crop Stubble & Agriculture Fires"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Agri ({categoryCounts["Agri-Burning"]})</span>
        </button>

        <button
          onClick={() => toggleCategory("Wildfire")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeCategories["Wildfire"]
              ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/60 shadow-md shadow-fuchsia-500/20"
              : "bg-surface-light/40 text-slate-500 border border-transparent hover:text-slate-300"
          }`}
          title="Toggle Forest Reserve & Wildfire Hotspots"
        >
          <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
          <span>Wildfire ({categoryCounts["Wildfire"]})</span>
        </button>

        <button
          onClick={() => setShowUncategorized(!showUncategorized)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            showUncategorized
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/60 shadow-md shadow-sky-500/20"
              : "bg-surface-light/40 text-slate-500 border border-transparent hover:text-slate-300 line-through"
          }`}
          title="Toggle Regional Satellite Background Heat"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Regional Heat ({categoryCounts["Other/Uncategorized"]})</span>
        </button>
      </div>

      {/* Top-Right Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-navy-950/95 backdrop-blur-xl p-2 rounded-2xl border border-surface-border shadow-2xl">
        {/* Layer Switcher */}
        <div className="flex flex-col gap-1 p-1 bg-surface-light/40 rounded-xl border border-surface-border">
          <button
            onClick={() => setActiveTileLayer("satellite")}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
              activeTileLayer === "satellite"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Satellite Ops</span>
          </button>

          <button
            onClick={() => setActiveTileLayer("dark")}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
              activeTileLayer === "dark"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dark Vector</span>
          </button>
        </div>

        <div className="w-full h-px bg-surface-border my-0.5" />

        {/* AI Confidence & De-Clutter Slider Toggle */}
        <button
          onClick={() => setShowDensityControls(!showDensityControls)}
          className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
            showDensityControls || minConfidence > 0 || !showUncategorized
              ? "text-orange-400 bg-orange-500/20 border border-orange-500/50 shadow-md shadow-orange-500/20"
              : "text-slate-400 hover:text-white bg-surface-light/40 border border-surface-border"
          }`}
          title="Adjust AI Confidence Threshold & De-Clutter Filter"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-surface-light/60 hover:bg-surface-light text-slate-300 hover:text-white border border-surface-border transition-colors text-xs font-mono font-bold cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-surface-light/60 hover:bg-surface-light text-slate-300 hover:text-white border border-surface-border transition-colors text-xs font-mono font-bold cursor-pointer"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-surface-light/60 hover:bg-surface-light text-slate-300 hover:text-white border border-surface-border transition-colors cursor-pointer"
            title="Recenter India View"
          >
            <Crosshair className="w-4 h-4 text-orange-400" />
          </button>
        </div>

        <div className="w-full h-px bg-surface-border my-0.5" />

        {/* Toggle Monitored Zones */}
        <button
          onClick={onToggleFacilities}
          className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
            showFacilities
              ? "text-cyan-400 bg-cyan-500/20 border border-cyan-500/50 shadow-md shadow-cyan-500/20"
              : "text-slate-500 hover:text-slate-300 bg-surface-light/40 border border-surface-border"
          }`}
          title="Toggle Monitored Reference Perimeters"
        >
          <Building2 className="w-4 h-4" />
        </button>
      </div>

      {/* Density & AI Confidence Slider Popup */}
      {showDensityControls && (
        <div className="absolute top-20 right-20 z-30 w-72 bg-navy-950/98 backdrop-blur-2xl border border-orange-500/50 rounded-2xl p-4 shadow-2xl text-white font-sans space-y-3 animate-in fade-in slide-in-from-right-2">
          <div className="flex items-center justify-between border-b border-surface-border pb-2">
            <span className="text-xs font-mono font-bold uppercase text-orange-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              AI Precision & De-Clutter
            </span>
            <button
              onClick={() => setShowDensityControls(false)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Min AI Confidence:</span>
              <span className="text-orange-400 font-bold">{minConfidence}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (All Points)</span>
              <span>60% (Verified)</span>
              <span>90% (High Certainty)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-surface-border flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-300">Background Heat:</span>
            <button
              onClick={() => setShowUncategorized(!showUncategorized)}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                showUncategorized
                  ? "bg-sky-950 text-sky-400 border border-sky-500/40"
                  : "bg-red-950/80 text-red-400 border border-red-800/40"
              }`}
            >
              {showUncategorized ? "Shown" : "Hidden (Clean View)"}
            </button>
          </div>
        </div>
      )}

      {/* Bottom-Left Classification Legend HUD */}
      <div className="absolute bottom-4 left-4 z-20 bg-navy-950/95 backdrop-blur-xl p-3.5 rounded-2xl border border-surface-border shadow-2xl text-xs font-mono max-w-sm sm:max-w-md">
        <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-surface-border">
          <span className="text-[10px] uppercase text-orange-400 font-bold tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            NASA FIRMS VIIRS/MODIS SATELLITE
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">
            {visibleHotspots.length} / {hotspots.length} Visible
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping ring-2 ring-red-500/60 shrink-0" />
            <span className="text-red-400 font-bold truncate">Industrial-Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse ring-2 ring-orange-500/50 shrink-0" />
            <span className="text-orange-400 font-semibold truncate">Industrial-Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/50 shrink-0" />
            <span className="text-emerald-400 font-semibold truncate">Agri-Burning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 animate-ping ring-2 ring-fuchsia-500/60 shrink-0" />
            <span className="text-fuchsia-400 font-bold truncate">Wildfire</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/60 shrink-0" />
            <span className="text-sky-300 font-semibold truncate">Regional Telemetry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-500/40 shrink-0" />
            <span className="text-cyan-400 truncate">Protected Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
};
