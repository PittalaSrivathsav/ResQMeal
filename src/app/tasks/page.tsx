import Link from "next/link";
import { Clock, MapPin, ArrowRight, Check, Truck, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/roles";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { FoodThumbnailCard } from "@/components/illustrations-3d";
import { acceptTask, updateTaskStatus } from "@/app/tasks/actions";

type SearchParams = Promise<{ view?: string; accepted?: string }>;

export default async function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireRole("VOLUNTEER");
  const { view: rawView, accepted } = await searchParams;
  const isMine = rawView === "mine";
  const isHistory = rawView === "history";

  // Fast single-roundtrip parallel fetch for volunteer identity and all task views
  const volunteerWhere = session.user?.id
    ? { userId: session.user.id }
    : { id: "cmwq68j2x0005x4lggn0e9k9w" };

  const [volunteer, openTasks, myTasks, historyTasks] = await Promise.all([
    db.volunteer.findFirst({
      where: volunteerWhere,
      include: { user: { select: { displayName: true } } },
    }),
    db.task.findMany({
      where: { status: "OPEN" },
      include: {
        donation: {
          include: {
            restaurantOrg: { select: { name: true, publicLocality: true } },
            claim: { include: { ngoOrg: { select: { name: true, publicLocality: true } } } },
          },
        },
      },
      take: 10,
    }),
    db.task.findMany({
      where: {
        volunteer: volunteerWhere,
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
      },
      include: {
        donation: {
          include: {
            restaurantOrg: { select: { name: true, publicLocality: true } },
            claim: { include: { ngoOrg: { select: { name: true, publicLocality: true } } } },
          },
        },
      },
    }),
    db.task.findMany({
      where: {
        volunteer: volunteerWhere,
        status: "DONE",
      },
      include: {
        donation: {
          include: {
            restaurantOrg: { select: { name: true, publicLocality: true } },
            claim: { include: { ngoOrg: { select: { name: true, publicLocality: true } } } },
          },
        },
      },
    }),
  ]);

  const displayName = session.user.name || volunteer?.user?.displayName || "Volunteer";
  const displayLocality = volunteer?.serviceLocalities?.[0] || "India Network";

  return (
    <AppShell
      role="VOLUNTEER"
      bannerTitle="Volunteer Dashboard"
      userName={displayName}
      userLocality={displayLocality}
    >
      {accepted && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-[#138A36] flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#138A36]" />
            <span>Task accepted successfully! Please proceed to the restaurant for pickup.</span>
          </span>
          <Link href="/tasks?view=mine" className="underline hover:text-[#075B2A] font-extrabold text-xs">
            View My Tasks
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/tasks"
            className={`rounded-full px-5 py-2 text-sm font-extrabold transition shadow-sm ${
              !isMine && !isHistory
                ? "bg-[#138A36] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            Available Tasks ({openTasks.length})
          </Link>
          <Link
            href="/tasks?view=mine"
            className={`rounded-full px-5 py-2 text-sm font-extrabold transition shadow-sm ${
              isMine
                ? "bg-[#138A36] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            My Tasks ({myTasks.length})
          </Link>
          <Link
            href="/tasks?view=history"
            className={`rounded-full px-5 py-2 text-sm font-extrabold transition shadow-sm ${
              isHistory
                ? "bg-[#138A36] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            History ({historyTasks.length})
          </Link>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {/* TAB 1: Available Tasks */}
        {!isMine && !isHistory && (
          openTasks.length > 0 ? (
            openTasks.map((t, idx) => {
              const donor = t.donation.restaurantOrg?.name ?? "Spice Garden Restaurant";
              const receiver = t.donation.claim?.ngoOrg?.name ?? "Hope Foundation";
              const dist = idx === 0 ? "1.2 km total" : "2.8 km total";
              const deadline = "9:00 PM";

              return (
                <div
                  key={t.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#138A36]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <FoodThumbnailCard dish={t.donation.title} size={82} />
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Pickup: {t.donation.title} ({t.donation.quantityValue}{" "}
                        {t.donation.quantityUnit === "SERVINGS" ? "packets" : "kg"})
                      </h3>

                      <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-600">
                        <span>{donor}</span>
                        <span className="text-[#138A36]">→</span>
                        <span>{receiver}</span>
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-amber-600" />
                          <span>{dist}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Pickup by: {deadline}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:self-center">
                    <form
                      action={async () => {
                        "use server";
                        await acceptTask(t.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-full bg-[#138A36] px-7 py-2.5 text-sm font-extrabold text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] hover:shadow-lg active:scale-95"
                      >
                        Accept Task
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center">
              <p className="text-base font-bold text-slate-700">No open pickup tasks available</p>
              <p className="mt-1 text-xs text-slate-500">
                New delivery requests will appear here as soon as NGOs claim donations.
              </p>
            </div>
          )
        )}

        {/* TAB 2: My Tasks */}
        {isMine && (
          myTasks.length > 0 ? (
            myTasks.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <FoodThumbnailCard dish={t.donation.title} size={82} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">{t.donation.title}</h3>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-black ${
                        t.status === "ASSIGNED"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {t.status === "ASSIGNED" ? "Ready for Pickup" : "In Transit"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {t.donation.restaurantOrg?.name ?? "Spice Garden Restaurant"} → {t.donation.claim?.ngoOrg?.name ?? "Hope Foundation"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {t.status === "ASSIGNED" && (
                    <form
                      action={async () => {
                        "use server";
                        await updateTaskStatus(t.id, "COLLECTED");
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-amber-600 transition"
                      >
                        Mark Collected
                      </button>
                    </form>
                  )}
                  {t.status === "IN_PROGRESS" && (
                    <form
                      action={async () => {
                        "use server";
                        await updateTaskStatus(t.id, "DELIVERED");
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-full bg-[#138A36] px-6 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-[#075B2A] transition"
                      >
                        Mark Delivered
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/donations/${t.donationId}`}
                    className="rounded-full border border-slate-200 px-5 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Track Route
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center">
              <p className="text-base font-bold text-slate-700">No active tasks assigned yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Go to Available Tasks to accept an open pickup task in your zone.
              </p>
              <Link
                href="/tasks"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#138A36] px-5 py-2 text-xs font-extrabold text-white"
              >
                Browse Available Tasks
              </Link>
            </div>
          )
        )}

        {/* TAB 3: History */}
        {isHistory && (
          historyTasks.length > 0 ? (
            historyTasks.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-90"
              >
                <div className="flex items-center gap-4">
                  <FoodThumbnailCard dish={t.donation.title} size={82} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">{t.donation.title}</h3>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 text-xs font-black">
                        Delivered ✔
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {t.donation.restaurantOrg?.name ?? "Spice Garden Restaurant"} → {t.donation.claim?.ngoOrg?.name ?? "Hope Foundation"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/donations/${t.donationId}`}
                    className="rounded-full border border-slate-200 px-5 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center">
              <p className="text-base font-bold text-slate-700">No completed tasks in history yet</p>
              <p className="mt-1 text-xs text-slate-500">
                When you mark tasks as delivered, they will appear here.
              </p>
            </div>
          )
        )}
      </div>
    </AppShell>
  );
}
