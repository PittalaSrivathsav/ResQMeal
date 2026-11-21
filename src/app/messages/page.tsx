import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const body = (
    <>
      <PageHeader title="Messages" subtitle="Updates about your donations and tasks." />
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" aria-hidden="true" />}
          title="Messages"
          message="No messages yet. Notifications appear here once the notification step is added."
        />
      </div>
    </>
  );

  const role = session.user.role;
  if (role === "RESTAURANT" || role === "NGO" || role === "VOLUNTEER") {
    return <AppShell role={role}>{body}</AppShell>;
  }
  return <main className="mx-auto max-w-2xl px-4 py-10">{body}</main>;
}
