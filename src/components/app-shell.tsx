"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import {
  Brain,
  ClipboardList,
  HandHeart,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  PlusCircle,
  Search,
  Truck,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";

export type AppRole = "RESTAURANT" | "NGO" | "VOLUNTEER";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

const ROLE_LABELS: Record<AppRole, string> = {
  RESTAURANT: "Restaurant",
  NGO: "NGO",
  VOLUNTEER: "Volunteer",
};

const ROLE_INFO: Record<AppRole, { name: string; locality: string; initial: string; banner?: string }> = {
  RESTAURANT: {
    name: "Spice Garden Restaurant",
    locality: "India Network",
    initial: "S",
  },
  NGO: {
    name: "Hope Foundation",
    locality: "India Network",
    initial: "H",
    banner: "NGO Dashboard",
  },
  VOLUNTEER: {
    name: "Rahul",
    locality: "India Network",
    initial: "R",
    banner: "Volunteer Dashboard",
  },
};

const NAV_ITEMS: Record<AppRole, NavItem[]> = {
  RESTAURANT: [
    { label: "Dashboard", href: "/restaurant", icon: LayoutDashboard },
    { label: "Donate Food", href: "/donations/new", icon: PlusCircle },
    { label: "My Donations", href: "/donations", icon: ClipboardList },
    { label: "History", href: "/donations?view=history", icon: History },
    { label: "AI Rescue Intelligence", href: "/frpe", icon: Brain },
    { label: "Profile", href: "/profile", icon: UserCircle },
  ],
  NGO: [
    { label: "Dashboard", href: "/ngo", icon: LayoutDashboard },
    { label: "Find Donations", href: "/discover", icon: Search },
    { label: "My Claims", href: "/claims", icon: HandHeart },
    { label: "History", href: "/claims?view=history", icon: History },
    { label: "AI Rescue Intelligence", href: "/frpe", icon: Brain },
    { label: "Profile", href: "/profile", icon: UserCircle },
  ],
  VOLUNTEER: [
    { label: "Dashboard", href: "/volunteer", icon: LayoutDashboard },
    { label: "Pickup Tasks", href: "/tasks", icon: Truck },
    { label: "My Tasks", href: "/tasks?view=mine", icon: ListChecks },
    { label: "History", href: "/tasks?view=history", icon: History },
    { label: "AI Rescue Intelligence", href: "/frpe", icon: Brain },
    { label: "Profile", href: "/profile", icon: UserCircle },
  ],
};

type AppShellProps = {
  role: AppRole;
  children: ReactNode;
  bannerTitle?: string;
  userName?: string;
  userLocality?: string;
  organisationName?: string;
};

function splitHref(href: string): { path: string; query: string | null } {
  const index = href.indexOf("?");
  if (index === -1) return { path: href, query: null };
  return { path: href.slice(0, index), query: href.slice(index + 1) };
}

function AppShellInner({
  role,
  children,
  bannerTitle,
  userName,
  userLocality,
  organisationName,
}: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = (searchParams?.toString() ?? "").split("&").filter(Boolean);

  const items = NAV_ITEMS[role];
  const info = ROLE_INFO[role];
  const displayName = userName ?? info.name;
  const displayLocality = userLocality ?? info.locality;
  const displayBanner = bannerTitle ?? info.banner;

  // On sidebar: For Restaurant and NGO, display organisationName; for Volunteer, display userName
  const sidebarName =
    role === "VOLUNTEER"
      ? displayName
      : organisationName || info.name || displayName;
  const sidebarInitial = sidebarName?.trim()
    ? sidebarName.trim().charAt(0).toUpperCase()
    : info.initial;

  function isActive(href: string): boolean {
    const { path, query } = splitHref(href);
    if (pathname !== path) return false;
    if (query) return search.includes(query);
    return !search.some((part) => part.startsWith("view="));
  }

  function handleSignOut() {
    void signOut({ callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen bg-[#F4FBF5] text-[#17251C] antialiased">
      {/* Top Banner Tag matching Reference Screen Header Banners */}
      {displayBanner && (
        <div className="bg-[#138A36] text-white px-6 py-2.5 text-xs font-black flex items-center gap-2 tracking-wide shadow-sm">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
            ●
          </span>
          <span>{displayBanner}</span>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 flex-col justify-between border-r border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(7,91,42,0.04)] md:flex select-none">
          <div>
            <Link href="/" aria-label="ResQMeal home" className="block px-2">
              <Logo />
            </Link>

            {/* Fixed Role Badge — role is locked after login */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#C8EED0] bg-[#F4FBF5] px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#138A36] text-white text-sm font-black shadow-sm flex-shrink-0">
                {sidebarInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">{sidebarName}</p>
                <p className="text-[10px] font-bold text-[#138A36] mt-0.5">{ROLE_LABELS[role]}</p>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="mt-6 flex flex-col gap-1.5" aria-label="Main navigation">
              {items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={true}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                      active
                        ? "bg-[#E8F7EA] text-[#138A36] shadow-sm ring-1 ring-[#138A36]/15"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${active ? "text-[#138A36]" : "text-slate-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sign Out */}
          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-rose-600 transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Top Bar matching Reference Screens 3, 5, 6 */}
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/70 bg-white/95 px-6 py-4 backdrop-blur-md">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                <span>Welcome, {displayName}</span>
                <span className="text-xl">✌</span>
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-[#138A36]" />
                <span>{displayLocality}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* User Avatar Circle */}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#075B2A] text-sm font-black text-white shadow-md shadow-[#075B2A]/20 ring-2 ring-emerald-200 select-none">
                {sidebarInitial}
              </div>
            </div>
          </header>

          {/* Children View Content */}
          <main className="p-6 sm:p-8 max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <Suspense fallback={null}>
      <AppShellInner {...props} />
    </Suspense>
  );
}
