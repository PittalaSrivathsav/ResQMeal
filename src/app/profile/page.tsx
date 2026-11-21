import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { ProfileEditor } from "./ProfileEditor";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [user, organisation, volunteer] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { displayName: true, email: true, role: true, phone: true },
    }),
    db.organisation.findUnique({
      where: { userId },
      select: { name: true, type: true, publicLocality: true, verificationStatus: true },
    }),
    db.volunteer.findUnique({
      where: { userId },
      select: { serviceLocalities: true, vehicleType: true, isActive: true },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const role = user.role;
  const orgName = organisation?.name;
  const locality =
    organisation?.publicLocality ||
    volunteer?.serviceLocalities?.[0] ||
    "India Network";

  const content = (
    <ProfileEditor
      user={{
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        phone: user.phone ?? null,
      }}
      organisation={
        organisation
          ? {
              name: organisation.name,
              type: organisation.type,
              publicLocality: organisation.publicLocality,
            }
          : null
      }
      volunteer={
        volunteer
          ? {
              serviceLocalities: volunteer.serviceLocalities,
            }
          : null
      }
    />
  );

  if (role === "RESTAURANT" || role === "NGO") {
    return (
      <AppShell
        role={role}
        userName={user.displayName}
        userLocality={locality}
        organisationName={orgName}
      >
        {content}
      </AppShell>
    );
  }

  if (role === "VOLUNTEER") {
    return (
      <AppShell
        role="VOLUNTEER"
        userName={user.displayName}
        userLocality={locality}
      >
        {content}
      </AppShell>
    );
  }

  return <main className="mx-auto max-w-2xl px-4 py-10">{content}</main>;
}
