export const FRPE_WEIGHTS = {
  timeUrgency: 0.35, distance: 0.20, quantity: 0.10,
  ngoCapacity: 0.15, dietaryCompatibility: 0.10, pickupFeasibility: 0.10,
};
export type FRPEWeights = typeof FRPE_WEIGHTS;

export type FactorScores = {
  urgency: number; urgencyRaw: number;      // urgencyRaw = minutesRemaining
  distance: number; distanceRaw: number;    // distanceRaw = km
  quantity: number; quantityRaw: number;
  capacity: number; capacityRaw: number;
  dietary: number;
  feasibility: number;
  total: number;
};

export type PriorityClass = "CRITICAL" | "HIGH" | "MEDIUM" | "NORMAL" | "OVERDUE";

export type NGORecommendation = {
  id: string; name: string; distanceKm: number;
  capacityKgPerDay: number | null; compatibilityScore: number;
  estimatedTravelMinutes: number; reason: string[];
};

export type VolunteerRecommendation = {
  id: string; name: string; distanceKm: number;
  activeTasks: number; estimatedTravelMinutes: number; reason: string[];
};

export type DonationPriority = {
  donationId: string; title: string; restaurantName: string;
  restaurantLocality: string; quantityValue: number; quantityUnit: string;
  pickupDeadline: string;    // ISO string (serializable)
  minutesRemaining: number; isOverdue: boolean;
  priorityScore: number; priorityClass: PriorityClass;
  factors: FactorScores; topNGOs: NGORecommendation[];
  topVolunteers: VolunteerRecommendation[];
  explanation: string; computedAt: string;
  status: string; isVegetarian: boolean; foodCategory: string;
};

export type FRPEResult = {
  donations: DonationPriority[];
  summary: { total: number; critical: number; high: number; medium: number; normal: number; overdue: number; };
  computedAt: string;
  weights: FRPEWeights;
};
