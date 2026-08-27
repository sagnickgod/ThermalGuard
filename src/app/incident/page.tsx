"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import IncidentDetailClient from "./[id]/IncidentDetailClient";

function IncidentPageContent() {
  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get("id") || "demo";
  return <IncidentDetailClient id={idFromQuery} />;
}

export default function IncidentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050811] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
          <span>SYNCHRONIZING SATELLITE INCIDENT TELEMETRY...</span>
        </div>
      </div>
    }>
      <IncidentPageContent />
    </Suspense>
  );
}
