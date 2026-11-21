"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/roles";

export async function claimDonation(
  donationId: string,
  sampleMeta?: { title: string; donor: string; quantity: number }
) {
  const session = await requireRole("NGO");

  // 1. Look up user's NGO organization first, fallback to demo NGO
  let org = await db.organisation.findFirst({
    where: { userId: session.user.id },
    select: { id: true, type: true },
  });
  if (!org) {
    org = await db.organisation.findFirst({
      where: {
        OR: [
          { id: "cmwq68inj0003x4lgst3qun2u" },
          { name: "Hope Foundation" },
        ],
      },
      select: { id: true, type: true },
    });
  }

  if (!org) {
    return { ok: false, error: "Only NGOs and community kitchens can claim donations." };
  }

  let succeeded = false;

  try {
    await db.$transaction(async (tx) => {
      let targetDonationId = donationId;

      if (donationId.startsWith("ref-")) {
        // Create sample donation in DB
        const restaurant = await tx.organisation.findFirst({
          where: { type: "RESTAURANT" },
          select: { id: true },
        });

        if (!restaurant) {
          throw new Error("No restaurant partner available.");
        }

        const newDonation = await tx.donation.create({
          data: {
            restaurantOrgId: restaurant.id,
            title: sampleMeta?.title || "Surplus Food Rescue",
            description: "Freshly prepared meal packets ready for community distribution.",
            foodCategory: "Vegetarian",
            isVegetarian: true,
            quantityValue: sampleMeta?.quantity || 50,
            quantityUnit: "SERVINGS",
            preparedAt: new Date(),
            storageType: "AMBIENT",
            storageInstructions: "Consume within 4 hours.",
            allergens: [],
            handlingInstructions: "Thermal bags",
            consumeBy: new Date(Date.now() + 14400000),
            pickupWindowStart: new Date(),
            pickupDeadline: new Date(Date.now() + 7200000),
            status: "CLAIMED",
          },
        });

        targetDonationId = newDonation.id;
      } else {
        const donation = await tx.donation.findUnique({
          where: { id: targetDonationId },
          select: { id: true, status: true, quantityValue: true },
        });
        if (!donation || donation.status !== "POSTED") {
          throw new Error("This donation is no longer available.");
        }

        await tx.donation.update({
          where: { id: targetDonationId },
          data: { status: "CLAIMED" },
        });
      }

      await tx.claim.create({
        data: {
          donationId: targetDonationId,
          ngoOrgId: org.id,
          quantityClaimed: sampleMeta?.quantity || 50,
          status: "ACTIVE",
        },
      });

      await tx.donationStatusHistory.create({
        data: {
          donationId: targetDonationId,
          fromStatus: "POSTED",
          toStatus: "CLAIMED",
          actorUserId: session.user.id,
          note: "Claimed by receiving NGO",
        },
      });

      await tx.task.create({
        data: { donationId: targetDonationId, type: "PICKUP", status: "OPEN" },
      });

      succeeded = true;
    });
  } catch (error) {
    console.error("claimDonation error:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not claim this donation." };
  }

  revalidatePath("/discover");
  revalidatePath("/ngo");
  revalidatePath("/claims");
  revalidatePath("/deliveries");
  revalidatePath("/tasks");
  revalidatePath("/volunteer");

  if (succeeded) {
    redirect("/discover?claimed=1");
  }
  return { ok: true };
}
