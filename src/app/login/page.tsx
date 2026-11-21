import { Suspense } from "react";
import { LoginForm } from "@/app/login/LoginForm";

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm created={params.created === "1"} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

