"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Facility, FacilityCategory } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { translations, Language } from "@/lib/translations";
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  X,
  ExternalLink,
  Trees,
  Wheat,
  Pickaxe,
  Layers
} from "lucide-react";

export default function FacilitiesPage() {
  const [lang, setLang] = useState<Language>("en");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<FacilityCategory>("industrial");
  const [formType, setFormType] = useState("Refinery");
  const [formState, setFormState] = useState("Gujarat");
  const [formLat, setFormLat] = useState("");
  const [formLon, setFormLon] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const t = translations[lang];

  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setFacilities(data as Facility[]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("facilities")
        .insert({
          name: formName,
          category: formCategory,
          type: formType,
          state: formState,
          latitude: parseFloat(formLat),
          longitude: parseFloat(formLon),
          risk_notes: formNotes,
        })
        .select()
        .single();

      if (!error && data) {
        setFacilities([data as Facility, ...facilities]);
        setIsAddModalOpen(false);
        setFormName("");
        setFormLat("");
        setFormLon("");
        setFormNotes("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this monitored zone?")) return;
    try {
      await supabase.from("facilities").delete().eq("id", id);
      setFacilities(facilities.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => {
    return facilities.filter((f) => {
      if (selectedCategory !== "ALL" && (f.category || "industrial") !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.state.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [facilities, selectedCategory, search]);

  const getCategoryIcon = (category?: string, type?: string) => {
    if (category === "forest" || type?.includes("Forest")) {
      return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (category === "agriculture" || type?.includes("Agri")) {
      return <Wheat className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <Building2 className="w-3.5 h-3.5 text-cyan-400" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-white font-sans">
      <Navbar lang={lang} onLanguageChange={setLang} onRefresh={fetchFacilities} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Building2 className="w-5 h-5" />
              <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-slate-100">
                MONITORED ASSET & ZONE REGISTRY
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Spatial reference registry for Heavy Industry, Forest Reserves, Agricultural Belts & Coalfields
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-600/20 border border-cyan-400/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Asset or Zone</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface/80 p-3.5 rounded-2xl border border-surface-border backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "ALL", label: "ALL MONITORED ZONES" },
              { key: "industrial", label: "HEAVY INDUSTRY" },
              { key: "forest", label: "FOREST RESERVES" },
              { key: "agriculture", label: "AGRI FARMLAND BELTS" },
            ].map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  selectedCategory === c.key
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                    : "bg-surface-light text-slate-300 hover:text-white border border-surface-border"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search zone, plant or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        </div>

        {/* Facilities & Zones Table */}
        <div className="bg-surface/90 backdrop-blur-xl border border-surface-border rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-navy-950/90 border-b border-surface-border font-mono text-[11px] uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="p-4">Monitored Entity Name</th>
                  <th className="p-4">Sector Type</th>
                  <th className="p-4">State</th>
                  <th className="p-4">GIS Coordinates</th>
                  <th className="p-4">Monitoring Profile & Buffer</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.map((fac) => (
                  <tr key={fac.id} className="hover:bg-surface-light/40 transition-colors">
                    <td className="p-4 font-bold text-slate-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-surface-border flex items-center justify-center shrink-0 shadow-sm">
                        {getCategoryIcon(fac.category, fac.type)}
                      </div>
                      <span className="truncate">{fac.name}</span>
                    </td>
                    <td className="p-4 font-mono text-cyan-300">
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-800/40">
                        {fac.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{fac.state}</td>
                    <td className="p-4 font-mono text-slate-400">
                      {fac.latitude.toFixed(4)}°N, {fac.longitude.toFixed(4)}°E
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">
                      {fac.risk_notes || "Continuous satellite monitoring zone."}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(fac.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove Zone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-950 border border-surface-border rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white font-sans relative">
            <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-3">
              <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                REGISTER ASSET / MONITORED ZONE
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-light"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFacility} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Entity / Facility / Zone Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Western Ghats Forest Canopy or Mathura Refinery"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-900 border border-surface-border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                    Zone Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-surface-border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="industrial">Heavy Industry (5km Radius)</option>
                    <option value="forest">Forest Reserve (Wildfire 15km)</option>
                    <option value="agriculture">Agricultural Belt (Stubble 20km)</option>
                    <option value="coalfield">Coal Mining Basin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                    Type Label
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Forest Reserve or Refinery"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">State</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Assam"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Latitude</label>
                  <input
                    required
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 26.57"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Longitude</label>
                  <input
                    required
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 93.17"
                    value={formLon}
                    onChange={(e) => setFormLon(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Environmental Context & Risk Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. High biodiversity buffer zone monitored for pre-monsoon fires."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-surface-border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-light text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold"
                >
                  Register Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
