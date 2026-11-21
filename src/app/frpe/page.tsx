import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppShell, type AppRole } from "@/components/app-shell";
import { PriorityDashboard } from "./PriorityDashboard";
import { computeFRPEAnalysis } from "@/lib/frpe/service";
import type { FRPEResult } from "@/lib/frpe/types";

export const dynamic = "force-dynamic";

export default async function FRPEPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const role = (session.user.role as AppRole) ?? "VOLUNTEER";
  const userName = session.user.name ?? undefined;

  // Fetch user's organisation or volunteer profile in parallel for AppShell header
  let orgName: string | undefined;
  let userLocality: string | undefined;

  if (role === "RESTAURANT" || role === "NGO") {
    const org = await db.organisation.findUnique({
      where: { userId },
      select: { name: true, publicLocality: true },
    });
    orgName = org?.name;
    userLocality = org?.publicLocality;
  } else if (role === "VOLUNTEER") {
    const volunteer = await db.volunteer.findUnique({
      where: { userId },
      select: { serviceLocalities: true },
    });
    userLocality = volunteer?.serviceLocalities?.[0];
  }

  // Fast direct server execution (no loopback HTTP fetch)
  let frpeData: FRPEResult | null = null;
  try {
    frpeData = await computeFRPEAnalysis();
  } catch (error) {
    console.error("Failed to compute FRPE analysis directly:", error);
  }

  return (
    <AppShell
      role={role}
      userName={userName}
      userLocality={userLocality}
      organisationName={orgName}
      bannerTitle="AI Rescue Intelligence Dashboard"
    >
      <PriorityDashboard initialData={frpeData} role={role} />
    </AppShell>
  );
}
