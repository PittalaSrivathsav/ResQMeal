import Link from "next/link";
import { Clock, HandHeart, Package } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Disclaimer } from "@/components/disclaimer";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusChip } from "@/components/status-chip";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/donations";
import { requireRole } from "@/lib/roles";

type ClaimsPageProps = {
  searchParams: Promise<{ view?: string }>;
};

const tabClass = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    active
      ? "bg-green-700 text-white"
      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-green-700"
  }`;

export default async function ClaimsPage({ searchParams }: ClaimsPageProps) {
  const session = await requireRole("NGO");
  const { view } = await searchParams;
  const history = view === "history";

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
          message="Add your organisation details to see your claims."
        />
      </AppShell>
    );
  }

  const claims = await db.claim.findMany({
    where: {
      ngoOrgId: org.id,
      status: history ? { in: ["COMPLETED", "RELEASED"] } : "ACTIVE",
    },
    orderBy: { claimedAt: "desc" },
    include: {
      donation: {
        select: {
          id: true,
          title: true,
          status: true,
          pickupDeadline: true,
          allergens: true,
          handlingInstructions: true,
        },
      },
    },
  });

  return (
    <AppShell
      role="NGO"
      userName={displayName}
      organisationName={org?.name}
      userLocality={org?.publicLocality}
      bannerTitle="My Claims"
    >
      <PageHeader title="My Claims" subtitle="Food your organisation has claimed." />

      <nav aria-label="Claim views" className="mb-6 flex flex-wrap gap-2">
        <Link href="/claims" className={tabClass(!history)} aria-current={!history ? "page" : undefined}>
          Active
        </Link>
        <Link
          href="/claims?view=history"
          className={tabClass(history)}
          aria-current={history ? "page" : undefined}
        >
          History
        </Link>
      </nav>

      {claims.length === 0 ? (
        <EmptyState
          icon={<HandHeart className="h-6 w-6" aria-hidden="true" />}
          title={history ? "No past claims yet" : "No active claims"}
          message={
            history
              ? "Completed and released claims will appear here."
              : "Claims you make on donations will appear here."
          }
        />
      ) : (
        <ul className="space-y-4">
          {claims.map((c) => (
            <li key={c.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900">{c.donation.title}</h2>
                <div className="flex items-center gap-2">
                  <StatusChip status={c.status} />
                  <Link
                    href={`/donations/${c.donation.id}`}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#138A36] hover:bg-[#F4FBF5] hover:text-[#138A36]"
                  >
                    Track Route
                  </Link>
                </div>
              </div>
              <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Quantity claimed</dt>
                  <dd className="font-semibold text-slate-800">{c.quantityClaimed}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Donation status</dt>
                  <dd>
                    <StatusChip status={c.donation.status} />
                  </dd>
                </div>
                <div className="flex items-start gap-1 sm:col-span-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>Pickup deadline: {formatDateTime(c.donation.pickupDeadline)}</span>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-slate-500">Allergens</dt>
                  <dd>
                    {c.donation.allergens.length > 0
                      ? c.donation.allergens.join(", ")
                      : "None declared by restaurant"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-slate-500">Handling instructions</dt>
                  <dd>{c.donation.handlingInstructions}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Disclaimer />
      </div>
    </AppShell>
  );
}
