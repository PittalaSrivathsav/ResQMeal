import { notFound } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DonationBox3D } from "@/components/illustrations-3d";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/roles";
import { DonationForm } from "./DonationForm";

const STEPS = [
  "Add food details",
  "Set quantity & pickup time",
  "Get matched with nearby NGOs",
  "Track the delivery",
];

export default async function NewDonationPage() {
  const session = await requireRole("RESTAURANT");
  const userId = session.user.id;
  if (!userId) notFound();

  let org = await db.organisation.findFirst({
    where: { userId },
    select: { id: true, name: true, publicLocality: true },
  });
  if (!org) {
    org = await db.organisation.findFirst({
      where: { name: "Spice Garden Restaurant" },
      select: { id: true, name: true, publicLocality: true },
    });
  }

  return (
    <AppShell
      role="RESTAURANT"
      bannerTitle="+ Post Donation (Restaurant)"
      userName={session.user.name || org?.name}
      organisationName={org?.name}
      userLocality={org?.publicLocality}
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr] items-start">
        {/* Left Side: 3D Illustration & Quick Steps matching Screen 4 */}
        <aside className="rounded-3xl border border-white/90 bg-gradient-to-br from-[#E8F7EA] via-white to-[#D9F2DE] p-8 shadow-[0_15px_40px_rgba(7,91,42,0.08)] select-none">
          <div className="flex items-center justify-center py-2">
            <img
              src="/hero-box.jpg"
              alt="Donation Box"
              className="max-w-[280px] w-full h-auto object-contain drop-shadow-xl rounded-2xl"
            />
          </div>

          <h2 className="mt-6 text-center text-2xl font-black tracking-tight text-slate-900">
            Donate Surplus Food in Under a Minute
          </h2>

          <ul className="mt-6 space-y-3.5">
            {STEPS.map((step) => (
              <li key={step} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#138A36] text-white shadow-sm">
                  <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                </div>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right Side: Donation Form Card */}
        <div className="rounded-3xl border border-white/90 bg-white p-7 sm:p-9 shadow-[0_15px_40px_rgba(7,91,42,0.06)]">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <Link
              href="/restaurant"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700 hover:text-[#138A36] transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Post a Food Donation</span>
            </Link>
            <span className="text-xs font-bold text-[#138A36] bg-[#E8F7EA] px-3 py-1 rounded-full">
              Kukatpally Zone
            </span>
          </div>

          <DonationForm />
        </div>
      </div>
    </AppShell>
  );
}
