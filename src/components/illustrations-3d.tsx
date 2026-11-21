"use client";

import React from "react";

/**
 * High-fidelity 3D Food Donation Box matching the reference hero image:
 * Cardboard box labeled "Good Food / Better Tomorrow" packed with fresh produce,
 * set inside a glowing 3D heart/leaf ring with floating green leaves.
 */
export function DonationBox3D({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Background Soft Glow & Orbit Ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full bg-gradient-to-tr from-[#c8f0cf]/60 via-[#e3f8e7]/80 to-transparent blur-2xl transform -translate-y-4" />
      </div>

      {/* Floating Leaves */}
      <div className="absolute -top-4 -right-2 animate-bounce duration-[4000ms] pointer-events-none z-20">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-md">
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#leafGrad1)"
          />
          <path d="M12 36C22 26 36 12 40 8" stroke="#075B2A" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <defs>
            <linearGradient id="leafGrad1" x1="10" y1="38" x2="42" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#138A36" />
              <stop offset="1" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute top-12 -left-6 animate-pulse duration-[3500ms] pointer-events-none z-20">
        <svg width="38" height="38" viewBox="0 0 48 48" fill="none" className="drop-shadow-md transform -rotate-45">
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#leafGrad2)"
          />
          <defs>
            <linearGradient id="leafGrad2" x1="10" y1="38" x2="42" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#075B2A" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute -bottom-2 -left-2 animate-bounce duration-[5000ms] pointer-events-none z-20">
        <svg width="42" height="42" viewBox="0 0 48 48" fill="none" className="drop-shadow-md transform rotate-12">
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#leafGrad3)"
          />
          <defs>
            <linearGradient id="leafGrad3" x1="10" y1="38" x2="42" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#138A36" />
              <stop offset="1" stopColor="#6EE7B7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute bottom-6 -right-6 animate-pulse duration-[4200ms] pointer-events-none z-20">
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none" className="drop-shadow-sm transform rotate-90">
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#leafGrad1)"
          />
        </svg>
      </div>

      {/* Main SVG: Heart/Ring + 3D Open Cardboard Box + Rich Produce */}
      <svg
        viewBox="0 0 520 440"
        className="w-full h-auto max-w-[480px] drop-shadow-2xl transition-transform hover:scale-[1.02] duration-500 ease-out"
      >
        <defs>
          {/* Heart / Leaf Ring Gradient */}
          <linearGradient id="heartRingGrad" x1="100" y1="50" x2="420" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B4ECC1" />
            <stop offset="0.5" stopColor="#E2F7E7" />
            <stop offset="1" stopColor="#9BD9AA" />
          </linearGradient>

          {/* Cardboard gradients */}
          <linearGradient id="boxFrontGrad" x1="180" y1="230" x2="340" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0AA77" />
            <stop offset="0.5" stopColor="#C88E56" />
            <stop offset="1" stopColor="#A86F37" />
          </linearGradient>
          <linearGradient id="boxSideGrad" x1="330" y1="210" x2="430" y2="360" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B87B42" />
            <stop offset="1" stopColor="#8C5523" />
          </linearGradient>
          <linearGradient id="boxFlapGrad" x1="150" y1="180" x2="350" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F0BC8B" />
            <stop offset="1" stopColor="#CF945B" />
          </linearGradient>

          {/* Tomato gradient */}
          <radialGradient id="tomatoGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FF7676" />
            <stop offset="40%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#991B1B" />
          </radialGradient>

          {/* Orange gradient */}
          <radialGradient id="orangeGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="30%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#C2410C" />
          </radialGradient>

          {/* Broccoli / Green gradient */}
          <linearGradient id="broccoliGrad" x1="240" y1="130" x2="310" y2="210" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ADE80" />
            <stop offset="0.5" stopColor="#16A34A" />
            <stop offset="1" stopColor="#14532D" />
          </linearGradient>

          {/* Carrot gradient */}
          <linearGradient id="carrotGrad" x1="320" y1="140" x2="390" y2="220" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFA048" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>

          {/* Box Shadow */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#075B2A" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* 3D Giant Glowing Leaf / Heart Halo in Background */}
        <g opacity="0.95" filter="url(#softShadow)">
          {/* Outer Ring */}
          <path
            d="M 260 70 
               C 340 30, 430 80, 420 180 
               C 410 270, 310 330, 260 360 
               C 210 330, 110 270, 100 180 
               C 90 80, 180 30, 260 70 Z"
            fill="none"
            stroke="url(#heartRingGrad)"
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Highlight Ring */}
          <path
            d="M 260 85 
               C 330 45, 410 90, 400 180 
               C 390 260, 300 315, 260 345 
               C 220 315, 130 260, 120 180 
               C 110 90, 190 45, 260 85 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.65"
          />
        </g>

        {/* Ground Soft Shadow for Box */}
        <ellipse cx="270" cy="395" rx="150" ry="24" fill="#075B2A" opacity="0.18" />

        {/* --- FRESH PRODUCE PACKED IN BOX --- */}
        <g id="box-produce">
          {/* Broccoli (Large bushy head at back left) */}
          <g transform="translate(185, 120)">
            {/* Broccoli clusters */}
            <circle cx="28" cy="40" r="24" fill="url(#broccoliGrad)" />
            <circle cx="56" cy="30" r="26" fill="url(#broccoliGrad)" />
            <circle cx="82" cy="42" r="22" fill="url(#broccoliGrad)" />
            <circle cx="45" cy="55" r="22" fill="#15803D" />
            <circle cx="70" cy="56" r="20" fill="#166534" />
            {/* Florets texture highlights */}
            <circle cx="24" cy="35" r="4" fill="#86EFAC" opacity="0.6" />
            <circle cx="55" cy="22" r="5" fill="#86EFAC" opacity="0.6" />
            <circle cx="80" cy="36" r="4" fill="#86EFAC" opacity="0.6" />
          </g>

          {/* Golden Bread Loaf / Packaged Container at back */}
          <g transform="translate(160, 150) rotate(-12)">
            <rect x="0" y="0" width="75" height="42" rx="14" fill="#EAB308" />
            <rect x="2" y="2" width="71" height="38" rx="12" fill="#CA8A04" />
            <path d="M 12 12 Q 22 28 30 14 Q 40 28 48 14 Q 58 28 66 14" stroke="#FEF08A" strokeWidth="3" fill="none" />
          </g>

          {/* Crisp Orange Carrots */}
          <g transform="translate(295, 130) rotate(22)">
            {/* Carrot greenery */}
            <path d="M 20 0 L 12 -28 M 20 0 L 22 -32 M 20 0 L 32 -26" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" />
            {/* Carrot root */}
            <path d="M 10 0 C 10 -4, 30 -4, 30 0 L 23 85 C 22 88, 18 88, 17 85 Z" fill="url(#carrotGrad)" />
            {/* Carrot ridges */}
            <path d="M 14 18 Q 20 22 26 18 M 16 38 Q 20 42 24 38 M 18 58 Q 20 62 22 58" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Another Carrot sticking out right */}
          <g transform="translate(325, 145) rotate(42)">
            <path d="M 10 0 C 10 -4, 26 -4, 26 0 L 20 70 C 19 73, 16 73, 15 70 Z" fill="url(#carrotGrad)" />
          </g>

          {/* Ripe Plump Red Tomatoes */}
          <g transform="translate(200, 180)">
            <circle cx="34" cy="34" r="32" fill="url(#tomatoGrad)" />
            {/* Shiny specular highlight */}
            <ellipse cx="22" cy="22" rx="9" ry="5" transform="rotate(-30 22 22)" fill="#FFFFFF" opacity="0.65" />
            {/* Green calyx/stem */}
            <path d="M 34 8 L 30 0 M 34 8 L 22 10 M 34 8 L 44 8 M 34 8 L 28 14 M 34 8 L 38 15" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* Fresh Golden Orange */}
          <g transform="translate(262, 190)">
            <circle cx="32" cy="32" r="28" fill="url(#orangeGrad)" />
            <ellipse cx="22" cy="22" rx="7" ry="4" transform="rotate(-30 22 22)" fill="#FFFFFF" opacity="0.55" />
            {/* Small leaf on orange */}
            <path d="M 32 6 Q 42 0 46 8 Q 38 12 32 6 Z" fill="#16A34A" />
          </g>

          {/* Green Apple / Pepper on right */}
          <g transform="translate(315, 185)">
            <circle cx="28" cy="28" r="26" fill="url(#broccoliGrad)" />
            <ellipse cx="20" cy="18" rx="7" ry="4" transform="rotate(-30 20 18)" fill="#FFFFFF" opacity="0.5" />
            <path d="M 28 4 L 30 -2" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <path d="M 30 -2 Q 38 -6 40 0 Q 34 4 30 -2 Z" fill="#22C55E" />
          </g>
        </g>

        {/* --- 3D OPEN CARDBOARD BOX --- */}
        <g id="box-structure">
          {/* Box Left Flap (tilted open) */}
          <path
            d="M 130 215 L 180 185 L 210 230 L 155 260 Z"
            fill="url(#boxFlapGrad)"
            stroke="#BA7944"
            strokeWidth="1.5"
          />

          {/* Box Right Flap (tilted open) */}
          <path
            d="M 385 205 L 435 225 L 395 265 L 345 240 Z"
            fill="url(#boxSideGrad)"
            stroke="#8C5523"
            strokeWidth="1.5"
          />

          {/* Box Front Flap (folded down forward) */}
          <path
            d="M 155 260 L 345 240 L 340 270 L 150 290 Z"
            fill="#EAC399"
            stroke="#C88E56"
            strokeWidth="1.5"
          />

          {/* Front Face of the Box */}
          <path
            d="M 150 285 L 340 265 L 335 385 L 155 400 Z"
            fill="url(#boxFrontGrad)"
            stroke="#B87B42"
            strokeWidth="1"
          />

          {/* Right Side Face of the Box */}
          <path
            d="M 340 265 L 415 245 L 405 355 L 335 385 Z"
            fill="url(#boxSideGrad)"
            stroke="#7A481B"
            strokeWidth="1"
          />

          {/* Inner Corner Shading */}
          <path d="M 155 400 L 335 385 L 335 388 L 155 402 Z" fill="#6B3E14" opacity="0.5" />

          {/* Branding Badge printed on box: "Good Food / Better Tomorrow" */}
          <g transform="translate(240, 315) rotate(-5.5)">
            <rect
              x="-60"
              y="-18"
              width="120"
              height="44"
              rx="6"
              fill="#FFFFFF"
              fillOpacity="0.18"
              stroke="#6B3E14"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Green Leaf Icon on box */}
            <path
              d="M -48 -2 C -48 -2 -46 -12 -36 -16 C -26 -20 -24 -18 -24 -18 C -24 -18 -26 -8 -36 -4 C -46 0 -48 -2 -48 -2 Z"
              fill="#075B2A"
            />
            <text
              x="-16"
              y="-1"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="14"
              fontWeight="900"
              fill="#42250B"
              letterSpacing="0.05em"
            >
              Good Food
            </text>
            <text
              x="-48"
              y="16"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="9"
              fontWeight="800"
              fill="#6B3E14"
              letterSpacing="0.08em"
            >
              Better Tomorrow
            </text>
          </g>

          {/* Barcode stamp on side */}
          <g transform="translate(365, 305) skewY(-8)">
            <rect x="0" y="0" width="28" height="18" fill="#FFFFFF" opacity="0.35" rx="2" />
            <line x1="4" y1="3" x2="4" y2="15" stroke="#42250B" strokeWidth="1.5" />
            <line x1="8" y1="3" x2="8" y2="15" stroke="#42250B" strokeWidth="2.5" />
            <line x1="13" y1="3" x2="13" y2="15" stroke="#42250B" strokeWidth="1" />
            <line x1="17" y1="3" x2="17" y2="15" stroke="#42250B" strokeWidth="3" />
            <line x1="23" y1="3" x2="23" y2="15" stroke="#42250B" strokeWidth="1.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * 3D Chef Character Avatar for Restaurant role
 */
