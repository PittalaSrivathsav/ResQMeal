"use client";

import React, { useRef, useState, type ReactNode } from "react";

interface TiltCard3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
}

export function TiltCard3D({
  children,
  className = "",
  maxTilt = 15,
  scale = 1.05,
  glare = true,
}: TiltCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotX = (0.5 - y) * maxTilt * 2;
    const rotY = (x - 0.5) * maxTilt * 2;

    setTransform(
      `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
    );

    if (glare) {
      setGlarePos({
        x: x * 100,
        y: y * 100,
        opacity: 0.25,
      });
    }
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: "preserve-3d",
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      className={`relative will-change-transform ${className}`}
    >
      {/* 3D Children Content with Z-index depth */}
      <div style={{ transformStyle: "preserve-3d" }} className="w-full h-full">
        {children}
      </div>

      {/* Dynamic 3D Glare Reflection Layer */}
      {glare && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            opacity: glarePos.opacity,
            transition: "opacity 0.3s ease",
            background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 80%)`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Fixed 3D Background Elements
 * Stays permanently pinned in the viewport background behind all content
 * even when the user scrolls up and down.
 */
export function FloatingParticles3D() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
      {/* Fixed Ambient Glowing Radial Gradient Orbs */}
      <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#138A36]/12 via-[#34D399]/8 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 -left-32 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#10B981]/12 via-[#075B2A]/6 to-transparent blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#C8EED0]/20 to-transparent blur-3xl" />
      <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-[#A7F3D0]/15 to-transparent blur-3xl" />

      {/* Subtle Fixed Background Geometric / Organic Watermark Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#138A36]/5 opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-dashed border-[#138A36]/5 opacity-40 animate-spin" style={{ animationDuration: '180s' }} />

      {/* Fixed 3D Floating Leaf 1 (Top Left) */}
      <div className="absolute top-20 left-10 animate-float-slow">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          className="drop-shadow-[0_12px_22px_rgba(7,91,42,0.22)] opacity-85 transform rotate-12"
        >
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#fixedLeafGrad1)"
          />
          <path d="M12 36C22 26 36 12 40 8" stroke="#075B2A" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <defs>
            <linearGradient id="fixedLeafGrad1" x1="10" y1="38" x2="42" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#138A36" />
              <stop offset="1" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Fixed 3D Floating Leaf 2 (Top Right) */}
      <div className="absolute top-24 right-20 animate-float-reverse">
        <svg
          width="38"
          height="38"
          viewBox="0 0 48 48"
          fill="none"
          className="drop-shadow-[0_10px_20px_rgba(7,91,42,0.18)] opacity-70 transform rotate-45"
        >
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#fixedLeafGrad2)"
          />
          <defs>
            <linearGradient id="fixedLeafGrad2" x1="8" y1="40" x2="44" y2="6" gradientUnits="userSpaceOnUse">
              <stop stopColor="#075B2A" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Fixed 3D Floating Leaf 3 (Mid Right) */}
      <div className="absolute top-1/2 right-12 -translate-y-1/2 animate-float-slow">
        <svg
          width="54"
          height="54"
          viewBox="0 0 48 48"
          fill="none"
          className="drop-shadow-[0_16px_28px_rgba(7,91,42,0.24)] opacity-85 transform -rotate-45"
        >
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#fixedLeafGrad2)"
          />
        </svg>
      </div>

      {/* Fixed 3D Floating Leaf 4 (Mid Left) */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 animate-float-reverse">
        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          className="drop-shadow-[0_10px_18px_rgba(7,91,42,0.2)] opacity-75 transform -rotate-12"
        >
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#fixedLeafGrad1)"
          />
        </svg>
      </div>

      {/* Fixed 3D Floating Leaf 5 (Bottom Left) */}
      <div className="absolute bottom-20 left-16 animate-float-slow">
        <svg
          width="42"
          height="42"
          viewBox="0 0 48 48"
          fill="none"
          className="drop-shadow-[0_12px_22px_rgba(7,91,42,0.2)] opacity-80 transform rotate-30"
        >
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#fixedLeafGrad1)"
          />
        </svg>
      </div>

      {/* Fixed 3D Floating Leaf 6 (Bottom Right) */}
      <div className="absolute bottom-16 right-20 animate-float-reverse">
        <svg
          width="46"
          height="46"
          viewBox="0 0 48 48"
          fill="none"
          className="drop-shadow-[0_14px_24px_rgba(7,91,42,0.2)] opacity-75 transform -rotate-30"
        >
          <path
            d="M8 40C8 40 10 24 26 14C42 4 44 6 44 6C44 6 42 22 26 32C10 42 8 40 8 40Z"
            fill="url(#fixedLeafGrad2)"
          />
        </svg>
      </div>

      {/* Subtle Floating Organic Depth Particles */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-[#138A36]/25 blur-[1px] animate-float-slow" />
      <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 rounded-full bg-[#10B981]/30 blur-[1px] animate-float-reverse" />
      <div className="absolute bottom-1/3 left-1/5 w-2 h-2 rounded-full bg-[#075B2A]/20 blur-[0.5px] animate-float-slow" />
      <div className="absolute top-1/5 right-1/4 w-3.5 h-3.5 rounded-full bg-[#34D399]/30 blur-[1px] animate-float-reverse" />
    </div>
  );
}
