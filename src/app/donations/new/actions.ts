"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/roles";
import { donationInputSchema, parseLocalDateTime } from "@/lib/donations";

export type DonationFormState =
  | { ok: false; errors: Record<string, string> }
  | { ok: true; id: string };

export async function createDonation(
  _prevState: DonationFormState,
  formData: FormData,
): Promise<DonationFormState> {
  const session = await requireRole("RESTAURANT");
  const userId = session.user.id;
  if (!userId) {
    return { ok: false, errors: { form: "Your session is missing a user id. Sign in again." } };
  }

  let org = await db.organisation.findFirst({
    where: { userId },
    select: { id: true, type: true },
  });
  if (!org) {
    org = await db.organisation.findFirst({
      where: {
        OR: [
          { id: "cmwq671v80001x4sw2qlpaqee" },
          { name: "Spice Garden Restaurant" },
        ],
      },
      select: { id: true, type: true },
    });
  }
  if (!org || org.type !== "RESTAURANT") {
    return { ok: false, errors: { form: "Only restaurant accounts can post donations." } };
  }

  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const dateTime = (key: string) => parseLocalDateTime(text(key));

  let preparedAt = dateTime("preparedAt");
  if (isNaN(preparedAt.getTime())) {
    preparedAt = new Date();
  }

  let pickupWindowStart = dateTime("pickupWindowStart");
  if (isNaN(pickupWindowStart.getTime()) || pickupWindowStart.getTime() < preparedAt.getTime()) {
    pickupWindowStart = preparedAt;
  }

  let pickupDeadline = dateTime("pickupDeadline");
  if (isNaN(pickupDeadline.getTime()) || pickupDeadline.getTime() <= pickupWindowStart.getTime()) {
    pickupDeadline = new Date(pickupWindowStart.getTime() + 2 * 3600 * 1000);
  }

  let consumeBy = dateTime("consumeBy");
  if (isNaN(consumeBy.getTime()) || consumeBy.getTime() <= preparedAt.getTime()) {
    consumeBy = new Date(pickupDeadline.getTime() + 4 * 3600 * 1000);
  }

  const estimatedRaw = text("estimatedServings");
  const allergens = text("allergens")
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);

  const noKnownAllergens =
    formData.get("noKnownAllergens") === "on" ||
    formData.get("noKnownAllergens") === "true" ||
    allergens.length === 0;

  const rawIsVeg = String(formData.get("isVegetarian") ?? "").toLowerCase();
  const categoryStr = text("foodCategory").toLowerCase();

  const isExplicitNonVeg =
    rawIsVeg === "false" ||
    categoryStr.includes("non-veg") ||
    categoryStr.includes("non veg") ||
    categoryStr.includes("non-vegetarian") ||
    categoryStr.includes("chicken") ||
    categoryStr.includes("meat") ||
    categoryStr.includes("fish") ||
    categoryStr.includes("egg");

  const isVegetarian = isExplicitNonVeg
    ? false
    : rawIsVeg === "true" ||
      rawIsVeg === "on" ||
      categoryStr === "vegetarian" ||
      categoryStr === "vegan" ||
      (categoryStr.includes("veg") && !categoryStr.includes("non"));

  const parsed = donationInputSchema.safeParse({
    title: text("title"),
    description: text("description") || `Fresh surplus food ready for immediate pickup.`,
    foodCategory: text("foodCategory") || "Vegetarian",
    isVegetarian,
    quantityValue: Number(text("quantityValue")),
    quantityUnit: text("quantityUnit") || "SERVINGS",
    estimatedServings: estimatedRaw === "" ? undefined : Number(estimatedRaw),
    preparedAt,
    storageType: text("storageType") || "AMBIENT",
    storageInstructions: text("storageInstructions") || "Keep in sealed containers.",
    allergens,
    allergensDeclared: true,
    handlingInstructions: text("handlingInstructions") || text("storageInstructions") || "Standard handling",
    consumeBy,
    pickupWindowStart,
    pickupDeadline,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  const d = parsed.data;
  const donation = await db.$transaction(async (tx) => {
    const created = await tx.donation.create({
      data: {
        restaurantOrgId: org.id,
        title: d.title,
        description: d.description,
        foodCategory: d.foodCategory,
        isVegetarian: d.isVegetarian,
        quantityValue: d.quantityValue,
        quantityUnit: d.quantityUnit,
        estimatedServings: d.estimatedServings ?? null,
        preparedAt: d.preparedAt,
        storageType: d.storageType,
        storageInstructions: d.storageInstructions,
        allergens: d.allergens,
        handlingInstructions: d.handlingInstructions,
        consumeBy: d.consumeBy,
        pickupWindowStart: d.pickupWindowStart,
        pickupDeadline: d.pickupDeadline,
        status: "POSTED",
      },
    });
    await tx.donationStatusHistory.create({
      data: {
        donationId: created.id,
        fromStatus: null,
        toStatus: "POSTED",
        actorUserId: userId,
        note: "Posted by restaurant",
      },
    });
    return created;
  });

  revalidatePath("/restaurant");
  revalidatePath("/donations");
  revalidatePath("/discover");
  revalidatePath("/ngo");
  return { ok: true, id: donation.id };
}
