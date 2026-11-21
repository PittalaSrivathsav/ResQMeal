import Link from "next/link";
import {
  Utensils,
  Salad,
  Leaf,
  Heart,
  ChevronDown,
  ArrowLeft,
  BarChart3,
  Globe2,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ImpactCharts } from "@/components/impact-charts";
import { FloatingParticles3D, TiltCard3D } from "@/components/tilt-3d";

export const metadata = {
  title: "Impact Dashboard | ResQMeal",
  description: "Real-time national food rescue and environmental diversion impact across India",
};

export default async function ImpactPage() {
  const stats = [
    {
      icon: Utensils,
      value: "12,500+",
      label: "Meals Rescued",
      change: "+18.4% this month",
      color: "bg-[#E8F7EA] text-[#138A36]",
    },
    {
      icon: Salad,
      value: "2,500 kg",
      label: "Food Waste Avoided",
      change: "+12.1% diversion",
      color: "bg-[#E8F7EA] text-[#138A36]",
    },
    {
      icon: Leaf,
      value: "1,200 kg",
      label: "CO2 Emissions Reduced",
      change: "Net greenhouse offset",
      color: "bg-[#E8F7EA] text-[#138A36]",
    },
    {
      icon: Heart,
      value: "340+",
      label: "Total Donations",
      change: "Verified donor pickups",
      color: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#F4FBF5] text-[#17251C] antialiased overflow-x-hidden">
      {/* 3D Fixed Viewport Background */}
      <FloatingParticles3D />

      {/* Standalone Impact Dashboard Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-5">
            <Link href="/" aria-label="ResQMeal home">
              <Logo />
            </Link>

            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#C8EED0] bg-[#E8F7EA] px-3.5 py-1 text-xs font-black text-[#138A36]">
              <span className="flex h-2 w-2 rounded-full bg-[#138A36] animate-pulse" />
              <span>Live Impact Dashboard</span>
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
              href="/login"
              className="rounded-full bg-[#138A36] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] hover:shadow-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Impact Dashboard Content Area */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Header Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#138A36] uppercase tracking-wider mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>National Food Rescue & Diversion Data • India</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Our Impact Across India
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Real-time environmental diversion and nutrition metrics for participating cities across India
            </p>
          </div>

          {/* Timeframe Filter Dropdown */}
          <div className="relative">
            <select
              defaultValue="30days"
              className="appearance-none rounded-2xl border border-slate-300/80 bg-white px-4 py-2.5 pr-9 text-xs font-black text-slate-800 shadow-sm focus:border-[#138A36] focus:outline-none cursor-pointer"
            >
              <option value="30days">Last 30 Days ▾</option>
              <option value="7days">Last 7 Days</option>
              <option value="alltime">All Time</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* 4 Interactive 3D Impact Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((s) => (
            <TiltCard3D key={s.label} maxTilt={10} scale={1.03} glare={true}>
              <div className="rounded-3xl border border-white/90 bg-white/95 p-6 shadow-[0_10px_30px_rgba(7,91,42,0.06)] backdrop-blur transition-all duration-300 hover:border-[#138A36]/40 hover:shadow-xl cursor-default h-full flex flex-col justify-between">
                <div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.color} shadow-xs`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{s.value}</p>
                  <p className="mt-1 text-xs font-bold text-slate-600 sm:text-sm">{s.label}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#138A36]" />
                  <span>{s.change}</span>
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>

        {/* Impact Charts Component (Daily Trend Line Chart + Status Distribution + 3D Earth Globe) */}
        <ImpactCharts totalDonations={340} />

        {/* Methodology & Assumptions Footer Note */}
        <div className="mt-8 rounded-3xl bg-white/90 p-6 border border-slate-200/70 shadow-sm backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E8F7EA] text-[#138A36]">
              <Globe2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Methodology & Verification Protocol
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                1 meal packet is benchmarked at 0.40 kg edible surplus nutrition. CO₂e emissions avoided are calculated at 2.5 kg CO₂e offset per 1.0 kg of food waste diverted from landfill decomposition, verified in accordance with municipal environmental standards.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Standalone Dashboard Footer */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span>— National Food Rescue Network • India</span>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-[#138A36] hover:underline"
          >
            ← Return to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
