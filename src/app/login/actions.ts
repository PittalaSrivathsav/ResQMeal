"use server";

import { signIn } from "@/auth";
import { db } from "@/lib/db";

export type LoginState = { error: string } | null;

function isRedirectSignal(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Pre-fetch role so we redirect directly to the role page
  let targetPath = "/dashboard";
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { role: true },
    });
    if (user?.role === "RESTAURANT") {
      targetPath = "/restaurant";
    } else if (user?.role === "NGO") {
      targetPath = "/ngo";
    } else if (user?.role === "VOLUNTEER") {
      targetPath = "/volunteer";
    }
  } catch (err) {
    console.error("User role lookup error:", err);
  }

  try {
    await signIn("credentials", { email, password, redirectTo: targetPath });
  } catch (error) {
    if (isRedirectSignal(error)) throw error;
    return { error: "Email or password is incorrect" };
  }

  return null;
}
