"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Lock, Mail, ArrowRight, User, Building } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("State Pollution Control Board");
  const [role, setRole] = useState<"analyst" | "admin">("analyst");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            organization,
            role,
          },
        },
      });

      if (error) {
        setMsg(error.message);
      } else {
        setMsg("Registration successful! You can now log into Mission Control.");
        setTimeout(() => router.push("/auth/login"), 1200);
      }
    } catch (err: any) {
      setMsg(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050811] text-white p-6">
      <div className="max-w-md w-full bg-surface/90 border border-surface-border rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold font-mono text-white">
            REGISTER FOR SATELLITE OPS ACCESS
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            State Pollution Control Board & Emergency Services
          </p>
        </div>

        {msg && (
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono">
            {msg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block font-mono uppercase text-slate-300 mb-1">Full Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Dr. Rajesh Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block font-mono uppercase text-slate-300 mb-1">Official Email</label>
            <input
              required
              type="email"
              placeholder="officer@spcb.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-mono uppercase text-slate-300 mb-1">Organization / Unit</label>
            <input
              required
              type="text"
              placeholder="e.g. Gujarat Pollution Control Board"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block font-mono uppercase text-slate-300 mb-1">System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
            >
              <option value="analyst">Safety / Environmental Analyst (View & Triage)</option>
              <option value="admin">Administrator (Full GIS & Asset Registry Access)</option>
            </select>
          </div>

          <div>
            <label className="block font-mono uppercase text-slate-300 mb-1">Password</label>
            <input
              required
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-mono text-xs font-bold shadow-lg shadow-orange-500/25 border border-orange-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Registering..." : "Submit Registration"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs font-mono text-slate-400 pt-2 border-t border-surface-border">
          Already registered?{" "}
          <Link href="/auth/login" className="text-orange-400 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
