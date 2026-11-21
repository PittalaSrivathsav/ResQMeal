import DonationTrackingPage from "@/app/donations/[id]/page";

export default function TrackPage() {
  return <DonationTrackingPage params={Promise.resolve({ id: "track" })} />;
}
