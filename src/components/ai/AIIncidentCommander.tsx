"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  MapPin, 
  ShieldAlert, 
  Building2, 
  Cpu, 
  Flame,
  Terminal,
  Loader2,
  ChevronRight,
  RefreshCw,
  Compass
} from "lucide-react";
import { askAIIncidentCommander, AICommanderResponse } from "@/lib/nvidia-ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  flyTo?: {
    latitude: number;
    longitude: number;
    zoom?: number;
    label?: string;
  };
  filterTag?: string;
  action?: string;
  timestamp: string;
}

interface AIIncidentCommanderProps {
  onFlyTo?: (lat: number, lon: number, zoom?: number) => void;
  onFilterChange?: (category: string) => void;
}

export const AIIncidentCommander: React.FC<AIIncidentCommanderProps> = ({
  onFlyTo,
  onFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `**🛰️ ThermalGuard AI Incident Commander Online** *(Powered by NVIDIA Nemotron-3.5-Lightning)*\n\nI am connected in real-time to your **NASA FIRMS multi-sensor feed** (2,040+ active points) and **Render FastAPI ML microservice**.\n\nAsk me anything in English or Hindi, for example:\n- *"Gujarat mein last 5 din ke Industrial-Alerts dikhao"* \n- *"Which facility has the highest thermal anomaly?"*\n- *"Summarize wildfire threats in Forest Reserves"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await askAIIncidentCommander(text, history);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.answer,
        flyTo: res.flyTo,
        filterTag: res.filterTag,
        action: res.recommendedAction,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If AI recommended a flyTo and we have the handler, automatically zoom to it
      if (res.flyTo && onFlyTo) {
        onFlyTo(res.flyTo.latitude, res.flyTo.longitude, res.flyTo.zoom || 11);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Gujarat ke Industrial-Alerts dikhao",
    "Highest FRP facility konsi hai?",
    "Forest Reserves wildfire summary",
    "Punjab stubble burning status",
  ];

  return (
    <>
      {/* Floating Trigger HUD Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-mono font-black text-xs shadow-2xl shadow-emerald-500/30 border border-emerald-300/50 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Open NVIDIA AI Incident Commander"
        >
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping absolute inset-0" />
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <span>AI Incident Commander</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-950/20 text-[10px] font-mono border border-slate-950/20">
            NVIDIA NEMOTRON
          </span>
        </button>
      )}

      {/* Slide-out Intelligence Commander Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full sm:w-[480px] h-[640px] max-h-[85vh] bg-navy-950/95 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 font-sans">
          {/* Header */}
          <div className="p-4 border-b border-surface-border bg-surface/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold text-white tracking-wide">
                    AI INCIDENT COMMANDER
                  </h3>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    NVIDIA 30B LLM
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Natural Language Spaceborne Tactical Intelligence
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-light transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2.5 bg-surface-light/30 border-b border-surface-border flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-400" />
              Try:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 text-[11px] font-mono whitespace-nowrap border border-surface-border transition-colors cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Messages Stream Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-none shadow-lg shadow-orange-600/20"
                      : "bg-surface/90 border border-surface-border text-slate-200 rounded-bl-none shadow-xl"
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Interactive Action Buttons */}
                  {msg.flyTo && onFlyTo && (
                    <div className="mt-3 pt-2.5 border-t border-surface-border flex flex-wrap gap-2">
                      <button
                        onClick={() => onFlyTo(msg.flyTo!.latitude, msg.flyTo!.longitude, msg.flyTo!.zoom || 11)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold transition-all cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Fly to {msg.flyTo.label || "Coordinates"} on Map</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs p-3 bg-surface/60 rounded-2xl w-fit border border-surface-border">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>NVIDIA Nemotron synthesizing satellite tactical telemetry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-surface-border bg-surface/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Incident Commander (e.g. 'Gujarat alerts', 'Panipat flare status')..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
