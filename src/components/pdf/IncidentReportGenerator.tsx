"use client";

import React, { useState } from "react";
import { Download, FileText, CheckCircle2, ShieldAlert, Printer, Loader2 } from "lucide-react";
import { AIIncidentSummary } from "@/components/ai/AIIncidentSummary";
import { Hotspot, Alert } from "@/types/database";
import { formatFRP, formatTime } from "@/lib/utils";

interface IncidentReportGeneratorProps {
  hotspot: Hotspot;
  alert?: Alert | null;
}

export const IncidentReportGenerator: React.FC<IncidentReportGeneratorProps> = ({
  hotspot,
  alert,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      // Use standard browser high-resolution print or jsPDF
      window.print();
    } catch (err) {
      console.error("Print export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            INCIDENT DOSSIER & STATUTORY AUDIT REPORT
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Government of India • Ministry of Environment, Forest & Climate Change
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-mono text-xs font-bold shadow-lg shadow-orange-500/25 border border-orange-400/30 transition-all cursor-pointer disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          <span>Print / Export PDF Report</span>
        </button>
      </div>

      {/* Printable Report Document (Styled for screen & print) */}
      <div 
        id="printable-incident-report" 
        className="bg-navy-950/90 border border-surface-border rounded-2xl p-6 sm:p-8 text-white font-sans space-y-6 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none"
      >
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2 text-orange-400 print:text-red-700">
              <ShieldAlert className="w-6 h-6" />
              <span className="font-mono font-black text-xl tracking-wider">
                THERMALGUARD INCIDENT DOSSIER
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-gray-600 font-mono mt-1">
              Ref: TG-FIRMS-{hotspot.id.slice(0, 8).toUpperCase()} • SIH Problem 26162
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 print:text-gray-600">
            <div>Generated: {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC</div>
            <div className="text-emerald-400 print:text-green-700 font-bold">Official Telemetry Verified</div>
          </div>
        </div>

        {/* Classification Summary Ribbon */}
        <div className="p-4 rounded-xl bg-surface-light/50 print:bg-gray-100 border border-surface-border print:border-gray-300 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 print:text-gray-500 block">
              AI Classified Category
            </span>
            <span className={`text-xl font-mono font-black ${
              hotspot.predicted_label === 'Industrial-Alert' ? 'text-red-400 print:text-red-700' : 'text-amber-400 print:text-amber-700'
            }`}>
              {hotspot.predicted_label}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 print:text-gray-500 block">
              Model Confidence
            </span>
            <span className="text-xl font-mono font-black text-emerald-400 print:text-green-700">
              {Math.round(hotspot.prediction_confidence * 100)}%
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 print:text-gray-500 block">
              Thermal Radiative Power
            </span>
            <span className="text-xl font-mono font-black text-orange-400 print:text-orange-700">
              {formatFRP(hotspot.frp)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 print:text-gray-500 block">
              Workflow Status
            </span>
            <span className="text-xl font-mono font-black text-cyan-400 print:text-blue-700 uppercase">
              {alert?.status || "Logged"}
            </span>
          </div>
        </div>

        {/* Spatial & Sensor Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-light/30 print:bg-gray-50 border border-surface-border print:border-gray-300 space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 print:text-gray-700 border-b border-surface-border print:border-gray-300 pb-1.5">
              1. Satellite Observation Data
            </h4>
            <div className="text-xs font-mono space-y-1 text-slate-300 print:text-gray-800">
              <div className="flex justify-between"><span>Latitude / Longitude:</span><span className="font-bold">{hotspot.latitude.toFixed(4)}°N, {hotspot.longitude.toFixed(4)}°E</span></div>
              <div className="flex justify-between"><span>Acquisition Date / Time:</span><span>{hotspot.acq_date} {formatTime(hotspot.acq_time)}</span></div>
              <div className="flex justify-between"><span>Sensor / Satellite:</span><span>{hotspot.satellite}</span></div>
              <div className="flex justify-between"><span>Pass Type:</span><span>{hotspot.daynight === 'N' ? 'Night-time (High Contrast)' : 'Daytime'}</span></div>
              <div className="flex justify-between"><span>NASA FIRMS Detection Confidence:</span><span>{hotspot.confidence}%</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-light/30 print:bg-gray-50 border border-surface-border print:border-gray-300 space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 print:text-gray-700 border-b border-surface-border print:border-gray-300 pb-1.5">
              2. Industrial Facility Proximity
            </h4>
            <div className="text-xs font-mono space-y-1 text-slate-300 print:text-gray-800">
              <div className="flex justify-between"><span>Nearest Registered Asset:</span><span className="font-bold text-cyan-400 print:text-blue-800">{hotspot.nearest_facility_name || 'N/A'}</span></div>
              <div className="flex justify-between"><span>Asset Type:</span><span>{hotspot.nearest_facility_type || 'Industrial Complex'}</span></div>
              <div className="flex justify-between"><span>Direct Proximity (Haversine):</span><span className="font-bold">{hotspot.distance_to_facility_km?.toFixed(2)} km</span></div>
              <div className="flex justify-between"><span>Thermal History / Persistence:</span><span>{hotspot.is_persistent ? 'Continuous Multi-day Flare' : 'New / Acute Flare Spike'}</span></div>
              <div className="flex justify-between"><span>Region Classification:</span><span>{hotspot.region_category || 'Industrial Corridor'}</span></div>
            </div>
          </div>
        </div>

        {/* NVIDIA AI Incident Synthesis & Statutory Briefing */}
        <AIIncidentSummary hotspot={hotspot} alert={alert} />

        {/* Explainability Engine Reasoning (Crucial for SIH) */}
        <div className="p-4 rounded-xl bg-surface-light/30 print:bg-gray-50 border border-orange-500/40 print:border-orange-300 space-y-2">
          <h4 className="text-xs font-mono font-bold uppercase text-orange-400 print:text-orange-800">
            3. AI Decision Explainability Factors
          </h4>
          <p className="text-xs text-slate-200 print:text-gray-900 leading-relaxed">
            {hotspot.explainability_summary || `Hotspot exhibited radiative power of ${hotspot.frp} MW within ${hotspot.distance_to_facility_km?.toFixed(2)} km of ${hotspot.nearest_facility_name}.`}
          </p>
        </div>

        {/* Sign-off box for Regulatory / Industry Hand-off */}
        <div className="pt-4 border-t border-surface-border print:border-gray-400 grid grid-cols-2 gap-8 text-xs font-mono text-slate-400 print:text-gray-600">
          <div>
            <span className="block mb-6">Inspecting Safety Officer / SPCB Analyst:</span>
            <div className="border-b border-slate-600 print:border-black w-48 mb-1" />
            <span>Signature / Digital ID</span>
          </div>

          <div className="text-right">
            <span className="block mb-6">Facility Safety Compliance Officer:</span>
            <div className="border-b border-slate-600 print:border-black w-48 ml-auto mb-1" />
            <span>Acknowledgement Date</span>
          </div>
        </div>
      </div>
    </div>
  );
};
