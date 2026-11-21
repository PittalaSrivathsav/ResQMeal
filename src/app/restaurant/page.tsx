import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ClipboardList,
  Leaf,
  Percent,
  Plus,
  Truck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import type { DonationStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { FoodThumbnailCard } from "@/components/illustrations-3d";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/roles";
import { formatDateTime } from "@/lib/donations";
import { deleteDonation } from "@/app/donations/actions";

const ACTIVE_STATUSES: DonationStatus[] = ["POSTED", "CLAIMED", "COLLECTED"];

export default async function RestaurantDashboardPage() {
  const session = await requireRole("RESTAURANT");
  const userId = session.user.id;
  if (!userId) notFound();

  // 1. Prioritize finding the signed-in user's restaurant first
  let org = await db.organisation.findFirst({
    where: { userId },
    select: { id: true, name: true, publicLocality: true },
  });

  // Fallback to sample restaurant for demo / guest sessions
  if (!org) {
    org = await db.organisation.findFirst({
      where: {
        OR: [
          { id: "cmwq671v80001x4sw2qlpaqee" },
          { name: "Spice Garden Restaurant" },
        ],
      },
      select: { id: true, name: true, publicLocality: true },
    });
  }
  if (!org) {
    org = {
      id: "default-restaurant",
      name: session.user.name || "Restaurant Partner",
      publicLocality: "India Network",
    };
  }

  // 2. Fast single query to fetch all restaurant donations
  const scope = { restaurantOrgId: org.id };
  const donations = await db.donation.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      quantityValue: true,
      quantityUnit: true,
      isVegetarian: true,
      foodCategory: true,
      pickupDeadline: true,
      storageInstructions: true,
      estimatedServings: true,
    },
  });

  const totalDb = donations.length;
  const deliveredDb = donations.filter((d) => d.status === "DELIVERED").length;
  const activeDb = donations.filter((d) => ACTIVE_STATUSES.includes(d.status));
  const mealsDb = donations
    .filter((d) => d.status === "DELIVERED")
    .reduce(
      (sum, d) =>
        sum +
        (d.estimatedServings ||
          (d.quantityUnit === "SERVINGS" ? d.quantityValue : d.quantityValue * 2.5)),
      0
    );

  const isDemo = false;

  const total = isDemo ? 18 : totalDb;
  const delivered = isDemo ? 15 : deliveredDb;
  const meals = isDemo ? 1450 : Math.round(mealsDb);
  const rate = isDemo ? "98%" : totalDb > 0 ? `${Math.round((deliveredDb / totalDb) * 100)}%` : "100%";

  const displayName = session.user.name || org.name;

  return (
    <AppShell
      role="RESTAURANT"
      userName={displayName}
      organisationName={org.name}
      userLocality={org.publicLocality}
      bannerTitle="Restaurant Dashboard"
    >
      {/* 4 Stat Cards matching Screen 3 in Reference */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Total Donations */}
        <div className="rounded-3xl border border-white/90 bg-white/95 p-6 shadow-[0_10px_30px_rgba(7,91,42,0.05)] backdrop-blur">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F7EA] text-[#138A36]">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{total}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">Total Donations</p>
        </div>

        {/* Card 2: Meals Donated */}
        <div className="rounded-3xl border border-white/90 bg-white/95 p-6 shadow-[0_10px_30px_rgba(7,91,42,0.05)] backdrop-blur">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F7EA] text-[#138A36]">
            <Leaf className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
            {meals.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500">Meals Donated</p>
        </div>

        {/* Card 3: Successful Deliveries */}
        <div className="rounded-3xl border border-white/90 bg-white/95 p-6 shadow-[0_10px_30px_rgba(7,91,42,0.05)] backdrop-blur">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F7EA] text-[#138A36]">
            <Truck className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{delivered}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">Successful Deliveries</p>
        </div>

        {/* Card 4: Fulfilment Rate */}
        <div className="rounded-3xl border border-white/90 bg-white/95 p-6 shadow-[0_10px_30px_rgba(7,91,42,0.05)] backdrop-blur">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F7EA] text-[#138A36]">
            <Percent className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{rate}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">Fulfilment Rate</p>
        </div>
      </div>

      {/* My Active Donations Section matching Screen 3 */}
      <section className="mt-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-extrabold text-slate-900">My Active Donations</h2>
          <Link
            href="/donations/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#138A36] px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] hover:shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Donate Food</span>
          </Link>
        </div>

        {/* Active Donations Cards List */}
        <div className="space-y-4">
          {activeDb.length > 0 ? (
            activeDb.map((donation) => {
              const statusClass =
                donation.status === "CLAIMED"
                  ? "bg-[#FEF3C7] text-[#D97706] border border-amber-200"
                  : donation.status === "COLLECTED"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-emerald-50 text-[#138A36] border border-emerald-200";

              return (
                <div
                  key={donation.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#138A36]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <FoodThumbnailCard dish={donation.title} size={76} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-extrabold text-slate-900">
                          {donation.title}
                        </h3>
                        <span className="rounded-full bg-[#E8F7EA] px-3 py-0.5 text-xs font-extrabold text-[#138A36]">
                          {donation.isVegetarian ? "Vegetarian" : "Non-vegetarian"}
                        </span>
                        <span className={`rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider ${statusClass}`}>
                          {donation.status === "CLAIMED" ? "Claimed" : donation.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-slate-600">
                        {donation.quantityValue} {donation.quantityUnit === "SERVINGS" ? "meal packets" : "kg"}
                      </p>

                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>Pickup by: {formatDateTime(donation.pickupDeadline)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <Link
                      href={`/donations/${donation.id}`}
                      className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#138A36] hover:bg-[#F4FBF5] hover:text-[#138A36]"
                    >
                      View Details
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteDonation(donation.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-4 py-2.5 text-xs font-extrabold text-rose-600 shadow-sm transition hover:bg-rose-50 hover:border-rose-300 active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          ) : isDemo ? (
            /* Fallback matching Reference Card for Demo */
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <FoodThumbnailCard dish="biryani" size={76} />
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-extrabold text-slate-900">Veg Biryani</h3>
                    <span className="rounded-full bg-[#E8F7EA] px-3 py-0.5 text-xs font-extrabold text-[#138A36]">
                      Vegetarian
                    </span>
                    <span className="rounded-full bg-[#FEF3C7] text-[#D97706] border border-amber-200 px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                      Claimed
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-600">50 meal packets</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Pickup by: Today, 9:00 PM</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center sm:self-center">
                <Link
                  href="/donations/track"
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#138A36] hover:bg-[#F4FBF5] hover:text-[#138A36]"
                >
                  View Details
                </Link>
              </div>
            </div>
          ) : (
            /* Clean Empty State for Real Restaurant */
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
              <p className="text-base font-bold text-slate-700">No active surplus donations right now</p>
              <p className="mt-1 text-xs text-slate-500">
                Post surplus food to immediately notify verified NGOs and volunteers in your area.
              </p>
              <Link
                href="/donations/new"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#138A36] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#075B2A] transition"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Post Your First Donation</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
