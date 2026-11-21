"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { IMPACT_ASSUMPTIONS } from "@/lib/config";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/roles";

async function getVolunteer() {
  const session = await requireRole("VOLUNTEER");
  let volunteer = await db.volunteer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  // If volunteer row doesn't exist yet, auto-create it for the user
  if (!volunteer) {
    volunteer = await db.volunteer.create({
      data: {
        userId: session.user.id,
        serviceLocalities: ["India Network"],
        isActive: true,
      },
      select: { id: true },
    });
  }

  return { session, volunteer };
}

function refresh() {
  revalidatePath("/tasks");
  revalidatePath("/volunteer");
  revalidatePath("/ngo");
  revalidatePath("/claims");
  revalidatePath("/restaurant");
  revalidatePath("/impact");
}

export async function acceptTask(
  taskId: string,
  sampleMeta?: { title: string; donor: string; receiver: string }
) {
  const { volunteer } = await getVolunteer();
  let succeeded = false;

  try {
    const existingTask = await db.task.findUnique({
      where: { id: taskId },
      select: { id: true, status: true, volunteerId: true },
    });

    if (existingTask) {
      await db.task.update({
        where: { id: taskId },
        data: {
          volunteerId: volunteer.id,
          status: "ASSIGNED",
          assignedAt: new Date(),
        },
      });
      succeeded = true;
    } else {
      // It's a sample task — create it dynamically in the DB and assign to this volunteer
      const restaurant = await db.organisation.findFirst({
        where: { type: "RESTAURANT" },
        select: { id: true },
      });

      const ngo = await db.organisation.findFirst({
        where: { type: "NGO" },
        select: { id: true },
      });

      if (restaurant) {
        const donation = await db.donation.create({
          data: {
            restaurantOrgId: restaurant.id,
            title: sampleMeta?.title || "Surplus Food Rescue",
            description: "Freshly packed food packets ready for immediate volunteer delivery.",
            foodCategory: "Vegetarian",
            isVegetarian: true,
            quantityValue: 50,
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

        if (ngo) {
          await db.claim.create({
            data: {
              donationId: donation.id,
              ngoOrgId: ngo.id,
              quantityClaimed: 50,
              status: "ACTIVE",
            },
          });
        }

        await db.task.create({
          data: {
            donationId: donation.id,
            type: "PICKUP",
            volunteerId: volunteer.id,
            status: "ASSIGNED",
            assignedAt: new Date(),
          },
        });
        succeeded = true;
      }
    }
  } catch (error) {
    console.error("acceptTask error:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not accept task." };
  }

  refresh();
  if (succeeded) {
    redirect("/tasks?view=mine&accepted=1");
  }
  return { ok: true };
}

export async function updateTaskStatus(taskId: string, status: "COLLECTED" | "DELIVERED") {
  const { session, volunteer } = await getVolunteer();
  try {
    await db.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id: taskId, volunteerId: volunteer.id },
        select: {
          id: true,
          status: true,
          donationId: true,
          donation: { select: { quantityValue: true, quantityUnit: true, status: true, claim: { select: { id: true } } } },
        },
      });
      if (!task) throw new Error("Task not found.");

      if (status === "COLLECTED") {
        await tx.task.update({ where: { id: task.id }, data: { status: "IN_PROGRESS", collectedAt: new Date() } });
        await tx.donation.update({ where: { id: task.donationId }, data: { status: "COLLECTED" } });
        await tx.donationStatusHistory.create({ data: { donationId: task.donationId, fromStatus: "CLAIMED", toStatus: "COLLECTED", actorUserId: session.user.id, note: "Collected by volunteer" } });
      } else {
        await tx.task.update({ where: { id: task.id }, data: { status: "DONE", deliveredAt: new Date() } });
        await tx.donation.update({ where: { id: task.donationId }, data: { status: "DELIVERED" } });
        if (task.donation.claim) {
          await tx.claim.update({ where: { id: task.donation.claim.id }, data: { status: "COMPLETED" } });
        }
        await tx.donationStatusHistory.create({ data: { donationId: task.donationId, fromStatus: "COLLECTED", toStatus: "DELIVERED", actorUserId: session.user.id, note: "Delivered to receiving NGO" } });

        const quantityKg = task.donation.quantityUnit === "KG" ? task.donation.quantityValue : task.donation.quantityValue * 0.35;
        const meals = quantityKg / IMPACT_ASSUMPTIONS.kgPerMeal.value;
        await tx.impactEvent.create({
          data: {
            donationId: task.donationId,
            deliveredKg: quantityKg,
            mealsEstimated: meals,
            co2eAvoidedKg: quantityKg * IMPACT_ASSUMPTIONS.co2eKgPerKg.value,
            assumptionVersion: IMPACT_ASSUMPTIONS.kgPerMeal.version,
          },
        });
      }
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update this task." };
  }
  refresh();
  return { ok: true };
}
