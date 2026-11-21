import Link from "next/link";
import { ArrowRight, Leaf, Salad, Store, Truck, Users, Utensils, HeartHandshake, ShieldCheck, Heart, MapPin } from "lucide-react";
import { Logo } from "@/components/logo";
import { TiltCard3D, FloatingParticles3D } from "@/components/tilt-3d";
import { ScrollVanSection } from "@/components/scroll-van";
import { InteractiveMap } from "@/components/interactive-map";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "/map", label: "Rescue Map" },
  { href: "/impact", label: "Impact" },
  { href: "#about", label: "About" },
];

const STATS = [
  { icon: Utensils, value: "12,500+", label: "Meals Rescued" },
  { icon: Salad, value: "2,500 kg", label: "Food Waste Avoided" },
  { icon: Leaf, value: "1,200 kg", label: "CO2 Emissions Reduced" },
  { icon: Users, value: "340+", label: "Total Donations" },
];

const STEPS = [
  {
    icon: Store,
    title: "Post surplus",
    text: "Restaurants list surplus food in under a minute with quantity, pickup window, and storage guidelines.",
  },
  {
    icon: HeartHandshake,
    title: "NGOs claim",
    text: "Nearby NGOs and verified community kitchens discover and claim surplus food matching their capacity.",
  },
  {
    icon: Truck,
    title: "Volunteers deliver",
    text: "Verified local volunteers pick up sealed containers and safely deliver them to receiving kitchens.",
  },
];

