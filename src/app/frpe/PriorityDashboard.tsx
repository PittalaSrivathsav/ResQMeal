"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Zap,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Flame,
  ShieldAlert,
} from "lucide-react";
import PriorityCard from "./PriorityCard";
import AnalysisPanel from "./AnalysisPanel";
import type { FRPEResult, DonationPriority } from "@/lib/frpe/types";

interface PriorityDashboardProps {
  initialData: FRPEResult | null;
  role: string;
}

export function PriorityDashboard({ initialData, role }: PriorityDashboardProps) {
  const [data, setData] = useState<FRPEResult | null>(initialData);
  const [selectedDonation, setSelectedDonation] = useState<DonationPriority | null>(null);
  const [activeTab, setActiveTab] = useState<"ranking" | "alerts" | "weights">("ranking");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState(10);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Background fetch to refresh data without reloading page
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/frpe/analyze", { cache: "no-store" });
      if (res.ok) {
        const fresh = (await res.json()) as FRPEResult;
        setData(fresh);
        // If a donation is selected, update it with fresh data
        if (selectedDonation) {
          const updated = fresh.donations.find(
            (d) => d.donationId === selectedDonation.donationId
          );
          if (updated) setSelectedDonation(updated);
        }
      }
    } catch (err) {
      console.error("Auto-refresh failed:", err);
    } finally {
      setIsRefreshing(false);
      setSecondsUntilNextRefresh(10);
    }
  }, [selectedDonation]);

  // Countdown timer and auto-refresh interval
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setSecondsUntilNextRefresh((prev) => {
        if (prev <= 1) {
          void refreshData();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, refreshData]);

  // Quick seed demonstration data
  const handleSeedDemo = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/frpe/seed", { method: "POST" });
      const result = await res.json();
      if (result.seeded) {
        setSeedMessage("Demo dataset loaded! 10 donations across 5 urgency stages.");
        await refreshData();
      }
    } catch (err) {
      console.error("Seed error:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  const summary = data?.summary ?? {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    normal: 0,
    overdue: 0,
  };

  const donations = data?.donations ?? [];
  const alertDonations = donations.filter(
    (d) => d.priorityClass === "CRITICAL" || d.priorityClass === "HIGH" || d.isOverdue
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* ── TOP HERO BANNER ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#075B2A] to-[#138A36] p-6 sm:p-8 text-white shadow-lg">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-2 ring-white/20 shadow-md">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  AI Rescue Intelligence
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                  FRPE v1.0
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-emerald-100 max-w-xl">
                Food Rescue Priority Engine · Real-time multi-factor mathematical scoring,
                smart NGO matching &amp; volunteer route feasibility.
              </p>
            </div>
          </div>

          {/* Live Engine Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Auto Refresh Toggle */}
            <button
              type="button"
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition shadow-sm ${
                autoRefreshEnabled
                  ? "bg-white text-[#075B2A] shadow-md"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  autoRefreshEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span>
                {autoRefreshEnabled
                  ? `Live Sync: ${secondsUntilNextRefresh}s`
                  : "Auto-refresh: OFF"}
              </span>
            </button>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => void refreshData()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-extrabold text-white backdrop-blur-sm hover:bg-white/30 transition disabled:opacity-50"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "Computing..." : "Refresh Now"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seed Success Banner */}
      {seedMessage && (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-[#138A36] shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{seedMessage}</span>
          </div>
          <button
            onClick={() => setSeedMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-black text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* ── PRIORITY OVERVIEW (STAT CARDS) ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Active */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Total Active
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900">{summary.total}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-400">Available donations</p>
        </div>

        {/* Critical (Red) */}
        <div className="rounded-2xl bg-red-50/70 border border-red-200/90 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-red-700 uppercase tracking-wide">
              Critical
            </p>
            <Flame className="h-3.5 w-3.5 text-red-500 animate-pulse" />
          </div>
          <p className="mt-1 text-2xl font-black text-red-600">{summary.critical}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-red-500">Score 80–100 · &lt;30m</p>
        </div>

        {/* High (Orange) */}
        <div className="rounded-2xl bg-orange-50/70 border border-orange-200/90 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wide">
              High
            </p>
            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
          </div>
          <p className="mt-1 text-2xl font-black text-orange-600">{summary.high}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-orange-500">Score 60–79 · 30–60m</p>
        </div>

        {/* Medium (Amber) */}
        <div className="rounded-2xl bg-amber-50/70 border border-amber-200/90 p-4 shadow-sm hover:shadow-md transition">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
            Medium
          </p>
          <p className="mt-1 text-2xl font-black text-amber-600">{summary.medium}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-amber-500">Score 40–59 · 1–2h</p>
        </div>

        {/* Normal (Green) */}
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/90 p-4 shadow-sm hover:shadow-md transition">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
            Normal
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{summary.normal}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-emerald-500">Score 0–39 · &gt;2h</p>
        </div>

        {/* Overdue (Slate/Red) */}
        <div className="rounded-2xl bg-slate-100/90 border border-slate-300 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Overdue
            </p>
            <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <p className="mt-1 text-2xl font-black text-slate-700">{summary.overdue}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-500">Deadline elapsed</p>
        </div>
      </div>

      {/* ── TAB BAR ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ranking")}
            className={`rounded-full px-5 py-2 text-xs font-extrabold transition shadow-sm ${
              activeTab === "ranking"
                ? "bg-[#138A36] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            Priority Ranking ({donations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("alerts")}
            className={`rounded-full px-5 py-2 text-xs font-extrabold transition shadow-sm flex items-center gap-1.5 ${
              activeTab === "alerts"
                ? "bg-red-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🚨 Critical Alerts</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-black ${
                activeTab === "alerts"
                  ? "bg-white text-red-600"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {alertDonations.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weights")}
            className={`rounded-full px-5 py-2 text-xs font-extrabold transition shadow-sm flex items-center gap-1.5 ${
              activeTab === "weights"
                ? "bg-slate-800 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Scoring Weights</span>
          </button>
        </div>

        <div className="text-[11px] font-bold text-slate-400">
          Ranked by FRPE weighted priority algorithm
        </div>
      </div>

      {/* ── TAB CONTENT ────────────────────────────────────────────────── */}
      {/* 1. PRIORITY RANKING TAB */}
      {activeTab === "ranking" && (
        <div>
          {donations.length > 0 ? (
            <div className="space-y-4">
              {donations.map((donation) => (
                <PriorityCard
                  key={donation.donationId}
                  donation={donation}
                  onViewAnalysis={() => setSelectedDonation(donation)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
              <Brain className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-extrabold text-slate-800">
                No Active Donations Found
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                All donations are currently rescued or no live food batches have been posted yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. CRITICAL ALERTS TAB */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {alertDonations.length > 0 ? (
            alertDonations.map((donation) => (
              <div
                key={donation.donationId}
                className={`rounded-3xl border p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  donation.isOverdue
                    ? "bg-slate-50 border-slate-300"
                    : donation.priorityClass === "CRITICAL"
                    ? "bg-red-50/80 border-red-300"
                    : "bg-orange-50/80 border-orange-300"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-black shadow-sm ${
                      donation.isOverdue
                        ? "bg-slate-600"
                        : donation.priorityClass === "CRITICAL"
                        ? "bg-red-600"
                        : "bg-orange-500"
                    }`}
                  >
                    {donation.isOverdue ? "!" : donation.priorityScore}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        {donation.isOverdue
                          ? `OVERDUE: ${donation.title}`
                          : `URGENT ALERT: ${donation.title}`}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          donation.isOverdue
                            ? "bg-slate-200 text-slate-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {donation.priorityClass}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-600">
                      {donation.restaurantName} ({donation.restaurantLocality}) ·{" "}
                      {donation.quantityValue} {donation.quantityUnit} ·{" "}
                      <span className="text-red-600 font-extrabold">
                        {donation.isOverdue
                          ? "Pickup deadline elapsed — requires immediate review"
                          : `Only ${donation.minutesRemaining} minutes remaining before deadline`}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
                      Suggested Action: Dispatch notification to top match{" "}
                      <span className="font-bold text-slate-800">
                        {donation.topNGOs[0]?.name ?? "Nearest NGO"}
                      </span>{" "}
                      and available volunteer{" "}
                      <span className="font-bold text-slate-800">
                        {donation.topVolunteers[0]?.name ?? "Volunteer Pool"}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(donation)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800 transition"
                  >
                    View Analysis →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-2 text-sm font-extrabold text-slate-800">
                No Critical or Overdue Alerts
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                All available donations currently have safe buffer windows.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. SCORING WEIGHTS CONFIGURATION TAB */}
      {activeTab === "weights" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              FRPE Configurable Priority Weights
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              The engine normalizes 6 independent operational factors and computes a
              deterministic 0–100 priority score using these backend-configured weights.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Time Urgency</span>
                <span className="rounded-full bg-[#E8F7EA] px-2.5 py-0.5 text-xs font-black text-[#138A36]">
                  35% (0.35)
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Calculated from remaining minutes to pickup deadline. &lt;30m = 100pts, 30–60m = 85pts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Distance Proximity</span>
                <span className="rounded-full bg-[#E8F7EA] px-2.5 py-0.5 text-xs font-black text-[#138A36]">
                  20% (0.20)
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Haversine distance between restaurant and suitable receiving NGO. &lt;1km = 100pts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">NGO Daily Capacity</span>
                <span className="rounded-full bg-[#E8F7EA] px-2.5 py-0.5 text-xs font-black text-[#138A36]">
                  15% (0.15)
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Receiving capacity, active pending claims, and whether NGO can safely absorb batch.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Food Quantity</span>
                <span className="rounded-full bg-[#E8F7EA] px-2.5 py-0.5 text-xs font-black text-[#138A36]">
                  10% (0.10)
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Quantity of meals saved vs NGO intake limits to prevent storage spoilage.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Dietary Compatibility</span>
                <span className="rounded-full bg-[#E8F7EA] px-2.5 py-0.5 text-xs font-black text-[#138A36]">
                  10% (0.10)
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Verifies matching between vegetarian / non-veg food and recipient NGO criteria.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Pickup Feasibility</span>
                <span className="rounded-full bg-[#E8F7EA] px-2.5 py-0.5 text-xs font-black text-[#138A36]">
                  10% (0.10)
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Volunteer travel corridor, city traffic buffer, and realistic completion feasibility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SLIDE-IN ANALYSIS PANEL ────────────────────────────────────── */}
      <AnalysisPanel
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
      />
    </div>
  );
}
