"use client";

import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle2, MessageSquare, AlertCircle, Clock } from "lucide-react";
import { Alert, AlertStatus } from "@/types/database";

interface StatusModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (alertId: string, status: AlertStatus, notes: string) => Promise<void>;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  alert,
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus>(alert?.status || "acknowledged");
  const [notes, setNotes] = useState<string>(alert?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !alert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(alert.id, selectedStatus, notes);
      onClose();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: { value: AlertStatus; label: string; desc: string }[] = [
    {
      value: "acknowledged",
      label: "Acknowledged",
      desc: "Alert received and logged by duty safety officer.",
    },
    {
      value: "investigating",
      label: "Under Investigation",
      desc: "Field team or facility contact contacted for physical telemetry check.",
    },
    {
      value: "resolved",
      label: "Resolved",
      desc: "Incident contained, flare normalized, or confirmed false alarm.",
    },
    {
      value: "new",
      label: "Mark as New (Reset)",
      desc: "Reset alert back to unprocessed intake queue.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-navy-950 border border-surface-border rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white font-sans relative">
        <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-slate-100">
                UPDATE ALERT WORKFLOW
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Incident ID: {alert.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-light"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
              Workflow Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedStatus === opt.value
                      ? "bg-orange-500/10 border-orange-500 text-orange-300"
                      : "bg-surface-light/40 border-surface-border text-slate-300 hover:bg-surface-light"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={selectedStatus === opt.value}
                    onChange={() => setSelectedStatus(opt.value)}
                    className="mt-0.5 accent-orange-500"
                  />
                  <div>
                    <span className="text-xs font-mono font-bold block">{opt.label}</span>
                    <span className="text-[11px] text-slate-400 font-sans">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              Investigation / Resolution Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. SPCB officer contacted IOCL flare unit. Confirmed controlled depressurization cycle."
              className="w-full bg-slate-900 border border-surface-border rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-light text-slate-300 hover:text-white text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