export function ChefAvatar3D({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center p-1 bg-gradient-to-b from-[#E8F7EA] to-[#C8EED0] ring-4 ring-[#138A36]/25 shadow-lg select-none ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Soft circle background */}
        <circle cx="50" cy="50" r="46" fill="#D9F5DD" />
        
        {/* Chef Body / Coat */}
        <path d="M 20 95 C 20 75, 35 68, 50 68 C 65 68, 80 75, 80 95 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <path d="M 44 68 L 44 95 M 56 68 L 56 95" stroke="#E2E8F0" strokeWidth="2" />
        {/* Double breasted buttons */}
        <circle cx="47" cy="76" r="2.5" fill="#138A36" />
        <circle cx="53" cy="76" r="2.5" fill="#138A36" />
        <circle cx="47" cy="84" r="2.5" fill="#138A36" />
        <circle cx="53" cy="84" r="2.5" fill="#138A36" />
        {/* Green Neckerchief */}
        <path d="M 42 66 Q 50 74 58 66 Q 50 62 42 66 Z" fill="#138A36" />

        {/* Neck */}
        <rect x="44" y="55" width="12" height="12" rx="4" fill="#FDBA74" />

        {/* Head */}
        <circle cx="50" cy="46" r="16" fill="#FED7AA" />
        {/* Smiling Eyes */}
        <path d="M 42 45 Q 45 42 48 45" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 52 45 Q 55 42 58 45" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <circle cx="41" cy="49" r="2.5" fill="#F87171" opacity="0.6" />
        <circle cx="59" cy="49" r="2.5" fill="#F87171" opacity="0.6" />
        {/* Warm Smile */}
        <path d="M 46 51 Q 50 56 54 51" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Chef Moustache */}
        <path d="M 45 50 Q 50 48 55 50" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Chef Hat (Toque Blanche) */}
        <g id="chef-toque">
          <ellipse cx="50" cy="31" rx="14" ry="4" fill="#E2E8F0" />
          <path
            d="M 36 31 
               C 30 26, 30 14, 38 12 
               C 42 8, 48 8, 50 11 
               C 52 8, 58 8, 62 12 
               C 70 14, 70 26, 64 31 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* Hat Pleats */}
          <path d="M 44 14 Q 45 24 45 31 M 50 12 Q 50 22 50 31 M 56 14 Q 55 24 55 31" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Hat Band with green trim */}
          <rect x="36" y="28" width="28" height="6" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="37" y1="31" x2="63" y2="31" stroke="#138A36" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

