"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function deleteDonation(donationId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const donation = await db.donation.findUnique({
      where: { id: donationId },
      select: { id: true, restaurantOrg: { select: { userId: true } } },
    });

    if (!donation) {
      return { ok: false, error: "Donation not found" };
    }

    // 1. Delete all dependent child records
    await db.matchScore.deleteMany({ where: { donationId } });
    await db.task.deleteMany({ where: { donationId } });
    await db.claim.deleteMany({ where: { donationId } });
    await db.donationStatusHistory.deleteMany({ where: { donationId } });
    await db.impactEvent.deleteMany({ where: { donationId } });

    // 2. Delete the donation itself
    await db.donation.delete({ where: { id: donationId } });

    // 3. Revalidate all stakeholder pages so it instantly disappears everywhere
    revalidatePath("/restaurant");
    revalidatePath("/donations");
    revalidatePath("/discover");
    revalidatePath("/claims");
    revalidatePath("/tasks");
    revalidatePath("/deliveries");
    revalidatePath("/frpe");

    return { ok: true };
  } catch (error) {
    console.error("Failed to delete donation:", error);
    throw error;
  }
}
