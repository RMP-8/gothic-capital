"use client";

import type { ReactNode } from "react";

/** A flat, straight-on monitor with a thin black bezel, slim stand and a soft shadow on the wall behind it. */
export default function MonitorFrame({
  x,
  y,
  w,
  h,
  shadow,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  shadow: { dx: number; dy: number; blur: number; opacity: number };
  children: ReactNode;
}) {
  const bezel = 6;
  const chin = 4;
  const neck = 22;
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
      {/* stand */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: h + bezel * 2 + chin - 1, width: 46, height: neck + 2, background: "linear-gradient(90deg, #1f2328, #3a3f46 50%, #1f2328)" }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-[3px]" style={{ top: h + bezel * 2 + chin + neck, width: w * 0.34, height: 10, background: "linear-gradient(#3a3f46, #1f2328)" }} />
      {/* bezel */}
      <div className="absolute inset-x-0 top-0 rounded-[6px] bg-[#111418]" style={{ height: h + bezel * 2 + chin, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }} />
      {/* screen */}
      <div className="absolute overflow-hidden rounded-[3px] bg-navy-deep" style={{ left: bezel, top: bezel, width: w, height: h }}>
        {children}
      </div>
    </div>
  );
}
