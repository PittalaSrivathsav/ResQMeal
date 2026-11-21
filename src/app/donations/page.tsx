import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, Plus, Trash2 } from "lucide-react";
import type { DonationStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { Disclaimer } from "@/components/disclaimer";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusChip } from "@/components/status-chip";
import { formatDateTime, remainingTimeLabel } from "@/lib/donations";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/roles";
import { deleteDonation } from "./actions";

const HISTORY_STATUSES: DonationStatus[] = ["DELIVERED", "EXPIRED", "CANCELLED"];

function storageLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

type PageProps = { searchParams: Promise<{ view?: string }> };

export default async function MyDonationsPage({ searchParams }: PageProps) {
  const session = await requireRole("RESTAURANT");
  const { view } = await searchParams;
  const showHistory = view === "history";

  const userId = session.user.id;
  if (!userId) notFound();
  let org = await db.organisation.findFirst({
    where: { userId },
    select: { id: true, name: true, publicLocality: true },
  });
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
  if (!org) notFound();

  const donations = await db.donation.findMany({
    where: {
      restaurantOrgId: org.id,
      ...(showHistory ? { status: { in: HISTORY_STATUSES } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      quantityValue: true,
      quantityUnit: true,
      storageType: true,
      pickupDeadline: true,
    },
  });

  const now = new Date();
  const tabs = [
    { label: "All Donations", href: "/donations", active: !showHistory },
    { label: "History", href: "/donations?view=history", active: showHistory },
  ];

  return (
    <AppShell
      role="RESTAURANT"
      userName={session.user.name || org.name}
      organisationName={org.name}
      userLocality={org.publicLocality}
    >
      <PageHeader
        title="My Donations"
        subtitle="Newest first. Track each donation from posting to delivery."
        action={
          <Link
            href="/donations/new"
            className="inline-flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Post Donation
          </Link>
        }
      />

      <nav aria-label="Donation views" className="mb-5 flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${
              tab.active
                ? "bg-green-700 text-white ring-green-700"
                : "bg-white text-slate-600 ring-slate-200 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {donations.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={<Package className="h-7 w-7" aria-hidden="true" />}
            title={showHistory ? "No past donations yet" : "No donations yet"}
            message={
              showHistory
                ? "Delivered, expired and cancelled donations will appear here."
                : "Post your first surplus food donation to get started."
            }
          />
          {!showHistory ? (
            <div className="flex justify-center">
              <Link
                href="/donations/new"
                className="inline-flex items-center gap-2 rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Post Donation
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3">
          {donations.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-slate-900">{d.title}</p>
                  <StatusChip status={d.status} />
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {d.quantityValue} {d.quantityUnit === "KG" ? "kg" : "meal packets"} ·{" "}
                  {storageLabel(d.storageType)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Pickup by {formatDateTime(d.pickupDeadline)} ·{" "}
                  {remainingTimeLabel(d.pickupDeadline, now)}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <Link
                  href={`/donations/${d.id}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-700 ring-1 ring-green-200 hover:bg-green-50"
                >
                  View Details
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteDonation(d.id);
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Disclaimer />
      </div>
    </AppShell>
  );
}
