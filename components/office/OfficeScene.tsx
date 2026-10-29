"use client";

export type TimeOfDay = "morning" | "midday" | "afternoon";
export type PlantMood = "perky" | "neutral" | "droopy";

export interface OfficeSceneProps {
  timeOfDay: TimeOfDay;
  plantMood: PlantMood;
  /** 0..1, how fresh the coffee is */
  coffeeLevel: number;
  /** text on the desk nameplate, e.g. "Junior PM" */
  title: string;
}

/* ---------- geometry (1600 x 900 stage) ---------- */
export const WINDOW_BOTTOM = 600;
export const DESK_TOP = 750;
const HORIZON = 500; // eye level: far skyline rests here

/* ---------- light moods ---------- */
export interface Mood {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  sun: { x: number; y: number; r: number; opacity: number };
  /** -1 sun on the left, 0 overhead, +1 sun on the right */
  dir: -1 | 0 | 1;
  /** shadow offset for objects in the room */
  shadow: { dx: number; dy: number; blur: number; opacity: number };
  far: string;
  mid: string;
  near: string;
  lit: string;
  litOpacity: number;
  glare: number;
  roomTint: string;
  roomTintOpacity: number;
}

export const MOODS: Record<TimeOfDay, Mood> = {
  morning: {
    skyTop: "#9fc1ee",
    skyMid: "#cfe0f7",
    skyHorizon: "#f8dcc4",
    sun: { x: 150, y: 430, r: 46, opacity: 0.85 },
    dir: -1,
    shadow: { dx: 26, dy: 8, blur: 10, opacity: 0.22 },
    far: "#c8d6e8",
    mid: "#93a4bd",
    near: "#6d8099",
    lit: "#ffe3c2",
    litOpacity: 0.55,
    glare: 0.16,
    roomTint: "#ffd8b8",
    roomTintOpacity: 0.12,
  },
  midday: {
    skyTop: "#5ea3ec",
    skyMid: "#a9cdf5",
    skyHorizon: "#e4f0fb",
    sun: { x: 1120, y: 40, r: 40, opacity: 0.9 },
    dir: 0,
    shadow: { dx: 0, dy: 10, blur: 6, opacity: 0.28 },
    far: "#bccbe0",
    mid: "#8798b3",
    near: "#5f7390",
    lit: "#ffffff",
    litOpacity: 0.3,
    glare: 0.1,
    roomTint: "#ffffff",
    roomTintOpacity: 0,
  },
  afternoon: {
    skyTop: "#e9a964",
    skyMid: "#f6cb92",
    skyHorizon: "#ffe6bf",
    sun: { x: 1450, y: 440, r: 52, opacity: 0.95 },
    dir: 1,
    shadow: { dx: -30, dy: 8, blur: 12, opacity: 0.24 },
    far: "#dcc3ae",
    mid: "#a58e7e",
    near: "#7a6657",
    lit: "#ffc880",
    litOpacity: 0.7,
    glare: 0.2,
    roomTint: "#ffb974",
    roomTintOpacity: 0.1,
  },
};

const T1 = { transition: "all 1s ease" };

/* ---------- deterministic skyline ---------- */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
interface Tower {
  x: number;
  w: number;
  top: number;
  cap: number; // setback width fraction (0 = none)
}
function towers(seed: number, x0: number, x1: number, base: number, minH: number, maxH: number, minW: number, maxW: number, gap: number): Tower[] {
  const r = rng(seed);
  const out: Tower[] = [];
  let x = x0;
  while (x < x1) {
    const w = minW + r() * (maxW - minW);
    const h = minH + r() * (maxH - minH);
    out.push({ x, w, top: base - h, cap: r() > 0.5 ? 0.3 + r() * 0.4 : 0 });
    x += w + gap * (0.4 + r());
  }
  return out;
}
const FAR = towers(11, -20, 1620, HORIZON, 40, 170, 30, 70, 20);
const MID = towers(23, -10, 1610, WINDOW_BOTTOM, 120, 330, 50, 120, 60);
const NEAR = towers(37, -40, 1640, WINDOW_BOTTOM + 40, 60, 130, 90, 220, 50);

