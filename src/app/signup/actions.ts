"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { LOCALITIES, LOCALITY_NAMES } from "@/lib/localities";

export type SignupState = { error: string } | null;

const GENERIC_ERROR = "Could not create account with those details";

const signupSchema = z
  .object({
    email: z.string().email({ message: "Enter a valid email address" }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    displayName: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(80, "Name must be 80 characters or fewer"),
    role: z.enum(["RESTAURANT", "NGO", "VOLUNTEER"], {
      message: "Choose a valid role",
    }),
    orgType: z.enum(["NGO", "COMMUNITY_KITCHEN"]).optional(),
    organisationName: z
      .string()
      .trim()
      .max(120, "Organisation name must be 120 characters or fewer")
      .optional(),
    publicLocality: z.enum(LOCALITY_NAMES, {
      message: "Choose a valid locality",
    }),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "NGO" && !data.orgType) {
      ctx.addIssue({ code: "custom", path: ["orgType"], message: "Choose an organisation type" });
    }
    if (data.role !== "VOLUNTEER" && (data.organisationName ?? "").length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["organisationName"],
        message: "Organisation name must be at least 2 characters",
      });
    }
  });

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const rawRole = String(formData.get("role") ?? "");
  // Default orgType for NGO if not explicitly provided
  const rawOrgType = rawRole === "NGO"
    ? (String(formData.get("orgType") ?? "") || "NGO")
    : undefined;

  const parsed = signupSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    role: rawRole,
    orgType: rawOrgType,
    organisationName: String(formData.get("organisationName") ?? ""),
    publicLocality: String(formData.get("publicLocality") ?? ""),
    phone: String(formData.get("phone") ?? "") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again" };
  }

  const data = parsed.data;
  const locality = LOCALITIES[data.publicLocality];

  // Check if email already exists
  const existing = await db.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) return { error: "An account with this email already exists. Please log in." };

  const passwordHash = await bcrypt.hash(data.password, 10);

  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: data.role,
          displayName: data.displayName,
          phone: data.phone ?? null,
          isVerified: false,
        },
      });

      if (data.role === "VOLUNTEER") {
        await tx.volunteer.create({
          data: {
            userId: user.id,
            serviceLocalities: [data.publicLocality],
            isActive: true,
          },
        });
      } else {
        const orgType =
          data.role === "RESTAURANT" ? "RESTAURANT" : (data.orgType ?? "NGO");
        await tx.organisation.create({
          data: {
            userId: user.id,
            type: orgType,
            name: data.organisationName ?? data.displayName,
            publicLocality: data.publicLocality,
            latitude: locality.latitude,
            longitude: locality.longitude,
            privateAddress: null,
            verificationStatus: "PENDING",
            acceptedCategories: [],
          },
        });
      }
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "An account with this email already exists." };
    console.error("Signup error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  // On success, redirect to login with a success banner
  redirect("/login?created=1");
}
