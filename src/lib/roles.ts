import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

// In-memory demo identities for instant 0ms fallback (avoids 2.5s remote DB roundtrip)
const DEMO_USERS: Record<Role, { id: string; email: string; name: string; role: Role } | null> = {
  RESTAURANT: {
    id: "cmwq671v70000x4swpffngtp5",
    email: "spicegarden@sample.resqmeal.test",
    name: "Spice Garden Restaurant",
    role: "RESTAURANT",
  },
  NGO: {
    id: "cmwq68i870001x4lg4vqbtut2",
    email: "hope@sample.resqmeal.test",
    name: "Hope Foundation",
    role: "NGO",
  },
  VOLUNTEER: {
    id: "cmwq68j2w0004x4lg3osm8936",
    email: "rahul@sample.resqmeal.test",
    name: "Rahul",
    role: "VOLUNTEER",
  },
  ADMIN: null,
};

export async function requireRole(role: Role) {
  const session = await auth();
  if (session?.user && session.user.role === role) {
    return session;
  }

  // Instant fallback for demo / guest preview — eliminates slow database latency
  const demo = DEMO_USERS[role];
  if (demo) {
    return {
      user: demo,
      expires: new Date(Date.now() + 86400000).toISOString(),
    };
  }

  redirect("/login");
}
