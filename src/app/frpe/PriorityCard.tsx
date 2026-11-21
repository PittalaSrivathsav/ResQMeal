"use client";

import { Clock, MapPin, Building2, Truck, Leaf } from "lucide-react";
import type { DonationPriority } from "@/lib/frpe/types";
import ScoreRing from "./ScoreRing";

interface PriorityCardProps {
  donation: DonationPriority;
  onViewAnalysis: () => void;
}

function formatCountdown(minutes: number): string {
  if (minutes < 0) return "OVERDUE";
  if (minutes < 60) return `${minutes}m left`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
}

function priorityColors(cls: string): {
  badge: string;
  border: string;
  countdown: string;
} {
  const map: Record<string, { badge: string; border: string; countdown: string }> = {
    CRITICAL: {
      badge: "bg-red-100 text-red-700 border-red-200",
      border: "border-l-red-500",
      countdown: "text-red-600",
    },
    HIGH: {
      badge: "bg-orange-100 text-orange-700 border-orange-200",
      border: "border-l-orange-500",
      countdown: "text-orange-600",
    },
    MEDIUM: {
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      border: "border-l-amber-500",
      countdown: "text-amber-600",
    },
    NORMAL: {
      badge: "bg-green-100 text-green-700 border-green-200",
      border: "border-l-green-400",
      countdown: "text-green-600",
    },
    OVERDUE: {
      badge: "bg-slate-100 text-slate-600 border-slate-200",
      border: "border-l-slate-400",
      countdown: "text-slate-500",
    },
  };
  return map[cls] ?? map.NORMAL;
}

export default function PriorityCard({ donation, onViewAnalysis }: PriorityCardProps) {
  const colors = priorityColors(donation.priorityClass);
  const topNGO = donation.topNGOs?.[0];
  const topVolunteer = donation.topVolunteers?.[0];

  return (
    <div
      className={`rounded-3xl bg-white border border-slate-200/80 border-l-4 ${colors.border} shadow-sm p-5 mb-4 flex flex-col sm:flex-row gap-4 items-start`}
    >
      {/* Left: Score Ring */}
      <div className="shrink-0">
        <ScoreRing score={donation.priorityScore} cls={donation.priorityClass} />
      </div>

      {/* Middle: Details */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Title + badge */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-lg font-extrabold text-slate-900 truncate">
            {donation.title}
          </span>
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${colors.badge}`}
          >
            {donation.priorityClass}
          </span>
        </div>

        {/* Row 2: Restaurant */}
        <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span>
            {donation.restaurantName} · {donation.restaurantLocality}
          </span>
        </div>

        {/* Row 3: Food category + veg */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <Leaf className="h-3 w-3 shrink-0" />
          <span>
            {donation.foodCategory}
            {donation.isVegetarian ? " · Veg" : " · Non-veg"}
          </span>
        </div>

        {/* Row 4: Quantity */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>
            {donation.quantityValue} {donation.quantityUnit}
          </span>
        </div>

        {/* Row 5: Countdown */}
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className={`text-sm font-black ${colors.countdown}`}>
            {formatCountdown(donation.minutesRemaining)}
          </span>
        </div>

        {/* Row 6: Top NGO chip */}
        {topNGO && (
          <div className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full px-3 py-1 mb-1 mr-2">
            ✓ {topNGO.name} · {topNGO.distanceKm.toFixed(1)}km ·{" "}
            {topNGO.compatibilityScore}%
          </div>
        )}

        {/* Row 7: Top Volunteer chip */}
        {topVolunteer && (
          <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-full px-3 py-1">
            <Truck className="h-3 w-3" />
            {topVolunteer.name} · {topVolunteer.estimatedTravelMinutes}min
          </div>
        )}
      </div>

      {/* Right: CTA */}
      <div className="shrink-0 self-center sm:self-start">
        <button
          onClick={onViewAnalysis}
          className="bg-[#138A36] text-white rounded-full px-4 py-2 text-xs font-extrabold hover:bg-[#075B2A] transition-colors whitespace-nowrap"
        >
          View Analysis →
        </button>
      </div>
    </div>
  );
}
