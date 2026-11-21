import { FRPE_WEIGHTS, type FactorScores, type PriorityClass, type NGORecommendation, type VolunteerRecommendation } from "./types";
import { LOCALITIES, type Locality } from "@/lib/localities";

export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getLocalityCoords(locality: string): { latitude: number; longitude: number } {
  return LOCALITIES[locality as Locality] ?? { latitude: 20.5937, longitude: 78.9629 };
}

export function calculateUrgencyScore(minutesRemaining: number): number {
  if (minutesRemaining <= 0) return 0;
  if (minutesRemaining < 30) return 100;
  if (minutesRemaining < 60) return 85;
  if (minutesRemaining < 120) return 65;
  if (minutesRemaining < 240) return 40;
  return 15;
}

export function calculateDistanceScore(distanceKm: number): number {
  if (distanceKm <= 1) return 100;
  if (distanceKm <= 3) return 80;
  if (distanceKm <= 5) return 60;
  if (distanceKm <= 10) return 30;
  return 10;
}

export function calculateQuantityScore(quantityKg: number, capacityKgPerDay: number | null): number {
  if (!capacityKgPerDay) return 50;
  const ratio = quantityKg / capacityKgPerDay;
  if (ratio <= 0.3) return 100;
  if (ratio <= 0.6) return 80;
  if (ratio <= 1.0) return 60;
  if (ratio <= 1.5) return 30;
  return 10;
}

export function calculateCapacityScore(pendingCount: number, capacityKgPerDay: number | null, quantityKg: number): number {
  if (!capacityKgPerDay) return 40;
  const usedRatio = (pendingCount * 20) / capacityKgPerDay; // assume 20kg avg per pending donation
  const remaining = capacityKgPerDay * (1 - usedRatio);
  if (remaining <= 0) return 0;
  if (remaining >= quantityKg * 2) return 100;
  if (remaining >= quantityKg) return 70;
  return 30;
}

export function calculateDietaryCompatibility(isVegetarian: boolean, dietaryRequirements: string | null): number {
  if (!dietaryRequirements) return 70; // unknown = assume compatible
  const req = dietaryRequirements.toLowerCase();
  if (req.includes("veg") && isVegetarian) return 100;
  if (req.includes("veg") && !isVegetarian) return 20;
  if (req.includes("non-veg") || req.includes("any")) return 90;
  return 70;
}

export function calculatePickupFeasibility(minutesRemaining: number, distanceKm: number, hasActiveVolunteer: boolean): number {
  const travelMin = distanceKm * 4; // 4 min/km avg city speed
  const buffer = minutesRemaining - travelMin - 10; // 10 min buffer
  if (buffer < 0) return 0;
  if (buffer < 15) return 40;
  if (buffer < 30) return 70;
  if (hasActiveVolunteer) return 100;
  return 85;
}

export function calculatePriorityScore(factors: FactorScores, weights = FRPE_WEIGHTS): number {
  return Math.round(
    factors.urgency * weights.timeUrgency +
    factors.distance * weights.distance +
    factors.quantity * weights.quantity +
    factors.capacity * weights.ngoCapacity +
    factors.dietary * weights.dietaryCompatibility +
    factors.feasibility * weights.pickupFeasibility
  );
}

export function getPriorityClass(score: number, isOverdue: boolean): PriorityClass {
  if (isOverdue) return "OVERDUE";
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "NORMAL";
}

export function recommendBestNGOs(
  restaurantLat: number,
  restaurantLng: number,
  isVegetarian: boolean,
  quantityKg: number,
  minutesRemaining: number,
  ngos: Array<{ id: string; name: string; latitude: number; longitude: number; capacityKgPerDay: number | null; dietaryRequirements: string | null; }>,
  pendingCounts: Record<string, number>
): NGORecommendation[] {
  return ngos.map(ngo => {
    const distanceKm = haversineDistanceKm(restaurantLat, restaurantLng, ngo.latitude, ngo.longitude);
    const dietary = calculateDietaryCompatibility(isVegetarian, ngo.dietaryRequirements);
    const capacity = calculateCapacityScore(pendingCounts[ngo.id] ?? 0, ngo.capacityKgPerDay, quantityKg);
    const distance = calculateDistanceScore(distanceKm);
    const feasibility = calculatePickupFeasibility(minutesRemaining, distanceKm, false);
    const compatibilityScore = Math.round((dietary * 0.4 + distance * 0.3 + capacity * 0.3));
    const reasons: string[] = [];
    if (distanceKm <= 2) reasons.push("Nearby location");
    if (dietary >= 90) reasons.push("Compatible dietary requirements");
    if (capacity >= 70) reasons.push("Sufficient receiving capacity");
    if (feasibility >= 70) reasons.push("Pickup deadline achievable");
    if (reasons.length === 0) reasons.push("Available NGO in network");
    return {
      id: ngo.id, name: ngo.name, distanceKm: Math.round(distanceKm * 10) / 10,
      capacityKgPerDay: ngo.capacityKgPerDay, compatibilityScore,
      estimatedTravelMinutes: Math.round(distanceKm * 4), reason: reasons,
    };
  }).sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, 3);
}

export function recommendBestVolunteers(
  restaurantLat: number,
  restaurantLng: number,
  minutesRemaining: number,
  volunteers: Array<{ id: string; displayName: string; latitude: number; longitude: number; isActive: boolean; }>,
  activeTaskCounts: Record<string, number>
): VolunteerRecommendation[] {
  return volunteers
    .filter(v => v.isActive)
    .map(v => {
      const distanceKm = haversineDistanceKm(restaurantLat, restaurantLng, v.latitude, v.longitude);
      const activeTasks = activeTaskCounts[v.id] ?? 0;
      const travelMin = Math.round(distanceKm * 4);
      const reasons: string[] = [];
      if (distanceKm <= 2) reasons.push("Close to restaurant");
      if (activeTasks === 0) reasons.push("No current assignments");
      if (activeTasks <= 1) reasons.push("Low current workload");
      if (travelMin < minutesRemaining - 15) reasons.push("Can reach before deadline");
      if (reasons.length === 0) reasons.push("Available volunteer");
      return {
        id: v.id, name: v.displayName, distanceKm: Math.round(distanceKm * 10) / 10,
        activeTasks, estimatedTravelMinutes: travelMin, reason: reasons,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);
}

export function generateExplanation(factors: FactorScores, priorityClass: string, topNGO: string, topVolunteer: string): string {
  const lines: string[] = [];
  if (factors.urgency >= 85) lines.push(`⚡ Critical time urgency: only ${factors.urgencyRaw} minutes remaining.`);
  else if (factors.urgency >= 65) lines.push(`⏰ High urgency: ${factors.urgencyRaw} minutes remaining to pickup.`);
  else lines.push(`🕐 ${factors.urgencyRaw} minutes remaining for pickup.`);
  if (factors.distanceRaw > 0) lines.push(`📍 Nearest suitable NGO is ${factors.distanceRaw} km away.`);
  if (topNGO) lines.push(`🏆 Best match: ${topNGO}`);
  if (topVolunteer) lines.push(`🚚 Recommended volunteer: ${topVolunteer}`);
  lines.push(`📊 Priority: ${priorityClass} (score: ${factors.total}/100)`);
  return lines.join(" ");
}
