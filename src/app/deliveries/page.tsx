import Link from "next/link";
import { Package, Truck, UserX } from "lucide-react";
import type { DonationStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { Disclaimer } from "@/components/disclaimer";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusChip } from "@/components/status-chip";
import { db } from "@/lib/db";
import { formatDateTime, statusLabel } from "@/lib/donations";
import { requireRole } from "@/lib/roles";

const JOURNEY: DonationStatus[] = ["POSTED", "CLAIMED", "COLLECTED", "DELIVERED"];

const taskTypeLabel = (type: string) => (type === "PICKUP" ? "Pickup" : "Delivery");

const taskStatusLabel = (status: string) =>
  status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default async function DeliveriesPage() {
  const session = await requireRole("NGO");
  let org = await db.organisation.findFirst({
    where: { userId: session.user.id },
    select: { id: true, name: true, publicLocality: true },
  });
  if (!org) {
    org = await db.organisation.findFirst({
      where: {
        OR: [
          { id: "cmwq68inj0003x4lgst3qun2u" },
          { name: "Hope Foundation" },
        ],
      },
      select: { id: true, name: true, publicLocality: true },
    });
  }

  const displayName = session.user.name || org?.name || "NGO Partner";

  if (!org) {
    return (
      <AppShell role="NGO" userName={displayName}>
        <EmptyState
          icon={<Package className="h-6 w-6" aria-hidden="true" />}
          title="Complete your organisation profile"
          message="Add your organisation details to track deliveries."
        />
      </AppShell>
    );
  }

  const donations = await db.donation.findMany({
    where: { claim: { ngoOrgId: org.id } },
    orderBy: { createdAt: "desc" },
    include: { tasks: { orderBy: { type: "asc" } } },
  });

  return (
    <AppShell
      role="NGO"
      userName={displayName}
      organisationName={org?.name}
      userLocality={org?.publicLocality}
      bannerTitle="NGO Deliveries"
    >
      <PageHeader title="Deliveries" subtitle="Pickup and delivery progress for food you claimed." />

      {donations.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-6 w-6" aria-hidden="true" />}
          title="No deliveries yet"
          message="Once you claim a donation, its pickup and delivery tasks will show here."
        />
      ) : (
        <ul className="space-y-4">
          {donations.map((d) => {
            const current = JOURNEY.indexOf(d.status);
            return (
              <li key={d.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-slate-900">{d.title}</h2>
                  <div className="flex items-center gap-2">
                    <StatusChip status={d.status} />
                    <Link
                      href={`/donations/${d.id}`}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#138A36] hover:bg-[#F4FBF5] hover:text-[#138A36]"
                    >
                      Track Route
                    </Link>
                  </div>
                </div>

                <ol className="mt-4 grid gap-3 sm:grid-cols-4" aria-label="Donation journey">
                  {JOURNEY.map((step, i) => {
                    const done = i <= current;
                    return (
                      <li key={step} className="flex items-center gap-2 text-sm">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            done ? "bg-green-700 text-white" : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className={done ? "font-semibold text-slate-900" : "text-slate-500"}>
                          {statusLabel(step)}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-5 space-y-3">
                  {d.tasks.length === 0 ? (
                    <p className="text-sm text-slate-500">No tasks created yet.</p>
                  ) : (
                    d.tasks.map((t) => (
                      <div key={t.id} className="rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">{taskTypeLabel(t.type)}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                            {taskStatusLabel(t.status)}
                          </span>
                        </div>
                        {t.volunteerId ? null : (
                          <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                            <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                            No volunteer assigned yet
                          </p>
                        )}
                        <dl className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-3">
                          <div>
                            <dt className="inline font-medium">Assigned: </dt>
                            <dd className="inline">{t.assignedAt ? formatDateTime(t.assignedAt) : "Not yet"}</dd>
                          </div>
                          {t.collectedAt ? (
                            <div>
                              <dt className="inline font-medium">Collected: </dt>
                              <dd className="inline">{formatDateTime(t.collectedAt)}</dd>
                            </div>
                          ) : null}
                          {t.deliveredAt ? (
                            <div>
                              <dt className="inline font-medium">Delivered: </dt>
                              <dd className="inline">{formatDateTime(t.deliveredAt)}</dd>
                            </div>
                          ) : null}
                        </dl>
                      </div>
                    ))
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8">
        <Disclaimer />
      </div>
    </AppShell>
  );
}
