"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Layers, 
  Compass, 
  Eye, 
  EyeOff, 
  Building2, 
  Flame, 
  ShieldAlert, 
  Maximize2 
} from "lucide-react";
import { Hotspot, Facility } from "@/types/database";
import { getLabelColor, formatFRP } from "@/lib/utils";

interface InteractiveMapProps {
  hotspots: Hotspot[];
  facilities: Facility[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
  showFacilities?: boolean;
  onToggleFacilities?: () => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  hotspots,
  facilities,
  selectedHotspot,
  onSelectHotspot,
  showFacilities = true,
  onToggleFacilities,
}) => {
  // Map viewport bounds (Focused on India: Lat 8 to 36, Lon 68 to 96)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Coordinate projection from GPS (lat/lon) to SVG ViewBox (0..1000, 0..900)
  const minLat = 7.0;
  const maxLat = 37.0;
  const minLon = 67.0;
  const maxLon = 98.0;

  const projectCoords = (lat: number, lon: number) => {
    // Mercator-like normalized bounding box mapping for India
    const x = ((lon - minLon) / (maxLon - minLon)) * 900 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 800 + 50;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.3, 4.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.3, 0.8));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-[#050811] overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Satellite Radar Grid & Scanlines */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 60%),
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />

      {/* SVG Canvas with Coordinate Transformations */}
      <svg
        viewBox="0 0 1000 900"
        className="w-full h-full transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* India Continental Boundary Outlines & State Lat/Lon Reference Grids */}
        <g className="opacity-40">
          {/* Latitude Lines */}
          {[12, 16, 20, 24, 28, 32].map((lat) => {
            const p1 = projectCoords(lat, 68);
            const p2 = projectCoords(lat, 97);
            return (
              <g key={`lat-${lat}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text x="60" y={p1.y - 4} fill="#64748b" fontSize="9" fontFamily="monospace">
                  {lat}°N
                </text>
              </g>
            );
          })}

          {/* Longitude Lines */}
          {[72, 76, 80, 84, 88, 92].map((lon) => {
            const p1 = projectCoords(36, lon);
            const p2 = projectCoords(8, lon);
            return (
              <g key={`lon-${lon}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text x={p1.x - 10} y="880" fill="#64748b" fontSize="9" fontFamily="monospace">
                  {lon}°E
                </text>
              </g>
            );
          })}
        </g>

        {/* Stylized India Landmass Outline (Geometric Path) */}
        <path
          d="M 280,80 L 330,70 L 360,110 L 380,140 L 440,190 L 510,210 L 600,230 L 690,240 L 760,280 L 800,320 L 770,360 L 680,360 L 630,420 L 590,490 L 540,580 L 480,680 L 430,760 L 390,830 L 360,780 L 320,680 L 260,590 L 210,500 L 170,440 L 160,380 L 190,320 L 220,260 L 240,180 Z"
          fill="#0c1322"
          stroke="#1e293b"
          strokeWidth="2.5"
          className="transition-colors"
        />

        {/* Facility 5km / 10km Buffer Zones */}
        {showFacilities &&
          facilities.map((fac) => {
            const { x, y } = projectCoords(fac.latitude, fac.longitude);
            return (
              <g key={`fac-buf-${fac.id}`} className="pointer-events-none">
                <circle
                  cx={x}
                  cy={y}
                  r="24"
                  fill="rgba(6, 182, 212, 0.04)"
                  stroke="rgba(6, 182, 212, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="48"
                  fill="none"
                  stroke="rgba(6, 182, 212, 0.12)"
                  strokeWidth="0.8"
                />
              </g>
            );
          })}

        {/* Facilities Markers */}
        {showFacilities &&
          facilities.map((fac) => {
            const { x, y } = projectCoords(fac.latitude, fac.longitude);
            return (
              <g
                key={`fac-${fac.id}`}
                className="cursor-pointer group"
                transform={`translate(${x}, ${y})`}
              >
                <circle r="6" fill="#06b6d4" stroke="#083344" strokeWidth="2" />
                <rect
                  x="-3"
                  y="-3"
                  width="6"
                  height="6"
                  fill="#ffffff"
                  className="group-hover:scale-125 transition-transform"
                />
                <text
                  x="10"
                  y="4"
                  fill="#67e8f9"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  className="opacity-80 group-hover:opacity-100 transition-opacity drop-shadow"
                >
                  {fac.name.split(" ")[0]} ({fac.type})
                </text>
              </g>
            );
          })}

        {/* Hotspots Render Layer */}
        {hotspots.map((h) => {
          const { x, y } = projectCoords(h.latitude, h.longitude);
          const isAlert = h.predicted_label === "Industrial-Alert";
          const isNormal = h.predicted_label === "Industrial-Normal";
          const isAgri = h.predicted_label === "Agri-Burning";
          const isWild = h.predicted_label === "Wildfire";
          const isSelected = selectedHotspot?.id === h.id;
          const isHighConfidence = h.prediction_confidence >= 0.85;

          // Scale radius by FRP
          const baseRadius = isAlert ? 9 : isNormal ? 7 : 5;
          const markerRadius = Math.min(16, baseRadius + (h.frp / 60));

          return (
            <g
              key={h.id}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectHotspot(h);
              }}
              onMouseEnter={(e) => {
                setHoveredHotspot(h);
                setHoverPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoveredHotspot(null)}
            >
              {/* Pulsing Radar Wave for Industrial-Alert */}
              {isAlert && (
                <>
                  <circle
                    r={markerRadius * 2.8}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    className="animate-ping origin-center opacity-75"
                  />
                  <circle
                    r={markerRadius * 1.8}
                    fill="rgba(239, 68, 68, 0.25)"
                    className="animate-pulse"
                  />
                </>
              )}

              {/* Selected Ring */}
              {isSelected && (
                <circle
                  r={markerRadius + 8}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  className="animate-spin origin-center"
                />
              )}

              {/* Core Hotspot Circle */}
              <circle
                r={markerRadius}
                fill={
                  isAlert
                    ? "#ef4444"
                    : isNormal
                    ? "#f59e0b"
                    : isAgri
                    ? "#10b981"
                    : isWild
                    ? "#d946ef"
                    : "#64748b"
                }

                stroke={isHighConfidence ? "#ffffff" : "rgba(255,255,255,0.4)"}
                strokeWidth={isHighConfidence ? "2" : "1"}
                strokeDasharray={isHighConfidence ? undefined : "2 2"}
                className="drop-shadow-lg transition-transform hover:scale-125"
              />

              {/* Center Glow Dot */}
              <circle r={markerRadius * 0.35} fill="#ffffff" />
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredHotspot && (
        <div 
          className="fixed z-50 pointer-events-none bg-navy-950/95 border border-orange-500/50 p-2.5 rounded-lg shadow-xl text-white font-sans text-xs -translate-x-1/2 -translate-y-full -mt-3 backdrop-blur-md min-w-[200px]"
          style={{ left: hoverPos.x, top: hoverPos.y }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-surface-border pb-1 mb-1.5">
            <span className="font-bold text-orange-400 font-mono">
              {hoveredHotspot.predicted_label}
            </span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {Math.round(hoveredHotspot.prediction_confidence * 100)}% Conf
            </span>
          </div>
          <div className="space-y-0.5 text-[11px] font-mono">
            <div className="flex justify-between text-slate-300">
              <span>FRP:</span>
              <span className="text-orange-400 font-bold">{formatFRP(hoveredHotspot.frp)}</span>
            </div>
            {hoveredHotspot.nearest_facility_name && (
              <div className="flex justify-between text-slate-300">
                <span>Facility:</span>
                <span className="text-cyan-400 truncate max-w-[120px]">{hoveredHotspot.nearest_facility_name}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Proximity:</span>
              <span>{hoveredHotspot.distance_to_facility_km?.toFixed(2)} km</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Control Toolbar (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-navy-950/90 backdrop-blur-md p-1.5 rounded-xl border border-surface-border shadow-xl">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-surface-light transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-surface-light transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-surface-light transition-colors"
          title="Reset to All-India View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-surface-border my-0.5" />
        <button
          onClick={onToggleFacilities}
          className={`p-2 rounded-lg transition-colors ${
            showFacilities
              ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
              : "text-slate-500 hover:text-slate-300"
          }`}
          title="Toggle Industrial Facilities & 5km Buffer Rings"
        >
          <Building2 className="w-4 h-4" />
        </button>
      </div>

      {/* Live Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-navy-950/90 backdrop-blur-md p-3 rounded-xl border border-surface-border shadow-xl text-xs font-mono">
        <span className="text-[10px] uppercase text-slate-400 font-bold block mb-2 tracking-wider">
          Classification Legend
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ring-2 ring-red-500/40" />
            <span className="text-red-400 font-medium">Industrial-Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-400">Industrial-Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400">Agri-Burning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 animate-pulse ring-2 ring-fuchsia-500/40" />
            <span className="text-fuchsia-400">Wildfire</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 opacity-60" />
            <span className="text-slate-400">Background Heat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-cyan-500/40" />
            <span className="text-cyan-400">Facility (5km Buffer)</span>
          </div>

        </div>
      </div>
    </div>
  );
};