/**
 * 3D NGO / Community Kitchen Avatar
 */
export function NgoAvatar3D({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center p-1 bg-gradient-to-b from-[#E8F7EA] to-[#C8EED0] ring-4 ring-[#138A36]/25 shadow-lg select-none ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="#D9F5DD" />
        
        {/* Shoulders / Green Community Vest */}
        <path d="M 20 95 C 20 75, 35 68, 50 68 C 65 68, 80 75, 80 95 Z" fill="#138A36" />
        <path d="M 42 68 L 50 82 L 58 68 Z" fill="#FFFFFF" />
        {/* Heart volunteer pin */}
        <circle cx="64" cy="78" r="6" fill="#FFFFFF" />
        <path d="M 64 76 Q 66 74 68 76 Q 66 80 64 81 Q 62 80 60 76 Q 62 74 64 76 Z" fill="#E11D48" />

        {/* Neck */}
        <rect x="44" y="55" width="12" height="12" rx="4" fill="#FED7AA" />

        {/* Head */}
        <circle cx="50" cy="46" r="16" fill="#FED7AA" />
        {/* Hair with side part */}
        <path d="M 34 42 C 34 32, 44 26, 50 26 C 58 26, 66 32, 66 42 C 64 37, 56 34, 46 36 Z" fill="#451A03" />

        {/* Modern Round Glasses */}
        <circle cx="43" cy="45" r="5.5" fill="none" stroke="#075B2A" strokeWidth="2" />
        <circle cx="57" cy="45" r="5.5" fill="none" stroke="#075B2A" strokeWidth="2" />
        <line x1="48.5" y1="45" x2="51.5" y2="45" stroke="#075B2A" strokeWidth="2" />

        {/* Eyes behind glasses */}
        <circle cx="43" cy="45" r="1.5" fill="#451A03" />
        <circle cx="57" cy="45" r="1.5" fill="#451A03" />

        {/* Smile */}
        <path d="M 46 53 Q 50 57 54 53" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

/**
 * 3D Volunteer / Delivery Hero Avatar
 */
export function VolunteerAvatar3D({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center p-1 bg-gradient-to-b from-[#E8F7EA] to-[#C8EED0] ring-4 ring-[#138A36]/25 shadow-lg select-none ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="#D9F5DD" />
        
        {/* Delivery Jacket (Vibrant Green with reflective straps) */}
        <path d="M 20 95 C 20 74, 35 67, 50 67 C 65 67, 80 74, 80 95 Z" fill="#075B2A" />
        <path d="M 32 72 L 34 95 M 68 72 L 66 95" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />
        {/* Delivery badge */}
        <rect x="44" y="74" width="12" height="15" rx="3" fill="#FFFFFF" />
        <circle cx="50" cy="78" r="2" fill="#138A36" />
        <line x1="47" y1="83" x2="53" y2="83" stroke="#138A36" strokeWidth="1.5" />

        {/* Neck */}
        <rect x="44" y="55" width="12" height="12" rx="4" fill="#FDBA74" />

        {/* Head */}
        <circle cx="50" cy="46" r="16" fill="#FDBA74" />
        {/* Determined smiling eyes */}
        <circle cx="43" cy="46" r="2" fill="#431407" />
        <circle cx="57" cy="46" r="2" fill="#431407" />
        <ellipse cx="40" cy="50" rx="3" ry="1.5" fill="#F87171" opacity="0.6" />
        <ellipse cx="60" cy="50" rx="3" ry="1.5" fill="#F87171" opacity="0.6" />
        <path d="M 45 53 Q 50 58 55 53" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Volunteer Cap (Green with visor pointing left) */}
        <path d="M 33 40 C 33 28, 67 28, 67 40 Z" fill="#138A36" />
        {/* Cap Visor */}
        <path d="M 28 41 Q 48 37 68 41 Q 72 43 70 45 Q 48 42 26 44 Z" fill="#075B2A" />
        {/* Leaf on cap */}
        <circle cx="50" cy="34" r="4.5" fill="#FFFFFF" />
        <path d="M 50 32 C 50 32 52 35 50 36 C 48 35 50 32 50 32 Z" fill="#138A36" />
      </svg>
    </div>
  );
}

/**
 * 3D Friendly Green AI Assistant Robot
 */
export function RobotAssistant3D({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-3xl flex items-center justify-center p-2 bg-gradient-to-tr from-[#C5EDCE] via-[#E8F7EA] to-[#FFFFFF] shadow-xl border border-white/80 select-none ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
        <defs>
          <radialGradient id="botHeadGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#D1F2D9" />
            <stop offset="100%" stopColor="#86D69B" />
          </radialGradient>
          <linearGradient id="visorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0B1B10" />
            <stop offset="100%" stopColor="#17251C" />
          </linearGradient>
        </defs>

        {/* Antenna with Leaf */}
        <line x1="50" y1="20" x2="50" y2="8" stroke="#138A36" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="50" cy="8" r="4.5" fill="#34D399" />
        <path d="M 50 7 C 50 7 57 2 62 6 C 60 11 50 7 50 7 Z" fill="#138A36" />

        {/* Robot Ears / Audio Sensors */}
        <rect x="18" y="38" width="6" height="16" rx="3" fill="#138A36" />
        <rect x="76" y="38" width="6" height="16" rx="3" fill="#138A36" />

        {/* Cute Rounded Head */}
        <rect
          x="22"
          y="18"
          width="56"
          height="52"
          rx="18"
          fill="url(#botHeadGrad)"
          stroke="#FFFFFF"
          strokeWidth="2"
        />

        {/* Dark Visor Display Screen */}
        <rect x="29" y="28" width="42" height="26" rx="10" fill="url(#visorGrad)" stroke="#138A36" strokeWidth="1.5" />

        {/* Glowing Expressive Cyan/Green Eyes */}
        <ellipse cx="40" cy="40" rx="5" ry="6" fill="#34D399" />
        <circle cx="42" cy="38" r="1.8" fill="#FFFFFF" />

        <ellipse cx="60" cy="40" rx="5" ry="6" fill="#34D399" />
        <circle cx="62" cy="38" r="1.8" fill="#FFFFFF" />

        {/* Cheerful Robot Mouth Indicator */}
        <path d="M 44 48 Q 50 52 56 48" stroke="#34D399" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Robot Torso / Chassis */}
        <path d="M 32 72 L 68 72 L 72 95 L 28 95 Z" fill="#E8F7EA" stroke="#A7E4B6" strokeWidth="2" />
        {/* Heart Rescue Meter */}
        <circle cx="50" cy="82" r="6" fill="#138A36" />
        <path d="M 50 79 Q 52 77 54 79 Q 52 83 50 85 Q 48 83 46 79 Q 48 77 50 79 Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/**
 * 3D Earth Globe with green continents and rescue foliage
 */
export function EarthGlobe3D({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center p-2 select-none ${className}`}
    >
      <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
        <defs>
          <radialGradient id="globeGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#A7F3D0" />
            <stop offset="70%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
          <linearGradient id="continentGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#15803D" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
        </defs>

        {/* Sphere Base */}
        <circle cx="60" cy="60" r="50" fill="url(#globeGrad)" />

        {/* Stylized Continents */}
        <path
          d="M 35 40 Q 45 35 55 42 Q 62 48 58 58 Q 50 68 38 65 Q 30 55 35 40 Z"
          fill="url(#continentGrad)"
          opacity="0.9"
        />
        <path
          d="M 68 32 Q 82 28 88 40 Q 92 52 82 60 Q 72 58 68 48 Q 66 38 68 32 Z"
          fill="url(#continentGrad)"
          opacity="0.9"
        />
        <path
          d="M 48 72 Q 62 70 66 82 Q 62 92 50 90 Q 42 85 48 72 Z"
          fill="url(#continentGrad)"
          opacity="0.9"
        />

        {/* 3D Sprout emerging from top */}
        <path d="M 60 18 Q 60 8 60 2" stroke="#138A36" strokeWidth="3" strokeLinecap="round" />
        <path d="M 60 5 C 60 5 68 0 72 7 C 68 11 60 5 60 5 Z" fill="#22C55E" />
        <path d="M 60 8 C 60 8 52 4 48 10 C 52 14 60 8 60 8 Z" fill="#15803D" />

        {/* Atmosphere Highlight Rim */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.4" />
      </svg>
    </div>
  );
}

/**
 * Realistic Food Thumbnail Illustrations for Veg Biryani, Idli & Sambar, Rice & Dal
 */
export function FoodThumbnailCard({
  dish,
  size = 72,
  className = "",
}: {
  dish: "biryani" | "idli" | "dal" | string;
  size?: number;
  className?: string;
}) {
  const norm = dish.toLowerCase();
  const isBiryani = norm.includes("biryani");
  const isIdli = norm.includes("idli") || norm.includes("sambar");

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-2xl overflow-hidden shadow-md ring-1 ring-slate-200/80 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center select-none ${className}`}
    >
      {isBiryani ? (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Black ceramic bowl */}
          <ellipse cx="50" cy="54" rx="42" ry="34" fill="#1E293B" />
          <ellipse cx="50" cy="50" rx="39" ry="30" fill="#334155" />
          {/* Saffron & Spiced Rice layer */}
          <ellipse cx="50" cy="48" rx="36" ry="27" fill="#F59E0B" />
          <path d="M 22 45 Q 38 32 54 44 Q 70 30 78 48 Q 50 68 22 45 Z" fill="#D97706" />
          {/* Fried onions & herb garnish */}
          <path d="M 36 42 Q 44 48 48 42 M 52 44 Q 60 48 64 43" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <circle cx="44" cy="46" r="3" fill="#16A34A" />
          <circle cx="56" cy="42" r="3.5" fill="#16A34A" />
          <circle cx="48" cy="52" r="2.5" fill="#DC2626" />
          <circle cx="58" cy="50" r="3" fill="#FEF08A" />
          {/* Paneer / Veg cube */}
          <rect x="36" y="47" width="9" height="7" rx="1.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
        </svg>
      ) : isIdli ? (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Traditional Plate / Thali */}
          <ellipse cx="50" cy="52" rx="42" ry="34" fill="#CBD5E1" />
          <ellipse cx="50" cy="50" rx="39" ry="31" fill="#E2E8F0" />
          {/* White soft steamed idlis */}
          <ellipse cx="38" cy="44" rx="17" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <ellipse cx="62" cy="44" rx="17" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <ellipse cx="50" cy="58" rx="18" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Bowl of red/orange sambar */}
          <circle cx="28" cy="66" r="14" fill="#B91C1C" stroke="#991B1B" strokeWidth="1" />
          <circle cx="28" cy="66" r="11" fill="#EA580C" />
          <circle cx="26" cy="64" r="2" fill="#15803D" />
          {/* Coconut chutney bowl */}
          <circle cx="72" cy="66" r="13" fill="#64748B" stroke="#475569" strokeWidth="1" />
          <circle cx="72" cy="66" r="10" fill="#F8FAFC" />
          <circle cx="71" cy="65" r="1.5" fill="#0F172A" />
          <circle cx="74" cy="67" r="1" fill="#16A34A" />
        </svg>
      ) : (
        /* Rice & Dal Tadka */
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <ellipse cx="50" cy="52" rx="42" ry="34" fill="#334155" />
          <ellipse cx="50" cy="50" rx="39" ry="31" fill="#475569" />
          {/* Half Fragrant Basmati Rice */}
          <path d="M 20 48 Q 35 25 50 48 Q 45 70 20 48 Z" fill="#FFFFFF" />
          <circle cx="32" cy="45" r="1.5" fill="#CBD5E1" />
          <circle cx="38" cy="50" r="1.5" fill="#CBD5E1" />
          {/* Half Rich Golden Yellow Dal Tadka */}
          <path d="M 50 48 Q 65 25 80 48 Q 65 72 50 48 Z" fill="#FBBF24" />
          <path d="M 54 44 Q 65 38 72 48" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="62" cy="52" r="3" fill="#15803D" />
          <circle cx="68" cy="46" r="2.5" fill="#78350F" />
        </svg>
      )}
    </div>
  );
}
