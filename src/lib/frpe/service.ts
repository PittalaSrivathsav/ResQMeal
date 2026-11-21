import { db } from "@/lib/db";
import { FRPE_WEIGHTS, type DonationPriority, type FRPEResult } from "@/lib/frpe/types";
import {
  getLocalityCoords,
  calculateUrgencyScore,
  calculateDistanceScore,
  calculateQuantityScore,
  calculateCapacityScore,
  calculateDietaryCompatibility,
  calculatePickupFeasibility,
  calculatePriorityScore,
  getPriorityClass,
  recommendBestNGOs,
  recommendBestVolunteers,
  generateExplanation,
} from "@/lib/frpe/engine";

export async function computeFRPEAnalysis(): Promise<FRPEResult> {
  const now = new Date();

  const [donations, ngoOrgs, volunteers] = await Promise.all([
    db.donation.findMany({
      where: { status: { in: ["POSTED", "CLAIMED"] } },
      include: {
        restaurantOrg: true,
        tasks: { include: { volunteer: true } },
        claim: true,
      },
      orderBy: { pickupDeadline: "asc" },
    }),
    db.organisation.findMany({
      where: { type: { in: ["NGO", "COMMUNITY_KITCHEN"] } },
      include: {
        claims: { where: { status: "ACTIVE" }, select: { id: true, donationId: true } },
      },
    }),
    db.volunteer.findMany({
      where: { isActive: true },
      include: {
        user: { select: { displayName: true } },
        tasks: { where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } }, select: { id: true } },
      },
    }),
  ]);

  const ngoList = ngoOrgs.map((ngo) => ({
    id: ngo.id,
    name: ngo.name,
    latitude: ngo.latitude,
    longitude: ngo.longitude,
    capacityKgPerDay: ngo.capacityKgPerDay,
    dietaryRequirements: ngo.dietaryRequirements,
  }));
  const ngoPendingCounts: Record<string, number> = {};
  ngoOrgs.forEach((ngo) => {
    ngoPendingCounts[ngo.id] = ngo.claims.length;
  });

  const volunteerList = volunteers.map((v) => {
    const coords = getLocalityCoords(v.serviceLocalities[0] ?? "Other");
    return {
      id: v.id,
      displayName: v.user?.displayName ?? "Volunteer",
      latitude: coords.latitude,
      longitude: coords.longitude,
      isActive: v.isActive,
    };
  });
  const volunteerActiveTasks: Record<string, number> = {};
  volunteers.forEach((v) => {
    volunteerActiveTasks[v.id] = v.tasks.length;
  });

  const priorities: DonationPriority[] = donations.map((donation) => {
    const minutesRemaining = Math.round(
      (donation.pickupDeadline.getTime() - now.getTime()) / 60000
    );
    const isOverdue = minutesRemaining < 0;
    const restLat = donation.restaurantOrg.latitude;
    const restLng = donation.restaurantOrg.longitude;
    const quantityKg =
      donation.quantityUnit === "KG"
        ? donation.quantityValue
        : donation.quantityValue * 0.4;

    const topNGOs = recommendBestNGOs(
      restLat,
      restLng,
      donation.isVegetarian,
      quantityKg,
      minutesRemaining,
      ngoList,
      ngoPendingCounts
    );
    const topVolunteers = recommendBestVolunteers(
      restLat,
      restLng,
      minutesRemaining,
      volunteerList,
      volunteerActiveTasks
    );
    const nearestDist = topNGOs[0]?.distanceKm ?? 5;
    const hasActiveVol = (donation.tasks ?? []).some((t) =>
      ["ASSIGNED", "IN_PROGRESS"].includes(t.status)
    );

    const factors = {
      urgency: calculateUrgencyScore(minutesRemaining),
      urgencyRaw: minutesRemaining,
      distance: calculateDistanceScore(nearestDist),
      distanceRaw: nearestDist,
      quantity: calculateQuantityScore(
        quantityKg,
        topNGOs[0]?.capacityKgPerDay ?? null
      ),
      quantityRaw: quantityKg,
      capacity: calculateCapacityScore(
        ngoPendingCounts[topNGOs[0]?.id ?? ""] ?? 0,
        topNGOs[0]?.capacityKgPerDay ?? null,
        quantityKg
      ),
      capacityRaw: topNGOs[0]?.capacityKgPerDay ?? 0,
      dietary: calculateDietaryCompatibility(
        donation.isVegetarian,
        topNGOs[0]
          ? ngoOrgs.find((n) => n.id === topNGOs[0].id)?.dietaryRequirements ?? null
          : null
      ),
      feasibility: calculatePickupFeasibility(
        minutesRemaining,
        nearestDist,
        hasActiveVol
      ),
      total: 0,
    };
    factors.total = isOverdue ? 0 : calculatePriorityScore(factors);
    const priorityClass = getPriorityClass(factors.total, isOverdue);
    const explanation = generateExplanation(
      factors,
      priorityClass,
      topNGOs[0]?.name ?? "",
      topVolunteers[0]?.name ?? ""
    );

    // Best-effort MatchScore upsert
    if (topNGOs[0] && !isOverdue) {
      db.matchScore
        .upsert({
          where: {
            donationId_ngoOrgId: {
              donationId: donation.id,
              ngoOrgId: topNGOs[0].id,
            },
          },
          create: {
            donationId: donation.id,
            ngoOrgId: topNGOs[0].id,
            score: factors.total,
            factorBreakdown: JSON.parse(JSON.stringify(factors)),
          },
          update: {
            score: factors.total,
            factorBreakdown: JSON.parse(JSON.stringify(factors)),
            computedAt: now,
          },
        })
        .catch(() => {
          /* non-critical */
        });
    }

    return {
      donationId: donation.id,
      title: donation.title,
      restaurantName: donation.restaurantOrg.name,
      restaurantLocality: donation.restaurantOrg.publicLocality,
      quantityValue: donation.quantityValue,
      quantityUnit: donation.quantityUnit,
      pickupDeadline: donation.pickupDeadline.toISOString(),
      minutesRemaining,
      isOverdue,
      priorityScore: factors.total,
      priorityClass,
      factors,
      topNGOs,
      topVolunteers,
      explanation,
      computedAt: now.toISOString(),
      status: donation.status,
      isVegetarian: donation.isVegetarian,
      foodCategory: donation.foodCategory,
    };
  });

  priorities.sort((a, b) => b.priorityScore - a.priorityScore);
  const summary = {
    total: priorities.length,
    critical: priorities.filter((d) => d.priorityClass === "CRITICAL").length,
    high: priorities.filter((d) => d.priorityClass === "HIGH").length,
    medium: priorities.filter((d) => d.priorityClass === "MEDIUM").length,
    normal: priorities.filter((d) => d.priorityClass === "NORMAL").length,
    overdue: priorities.filter((d) => d.priorityClass === "OVERDUE").length,
  };

  return {
    donations: priorities,
    summary,
    computedAt: now.toISOString(),
    weights: FRPE_WEIGHTS,
  };
}
