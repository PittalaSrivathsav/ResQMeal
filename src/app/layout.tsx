import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import "./globals.css";
import { AppSessionProvider } from "@/components/session-provider";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "ResQMeal",
  description: "Rescue the Surplus",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AppSessionProvider>
          <Suspense fallback={null}>
            <PageTransition>{children}</PageTransition>
          </Suspense>
        </AppSessionProvider>
      </body>
    </html>
  );
}
