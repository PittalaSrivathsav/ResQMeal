"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { LOCALITIES, LOCALITY_NAMES } from "@/lib/localities";

export type ProfileFormState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized. Please sign in again." };
  }

  const userId = session.user.id;
  const displayName = String(formData.get("displayName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const organisationName = String(formData.get("organisationName") ?? "").trim();
  const publicLocality = String(formData.get("publicLocality") ?? "").trim();

  if (!displayName || displayName.length < 2) {
    return { ok: false, error: "Please enter a valid name (at least 2 characters)." };
  }

  try {
    // 1. Update User basic info
    await db.user.update({
      where: { id: userId },
      data: {
        displayName,
        phone: phone || null,
      },
    });

    // 2. Update Organisation if applicable
    const org = await db.organisation.findUnique({
      where: { userId },
      select: { id: true, latitude: true, longitude: true },
    });

    if (org) {
      const localityCoords = LOCALITIES[publicLocality as keyof typeof LOCALITIES];
      await db.organisation.update({
        where: { id: org.id },
        data: {
          name: organisationName || displayName,
          publicLocality: publicLocality || "India Network",
          latitude: localityCoords ? localityCoords.latitude : org.latitude,
          longitude: localityCoords ? localityCoords.longitude : org.longitude,
        },
      });
    }

    // 3. Update Volunteer if applicable
    const volunteer = await db.volunteer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (volunteer && publicLocality) {
      await db.volunteer.update({
        where: { id: volunteer.id },
        data: {
          serviceLocalities: [publicLocality],
        },
      });
    }

    revalidatePath("/profile");
    revalidatePath("/restaurant");
    revalidatePath("/ngo");
    revalidatePath("/volunteer");
    revalidatePath("/donations");
    revalidatePath("/tasks");

    return { ok: true, message: "Profile details updated successfully!" };
  } catch (error) {
    console.error("updateProfile error:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
    };
  }
}
