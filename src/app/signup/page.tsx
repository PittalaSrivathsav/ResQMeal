"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { useActionState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Search,
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ChefAvatar3D, NgoAvatar3D, VolunteerAvatar3D } from "@/components/illustrations-3d";
import { TiltCard3D, FloatingParticles3D } from "@/components/tilt-3d";
import { signupAction, type SignupState } from "@/app/signup/actions";
import { LOCALITIES, LOCALITY_NAMES } from "@/lib/localities";

type Role = "RESTAURANT" | "NGO" | "VOLUNTEER";
type Step = 1 | 2 | 3;

// Helper to find the geographically closest registered locality to any GPS coordinate
function findNearestLocality(lat: number, lng: number): string {
  let closest: string = LOCALITY_NAMES[0];
  let minDistance = Infinity;

  for (const name of LOCALITY_NAMES) {
    if (name === "Other") continue;
    const loc = LOCALITIES[name as keyof typeof LOCALITIES];
    if (!loc) continue;
    const dLat = (loc.latitude - lat) * 111;
    const dLng = (loc.longitude - lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = name;
    }
  }

  return closest;
}

const INDIA_CITIES: Record<string, { lat: number; lng: number; zoom: number }> = {
  Delhi: { lat: 28.6139, lng: 77.209, zoom: 12 },
  Mumbai: { lat: 19.076, lng: 72.8777, zoom: 12 },
  Bengaluru: { lat: 12.9716, lng: 77.5946, zoom: 12 },
  Hyderabad: { lat: 17.385, lng: 78.4867, zoom: 12 },
  Chennai: { lat: 13.0827, lng: 80.2707, zoom: 12 },
  Kolkata: { lat: 22.5726, lng: 88.3639, zoom: 12 },
  Pune: { lat: 18.5204, lng: 73.8567, zoom: 12 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 12 },
};

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY || "cb1_5ded_1_a30695abc133718418a8c126";

