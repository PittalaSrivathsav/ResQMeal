"use client";

import { X, Building2, Truck, TrendingUp, Brain, Award, Scale } from "lucide-react";
import type { DonationPriority, FactorScores } from "@/lib/frpe/types";

interface AnalysisPanelProps {
  donation: DonationPriority | null;
  onClose: () => void;
}

type FactorRow = {
  label: string;
  weight: string;
  score: number;
  rawLabel: string;
};

function buildFactorRows(factors: FactorScores): FactorRow[] {
  return [
    {
      label: "Urgency",
      weight: "35%",
      score: factors.urgency,
      rawLabel: `${factors.urgencyRaw}min`,
    },
    {
      label: "Distance",
      weight: "20%",
      score: factors.distance,
      rawLabel: `${factors.distanceRaw.toFixed(1)}km`,
    },
    {
      label: "Quantity",
      weight: "10%",
      score: factors.quantity,
      rawLabel: `${factors.quantityRaw}kg`,
    },
    {
      label: "Capacity",
      weight: "15%",
      score: factors.capacity,
      rawLabel: `${factors.capacityRaw.toFixed(0)}kg/day`,
    },
    {
      label: "Dietary",
      weight: "10%",
      score: factors.dietary,
      rawLabel: "—",
    },
    {
      label: "Feasibility",
      weight: "10%",
      score: factors.feasibility,
      rawLabel: "—",
    },
  ];
}

export default function AnalysisPanel({ donation, onClose }: AnalysisPanelProps) {
  const isOpen = donation !== null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 overflow-y-auto transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex justify-between items-start z-10">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#138A36]" />
            <span className="font-black text-slate-900">AI Analysis</span>
          </div>
          {donation && (
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[260px]">
              {donation.title}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close panel"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      {donation && (
        <div className="p-5 space-y-6">
          {/* SECTION 1: Priority Score Breakdown */}
          <section>
            <h3 className="flex items-center gap-2 font-black text-slate-800 mb-4">
              <TrendingUp className="h-4 w-4 text-[#138A36]" />
              Priority Score Breakdown
            </h3>
            <div className="space-y-3">
              {buildFactorRows(donation.factors).map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{row.label}</span>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>{row.rawLabel}</span>
                      <span className="font-black text-slate-700">{Math.round(row.score)}/100</span>
                      <span className="text-[#138A36] font-black">{row.weight}</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 h-2 w-full">
                    <div
                      className="bg-[#138A36] h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(row.score, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-[#E8F7EA] rounded-2xl p-3 text-center">
              <div className="text-3xl font-black text-[#075B2A]">
                {donation.factors.total.toFixed(1)}
              </div>
              <div className="text-xs font-semibold text-[#138A36] mt-0.5">
                Composite Priority Score
              </div>
            </div>
          </section>

          {/* SECTION 2: Top NGO Recommendations */}
          <section>
            <h3 className="flex items-center gap-2 font-black text-slate-800 mb-4">
              <Building2 className="h-4 w-4 text-[#138A36]" />
              Top NGO Recommendations
            </h3>
            <div className="space-y-3">
              {donation.topNGOs.slice(0, 3).map((ngo, idx) => (
                <div
                  key={ngo.id}
                  className="rounded-2xl bg-slate-50 border border-slate-100 p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-slate-800">{ngo.name}</span>
                    {idx === 0 && (
                      <span className="text-[10px] font-black bg-[#138A36] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="h-2.5 w-2.5" /> BEST MATCH
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    {ngo.distanceKm.toFixed(1)}km ·{" "}
                    {ngo.capacityKgPerDay != null
                      ? `${ngo.capacityKgPerDay}kg/day`
                      : "Capacity unknown"}{" "}
                    · {ngo.compatibilityScore}% match
                  </div>
                  <ul className="space-y-0.5">
                    {ngo.reason.map((r, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-[#138A36] font-black shrink-0">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: Volunteer Recommendations */}
          <section>
            <h3 className="flex items-center gap-2 font-black text-slate-800 mb-4">
              <Truck className="h-4 w-4 text-[#138A36]" />
              Volunteer Recommendations
            </h3>
            <div className="space-y-3">
              {donation.topVolunteers.slice(0, 3).map((vol) => (
                <div
                  key={vol.id}
                  className="rounded-2xl bg-slate-50 border border-slate-100 p-4"
                >
                  <div className="font-black text-slate-800 mb-1">{vol.name}</div>
                  <div className="text-xs text-slate-500 mb-2">
                    {vol.distanceKm.toFixed(1)}km · ~{vol.estimatedTravelMinutes}min ·{" "}
                    {vol.activeTasks} active task{vol.activeTasks !== 1 ? "s" : ""}
                  </div>
                  <ul className="space-y-0.5">
                    {vol.reason.map((r, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-[#138A36] font-black shrink-0">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: AI Explanation */}
          <section>
            <h3 className="flex items-center gap-2 font-black text-slate-800 mb-4">
              <Brain className="h-4 w-4 text-[#138A36]" />
              AI Explanation
            </h3>
            <div className="bg-[#E8F7EA] rounded-2xl p-4 text-sm font-semibold text-[#075B2A] leading-relaxed">
              &ldquo;{donation.explanation}&rdquo;
            </div>
          </section>

          {/* SECTION 5: Recommended Action */}
          <section>
            <h3 className="flex items-center gap-2 font-black text-slate-800 mb-4">
              <Scale className="h-4 w-4 text-[#138A36]" />
              Recommended Action
            </h3>
            <button className="w-full bg-[#138A36] text-white rounded-full py-3 font-extrabold hover:bg-[#075B2A] transition-colors">
              Notify Nearest NGO
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">
              This will send a priority alert to{" "}
              <span className="font-semibold">
                {donation.topNGOs[0]?.name ?? "the nearest NGO"}
              </span>
              . No automatic assignment is made.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