export default function LandingPage() {
  return (
    <div id="home" className="relative min-h-screen bg-[#F4FBF5] text-[#17251C] antialiased overflow-x-hidden">
      {/* 3D Floating Particles & Depth Leaves in Background */}
      <FloatingParticles3D />

      {/* Main Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="ResQMeal home">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition hover:text-[#138A36]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-300/80 bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#138A36] hover:text-[#138A36]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#138A36] px-6 py-2 text-sm font-bold text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6">
        <section className="relative grid items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C8EED0] bg-[#E8F7EA] px-3.5 py-1.5 text-xs font-extrabold text-[#138A36]">
              <Leaf className="h-3.5 w-3.5" />
              <span>ResQMeal</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#17251C] sm:text-5xl lg:text-6xl leading-[1.1]">
              Turning Surplus Food into Someone&apos;s{" "}
              <span className="text-[#138A36]">Next Meal</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Connects restaurants with surplus food to NGOs and volunteers, reducing food waste and
              fighting hunger across India.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/restaurant"
                className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#138A36] to-[#075B2A] px-7 py-3.5 text-base font-extrabold text-white shadow-lg shadow-[#138A36]/25 transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                <span>Donate Food</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/ngo"
                className="inline-flex items-center gap-2 rounded-full border border-[#BDE8C6] bg-white px-7 py-3.5 text-base font-extrabold text-[#075B2A] shadow-sm transition hover:bg-[#E8F7EA] hover:border-[#138A36]"
              >
                Find Food
              </Link>
            </div>
          </div>

          {/* Refined 3D Interactive Hero Visual */}
          <div className="relative flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[380px] h-[380px] sm:w-[460px] sm:h-[460px] rounded-full bg-gradient-to-tr from-[#A7F3D0]/50 via-[#DCFCE7]/70 to-transparent blur-3xl" />
            </div>

            {/* 3D Interactive Tilt Card for Hero Image */}
            <TiltCard3D maxTilt={10} scale={1.03} glare={true} className="w-full max-w-[480px]">
              <div className="relative w-full rounded-[36px] overflow-hidden p-2 bg-gradient-to-b from-white/90 to-white/50 border border-white/90 shadow-[0_24px_55px_rgba(7,91,42,0.14)] backdrop-blur">
                <img
                  src="/hero-rescue.jpg"
                  alt="Child receiving surplus food donation"
                  className="w-full h-auto object-cover rounded-[30px]"
                />

                {/* Bottom floating badge overlay popping forward in 3D */}
                <div
                  style={{ transform: "translateZ(30px)" }}
                  className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-2 pointer-events-none"
                >
                  <div className="flex items-center gap-2 rounded-2xl bg-white/95 px-3.5 py-2 text-xs font-black text-slate-800 shadow-lg backdrop-blur border border-white">
                    <span className="flex h-2 w-2 rounded-full bg-[#138A36] animate-ping" />
                    <span>Fresh Meals Served Daily</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-[#E8F7EA]/95 px-3 py-2 text-xs font-black text-[#138A36] shadow-lg backdrop-blur border border-[#C8EED0]">
                    <Heart className="h-3.5 w-3.5 fill-[#138A36]" />
                    <span>100% Free</span>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          </div>
        </section>

        {/* 4 3D Impact Statistics Cards */}
        <section className="py-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
              <TiltCard3D key={stat.label} maxTilt={12} scale={1.04} glare={true}>
                <div className="flex items-center gap-4 rounded-3xl border border-white/90 bg-white/90 p-5 shadow-[0_10px_30px_rgba(7,91,42,0.06)] backdrop-blur transition-all duration-300 hover:border-[#138A36]/40 hover:shadow-xl cursor-default h-full">
                  <div
                    style={{ transform: "translateZ(20px)" }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7EA] text-[#138A36] shadow-sm"
                  >
                    <stat.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div style={{ transform: "translateZ(15px)" }}>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                    <p className="text-xs font-semibold text-slate-600 sm:text-sm">{stat.label}</p>
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </section>

        {/* ── Scroll-driven Van Lane ── sits between Stats and How It Works ── */}
        <div className="-mx-6">
          <ScrollVanSection />
        </div>

        {/* How It Works Section with 3D Interactive Tilt & Elevate Frames */}
        <section id="how-it-works" className="scroll-mt-24 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-[#17251C]">How ResQMeal Works</h2>
            <p className="mt-3 text-slate-600">
              A seamless, safe, and transparent workflow connecting surplus food to people in need in 3 simple steps.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <TiltCard3D key={step.title} maxTilt={15} scale={1.05} glare={true} className="h-full">
                <div className="group relative rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all duration-300 ease-out hover:shadow-[0_25px_50px_rgba(7,91,42,0.14)] hover:border-[#138A36] cursor-pointer select-none h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        style={{ transform: "translateZ(30px)" }}
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F7EA] text-[#138A36] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#138A36] group-hover:text-white group-hover:shadow-lg"
                      >
                        <step.icon className="h-7 w-7" aria-hidden="true" />
                      </span>
                      <span
                        style={{ transform: "translateZ(20px)" }}
                        className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-black text-slate-600 transition-colors group-hover:bg-[#E8F7EA] group-hover:text-[#138A36]"
                      >
                        Step {index + 1}
                      </span>
                    </div>

                    <h3
                      style={{ transform: "translateZ(25px)" }}
                      className="mt-6 text-xl font-black text-slate-900 transition-colors group-hover:text-[#138A36]"
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{ transform: "translateZ(15px)" }}
                      className="mt-2 text-sm leading-relaxed text-slate-600"
                    >
                      {step.text}
                    </p>
                  </div>

                  <div
                    style={{ transform: "translateZ(20px)" }}
                    className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-extrabold text-[#138A36] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </section>

        {/* Live Pan-India Rescue Map Section */}
        <section className="py-12 border-t border-slate-200/80">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C8EED0] bg-[#E8F7EA] px-3.5 py-1 text-xs font-black text-[#138A36]">
                <MapPin className="h-3.5 w-3.5" />
                <span>Pan-India Live Corridors</span>
              </div>
              <h2 className="mt-2 text-3xl font-extrabold text-[#17251C]">Live Food Rescue Map</h2>
              <p className="mt-1 text-slate-600 text-sm">
                Discover active food donors, receiving community kitchens, and live deliveries across India.
              </p>
            </div>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#138A36] hover:text-[#138A36]"
            >
              <span>Explore Dedicated Map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <InteractiveMap height="460px" selectedCity="All" />
        </section>

        {/* About Section */}
        <section id="about" className="scroll-mt-24 py-12 border-t border-slate-200/80">
          <TiltCard3D maxTilt={6} scale={1.01} glare={false}>
            <div className="rounded-3xl bg-white p-8 border border-slate-200/80 shadow-sm transition hover:shadow-md">
              <h2 className="text-2xl font-bold text-slate-900">About ResQMeal – Rescue the Surplus</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 max-w-3xl">
                ResQMeal provides a high-reliability digital corridor for surplus food redistribution across India, ensuring food hygiene, cold-chain compliance, and verified delivery tracking between local restaurants, community kitchens, and volunteers.
              </p>
            </div>
          </TiltCard3D>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Logo />
            <span>— Rescue the Surplus</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
