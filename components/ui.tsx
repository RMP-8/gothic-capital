"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "gain" | "loss";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-royal hover:bg-royal-bright text-white shadow-[0_2px_12px_rgba(0,83,155,0.45)]",
  ghost: "bg-white/5 hover:bg-white/10 text-silver border border-white/10",
  gain: "bg-gain/20 hover:bg-gain/30 text-gain border border-gain/40",
  loss: "bg-loss/20 hover:bg-loss/30 text-loss border border-loss/40",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={`rounded-md px-3 py-1.5 text-[13px] font-medium tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** A monitor screen: positioned in stage coordinates, dark glass with a subtle header. */
export function Monitor({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden bg-navy-deep text-white"
      style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)" }}
    >
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-silver/80">{title}</span>
        {right}
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "sm",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-md border border-white/10 bg-white/5 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded px-2 ${size === "sm" ? "py-0.5 text-[12px]" : "py-1 text-[13px]"} font-medium transition-colors ${
            value === o.value ? "bg-royal text-white" : "text-silver/80 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Overlay({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#0b1a3d]/45 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-navy-panel/95 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)] ${className}`}
    >
      {children}
    </div>
  );
}

export function FounderAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-royal-bright to-royal text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, fontWeight: 600, letterSpacing: "0.02em" }}
      aria-hidden
    >
      EV
    </div>
  );
}
