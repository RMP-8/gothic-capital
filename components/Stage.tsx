"use client";

import { useEffect, useState } from "react";

export const STAGE_W = 1600;
export const STAGE_H = 900;

/** Fixed 1600x900 design surface, scaled to fit the viewport. Children use absolute stage coordinates. */
export default function Stage({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () =>
      setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#010d2e]">
      <div
        data-stage
        className="absolute left-1/2 top-1/2"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
