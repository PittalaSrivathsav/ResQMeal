import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, CheckCircle2, Clock, MapPin, ShieldCheck, Truck, Utensils, Building2, Trash2 } from "lucide-react";
import { AppShell, type AppRole } from "@/components/app-shell";
import { FoodThumbnailCard } from "@/components/illustrations-3d";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { deleteDonation } from "@/app/donations/actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function DonationTrackingPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch user session and exact donation by ID
  const [session, exactDonation] = await Promise.all([
    auth(),
    db.donation.findUnique({
      where: { id },
      include: {
        restaurantOrg: { select: { name: true, publicLocality: true } },
        claim: { include: { ngoOrg: { select: { name: true, publicLocality: true } } } },
        tasks: { include: { volunteer: { include: { user: { select: { displayName: true } } } } } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    }),
  ]);

  // Fallback to sample donation only if ID is not found in database
  const donation = exactDonation ?? (await db.donation.findFirst({
    where: { title: "Veg Biryani" },
    include: {
      restaurantOrg: { select: { name: true, publicLocality: true } },
      claim: { include: { ngoOrg: { select: { name: true, publicLocality: true } } } },
      tasks: { include: { volunteer: { include: { user: { select: { displayName: true } } } } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  }));

  const userRole = (session?.user?.role as AppRole) ?? "VOLUNTEER";
  const userName = session?.user?.name ?? undefined;
  const userLocality = (session?.user as any)?.locality ?? undefined;

  const donorName = donation?.restaurantOrg?.name ?? "Spice Garden Restaurant";
  const receiverName = donation?.claim?.ngoOrg?.name ?? "Hope Foundation";
  const status = donation?.status ?? "DELIVERED";
  const volunteerName =
    donation?.tasks?.[0]?.volunteer?.user?.displayName ?? userName ?? "Rescue Volunteer";

  const isClaimed = status === "CLAIMED" || status === "COLLECTED" || status === "DELIVERED";
  const isCollected = status === "COLLECTED" || status === "DELIVERED";
  const isDelivered = status === "DELIVERED";

  // Dynamic timeline steps matching current status
  const timeline = [
    { title: "Posted", time: "Today, 7:05 PM", done: true },
    { title: "Claimed by NGO", time: isClaimed ? "Today, 7:18 PM" : "Awaiting NGO", done: isClaimed },
    { title: "Collected by Volunteer", time: isCollected ? "Today, 8:10 PM" : isClaimed ? "In transit" : "Awaiting pickup", done: isCollected },
    { title: "Delivered", time: isDelivered ? "Today, 8:40 PM" : "Awaiting delivery", done: isDelivered },
  ];

  const backHref =
    userRole === "VOLUNTEER"
      ? "/tasks?view=mine"
      : userRole === "NGO"
      ? "/deliveries"
      : "/donations";

  const backText =
    userRole === "VOLUNTEER"
      ? "Back to My Tasks"
      : userRole === "NGO"
      ? "Back to Deliveries"
      : "Donation Details";

  const corridor = donation?.restaurantOrg?.publicLocality
    ? `${donation.restaurantOrg.publicLocality} Corridor • 1.2 km`
    : "Kukatpally Corridor • 1.2 km";

  return (
    <AppShell
      role={userRole}
      userName={userName}
      userLocality={userLocality}
      bannerTitle={
        userRole === "VOLUNTEER"
          ? "Volunteer Delivery Route"
          : userRole === "NGO"
          ? "Incoming Rescue Route"
          : "Donation Tracking (All Roles)"
      }
    >
      {/* Header bar matching Screen 7 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-base font-extrabold text-slate-800 hover:text-[#138A36] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backText}</span>
        </Link>

        <div className="flex items-center gap-2">
          {userRole === "RESTAURANT" && donation?.id && (
            <form
              action={async () => {
                "use server";
                await deleteDonation(donation.id);
                redirect("/donations");
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition shadow-sm active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Donation</span>
              </button>
            </form>
          )}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-black ${
              status === "DELIVERED"
                ? "bg-[#E8F7EA] border border-[#C8EED0] text-[#138A36]"
                : status === "COLLECTED"
                ? "bg-blue-50 border border-blue-200 text-blue-700"
                : "bg-amber-50 border border-amber-200 text-amber-700"
            }`}
          >
            <Check className="h-3.5 w-3.5 stroke-[3]" />
            <span>
              {status === "DELIVERED"
                ? "Delivered"
                : status === "COLLECTED"
                ? "In Transit"
                : "Ready for Pickup"}
            </span>
          </span>
        </div>
      </div>

      {/* Main 2-column layout without map */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Left Card: Food Rescue Information */}
        <div className="rounded-3xl border border-white/90 bg-white p-7 shadow-[0_15px_40px_rgba(7,91,42,0.06)]">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <FoodThumbnailCard dish={donation?.title ?? "Veg Biryani"} size={84} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {donation?.title ?? "Veg Biryani"}
                </h2>
                <span className="rounded-full bg-[#E8F7EA] px-3 py-0.5 text-xs font-extrabold text-[#138A36]">
                  {donation?.isVegetarian ? "Vegetarian" : "Non-vegetarian"}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-600">
                {donation?.quantityValue ?? 50}{" "}
                {donation?.quantityUnit === "KG" ? "kg" : "meal packets"}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <Building2 className="h-5 w-5 text-[#138A36] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-400">Donor Restaurant</p>
                <p className="text-sm font-black text-slate-800">{donorName}</p>
                <p className="text-xs font-semibold text-slate-500">{donation?.restaurantOrg?.publicLocality ?? "Local Hub"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <Building2 className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-400">Receiving NGO</p>
                <p className="text-sm font-black text-slate-800">{receiverName}</p>
                <p className="text-xs font-semibold text-slate-500">{donation?.claim?.ngoOrg?.publicLocality ?? "Local Shelter"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <Truck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-400">Assigned Volunteer Courier</p>
                <p className="text-sm font-black text-slate-800">{volunteerName}</p>
                <p className="text-xs font-semibold text-slate-500">{corridor}</p>
              </div>
            </div>

            {donation?.storageInstructions && (
              <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100">
                <p className="text-xs font-bold text-[#138A36]">Storage & Handling Instructions</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{donation.storageInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Donation Journey Timeline */}
        <div className="rounded-3xl border border-white/90 bg-white p-7 shadow-[0_15px_40px_rgba(7,91,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Donation Journey
              </h3>
              <p className="text-xs font-semibold text-slate-500">Live rescue delivery status</p>
            </div>
            <span className="rounded-full bg-[#E8F7EA] px-3 py-1 text-xs font-extrabold text-[#138A36]">
              Verified FSSAI Corridor
            </span>
          </div>

          <div className="relative pl-6 space-y-7 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#138A36]">
            {timeline.map((step) => (
              <div key={step.title} className="relative flex items-start gap-3">
                <div
                  className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm ring-4 ${
                    step.done
                      ? "bg-[#138A36] ring-[#E8F7EA]"
                      : "bg-slate-300 ring-slate-100"
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <div>
                  <p
                    className={`text-sm font-extrabold leading-none ${
                      step.done ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="mt-1.5 text-xs font-bold text-slate-500">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
