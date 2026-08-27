"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { IncidentReportGenerator } from "@/components/pdf/IncidentReportGenerator";
import { Hotspot, Alert } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Flame, 
  Building2, 
  Cpu, 
  ShieldAlert, 
  Calendar, 
  Clock, 
  AlertTriangle
} from "lucide-react";

export default function IncidentDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadIncident() {
      // Determine effective incident ID from props or browser URL
      let targetId = id;
      if (typeof window !== "undefined") {
        const pathParts = window.location.pathname.split("/incident/");
        if (pathParts.length > 1 && pathParts[1]) {
          const extracted = pathParts[1].replace(/\/$/, "");
          if (extracted) targetId = extracted;
        }
      }

      setIsLoading(true);
      try {
        if (!targetId || targetId === "demo") {
          // Fetch peak industrial alert hotspot
          const { data: peak } = await supabase
            .from("hotspots")
            .select("*")
            .eq("predicted_label", "Industrial-Alert")
            .order("frp", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (peak) {
            setHotspot(peak as Hotspot);
            const { data: aData } = await supabase
              .from("alerts")
              .select("*")
              .eq("hotspot_id", peak.id)
              .maybeSingle();
            if (aData) setAlert(aData as Alert);
          }
          setIsLoading(false);
          return;
        }

        // Fetch exact incident by UUID
        const { data: hData, error: hErr } = await supabase
          .from("hotspots")
          .select("*")
          .eq("id", targetId)
          .maybeSingle();

        if (hData) {
          setHotspot(hData as Hotspot);
          const { data: aData } = await supabase
            .from("alerts")
            .select("*")
            .eq("hotspot_id", targetId)
            .maybeSingle();

          if (aData) setAlert(aData as Alert);
        } else {
          // Fallback if UUID was deleted/mocked
          const { data: fallbackHotspot } = await supabase
            .from("hotspots")
            .select("*")
            .order("frp", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fallbackHotspot) {
            setHotspot(fallbackHotspot as Hotspot);
          }
        }
      } catch (err) {
        console.error("Error loading incident", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadIncident();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050811] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
          <span>RETRIEVING SATELLITE INCIDENT DOSSIER...</span>
        </div>
      </div>
    );
  }

  if (!hotspot) {
    return (
      <div className="min-h-screen bg-[#050811] text-white p-8">
        <Navbar />
        <div className="max-w-xl mx-auto mt-20 text-center space-y-4 bg-surface/80 p-8 rounded-3xl border border-surface-border">
          <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto" />
          <h2 className="text-xl font-bold font-mono">Incident Record Not Found</h2>
          <p className="text-xs text-slate-400 font-mono">The requested incident ID does not exist in the live telemetry stream.</p>
          <Link href="/dashboard" className="inline-block px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-mono font-bold transition-colors">
            Return to Operations Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="no-print">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard / Incident Queue</span>
          </button>
        </div>

        {/* PDF Incident Dossier & Printable Sheet */}
        <IncidentReportGenerator hotspot={hotspot} alert={alert} />
      </main>
    </div>
  );
}