/** Lit face strip on the sun side of a block. */
function Lit({ x, w, y, h, mood }: { x: number; w: number; y: number; h: number; mood: Mood }) {
  const sw = Math.max(4, w * 0.18);
  const lx = mood.dir < 0 ? x : mood.dir > 0 ? x + w - sw : x;
  const lw = mood.dir === 0 ? w : sw;
  const lh = mood.dir === 0 ? Math.min(6, h) : h;
  return <rect x={lx} y={y} width={lw} height={lh} style={{ fill: mood.lit, fillOpacity: mood.litOpacity, ...T1 }} />;
}


/** The window: sky, three skyline layers, glass glare/tint and frames. Shared by the office and the conference room. */
export function Skyline({ mood: m, bottom, idPrefix }: { mood: Mood; bottom: number; idPrefix: string }) {
  const glareX = m.dir < 0 ? 260 : m.dir > 0 ? 1060 : 660;
  const id = (k: string) => `${idPrefix}-${k}`;
  const url = (k: string) => `url(#${idPrefix}-${k})`;
  return (
    <g>
      <defs>
        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: m.skyTop, ...T1 }} />
          <stop offset="0.6" style={{ stopColor: m.skyMid, ...T1 }} />
          <stop offset="1" style={{ stopColor: m.skyHorizon, ...T1 }} />
        </linearGradient>
        <radialGradient id={id("sun")}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#fff6dc" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff2c8" stopOpacity="0" />
        </radialGradient>
        <pattern id={id("win")} width="14" height="18" patternUnits="userSpaceOnUse">
          <rect x="3" y="4" width="7" height="9" fill="#ffffff" fillOpacity="0.22" />
        </pattern>
        <pattern id={id("winNear")} width="18" height="22" patternUnits="userSpaceOnUse">
          <rect x="4" y="5" width="9" height="11" fill="#ffffff" fillOpacity="0.26" />
        </pattern>
        <filter id={id("blurFar")} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id={id("blurMid")} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        <clipPath id={id("glass")}>
          <rect x="0" y="0" width="1600" height={bottom} />
        </clipPath>
      </defs>
      {/* ============ 1. sky ============ */}
      <g clipPath={url("glass")}>
        <rect x="0" y="0" width="1600" height={bottom} fill={url("sky")} />
        <circle r={m.sun.r * 3.2} fill={url("sun")} style={{ cx: m.sun.x, cy: m.sun.y, opacity: m.sun.opacity * 0.8, ...T1 } as React.CSSProperties} cx={m.sun.x} cy={m.sun.y} />
        <circle r={m.sun.r} fill="#fffaf0" cx={m.sun.x} cy={m.sun.y} style={{ opacity: m.sun.opacity, ...T1 }} />

        {/* ============ 2. far skyline: pale, blurred ============ */}
        <g filter={url("blurFar")}>
          {FAR.map((t, i) => (
            <rect key={`f${i}`} x={t.x} y={t.top} width={t.w} height={HORIZON - t.top + 120} style={{ fill: m.far, ...T1 }} />
          ))}
          <rect x="0" y={HORIZON - 10} width="1600" height="140" fill={url("sky")} opacity="0.5" />
        </g>

        {/* ============ 3. mid skyline: sharper, window grids, landmark shapes ============ */}
        <g filter={url("blurMid")}>
          {MID.map((t, i) => (
            <g key={`m${i}`}>
              {t.cap > 0 && (
                <rect x={t.x + (t.w * (1 - t.cap)) / 2} y={t.top - 28} width={t.w * t.cap} height={30} style={{ fill: m.mid, ...T1 }} />
              )}
              <rect x={t.x} y={t.top} width={t.w} height={bottom - t.top} style={{ fill: m.mid, ...T1 }} />
              <rect x={t.x} y={t.top} width={t.w} height={bottom - t.top} fill={url("win")} />
              <Lit x={t.x} w={t.w} y={t.top} h={bottom - t.top} mood={m} />
            </g>
          ))}
          {/* Art Deco stepped spire (left of center) */}
          <g>
            {[
              [440, 120, 300],
              [454, 92, 230],
              [468, 64, 170],
              [480, 40, 120],
              [490, 20, 80],
            ].map(([x, w, top], i) => (
              <rect key={`deco${i}`} x={x} y={top} width={w} height={bottom - top} style={{ fill: m.mid, ...T1 }} />
            ))}
            <rect x="498" y="20" width="4" height="60" style={{ fill: m.near, ...T1 }} />
            <rect x="440" y="300" width="120" height="300" fill={url("win")} />
            <Lit x={440} w={120} y={300} h={300} mood={m} />
            <Lit x={454} w={92} y={230} h={70} mood={m} />
            <Lit x={468} w={64} y={170} h={60} mood={m} />
          </g>
          {/* slab tower with crown (right of center) */}
          <g>
            <rect x="1040" y="150" width="150" height="450" style={{ fill: m.mid, ...T1 }} />
            <rect x="1040" y="150" width="150" height="450" fill={url("win")} />
            <polygon points="1040,150 1115,112 1190,150" style={{ fill: m.near, ...T1 }} />
            <rect x="1113" y="60" width="4" height="54" style={{ fill: m.near, ...T1 }} />
            <Lit x={1040} w={150} y={150} h={450} mood={m} />
          </g>
        </g>

        {/* ============ 4. near rooftops: sharp, just below eye level ============ */}
        {NEAR.map((t, i) => (
          <g key={`n${i}`}>
            <rect x={t.x} y={t.top} width={t.w} height={bottom + 40 - t.top} style={{ fill: m.near, ...T1 }} />
            <rect x={t.x} y={t.top + 10} width={t.w} height={bottom - t.top} fill={url("winNear")} />
            <rect x={t.x} y={t.top} width={t.w} height={5} fill="#ffffff" fillOpacity="0.35" />
            <Lit x={t.x} w={t.w} y={t.top} h={bottom + 40 - t.top} mood={m} />
            {i % 3 === 0 && (
              <g>
                <rect x={t.x + t.w * 0.25} y={t.top - 34} width={26} height={34} rx={3} style={{ fill: m.near, ...T1 }} />
                <polygon points={`${t.x + t.w * 0.25 - 3},${t.top - 34} ${t.x + t.w * 0.25 + 13},${t.top - 46} ${t.x + t.w * 0.25 + 29},${t.top - 34}`} style={{ fill: m.near, ...T1 }} />
              </g>
            )}
            {i % 3 === 1 && <rect x={t.x + t.w * 0.55} y={t.top - 14} width={34} height={14} style={{ fill: m.near, ...T1 }} />}
          </g>
        ))}

        {/* ============ 5. glass: glare, tint, frames ============ */}
        <polygon
          points={`${glareX},0 ${glareX + 260},0 ${glareX - 140},${bottom} ${glareX - 400},${bottom}`}
          style={{ fill: "#ffffff", fillOpacity: m.glare, ...T1 }}
        />
        <rect x="0" y="0" width="1600" height={bottom} style={{ fill: m.roomTint, fillOpacity: m.roomTintOpacity * 0.5, ...T1 }} />
      </g>
      {[320, 640, 960, 1280].map((x) => (
        <rect key={x} x={x - 4} y="0" width="8" height={bottom + 6} fill="#2b3340" />
      ))}
      <rect x="0" y="0" width="1600" height="6" fill="#2b3340" />

    </g>
  );
}

