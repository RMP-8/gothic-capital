"use client";

import type { ReactNode } from "react";

/** A flat, straight-on monitor with a thin black bezel, slim stand and a soft shadow on the wall behind it. */
export default function MonitorFrame({
  x,
  y,
  w,
  h,
  shadow,
  spot,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  shadow: { dx: number; dy: number; blur: number; opacity: number };
  /** id for the practice coach to point at */
  spot?: string;
  children: ReactNode;
}) {
  const bezel = 6;
  const chin = 4;
  const neck = 26;
  return (
    <div className="absolute" style={{ left: x - bezel, top: y - bezel, width: w + bezel * 2, height: h + bezel * 2 + chin + neck + 10 }}>
      {/* shadow on the wall */}
      <div
        className="absolute inset-x-0 top-0 rounded-[6px] bg-[#2a2416]"
        style={{
          height: h + bezel * 2 + chin,
          transform: `translate(${shadow.dx}px, ${shadow.dy}px)`,
          filter: `blur(${shadow.blur}px)`,
          opacity: shadow.opacity,
          transition: "all 1s ease",
        }}
      />
      {/* stand: neck, then a flat elliptical base resting on the desk with a contact shadow */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: h + bezel * 2 + chin - 1, width: 44, height: neck + 2, background: "linear-gradient(90deg, #1f2328, #4a5058 50%, #1f2328)" }} />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{ top: h + bezel * 2 + chin + neck + 2, width: w * 0.44, height: 16, background: "radial-gradient(ellipse at center, rgba(40,32,18,0.4), rgba(40,32,18,0) 70%)", transform: `translate(calc(-50% + ${shadow.dx * 0.3}px), ${shadow.dy * 0.2}px)`, transition: "transform 1s ease" }}
      />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-[50%]" style={{ top: h + bezel * 2 + chin + neck - 4, width: w * 0.38, height: 14, background: "linear-gradient(#4a5058, #22262c)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }} />
      {/* bezel */}
      <div data-spot={spot} className="absolute inset-x-0 top-0 rounded-[6px] bg-[#111418]" style={{ height: h + bezel * 2 + chin, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }} />
      {/* screen */}
      <div className="absolute overflow-hidden rounded-[3px] bg-white" style={{ left: bezel, top: bezel, width: w, height: h, boxShadow: "0 0 24px rgba(255,255,255,0.35)" }}>
        {children}
      </div>
    </div>
  );
}
