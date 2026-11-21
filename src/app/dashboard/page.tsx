import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role === "RESTAURANT") {
    redirect("/restaurant");
  } else if (role === "NGO") {
    redirect("/ngo");
  } else if (role === "VOLUNTEER") {
    redirect("/volunteer");
  }

  redirect("/impact");
}
