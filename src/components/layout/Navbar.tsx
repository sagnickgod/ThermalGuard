"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Flame, 
  Satellite, 
  Radio, 
  Bell, 
  BarChart3, 
  Building2, 
  Globe2, 
  ShieldAlert, 
  Cpu,
  RefreshCw,
  LogOut,
  User
} from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
  activeAlertsCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang = "en",
  onLanguageChange,
  activeAlertsCount = 4,
  onRefresh,
  isRefreshing = false,
}) => {
  const pathname = usePathname();
  const [timeUtc, setTimeUtc] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("analyst");
  const t = translations[lang];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserEmail(data.session.user.email || "officer@spcb.gov.in");
        if (data.session.user.email?.includes("admin")) {
          setUserRole("admin");
        }
      }
    });
  }, []);

  const navLinks = [
    { href: "/dashboard", label: t.navDashboard, icon: Satellite },
    { href: "/alerts", label: t.navAlerts, icon: ShieldAlert, badge: activeAlertsCount },
    { href: "/analytics", label: t.navAnalytics, icon: BarChart3 },
    { href: "/facilities", label: t.navFacilities, icon: Building2 },
  ];

  return (
    <header className="h-16 border-b border-surface-border bg-background/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between text-white">
      {/* Left: Brand / Logo */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 via-red-600 to-amber-600 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-[7px] flex items-center justify-center group-hover:bg-transparent transition-colors">
              <Flame className="w-5 h-5 text-orange-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-200 to-red-400">
                THERMAL<span className="text-white">GUARD</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-red-950/80 text-red-400 border border-red-800/60 rounded">
                SIH 26162
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              NASA FIRMS • VIIRS-NRT • ISRO IR-GIS
            </p>
          </div>
        </Link>

        {/* Center-Left Nav Links */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/40 shadow-sm shadow-orange-500/10"
                    : "text-slate-300 hover:text-white hover:bg-surface-light/60 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-red-600 text-white rounded-full animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Live Telemetry Status, Language, User Actions */}
      <div className="flex items-center gap-3 font-mono text-xs">
        {/* UTC Clock & Telemetry Status */}
        <div className="hidden xl:flex flex-col text-right">
          <div className="flex items-center justify-end gap-1.5 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="tracking-wider">{t.statusLive}</span>
          </div>
          <span className="text-[10px] text-slate-400">{timeUtc || "SYNCHRONIZING..."}</span>
        </div>

        {/* Manual Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh FIRMS Telemetry Stream"
            className="p-2 rounded-md bg-surface-light/60 hover:bg-surface-light text-slate-300 hover:text-white border border-surface-border transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-orange-400" : ""}`} />
          </button>
        )}

        {/* Bilingual EN / HI Toggle */}
        <button
          onClick={() => onLanguageChange?.(lang === "en" ? "hi" : "en")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface-light/80 hover:bg-surface-light border border-surface-border text-slate-200 hover:text-orange-400 transition-all font-sans text-xs"
          title="Switch Language / भाषा बदलें"
        >
          <Globe2 className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-semibold">{lang === "en" ? "हिन्दी" : "EN"}</span>
        </button>

        {/* Role & User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-slate-200">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[11px] font-sans text-slate-200 truncate max-w-[120px]">
              {userEmail || "Gov Analyst"}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-orange-400 font-semibold">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
