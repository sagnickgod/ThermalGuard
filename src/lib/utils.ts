import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate Great-Circle Distance (Haversine formula) in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function formatFRP(frp: number): string {
  return `${frp.toFixed(1)} MW`;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return "00:00 UTC";
  const cleaned = timeStr.padStart(4, "0");
  return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)} UTC`;
}

export function getLabelColor(label: string): {
  bg: string;
  text: string;
  border: string;
  hex: string;
  glow: string;
} {
  switch (label) {
    case "Industrial-Alert":
      return {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/50",
        hex: "#ef4444",
        glow: "rgba(239, 68, 68, 0.5)",
      };
    case "Industrial-Normal":
      return {
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        border: "border-amber-500/50",
        hex: "#f59e0b",
        glow: "rgba(245, 158, 11, 0.5)",
      };
    case "Agri-Burning":
      return {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        border: "border-emerald-500/50",
        hex: "#10b981",
        glow: "rgba(16, 185, 129, 0.5)",
      };
    case "Wildfire":
      return {
        bg: "bg-fuchsia-500/20",
        text: "text-fuchsia-400",
        border: "border-fuchsia-500/50",
        hex: "#d946ef",
        glow: "rgba(217, 70, 239, 0.6)",
      };
    default:
      return {
        bg: "bg-slate-700/20",
        text: "text-slate-400",
        border: "border-slate-700/40",
        hex: "#64748b",
        glow: "rgba(100, 116, 139, 0.2)",
      };
  }
}


export function getStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "new":
      return {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/50",
      };
    case "acknowledged":
      return {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/50",
      };
    case "investigating":
      return {
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        border: "border-amber-500/50",
      };
    case "resolved":
      return {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        border: "border-emerald-500/50",
      };
    default:
      return {
        bg: "bg-slate-500/20",
        text: "text-slate-400",
        border: "border-slate-500/50",
      };
  }
}