const initialState: SignupState = null;

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>("RESTAURANT");

  // Location state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pinMarkerRef = useRef<any>(null);
  const [selectedLocality, setSelectedLocality] = useState<string>(LOCALITY_NAMES[0]);
  const [locationAddress, setLocationAddress] = useState("Select your area");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCity, setActiveCity] = useState("Delhi");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Account fields
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  // Server action state
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  // ─── Map init (Step 2) ───────────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        pinMarkerRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [28.6139, 77.209],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
        { maxZoom: 20 }
      ).addTo(map);

      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:40px;height:50px;">
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;">
            <div style="width:36px;height:36px;border-radius:50%;background:#138A36;border:3px solid white;box-shadow:0 4px 16px rgba(19,138,54,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;">📍</div>
            <div style="width:3px;height:14px;background:#138A36;margin-top:-2px;border-radius:0 0 3px 3px;"></div>
          </div></div>`,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
      });

      const marker = L.marker([28.6139, 77.209], { icon: pinIcon, draggable: true }).addTo(map);
      pinMarkerRef.current = marker;

      marker.on("dragend", async (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        const nearest = findNearestLocality(lat, lng);
        setSelectedLocality(nearest);
        const cityMatch = nearest.split(",")[1]?.trim();
        if (cityMatch && INDIA_CITIES[cityMatch]) setActiveCity(cityMatch);
        await reverseGeocode(lat, lng);
      });

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        const nearest = findNearestLocality(lat, lng);
        setSelectedLocality(nearest);
        const cityMatch = nearest.split(",")[1]?.trim();
        if (cityMatch && INDIA_CITIES[cityMatch]) setActiveCity(cityMatch);
        await reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
    });

    return () => { isMounted = false; };
  }, [step]);

  function flyToCity(cityName: string) {
    setActiveCity(cityName);
    const target = INDIA_CITIES[cityName];
    if (!target) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1.1 });
    }
    if (pinMarkerRef.current) {
      pinMarkerRef.current.setLatLng([target.lat, target.lng]);
    }
    const nearest = findNearestLocality(target.lat, target.lng);
    setSelectedLocality(nearest);
    void reverseGeocode(target.lat, target.lng);
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.display_name) {
        const parts = data.display_name.split(",");
        setLocationAddress(parts.slice(0, 3).join(",").trim());
      }
    } catch {
      setLocationAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!query.trim() || query.length < 3) { setSearchResults([]); return; }
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " India")}&format=json&limit=5&countrycodes=in`,
          { headers: { "Accept-Language": "en" } }
        );
        setSearchResults(await res.json());
      } catch { setSearchResults([]); }
      finally { setIsSearching(false); }
    }, 400);
  }

  function selectSearchResult(result: any) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const shortName = result.display_name.split(",").slice(0, 2).join(",");
    setSearchQuery(shortName);
    setLocationAddress(result.display_name.split(",").slice(0, 3).join(",").trim());
    setSearchResults([]);
    if (mapInstanceRef.current) mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1 });
    if (pinMarkerRef.current) pinMarkerRef.current.setLatLng([lat, lng]);
    const nearest = findNearestLocality(lat, lng);
    setSelectedLocality(nearest);
    const cityMatch = nearest.split(",")[1]?.trim();
    if (cityMatch && INDIA_CITIES[cityMatch]) setActiveCity(cityMatch);
  }

  // Client-side validation before submitting to server
  function validateStep3(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!orgName.trim() && role !== "VOLUNTEER") e.orgName = "Organisation name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (password.length < 8) e.password = "Minimum 8 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setClientErrors(e);
    return Object.keys(e).length === 0;
  }

  const steps = ["Choose Role", "Pin Location", "Create Account"];

  return (
    <div className="relative min-h-screen bg-[#F4FBF5] text-[#17251C] flex flex-col selection:bg-[#138A36]/20 overflow-x-hidden">
      <FloatingParticles3D />

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/60 bg-white/95 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-[#138A36] transition">
          <ArrowLeft className="h-4 w-4" />
          <Logo />
        </Link>
        <h2 className="text-base font-extrabold text-slate-800 tracking-tight hidden sm:block">
          {steps[step - 1]}
        </h2>
        <Link href="/login" className="text-xs font-bold text-[#138A36] hover:underline">Login</Link>
      </header>

      {/* Step Progress */}
      <div className="bg-white/95 border-b border-slate-100 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-0">
          {steps.map((label, i) => {
            const s = (i + 1) as Step;
            const done = step > s;
            const active = step === s;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${done ? "bg-[#138A36] border-[#138A36] text-white" : active ? "bg-white border-[#138A36] text-[#138A36]" : "bg-white border-slate-200 text-slate-400"}`}>
                    {done ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  <span className={`text-[10px] font-bold mt-0.5 hidden sm:block ${active || done ? "text-[#138A36]" : "text-slate-400"}`}>{label}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded-full ${done ? "bg-[#138A36]" : "bg-slate-200"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <main className="flex-1 relative z-10 mx-auto w-full max-w-4xl px-4 py-8">

        {/* ── STEP 1: Role ── */}
        {step === 1 && (
          <div className="rounded-3xl border border-white/90 bg-white/95 p-8 shadow-[0_20px_60px_rgba(7,91,42,0.08)] backdrop-blur-md sm:p-12 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#17251C] sm:text-4xl">I am joining as…</h1>
            <p className="mt-2 text-sm text-slate-500 font-semibold">Choose your role in the ResQMeal food rescue network.</p>

            <div className="mt-10 grid gap-6 md:grid-cols-3 text-left">
              {/* Restaurant */}
              <TiltCard3D maxTilt={14} scale={1.04} glare className="h-full">
                <div role="button" tabIndex={0} onClick={() => setRole("RESTAURANT")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setRole("RESTAURANT"); }} className={`relative flex flex-col items-center p-7 rounded-3xl cursor-pointer transition-all duration-200 select-none h-full ${role === "RESTAURANT" ? "border-2 border-[#138A36] bg-[#F4FBF5] shadow-xl shadow-[#138A36]/15 scale-[1.02]" : "border-2 border-slate-200/80 bg-white hover:border-[#138A36]/50 hover:shadow-lg"}`}>
                  {role === "RESTAURANT" && <div style={{ transform: "translateZ(30px)" }} className="absolute top-3.5 right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#138A36] text-white shadow-md"><Check className="h-4 w-4 stroke-[3]" /></div>}
                  <div style={{ transform: "translateZ(25px)" }}><ChefAvatar3D size={84} /></div>
                  <h3 style={{ transform: "translateZ(20px)" }} className="mt-5 text-center text-lg font-extrabold text-slate-900">I am a Restaurant</h3>
                  <p style={{ transform: "translateZ(15px)" }} className="mt-1.5 text-center text-xs font-semibold text-slate-500">I want to donate surplus food</p>
                </div>
              </TiltCard3D>

              {/* NGO */}
              <TiltCard3D maxTilt={14} scale={1.04} glare className="h-full">
                <div role="button" tabIndex={0} onClick={() => setRole("NGO")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setRole("NGO"); }} className={`relative flex flex-col items-center p-7 rounded-3xl cursor-pointer transition-all duration-200 select-none h-full ${role === "NGO" ? "border-2 border-[#138A36] bg-[#F4FBF5] shadow-xl shadow-[#138A36]/15 scale-[1.02]" : "border-2 border-slate-200/80 bg-white hover:border-[#138A36]/50 hover:shadow-lg"}`}>
                  {role === "NGO" && <div style={{ transform: "translateZ(30px)" }} className="absolute top-3.5 right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#138A36] text-white shadow-md"><Check className="h-4 w-4 stroke-[3]" /></div>}
                  <div style={{ transform: "translateZ(25px)" }}><NgoAvatar3D size={84} /></div>
                  <h3 style={{ transform: "translateZ(20px)" }} className="mt-5 text-center text-lg font-extrabold text-slate-900 leading-snug">I am an NGO / Community Kitchen</h3>
                  <p style={{ transform: "translateZ(15px)" }} className="mt-1.5 text-center text-xs font-semibold text-slate-500">I want to receive food donations</p>
                </div>
              </TiltCard3D>

              {/* Volunteer */}
              <TiltCard3D maxTilt={14} scale={1.04} glare className="h-full">
                <div role="button" tabIndex={0} onClick={() => setRole("VOLUNTEER")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setRole("VOLUNTEER"); }} className={`relative flex flex-col items-center p-7 rounded-3xl cursor-pointer transition-all duration-200 select-none h-full ${role === "VOLUNTEER" ? "border-2 border-[#138A36] bg-[#F4FBF5] shadow-xl shadow-[#138A36]/15 scale-[1.02]" : "border-2 border-slate-200/80 bg-white hover:border-[#138A36]/50 hover:shadow-lg"}`}>
                  {role === "VOLUNTEER" && <div style={{ transform: "translateZ(30px)" }} className="absolute top-3.5 right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#138A36] text-white shadow-md"><Check className="h-4 w-4 stroke-[3]" /></div>}
                  <div style={{ transform: "translateZ(25px)" }}><VolunteerAvatar3D size={84} /></div>
                  <h3 style={{ transform: "translateZ(20px)" }} className="mt-5 text-center text-lg font-extrabold text-slate-900">I am a Volunteer</h3>
                  <p style={{ transform: "translateZ(15px)" }} className="mt-1.5 text-center text-xs font-semibold text-slate-500">I want to help with pickup & delivery</p>
                </div>
              </TiltCard3D>
            </div>

            <div className="mt-10 max-w-sm mx-auto">
              <button onClick={() => setStep(2)} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#138A36] py-4 text-base font-extrabold text-white shadow-lg shadow-[#138A36]/25 transition hover:bg-[#075B2A] hover:shadow-xl active:scale-[0.99]">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
              <p className="mt-4 text-center text-xs font-semibold text-slate-500">Already have an account?{" "}<Link href="/login" className="font-extrabold text-[#138A36] hover:underline">Login</Link></p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Location ── */}
        {step === 2 && (
          <div className="rounded-3xl border border-white/90 bg-white/95 p-8 shadow-[0_20px_60px_rgba(7,91,42,0.08)] backdrop-blur-md sm:p-12">
            <h1 className="text-2xl font-extrabold text-slate-900">Pin Your Location</h1>
            <p className="mt-1 text-sm text-slate-500 font-semibold">Search your address or click the map, then choose the nearest area from the list below.</p>

            {/* Search bar */}
            <div className="mt-5 relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                <input type="text" placeholder="Search address, landmark or area in India..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-11 pr-12 py-3.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-[#138A36] focus:bg-white focus:outline-none transition" />
                {isSearching && <Loader2 className="absolute right-4 h-4 w-4 text-[#138A36] animate-spin" />}
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((result, i) => (
                    <button key={i} onClick={() => selectSearchResult(result)} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-[#F4FBF5] hover:text-[#138A36] flex items-start gap-3 border-b border-slate-100 last:border-0 transition">
                      <MapPin className="h-4 w-4 text-[#138A36] mt-0.5 flex-shrink-0" />
                      <span className="font-semibold leading-snug">{result.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* City tabs */}
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.keys(INDIA_CITIES).map((city) => (
                <button key={city} onClick={() => flyToCity(city)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${activeCity === city ? "bg-[#138A36] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{city}</button>
              ))}
            </div>

            {/* Map */}
            <div className="mt-4 rounded-2xl overflow-hidden border-2 border-slate-200 relative" style={{ height: "340px" }}>
              <div ref={mapContainerRef} className="w-full h-full" />
              <div className="absolute bottom-3 left-3 right-3 z-[400] pointer-events-none">
                <div className="bg-white/95 backdrop-blur rounded-xl px-4 py-2.5 shadow-lg border border-slate-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#138A36] flex-shrink-0" />
                  <p className="text-xs font-black text-slate-800 truncate">{locationAddress}</p>
                </div>
              </div>
            </div>

            {/* Locality selector — the value that actually goes to the DB */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="block text-xs font-black text-slate-700">
                  Select your nearest area / locality *
                </label>
                <span className="text-[11px] font-extrabold text-[#138A36] bg-[#E8F7EA] px-2.5 py-0.5 rounded-full border border-[#C8EED0]">
                  📍 Auto-detected from pin
                </span>
              </div>
              <select
                value={selectedLocality}
                onChange={(e) => {
                  const loc = e.target.value;
                  setSelectedLocality(loc);
                  const coords = LOCALITIES[loc as keyof typeof LOCALITIES];
                  if (coords && coords.latitude && mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([coords.latitude, coords.longitude], 14, { duration: 1 });
                    if (pinMarkerRef.current) {
                      pinMarkerRef.current.setLatLng([coords.latitude, coords.longitude]);
                    }
                    reverseGeocode(coords.latitude, coords.longitude);
                    const cityMatch = loc.split(",")[1]?.trim();
                    if (cityMatch && INDIA_CITIES[cityMatch]) setActiveCity(cityMatch);
                  }
                }}
                className="w-full rounded-xl border-2 border-[#138A36]/40 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm focus:border-[#138A36] focus:outline-none transition"
              >
                {LOCALITY_NAMES.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-400 font-semibold">
                Automatically matches your map pin. You can also adjust it manually.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-700 hover:border-slate-300 transition">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#138A36] py-3.5 text-base font-extrabold text-white shadow-lg shadow-[#138A36]/25 hover:bg-[#075B2A] transition active:scale-[0.99]">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Account Details — posts to real server action ── */}
        {step === 3 && (
          <div className="rounded-3xl border border-white/90 bg-white/95 p-8 shadow-[0_20px_60px_rgba(7,91,42,0.08)] backdrop-blur-md sm:p-12">
            <h1 className="text-2xl font-extrabold text-slate-900">Create Your Account</h1>
            <p className="mt-1 text-sm text-slate-500 font-semibold">
              Joining as a <span className="text-[#138A36]">{role === "RESTAURANT" ? "Restaurant Donor" : role === "NGO" ? "NGO / Community Kitchen" : "Volunteer"}</span> in <span className="text-[#138A36]">{selectedLocality}</span>
            </p>

            {/* Server-side error */}
            {state?.error && (
              <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold">
                ⚠️ {state.error}
              </div>
            )}

            {/* Hidden fields passed to server action */}
            <form
              action={(formData) => {
                if (!validateStep3()) return;
                formAction(formData);
              }}
              className="mt-6"
            >
              {/* Hidden fields */}
              <input type="hidden" name="role" value={role} />
              <input type="hidden" name="publicLocality" value={selectedLocality} />
              {role === "NGO" && <input type="hidden" name="orgType" value="NGO" />}

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input type="text" name="displayName" placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)}
                      className={`w-full rounded-xl border-2 pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition ${clientErrors.name ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-[#138A36] focus:bg-white"}`} />
                  </div>
                  {clientErrors.name && <p className="mt-1 text-xs text-red-500 font-bold">{clientErrors.name}</p>}
                </div>

                {/* Organisation Name */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    {role === "RESTAURANT" ? "Restaurant / Business Name *" : role === "NGO" ? "NGO / Organisation Name *" : "Organisation Name (optional)"}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input type="text" name="organisationName" placeholder={role === "RESTAURANT" ? "Punjab Grill & Catering" : role === "NGO" ? "Robin Hood Army" : "Independent Volunteer"} value={orgName} onChange={(e) => setOrgName(e.target.value)}
                      className={`w-full rounded-xl border-2 pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition ${clientErrors.orgName ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-[#138A36] focus:bg-white"}`} />
                  </div>
                  {clientErrors.orgName && <p className="mt-1 text-xs text-red-500 font-bold">{clientErrors.orgName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input type="email" name="email" placeholder="rahul@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-xl border-2 pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition ${clientErrors.email ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-[#138A36] focus:bg-white"}`} />
                  </div>
                  {clientErrors.email && <p className="mt-1 text-xs text-red-500 font-bold">{clientErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input type="tel" name="phone" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-[#138A36] focus:bg-white focus:outline-none transition" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                      className={`w-full rounded-xl border-2 pl-10 pr-11 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition ${clientErrors.password ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-[#138A36] focus:bg-white"}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {clientErrors.password && <p className="mt-1 text-xs text-red-500 font-bold">{clientErrors.password}</p>}
                </div>

                {/* Confirm Password — not sent to server, only for client validation */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full rounded-xl border-2 pl-10 pr-11 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition ${clientErrors.confirmPassword ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-[#138A36] focus:bg-white"}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {clientErrors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-bold">{clientErrors.confirmPassword}</p>}
                </div>
              </div>

              {/* Summary card */}
              <div className="mt-6 rounded-2xl bg-[#F4FBF5] border border-[#C8EED0] p-4 flex flex-wrap gap-4 text-xs font-bold text-[#138A36]">
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" />Role: {role === "RESTAURANT" ? "Restaurant Donor" : role === "NGO" ? "NGO / Community Kitchen" : "Volunteer"}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{selectedLocality}</span>
              </div>

              <p className="mt-4 text-xs text-slate-400 font-semibold text-center">
                By creating an account you agree to ResQMeal's <span className="text-[#138A36] cursor-pointer hover:underline">Terms</span> and <span className="text-[#138A36] cursor-pointer hover:underline">Privacy Policy</span>.
              </p>

              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-700 hover:border-slate-300 transition">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#138A36] py-3.5 text-base font-extrabold text-white shadow-lg shadow-[#138A36]/25 hover:bg-[#075B2A] transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed">
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</> : <><Check className="w-4 h-4" /> Create Account</>}
                </button>
              </div>

              <p className="mt-4 text-center text-xs font-semibold text-slate-500">
                Already have an account?{" "}<Link href="/login" className="font-extrabold text-[#138A36] hover:underline">Login</Link>
              </p>
            </form>
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">ResQMeal • Pan-India Food Rescue Network</footer>
    </div>
  );
}
