"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Calendar, Clock, History, Globe2 } from "lucide-react";
import { translations, Language } from "@/lib/translations";

interface TimeSliderProps {
  dates: string[]; // List of sorted YYYY-MM-DD strings
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
  lang?: Language;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  dates,
  selectedDate,
  onDateChange,
  lang = "en",
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(
    selectedDate ? Math.max(0, dates.indexOf(selectedDate)) : dates.length - 1
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const t = translations[lang];

  // Sync index when selectedDate changes from outside
  useEffect(() => {
    if (selectedDate) {
      const idx = dates.indexOf(selectedDate);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [selectedDate, dates]);

  // Handle Play/Pause timer loop
  useEffect(() => {
    if (isPlaying && dates.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1 >= dates.length ? 0 : prev + 1;
          onDateChange(dates[next]);
          return next;
        });
      }, 1400);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, dates, onDateChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    setCurrentIndex(idx);
    // Strictly filter to the chosen date
    onDateChange(dates[idx]);
  };

  const handleShowAllDates = () => {
    setIsPlaying(false);
    onDateChange(null);
  };

  const handleSelectLatest = () => {
    setIsPlaying(false);
    if (dates.length > 0) {
      const latestIdx = dates.length - 1;
      setCurrentIndex(latestIdx);
      onDateChange(dates[latestIdx]);
    }
  };

  if (!dates || dates.length === 0) return null;

  const isAllDates = selectedDate === null;
  const activeDate = selectedDate || dates[currentIndex] || dates[dates.length - 1];

  return (
    <div className="bg-navy-950/95 backdrop-blur-xl border border-surface-border p-3.5 rounded-2xl shadow-2xl text-white font-sans space-y-2.5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            {t.timeSliderTitle}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
            {dates.length} Days Archive
          </span>
        </div>

        {/* Active Filter Mode Pill */}
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm ${
            isAllDates
              ? "bg-cyan-950/90 text-cyan-300 border-cyan-500/50"
              : "bg-orange-500/20 text-orange-300 border-orange-500/60 shadow-orange-500/10"
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {isAllDates ? "ALL DATES (LIVE OVERVIEW)" : `FILTERED: ${activeDate}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Play / Pause animation */}
        <button
          onClick={() => {
            if (!isPlaying && isAllDates && dates.length > 0) {
              onDateChange(dates[0]);
              setCurrentIndex(0);
            }
            setIsPlaying(!isPlaying);
          }}
          className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
            isPlaying
              ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/30"
              : "bg-orange-500 hover:bg-orange-600 text-slate-950 shadow-lg shadow-orange-500/30"
          }`}
          title={isPlaying ? t.pauseTime : t.playTime}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
        </button>

        {/* Range Scrubber */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={0}
            max={dates.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
          />
        </div>

        {/* Quick View Modes */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSelectLatest}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
              !isAllDates && activeDate === dates[dates.length - 1]
                ? "bg-orange-500 text-slate-950 font-bold border-orange-500"
                : "bg-surface-light hover:bg-slate-800 text-slate-300 border-surface-border"
            }`}
            title="Filter strictly to Latest Date"
          >
            <span>Latest Day</span>
          </button>

          <button
            onClick={handleShowAllDates}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
              isAllDates
                ? "bg-cyan-500 text-slate-950 font-bold border-cyan-500"
                : "bg-surface-light hover:bg-slate-800 text-slate-300 border-surface-border"
            }`}
            title="View all dates without date restriction"
          >
            <Globe2 className="w-3 h-3" />
            <span>All Dates</span>
          </button>
        </div>
      </div>

      {/* Date ticks preview */}
      <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-0.5 px-1">
        <span>{dates[0]} (Oldest)</span>
        <span>{dates[Math.floor(dates.length / 2)]}</span>
        <span className="text-orange-400 font-bold">{dates[dates.length - 1]} (Latest)</span>
      </div>
    </div>
  );
};