export function OfficeScene({ timeOfDay, plantMood, coffeeLevel, title }: OfficeSceneProps) {
  const m = MOODS[timeOfDay];
  const level = Math.max(0, Math.min(1, coffeeLevel));
  const leafTilt = plantMood === "perky" ? -14 : plantMood === "droopy" ? 22 : 0;
  const leafFill = plantMood === "perky" ? "#4a9a66" : plantMood === "droopy" ? "#5f7a5a" : "#4f8a60";
  const sh = m.shadow;
  return (
    <svg viewBox="0 0 1600 900" width="1600" height="900" className="absolute inset-0" aria-hidden>
      <defs>
        <linearGradient id="os-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fafbfc" />
          <stop offset="1" stopColor="#e4e8ee" />
        </linearGradient>
        <linearGradient id="os-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ebdfc8" />
          <stop offset="0.75" stopColor="#dccbaa" />
          <stop offset="1" stopColor="#c9b48d" />
        </linearGradient>
        <linearGradient id="os-pot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9cfd8" />
          <stop offset="0.5" stopColor="#eef1f5" />
          <stop offset="1" stopColor="#b9c0ca" />
        </linearGradient>
        <linearGradient id="os-cup" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f3f4f6" />
          <stop offset="1" stopColor="#cfd4db" />
        </linearGradient>
        <linearGradient id="os-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#01205f" />
          <stop offset="0.5" stopColor="#0d3a8f" />
          <stop offset="1" stopColor="#01205f" />
        </linearGradient>
        <radialGradient id="os-lampGlow" cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#ffd78a" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffd78a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="os-plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b3b8a" />
          <stop offset="1" stopColor="#012169" />
        </linearGradient>
        <filter id="os-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={sh.blur} />
        </filter>
        <filter id="os-softer" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <style>{`
          @keyframes os-steam { 0% { transform: translateY(0) scaleX(1); opacity: 0; } 25% { opacity: .5; } 100% { transform: translateY(-26px) scaleX(1.4); opacity: 0; } }
          .os-steam { animation: os-steam 3s ease-out infinite; transform-box: fill-box; transform-origin: center bottom; }
          .os-steam.b { animation-delay: 1.3s; }
        `}</style>
      </defs>

      <Skyline mood={m} bottom={WINDOW_BOTTOM} idPrefix="os" />

      {/* ============ 6. wall band and desk ============ */}
      <rect x="0" y={WINDOW_BOTTOM} width="1600" height={DESK_TOP - WINDOW_BOTTOM} fill="url(#os-wall)" />
      <rect x="0" y={WINDOW_BOTTOM} width="1600" height="10" fill="#d6dbe3" />
      <rect x="0" y={WINDOW_BOTTOM + 10} width="1600" height="3" fill="#ffffff" fillOpacity="0.8" />
      <rect x="0" y={DESK_TOP} width="1600" height={900 - DESK_TOP} fill="url(#os-desk)" />
      <rect x="0" y={DESK_TOP} width="1600" height="3" fill="#fff7e8" fillOpacity="0.9" />
      <rect x="0" y={DESK_TOP - 3} width="1600" height="3" fill="#7a6a4e" fillOpacity="0.25" />
      {/* front edge */}
      <rect x="0" y="880" width="1600" height="20" fill="#a98f67" />
      <rect x="0" y="878" width="1600" height="3" fill="#6b5a3e" fillOpacity="0.5" />

      {/* ============ 7. desk items ============ */}
      {/* plant, on the desk at the front left */}
      <g>
        <ellipse cx={160 + sh.dx * 0.6} cy={870 + sh.dy * 0.4} rx={44} ry={7} fill="#4a3b22" style={{ opacity: sh.opacity, ...T1 }} filter="url(#os-softer)" />
        <g style={{ transformBox: "fill-box", transformOrigin: "50% 100%", transform: `rotate(${leafTilt * 0.15}deg)`, transition: "transform 1.2s ease" } as React.CSSProperties}>
          {[-34, -17, 0, 17, 34].map((dx, i) => (
            <path
              key={i}
              d={`M160 822 C ${160 + dx * 0.6} ${792 + Math.abs(dx) * 0.4} ${160 + dx * 1.4} ${770 + Math.abs(dx) * 0.5} ${160 + dx * 2.1} ${744 + Math.abs(dx) * 1.1}`}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              style={{ stroke: leafFill, transformBox: "fill-box", transformOrigin: "50% 100%", transform: `rotate(${(leafTilt * dx) / 34}deg)`, transition: "transform 1.2s ease, stroke 1.2s ease" } as React.CSSProperties}
            />
          ))}
        </g>
        <polygon points="128,820 192,820 184,868 136,868" fill="url(#os-pot)" />
        <rect x="126" y="816" width="68" height="8" rx="2" fill="#dfe3e9" />
      </g>

      {/* nameplate, left of the keyboard */}
      <g>
        <rect x={296 + sh.dx * 0.3} y={856 + sh.dy * 0.3} width="170" height="8" fill="#4a3b22" style={{ opacity: sh.opacity, ...T1 }} filter="url(#os-softer)" />
        <rect x="294" y="818" width="172" height="42" rx="3" fill="url(#os-plate)" />
        <rect x="294" y="818" width="172" height="42" rx="3" fill="none" stroke="#c9d1db" strokeWidth="1.5" />
        <rect x="294" y="858" width="172" height="4" fill="#9aa3b1" />
        <text x="380" y="845" textAnchor="middle" fontSize={title.length > 14 ? 13 : 16} fontWeight="600" letterSpacing="1.5" fill="#ffffff" style={{ fontVariant: "small-caps" }}>
          {title}
        </text>
      </g>

      {/* coffee cup, right of the keyboard: ~ a tenth of a monitor tall */}
      <g>
        <ellipse cx={1166 + sh.dx * 0.4} cy={866 + sh.dy * 0.3} rx={24} ry={4} fill="#4a3b22" style={{ opacity: sh.opacity, ...T1 }} filter="url(#os-softer)" />
        <path d="M1182 838 Q1196 838 1196 850 Q1196 862 1182 862" fill="none" stroke="#dfe3e8" strokeWidth="6" strokeLinecap="round" />
        <path d="M1182 838 Q1196 838 1196 850 Q1196 862 1182 862" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M1148 832 L1184 832 L1180 866 Q1166 870 1152 866 Z" fill="url(#os-cup)" />
        <rect x="1148" y="832" width="36" height="4" fill="#012169" />
        <ellipse cx="1166" cy="832" rx="18" ry="3" fill="#f7f8fa" stroke="#c6ccd5" strokeWidth="1" />
        {level > 0.3 && (
          <g>
            <path className="os-steam" d="M1160 826 C1155 816 1165 814 1160 804" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <path className="os-steam b" d="M1172 826 C1167 816 1177 814 1172 804" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </g>

      {/* desk lamp, right margin */}
      <g>
        <ellipse cx={1565 + sh.dx * 0.8} cy={792 + sh.dy * 0.4} rx={46} ry={7} fill="#4a3b22" style={{ opacity: sh.opacity, ...T1 }} filter="url(#os-softer)" />
        <ellipse cx="1565" cy="788" rx="42" ry="7" fill="#2b3340" />
        <rect x="1561" y="600" width="8" height="190" fill="#3a4350" />
        <rect x="1528" y="596" width="74" height="8" rx="2" fill="#3a4350" />
        <ellipse cx="1565" cy="600" rx="46" ry="6" fill="#2b3340" />
        <polygon points="1524,560 1606,560 1618,600 1512,600" fill="url(#os-shade)" />
        <polygon points="1512,600 1618,600 1670,760 1460,760" fill="url(#os-lampGlow)" style={{ opacity: timeOfDay === "afternoon" ? 1 : 0, ...T1 }} />
      </g>

      {/* room light tint */}
      <rect x="0" y={WINDOW_BOTTOM} width="1600" height={900 - WINDOW_BOTTOM} style={{ fill: m.roomTint, fillOpacity: m.roomTintOpacity, ...T1 }} pointerEvents="none" />
    </svg>
  );
}

export default OfficeScene;
