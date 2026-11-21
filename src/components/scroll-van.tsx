"use client";

import { useEffect, useRef } from "react";

/**
 * ScrollVanScene
 * 
 * 1. Road stripes are 100% continuous across the entire screen width with ZERO gaps,
 *    using an infinite repeating CSS gradient that wraps seamlessly.
 * 2. The van moves from the RIGHT of the screen towards the LEFT.
 * 3. The van is facing LEFT (cab in front, food box at rear) — exactly matching
 *    the reference image without any horizontal flipping ("dont change the van side keep is same").
 * 4. The wheels rotate counter-clockwise (forward roll) directly synchronized with scroll.
 * 5. All movements run via direct DOM refs on requestAnimationFrame for silky 60fps.
 */
export function ScrollVanScene() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const vanRef      = useRef<HTMLDivElement>(null);       // Moves van right → left
  const svgRef      = useRef<SVGSVGElement>(null);        // Vehicle suspension bob
  const whlFRef     = useRef<SVGGElement>(null);          // Front wheel group rotation
  const whlRRef     = useRef<SVGGElement>(null);          // Rear wheel group rotation
  const roadRef     = useRef<HTMLDivElement>(null);       // Continuous center dashed stripe
  const shoulderRef = useRef<HTMLDivElement>(null);       // Continuous shoulder stripe
  const hintRef     = useRef<HTMLDivElement>(null);       // "Scroll to drive" indicator

  useEffect(() => {
    let rafId        = 0;
    let bobRafId     = 0;
    let wheelAngle   = 0;      // Cumulative wheel rotation angle (degrees)
    let prevProgress = 0;
    let bobStart: number | null = null;

    // ── Suspension bob animation (gentle continuous road vibration) ──
    function bobStep(ts: number) {
      if (!bobStart) bobStart = ts;
      const t = (ts - bobStart) / 1000;
      const bobY = Math.sin(t * 3.0 * Math.PI * 2) * 2.0;
      if (svgRef.current) {
        svgRef.current.style.transform = `translateY(${bobY.toFixed(2)}px)`;
      }
      bobRafId = requestAnimationFrame(bobStep);
    }
    bobRafId = requestAnimationFrame(bobStep);

    // ── Scroll-driven van and road update ────────────────────────────
    function update() {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const vh   = window.innerHeight;
      
      // Progress p: 0 when top of section is at bottom of viewport,
      //             1 when bottom of section reaches top of viewport
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height + vh)));

      // ── Van position: drives from RIGHT to LEFT ──────────────────
      // p = 0: van is off-screen at 105vw (right)
      // p = 1: van exits off-screen at -45vw (left)
      const vanX = 105 - p * 155; // vw
      if (vanRef.current) {
        vanRef.current.style.transform = `translateX(${vanX.toFixed(2)}vw)`;
      }

      // ── Wheel rotation: counter-clockwise when driving to the left ──
      const delta = p - prevProgress;
      // Moving left means wheel rotates counter-clockwise (negative angle)
      wheelAngle -= delta * 3600;
      prevProgress = p;

      const rotF = `rotate(${wheelAngle.toFixed(2)}, 135, 195)`;
      const rotR = `rotate(${wheelAngle.toFixed(2)}, 430, 195)`;
      whlFRef.current?.setAttribute("transform", rotF);
      whlRRef.current?.setAttribute("transform", rotR);

      // ── Continuous road stripes: scroll seamlessly to the right ──
      // (Relative motion: as car moves left, road moves right beneath it)
      if (roadRef.current) {
        roadRef.current.style.backgroundPositionX = `${(p * 2400).toFixed(1)}px`;
      }
      if (shoulderRef.current) {
        shoulderRef.current.style.backgroundPositionX = `${(p * 1900).toFixed(1)}px`;
      }

      // ── Fade out scroll prompt once user starts scrolling ──────────
      if (hintRef.current) {
        hintRef.current.style.opacity = p < 0.08 ? String(1 - p * 12.5) : "0";
      }
    }

    function onScroll() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // Run on mount to initialize position

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(bobRafId);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      aria-hidden="true"
      className="relative w-full overflow-hidden select-none"
      style={{
        height: "500px",
        background:
          "linear-gradient(180deg, #EDF8F0 0%, #DCF3E4 35%, #CBE9D5 68%, #B8DEC3 100%)",
      }}
    >
      {/* ── Sky atmospheric ambient glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255,255,255,0.5) 0%, transparent 70%)",
        }}
      />

      {/* ── Distant hills & foliage (slow parallax) ── */}
      <svg
        className="absolute pointer-events-none"
        style={{ bottom: 125, left: 0, width: "100%", height: 160 }}
        viewBox="0 0 1600 160"
        fill="none"
        preserveAspectRatio="none"
      >
        <ellipse cx="450" cy="170" rx="550" ry="60" fill="rgba(19,138,54,0.08)" />
        <ellipse cx="1150" cy="175" rx="650" ry="65" fill="rgba(7,91,42,0.06)" />
        {[60, 190, 320, 480, 630, 770, 920, 1080, 1220, 1380, 1520].map((x, i) => (
          <g key={i} transform={`translate(${x},${i % 2 === 0 ? 25 : 38})`}>
            <rect x="-3" y="34" width="6" height="34" rx="3" fill="rgba(7,91,42,0.22)" />
            <ellipse cx="0" cy="22" rx={13 + (i % 3) * 2} ry={18 + (i % 3) * 2} fill="rgba(19,138,54,0.18)" />
            <ellipse cx="0" cy="10" rx={8 + (i % 2) * 2} ry={12 + (i % 2) * 2} fill="rgba(19,138,54,0.14)" />
          </g>
        ))}
      </svg>

      {/* ── Mid-ground roadside cacti & rock clusters ── */}
      <svg
        className="absolute pointer-events-none"
        style={{ bottom: 106, left: 0, width: "100%", height: 160 }}
        viewBox="0 0 1600 160"
        fill="none"
      >
        {/* Left cacti */}
        <g transform="translate(90, 0)">
          <rect x="14" y="28" width="12" height="132" rx="6" fill="#138A36" opacity="0.8" />
          <rect x="2" y="55" width="18" height="10" rx="5" fill="#138A36" opacity="0.68" />
          <rect x="2" y="45" width="10" height="28" rx="5" fill="#138A36" opacity="0.65" />
          <rect x="26" y="68" width="18" height="10" rx="5" fill="#138A36" opacity="0.68" />
          <rect x="32" y="58" width="10" height="28" rx="5" fill="#138A36" opacity="0.65" />
        </g>
        <g transform="translate(180, 32)">
          <rect x="8" y="20" width="8" height="80" rx="4" fill="#075B2A" opacity="0.65" />
          <rect x="1" y="44" width="12" height="7" rx="3.5" fill="#075B2A" opacity="0.55" />
          <rect x="1" y="37" width="7" height="18" rx="3.5" fill="#075B2A" opacity="0.5" />
        </g>
        <ellipse cx="270" cy="152" rx="28" ry="10" fill="rgba(7,91,42,0.32)" />
        <ellipse cx="340" cy="148" rx="34" ry="14" fill="rgba(100,135,110,0.35)" />

        {/* Right cacti */}
        <g transform="translate(1420, 10)">
          <rect x="14" y="24" width="12" height="128" rx="6" fill="#138A36" opacity="0.75" />
          <rect x="2" y="58" width="18" height="10" rx="5" fill="#138A36" opacity="0.65" />
          <rect x="26" y="72" width="18" height="10" rx="5" fill="#138A36" opacity="0.65" />
        </g>
        <ellipse cx="1520" cy="150" rx="42" ry="15" fill="rgba(100,135,110,0.3)" />
      </svg>

      {/* ── Ground & Realistic Road Section ── */}
      <div className="absolute left-0 right-0 bottom-0 pointer-events-none" style={{ height: 135 }}>
        {/* Soft grass roadside verge */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #A2D3AF 0%, #8CC39B 50%, #76AE87 100%)",
            opacity: 0.75,
          }}
        />

        {/* Realistic asphalt roadway surface */}
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: 12,
            height: 94,
            background: "linear-gradient(180deg, #7FA88B 0%, #6E997A 50%, #628D6E 100%)",
            opacity: 0.98,
            boxShadow: "inset 0 3px 6px rgba(0,0,0,0.12)",
          }}
        />

        {/* Road top border curb */}
        <div
          className="absolute left-0 right-0"
          style={{ bottom: 106, height: 3, background: "rgba(7,91,42,0.4)" }}
        />

        {/* Road bottom border curb */}
        <div
          className="absolute left-0 right-0"
          style={{ bottom: 12, height: 2.5, background: "rgba(7,91,42,0.3)" }}
        />

        {/* ── 100% COMPLETE CONTINUOUS CENTER DASHED STRIPES ── */}
        <div
          ref={roadRef}
          className="absolute left-0 right-0"
          style={{
            bottom: 42,
            height: 6,
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.92) 0px, rgba(255,255,255,0.92) 64px, transparent 64px, transparent 116px)",
            backgroundRepeat: "repeat-x",
            willChange: "background-position-x",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))",
          }}
        />

        {/* ── 100% COMPLETE CONTINUOUS SHOULDER STRIPES ── */}
        <div
          ref={shoulderRef}
          className="absolute left-0 right-0"
          style={{
            bottom: 18,
            height: 2.5,
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.45) 0px, rgba(255,255,255,0.45) 42px, transparent 42px, transparent 78px)",
            backgroundRepeat: "repeat-x",
            willChange: "background-position-x",
          }}
        />
      </div>

      {/* ── THE VAN (Sitting firmly ON the asphalt roadway) ── */}
      <div
        className="pointer-events-none absolute"
        style={{ bottom: 30, left: 0, width: "100%" }}
      >
        <div
          ref={vanRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            willChange: "transform",
          }}
        >
          {/* Ground drop shadow underneath van */}
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "6%",
              width: "88%",
              height: 24,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.18)",
              filter: "blur(9px)",
              transform: "scaleY(0.35)",
            }}
          />

          {/* SVG Van: FACING LEFT naturally (NO scaleX(-1) flipping) */}
          <svg
            ref={svgRef}
            width="570"
            height="250"
            viewBox="0 0 570 250"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              display: "block",
              overflow: "visible",
              transformOrigin: "center bottom",
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.18)) drop-shadow(0 3px 6px rgba(0,0,0,0.10))",
            }}
          >
            <defs>
              {/* Warm cream body gradient matching reference image */}
              <linearGradient id="vanBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="15%" stopColor="#FBF4E8" />
                <stop offset="80%" stopColor="#F5EBDC" />
                <stop offset="100%" stopColor="#EDE0CE" />
              </linearGradient>

              {/* Dynamic emerald green wave gradient */}
              <linearGradient id="vanWaveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#138A36" />
                <stop offset="60%" stopColor="#25A844" />
                <stop offset="100%" stopColor="#3CD05E" />
              </linearGradient>

              {/* Windshield blue glass gradient with realism */}
              <linearGradient id="windshieldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7FB7D0" />
                <stop offset="60%" stopColor="#4A88A4" />
                <stop offset="100%" stopColor="#306982" />
              </linearGradient>

              {/* Windshield glare reflection */}
              <linearGradient id="glassGlare" x1="0" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.45" />
                <stop offset="45%" stopColor="white" stopOpacity="0.15" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* ── Chassis / Underframe bar ── */}
            <rect x="45" y="185" width="480" height="15" rx="4" fill="#2C2C2C" />

            {/* ── MAIN CARGO BODY (White / Cream) ── */}
            <rect x="150" y="44" width="375" height="142" rx="10" fill="url(#vanBodyGrad)" />
            {/* White roof highlight line */}
            <rect x="150" y="44" width="375" height="6" rx="3" fill="#FFFFFF" opacity="0.9" />
            {/* Rear edge seam shadow */}
            <rect x="520" y="48" width="5" height="134" rx="2" fill="rgba(0,0,0,0.08)" />

            {/* ── FRONT CAB (Left side of vehicle) ── */}
            {/* Smooth aerodynamic front cabin contour */}
            <path
              d="M 45 185 L 45 140 Q 46 122 58 108 L 84 68 Q 96 52 118 47 L 152 44 L 152 185 Z"
              fill="url(#vanBodyGrad)"
            />
            {/* Cab lower rocker panel */}
            <rect x="45" y="165" width="107" height="20" rx="3" fill="#E6D9C8" />

            {/* ── FRONT WINDSHIELD (Slanted front glass) ── */}
            <path
              d="M 62 138 L 86 98 L 108 65 L 146 54 L 146 138 Z"
              fill="url(#windshieldGrad)"
            />
            {/* Windshield frame / rubber seal */}
            <path
              d="M 62 138 L 86 98 L 108 65 L 146 54 L 146 58 L 110 68 L 89 101 L 66 138 Z"
              fill="rgba(30,30,30,0.5)"
            />
            {/* Windshield sun glare */}
            <path
              d="M 70 132 L 92 92 L 114 66 L 140 58 L 140 88 L 105 98 L 78 126 Z"
              fill="url(#glassGlare)"
            />
            {/* Black windshield wiper */}
            <line x1="88" y1="126" x2="136" y2="76" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />

            {/* ── DRIVER CAB DOOR WINDOW ── */}
            <rect x="158" y="58" width="46" height="78" rx="6" fill="url(#windshieldGrad)" />
            <rect x="160" y="60" width="42" height="34" rx="4" fill="url(#glassGlare)" opacity="0.7" />

            {/* Cab door seam lines */}
            <rect x="152" y="52" width="58" height="132" rx="4" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
            {/* Door handle */}
            <rect x="194" y="132" width="12" height="4" rx="2" fill="#333" />

            {/* Black side mirror mounted on cab */}
            <rect x="52" y="86" width="16" height="24" rx="4" fill="#222" />
            <rect x="66" y="94" width="12" height="4" rx="2" fill="#555" />

            {/* ── FRONT BUMPER & GRILLE (Far left) ── */}
            <rect x="36" y="180" width="105" height="14" rx="5" fill="#333333" />
            <rect x="40" y="152" width="14" height="26" rx="3" fill="#1C1C1C" />
            {[156, 161, 166, 171].map((y) => (
              <rect key={y} x="42" y={y} width="10" height="2" rx="1" fill="#444" />
            ))}

            {/* Headlight (White / Soft Yellow glow) */}
            <rect x="40" y="122" width="12" height="22" rx="3" fill="#FFFED4" />
            <rect x="40" y="122" width="12" height="22" rx="3" fill="none" stroke="#D1CEB8" strokeWidth="1" />

            {/* ── REAR LIGHTS & BUMPER ── */}
            <rect x="520" y="168" width="8" height="15" rx="3" fill="#E62E2E" />
            <rect x="515" y="180" width="16" height="14" rx="4" fill="#333333" />

            {/* ── GREEN WAVE SWOOP (Curving along lower body) ── */}
            <path
              d="M 152 185 L 152 162 Q 220 162 290 148 Q 365 132 440 144 Q 485 152 525 142 L 525 185 Z"
              fill="url(#vanWaveGrad)"
            />
            {/* Upper accent wave stripe */}
            <path
              d="M 152 162 Q 220 162 290 148 Q 365 132 440 144 Q 485 152 525 142 L 525 145 Q 485 155 440 147 Q 365 135 290 151 Q 220 165 152 165 Z"
              fill="rgba(255,255,255,0.3)"
            />

            {/* ── ResQMeal LOGO & BRANDING (Centered on side, reads normally) ── */}
            {/* Green Leaf Logo */}
            <g transform="translate(325, 78)">
              {/* Leaf background badge */}
              <path
                d="M -18 16 Q -22 -14 10 -20 Q 24 -12 18 12 Q 10 24 -18 16 Z"
                fill="#138A36"
              />
              {/* White fork icon inside leaf */}
              <line x1="-3" y1="-8" x2="-3" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {[-8, -3, 2].map((x) => (
                <line key={x} x1={x} y1="-14" x2={x} y2="-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              ))}
            </g>

            {/* "ResQMeal" Title text */}
            <text
              x="330"
              y="114"
              textAnchor="middle"
              fontSize="30"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              fill="#075B2A"
              letterSpacing="-0.5"
            >
              ResQMeal
            </text>

            {/* Tagline text line 1 */}
            <text
              x="330"
              y="134"
              textAnchor="middle"
              fontSize="12.5"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
              fill="#138A36"
            >
              Rescuing Surplus Food
            </text>

            {/* Tagline text line 2 */}
            <text
              x="330"
              y="149"
              textAnchor="middle"
              fontSize="12.5"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
              fill="#138A36"
            >
              Feeding People
            </text>

            {/* ── FOOD DONATION BOX ILLUSTRATION (Right side of van body) ── */}
            <g transform="translate(450, 72)">
              {/* Cardboard box base */}
              <rect x="-35" y="18" width="70" height="52" rx="5" fill="#D99455" />
              {/* Box flaps open */}
              <path d="M -35 18 L -26 4 L 26 4 L 35 18 Z" fill="#C27D3E" />
              <path d="M -26 4 L -20 12 L 20 12 L 26 4 Z" fill="#E6A668" />

              {/* Red heart on box */}
              <path
                d="M 0 45 C 0 41 4 37 8 41 C 12 37 16 41 16 45 C 16 49 8 57 8 57 C 8 57 0 49 0 45 Z"
                fill="#E83B3B"
                transform="translate(-8, -4)"
              />

              {/* Fresh vegetables in box */}
              {/* Tomato */}
              <circle cx="-16" cy="6" r="10" fill="#E83B3B" />
              <line x1="-16" y1="-4" x2="-16" y2="-7" stroke="#138A36" strokeWidth="2.5" strokeLinecap="round" />
              {/* Yellow bell pepper */}
              <ellipse cx="-2" cy="4" rx="10" ry="11" fill="#FBBF24" />
              {/* Green lettuce / cabbage */}
              <circle cx="16" cy="4" r="11" fill="#22C55E" />
              <circle cx="12" cy="0" r="8" fill="#16A34A" />
              {/* Carrot */}
              <path d="M 6 8 L 14 24 L 2 24 Z" fill="#F97316" />
            </g>

            {/* ── WHEEL ARCH CUTOUTS & SHADOWS ── */}
            <circle cx="135" cy="195" r="47" fill="#1C2E20" />
            <circle cx="430" cy="195" r="47" fill="#1C2E20" />

            {/* Wheel arch dark inner fender shadow */}
            <path d="M 88 195 A 47 47 0 0 1 182 195 Z" fill="#1F3624" opacity="0.6" />
            <path d="M 383 195 A 47 47 0 0 1 477 195 Z" fill="#1F3624" opacity="0.6" />

            {/* ── FRONT WHEEL (Rotates in real-time counter-clockwise) ── */}
            <g ref={whlFRef}>
              <WheelShapes cx={135} cy={195} r={42} />
            </g>

            {/* ── REAR WHEEL (Rotates in real-time counter-clockwise) ── */}
            <g ref={whlRRef}>
              <WheelShapes cx={430} cy={195} r={42} />
            </g>
          </svg>

          {/* ── Exhaust Smoke Puffs trailing from the REAR bumper ── */}
          <div
            style={{
              position: "absolute",
              right: 15,
              bottom: 48,
              display: "flex",
              gap: 12,
              alignItems: "flex-end",
              pointerEvents: "none",
            }}
          >
            {[22, 16, 10, 6].map((sz, i) => (
              <div
                key={i}
                style={{
                  width: sz,
                  height: sz,
                  borderRadius: "50%",
                  background: "rgba(220,240,225,0.7)",
                  filter: "blur(5px)",
                  opacity: 0.7 - i * 0.15,
                  animationName: "dustPuff",
                  animationDuration: `${1.1 + i * 0.28}s`,
                  animationIterationCount: "infinite",
                  animationTimingFunction: "ease-out",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── "Scroll to drive" indicator (Fades out seamlessly) ── */}
      <div
        ref={hintRef}
        className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        style={{ opacity: 1, transition: "opacity 0.25s ease-out" }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#075B2A",
            textTransform: "uppercase",
            textShadow: "0 1px 2px rgba(255,255,255,0.8)",
          }}
        >
          Scroll to drive
        </span>
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
          <path
            d="M7 2v12M3 10l4 4 4-4"
            stroke="#138A36"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* ──────────────── Wheel Sub-component (Vector Wheel Details) ──────────────── */
function WheelShapes({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  // 5 Spokes
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 * Math.PI) / 180;
    return {
      x1: cx + r * 0.26 * Math.cos(a),
      y1: cy + r * 0.26 * Math.sin(a),
      x2: cx + r * 0.72 * Math.cos(a),
      y2: cy + r * 0.72 * Math.sin(a),
    };
  });

  // 5 Lug nuts
  const lugs = Array.from({ length: 5 }, (_, i) => {
    const a = ((i * 72 + 36) * Math.PI) / 180;
    return { cx: cx + r * 0.48 * Math.cos(a), cy: cy + r * 0.48 * Math.sin(a) };
  });

  return (
    <>
      {/* Outer black tire tread */}
      <circle cx={cx} cy={cy} r={r} fill="#1A1A1A" />
      {/* Tire sidewall ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2B2B2B" strokeWidth="5" />
      {/* Inner tire well */}
      <circle cx={cx} cy={cy} r={r * 0.84} fill="#242424" />
      {/* Metallic alloy rim outer rim */}
      <circle cx={cx} cy={cy} r={r * 0.74} fill="#BDBDBB" />
      {/* Metallic alloy rim face */}
      <circle cx={cx} cy={cy} r={r * 0.60} fill="#D6D6D2" />

      {/* 5 Structural Wheel Spokes */}
      {spokes.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke="#90908C"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      ))}

      {/* 5 Wheel Lug nuts */}
      {lugs.map((l, i) => (
        <circle key={i} cx={l.cx} cy={l.cy} r={r * 0.08} fill="#70706C" />
      ))}

      {/* Central Axle Hubcap */}
      <circle cx={cx} cy={cy} r={r * 0.24} fill="#A6A6A2" />
      <circle cx={cx} cy={cy} r={r * 0.14} fill="#82827E" />
      <circle cx={cx} cy={cy} r={r * 0.06} fill="#4A4A46" />
    </>
  );
}

export { ScrollVanScene as ScrollVanSection };
export function ScrollVan() {
  return null;
}
