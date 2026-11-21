"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Compass, Layers, CheckCircle2, ShieldCheck } from "lucide-react";
import { InteractiveMap, MapMarkerItem } from "@/components/interactive-map";

export function RouteMap({
  donorName = "Spice Garden Restaurant",
  receiverName = "Hope Foundation",
  distance = "1.2 km",
  status = "DELIVERED",
  volunteerName,
}: {
  donorName?: string;
  receiverName?: string;
  distance?: string;
  status?: string;
  volunteerName?: string;
}) {
  const [viewMode, setViewMode] = useState<"interactive" | "schematic">("interactive");

  // Route markers: Donor and Receiver in local corridor
  const routeMarkers: MapMarkerItem[] = [
    {
      id: "donor-1",
      name: donorName,
      role: "RESTAURANT",
      city: "Express Hub",
      state: "India",
      lat: 28.625,
      lng: 77.21,
      details: "Surplus Food Dispatch Point",
      mealsAvailable: 50,
    },
    {
      id: "receiver-1",
      name: receiverName,
      role: "NGO",
      city: "Express Hub",
      state: "India",
      lat: 28.61,
      lng: 77.23,
      details: "Verified Community Receiving Shelter",
    },
    {
      id: "volunteer-courier",
      name: `${volunteerName || "Rahul"} • Rescue Volunteer`,
      role: "VOLUNTEER",
      city: "Express Hub",
      state: "India",
      lat: 28.618,
      lng: 77.22,
      details: status === "DELIVERED" ? "Delivered successfully" : `In Transit • ${distance} remaining`,
      status: status === "DELIVERED" ? "Delivered" : "In Transit",
    },
  ];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-white select-none">
      {/* Top Bar inside Map Card */}
      <div className="p-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#138A36] animate-ping" />
          <span className="text-xs font-black text-slate-800">
            Live Verified GPS Corridor • {distance}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-[#138A36] border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>FSSAI Safe Food Compliant</span>
          </span>
        </div>
      </div>

      {/* Interactive Map with Route Line */}
      <InteractiveMap
        height="380px"
        markers={routeMarkers}
        showControls={false}
        routeLine={{
          from: [28.625, 77.21],
          to: [28.61, 77.23],
        }}
        initialCenter={[28.618, 77.22]}
        initialZoom={14}
      />

      {/* Route Summary Footbar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F7EA] text-[#138A36] font-bold">
            A
          </span>
          <div>
            <p className="font-extrabold text-slate-900">{donorName}</p>
            <p className="text-[10px] text-slate-500 font-semibold">Origin Point</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-extrabold">
          <span>┈┈┈┈┈┈</span>
          <span className="rounded-full bg-[#138A36] px-2 py-0.5 text-[10px] text-white">
            {distance}
          </span>
          <span>┈┈┈┈┈┈</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold">
            B
          </span>
          <div>
            <p className="font-extrabold text-slate-900">{receiverName}</p>
            <p className="text-[10px] text-slate-500 font-semibold">Destination Shelter</p>
          </div>
        </div>
      </div>
    </div>
  );
}
