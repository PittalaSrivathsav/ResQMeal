import DiscoverPage from "@/app/discover/page";

type PageProps = {
  searchParams: Promise<{ view?: string; claimed?: string }>;
};

export default function NgoDashboardPage(props: PageProps) {
  return <DiscoverPage {...props} />;
}
