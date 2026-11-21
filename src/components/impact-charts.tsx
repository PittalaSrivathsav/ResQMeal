"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EarthGlobe3D } from "@/components/illustrations-3d";

export function ImpactCharts({
  totalDonations = 340,
}: {
  totalDonations?: number;
}) {
  // Exact 5 data points matching Screen 8: Mar 1, Mar 7, Mar 14, Mar 21, Mar 28
  const mealsDailyData = [
    { date: "Mar 1", meals: 380 },
    { date: "Mar 7", meals: 640 },
    { date: "Mar 14", meals: 590 },
    { date: "Mar 21", meals: 820 },
    { date: "Mar 28", meals: 950 },
  ];

  // Exact doughnut breakdown matching Screen 8: Delivered (85%), In Progress (10%), Open (5%)
  const statusPieData = [
    { name: "Delivered", value: 85, color: "#138A36" },
    { name: "In Progress", value: 10, color: "#F59E0B" },
    { name: "Open", value: 5, color: "#10B981" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1.1fr] items-start">
      {/* Left: Meals Rescued Daily Line Chart */}
      <section className="rounded-3xl border border-white/90 bg-white p-7 shadow-[0_15px_40px_rgba(7,91,42,0.06)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Meals Rescued (Daily)
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              National surplus food recovery trend across India
            </p>
          </div>
          <span className="rounded-full bg-[#E8F7EA] px-3.5 py-1 text-xs font-extrabold text-[#138A36]">
            March 2026
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mealsDailyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 1000]}
                ticks={[0, 250, 500, 750, 1000]}
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 700 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              />
              <Line
                type="monotone"
                dataKey="meals"
                stroke="#138A36"
                strokeWidth={3.5}
                dot={{ r: 5, fill: "#138A36", stroke: "#FFFFFF", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#075B2A" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3D Earth Globe with green plants at bottom left */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-4">
          <EarthGlobe3D size={68} />
          <div>
            <h4 className="text-sm font-black text-slate-900">
              Zero Landfill Waste Objective
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              Every meal rescued diverts ~0.4 kg of organic waste from Indian landfills, avoiding methane and greenhouse gas emissions.
            </p>
          </div>
        </div>
      </section>

      {/* Right: Donations by Status Doughnut Chart */}
      <section className="rounded-3xl border border-white/90 bg-white p-7 shadow-[0_15px_40px_rgba(7,91,42,0.06)] flex flex-col justify-between">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Donations by Status
            </h3>
            <span className="text-xs font-bold text-slate-500">Live Breakdown</span>
          </div>

          <div className="relative h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={94}
                  paddingAngle={4}
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="#FFFFFF" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, "Share"]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text inside Doughnut matching Screen 8: "340 Total" */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {totalDonations}
              </span>
              <span className="text-xs font-bold text-slate-500">Total</span>
            </div>
          </div>
        </div>

        {/* Legend matching Screen 8 */}
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs font-bold">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#138A36]" />
              <span>Delivered (85%)</span>
            </span>
            <span className="text-[#138A36]">289 batches</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
              <span>In Progress (10%)</span>
            </span>
            <span className="text-amber-600">34 batches</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#10B981]" />
              <span>Open (5%)</span>
            </span>
            <span className="text-emerald-600">17 batches</span>
          </div>
        </div>
      </section>
    </div>
  );
}
