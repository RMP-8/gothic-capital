"use client";

import { motion } from "framer-motion";
import type { Rect } from "@/lib/layout";

/** Dims the stage except for one rectangle. Purely visual: clicks still go through. */
export default function Spotlight({ rect }: { rect: Rect | null }) {
  const r = rect ?? { x: -40, y: -40, w: 1680, h: 980 };
  return (
    <motion.div
      className="pointer-events-none absolute z-30 rounded-[10px]"
      initial={false}
      animate={{ left: r.x - 8, top: r.y - 8, width: r.w + 16, height: r.h + 16, opacity: rect ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 24 }}
      style={{
        boxShadow: "0 0 0 4000px rgba(1, 10, 36, 0.55), 0 0 0 3px rgba(27,111,194,0.9), 0 0 24px 6px rgba(27,111,194,0.45)",
      }}
    />
  );
}
