import { describe, it, expect } from "vitest";
import type { DonationStatus } from "@prisma/client";
import {
  canTransition,
  donationInputSchema,
  remainingTimeLabel,
  statusLabel,
  allowedTransitions,
} from "./donations";

const ALL_STATUSES: DonationStatus[] = [
  "POSTED",
  "CLAIMED",
  "COLLECTED",
  "DELIVERED",
  "EXPIRED",
  "CANCELLED",
];

describe("canTransition", () => {
  it("allows POSTED -> CLAIMED", () => {
    expect(canTransition("POSTED", "CLAIMED")).toBe(true);
  });

  it("allows CLAIMED -> COLLECTED", () => {
    expect(canTransition("CLAIMED", "COLLECTED")).toBe(true);
  });

  it("allows COLLECTED -> DELIVERED", () => {
    expect(canTransition("COLLECTED", "DELIVERED")).toBe(true);
  });

  it("rejects POSTED -> DELIVERED (skipping steps)", () => {
    expect(canTransition("POSTED", "DELIVERED")).toBe(false);
  });

  it("allows CLAIMED -> POSTED (release)", () => {
    expect(canTransition("CLAIMED", "POSTED")).toBe(true);
  });

  it("gives DELIVERED no outgoing transitions", () => {
    for (const to of ALL_STATUSES) {
      expect(canTransition("DELIVERED", to)).toBe(false);
    }
    expect(allowedTransitions.DELIVERED).toEqual([]);
  });

  it("gives EXPIRED and CANCELLED no outgoing transitions", () => {
    for (const from of ["EXPIRED", "CANCELLED"] as DonationStatus[]) {
      for (const to of ALL_STATUSES) {
        expect(canTransition(from, to)).toBe(false);
      }
    }
  });
});

describe("remainingTimeLabel", () => {
  const now = new Date("2030-01-01T10:00:00+05:30");

  it("shows hours and minutes for a deadline 2h15m away", () => {
    const deadline = new Date(now.getTime() + (2 * 60 + 15) * 60_000);
    expect(remainingTimeLabel(deadline, now)).toBe("2h 15m left");
  });

  it("returns 'Deadline passed' when the deadline is before now", () => {
    const deadline = new Date(now.getTime() - 5 * 60_000);
    expect(remainingTimeLabel(deadline, now)).toBe("Deadline passed");
  });
});

describe("statusLabel", () => {
  it("returns a non-empty string for every DonationStatus", () => {
    for (const status of ALL_STATUSES) {
      const label = statusLabel(status);
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe("donationInputSchema", () => {
  const preparedAt = new Date("2030-01-01T10:00:00+05:30");
  const consumeBy = new Date("2030-01-01T22:00:00+05:30");
  const pickupWindowStart = new Date("2030-01-01T18:00:00+05:30");
  const pickupDeadline = new Date("2030-01-01T20:00:00+05:30");

  const validInput = () => ({
    title: "Surplus dal and rice",
    description: "Freshly cooked lunch surplus",
    foodCategory: "Cooked meals",
    isVegetarian: true,
    quantityValue: 10,
    quantityUnit: "SERVINGS" as const,
    estimatedServings: 10,
    preparedAt,
    storageType: "CHILLED" as const,
    storageInstructions: "Keep refrigerated",
    allergens: ["gluten"],
    allergensDeclared: true as const,
    handlingInstructions: "Reheat before serving",
    consumeBy,
    pickupWindowStart,
    pickupDeadline,
  });

  it("accepts a valid input", () => {
    expect(donationInputSchema.safeParse(validInput()).success).toBe(true);
  });

  it("rejects pickupDeadline before pickupWindowStart", () => {
    const input = {
      ...validInput(),
      pickupDeadline: new Date("2030-01-01T17:00:00+05:30"),
    };
    expect(donationInputSchema.safeParse(input).success).toBe(false);
  });

  it("rejects quantityValue of 0", () => {
    expect(
      donationInputSchema.safeParse({ ...validInput(), quantityValue: 0 }).success,
    ).toBe(false);
  });

  it("rejects a title under 3 characters", () => {
    expect(
      donationInputSchema.safeParse({ ...validInput(), title: "ab" }).success,
    ).toBe(false);
  });

  it("rejects empty allergens when 'no known allergens' is not ticked", () => {
    const input = {
      ...validInput(),
      allergens: [],
      allergensDeclared: false,
    };
    expect(donationInputSchema.safeParse(input).success).toBe(false);
  });
});
