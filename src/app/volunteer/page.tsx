import TasksPage from "@/app/tasks/page";

type PageProps = {
  searchParams: Promise<{ view?: string; accepted?: string }>;
};

export default function VolunteerDashboardPage(props: PageProps) {
  return <TasksPage {...props} />;
}
