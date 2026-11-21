import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Utensils,
  Building2,
  Truck,
  Globe2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { InteractiveMap } from "@/components/interactive-map";
import { FloatingParticles3D } from "@/components/tilt-3d";

export const metadata = {
  title: "Pan-India Rescue Map | ResQMeal",
  description: "Live interactive map of surplus food rescue donors, NGOs, and volunteers across India",
};

export default function MapPage() {
  return (
    <div className="relative min-h-screen bg-[#F4FBF5] text-[#17251C] antialiased overflow-x-hidden">
      {/* Fixed 3D Particles Background */}
      <FloatingParticles3D />

      {/* Standalone Map Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="ResQMeal home">
              <Logo />
            </Link>

            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#C8EED0] bg-[#E8F7EA] px-3.5 py-1 text-xs font-black text-[#138A36]">
              <span className="flex h-2 w-2 rounded-full bg-[#138A36] animate-pulse" />
              <span>Live Pan-India Rescue Map</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#138A36] hover:text-[#138A36]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#138A36] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] hover:shadow-lg"
            >
              Join Network
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Title & Quick Stats */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#138A36] mb-1">
              <Globe2 className="h-4 w-4" />
              <span>Pan-India Food Rescue Grid</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Explore Live Food Corridors Across India
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500 max-w-2xl">
              Real-time map connecting verified restaurant donors, community kitchens, and volunteer dispatch couriers across Indian metropolitan hubs.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/90 bg-white/95 px-4 py-2.5 shadow-sm text-center">
              <p className="text-xl font-black text-[#138A36]">28+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Indian Cities</p>
            </div>
            <div className="rounded-2xl border border-white/90 bg-white/95 px-4 py-2.5 shadow-sm text-center">
              <p className="text-xl font-black text-slate-900">450+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Donors</p>
            </div>
            <div className="rounded-2xl border border-white/90 bg-white/95 px-4 py-2.5 shadow-sm text-center">
              <p className="text-xl font-black text-amber-600">98%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivered Fresh</p>
            </div>
          </div>
        </div>

        {/* ── Interactive Leaflet Map Component ── */}
        <InteractiveMap height="620px" selectedCity="All" />

        {/* Legend / Info Cards under Map */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F7EA] text-[#138A36]">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Restaurant Donors</h4>
                <p className="text-xs text-slate-500">Green pins indicate restaurants with live surplus batches ready for pickup.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Verified NGOs</h4>
                <p className="text-xs text-slate-500">Blue pins mark partner shelters, orphanages, and community feeding centers.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Volunteer Couriers</h4>
                <p className="text-xs text-slate-500">Amber pins indicate active couriers transporting food across municipal corridors.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span>— Pan-India Food Rescue Network</span>
          </div>
          <Link href="/" className="text-xs font-bold text-[#138A36] hover:underline">
            ← Return to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
