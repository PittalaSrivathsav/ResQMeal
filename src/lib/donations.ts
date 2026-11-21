import { z } from "zod";
import type { DonationStatus } from "@prisma/client";

export const FOOD_SAFETY_DISCLAIMER =
  "ResQMeal does not certify that food is safe. The restaurant is responsible for accuracy of these details.";

const STORAGE_TYPES = ["AMBIENT", "CHILLED", "FROZEN"] as const;
const QUANTITY_UNITS = ["KG", "SERVINGS"] as const;

const invalidDate = { error: "Enter a valid date and time" };

export const donationInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title must be at most 120 characters"),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be at most 1000 characters"),
    foodCategory: z
      .string()
      .trim()
      .min(1, "Food category is required")
      .max(60, "Food category must be at most 60 characters"),
    isVegetarian: z.boolean(),
    quantityValue: z
      .number({ error: "Enter a quantity" })
      .positive("Quantity must be more than 0"),
    quantityUnit: z.enum(QUANTITY_UNITS, { error: "Choose kg or servings" }),
    estimatedServings: z
      .number({ error: "Enter a whole number" })
      .int("Estimated servings must be a whole number")
      .min(1, "Estimated servings must be at least 1")
      .optional(),
    preparedAt: z.date(invalidDate),
    storageType: z.enum(STORAGE_TYPES, { error: "Choose a storage type" }),
    storageInstructions: z
      .string()
      .trim()
      .min(3, "Storage instructions must be at least 3 characters")
      .max(300, "Storage instructions must be at most 300 characters"),
    allergens: z
      .array(z.string().trim().min(1).max(40))
      .max(20, "List at most 20 allergens"),
    // Food-safety rule: true when the restaurant lists allergens or ticks
    // "No known allergens (declared by restaurant)".
    allergensDeclared: z.literal(true, {
      error: "List the allergens or tick 'No known allergens (declared by restaurant)'",
    }),
    handlingInstructions: z
      .string()
      .trim()
      .min(3, "Handling instructions must be at least 3 characters")
      .max(300, "Handling instructions must be at most 300 characters"),
    consumeBy: z.date(invalidDate),
    pickupWindowStart: z.date(invalidDate),
    pickupDeadline: z.date(invalidDate),
  })
  .superRefine((d, ctx) => {
    if (d.consumeBy.getTime() <= d.preparedAt.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["consumeBy"],
        message: "Consume-by must be after the prepared time",
      });
    }
    if (d.pickupDeadline.getTime() <= d.pickupWindowStart.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["pickupDeadline"],
        message: "Pickup deadline must be after the pickup window start",
      });
    }
    if (d.pickupDeadline.getTime() > d.consumeBy.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["pickupDeadline"],
        message: "Pickup deadline must be on or before consume-by",
      });
    }
  });

export type DonationInput = z.infer<typeof donationInputSchema>;

/**
 * Parses a datetime-local value ("YYYY-MM-DDTHH:mm") as Indian Standard Time,
 * so the result does not depend on the server's timezone.
 * Returns an Invalid Date for anything else.
 */
export function parseLocalDateTime(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return new Date(Number.NaN);
  }
  return new Date(`${value}:00+05:30`);
}

export function remainingTimeLabel(deadline: Date, now: Date): string {
  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return "Deadline passed";

  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m left`;
  return "Less than 1m left";
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

const STATUS_LABELS: Record<DonationStatus, string> = {
  POSTED: "Posted",
  CLAIMED: "Claimed",
  COLLECTED: "Collected",
  DELIVERED: "Delivered",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export function statusLabel(status: DonationStatus): string {
  return STATUS_LABELS[status];
}

export const allowedTransitions: Record<DonationStatus, DonationStatus[]> = {
  POSTED: ["CLAIMED", "CANCELLED", "EXPIRED"],
  CLAIMED: ["COLLECTED", "POSTED", "CANCELLED"],
  COLLECTED: ["DELIVERED"],
  DELIVERED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export function canTransition(from: DonationStatus, to: DonationStatus): boolean {
  return allowedTransitions[from].includes(to);
}
