import Link from "next/link";
import { Clock, MapPin, Sparkles, Check, Map, List } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FoodThumbnailCard } from "@/components/illustrations-3d";
import { InteractiveMap } from "@/components/interactive-map";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/roles";
import { claimDonation } from "@/app/claims/actions";

type DiscoverPageProps = {
  searchParams: Promise<{ view?: string; claimed?: string }>;
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const session = await requireRole("NGO");
  const { view, claimed } = await searchParams;
  const isMapView = view === "map";
  const recommended = view === "recommended";

  // 1. Fetch user's NGO organization first, fallback to sample NGO
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
  if (!org) {
    org = {
      id: "default-ngo",
      name: session.user.name || "Hope Foundation",
      publicLocality: "India Network",
    };
  }

  // 2. Fetch available posted donations and this NGO's active claims concurrently
  const [donations, myClaims] = await Promise.all([
    db.donation.findMany({
      where: { status: "POSTED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { restaurantOrg: { select: { name: true, publicLocality: true } } },
    }),
    org
      ? db.claim.findMany({
          where: { ngoOrgId: org.id },
          select: { donation: { select: { title: true } } },
        })
      : Promise.resolve([]),
  ]);

  const displayName = session.user.name || org?.name || "NGO Partner";

  return (
    <AppShell
      role="NGO"
      bannerTitle="NGO Dashboard"
      userName={displayName}
      organisationName={org?.name}
      userLocality={org?.publicLocality ?? "India Network"}
    >
      {claimed && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-[#138A36] flex items-center justify-between">
          <span>✔ Donation successfully claimed! It has been dispatched to local volunteers for pickup.</span>
          <Link href="/claims" className="underline hover:text-[#075B2A]">
            View My Claims
          </Link>
        </div>
      )}

      {/* Tabs & Sort Controls matching Screen 5 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/discover"
            className={`rounded-full px-5 py-2 text-sm font-extrabold transition shadow-sm ${
              !recommended && !isMapView
                ? "bg-[#138A36] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            Available Donations
          </Link>
          <Link
            href="/discover?view=recommended"
            className={`rounded-full px-5 py-2 text-sm font-extrabold transition shadow-sm flex items-center gap-1.5 ${
              recommended
                ? "bg-[#138A36] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Recommended for You</span>
            <span>✨</span>
          </Link>
          <Link
            href="/discover?view=map"
            className={`rounded-full px-5 py-2 text-sm font-extrabold transition shadow-sm flex items-center gap-1.5 ${
              isMapView
                ? "bg-[#138A36] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            <Map className="h-4 w-4" />
            <span>Map View</span>
          </Link>
        </div>
      </div>

      {/* Render Map View or List View */}
      {isMapView ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Showing verified food donations and pickup corridors on live map:</span>
            <span className="text-[#138A36] font-black">● 3 Batches Ready for Claim</span>
          </div>
          <InteractiveMap height="540px" selectedCity="All" />
        </div>
      ) : (
      /* Donation Cards List matching Screen 5 */
      <div className="space-y-4">
        {donations.length > 0
          ? donations.map((d, index) => {
              const dist =
                index === 0
                  ? "1.2 km away"
                  : index === 1
                  ? "2.8 km away"
                  : `${(1.2 + index * 0.9).toFixed(1)} km away`;
              const loc = d.restaurantOrg?.publicLocality ?? "Local Hub";

              return (
                <div
                  key={d.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#138A36]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <FoodThumbnailCard dish={d.title} size={82} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-extrabold text-slate-900">{d.title}</h3>
                        <span className="rounded-full bg-[#E8F7EA] px-3 py-0.5 text-xs font-extrabold text-[#138A36]">
                          {d.isVegetarian ? "Vegetarian" : "Non-vegetarian"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-slate-600">
                        {d.quantityValue}{" "}
                        {d.quantityUnit === "SERVINGS" ? "meal packets" : "kg"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-amber-600" />
                          <span>{dist} • {loc}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Pickup by: Today, 9:00 PM</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:self-center">
                    <form
                      action={async () => {
                        "use server";
                        await claimDonation(d.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-full bg-[#138A36] px-7 py-2.5 text-sm font-extrabold text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] hover:shadow-lg active:scale-95"
                      >
                        Claim
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          : (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center">
              <p className="text-base font-bold text-slate-700">No active food donations available</p>
              <p className="mt-1 text-xs text-slate-500">
                New surplus batches will appear here as soon as local restaurants post them.
              </p>
            </div>
          )}
      </div>
      )}
    </AppShell>
  );
}
