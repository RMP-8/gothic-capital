"use client";

/**
 * Eleanor Vance, seated across the conference table. Flat illustration in the scene's style,
 * drawn in stage coordinates (1600x900) with her torso hidden below the table at y=720.
 */
export default function Eleanor({ x = 1330 }: { x?: number }) {
  const skin = "#d8a98a";
  const skinShade = "#c28f70";
  const hair = "#3b2a22";
  const blazer = "#012169";
  const lapel = "#0b2f85";
  return (
    <g transform={`translate(${x} 0)`}>
      <defs>
        <linearGradient id="el-blazer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lapel} />
          <stop offset="1" stopColor={blazer} />
        </linearGradient>
        <radialGradient id="el-cheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e39a8a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#e39a8a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* chair back */}
      <rect x="-150" y="430" width="300" height="300" rx="34" fill="#2f3640" />
      <rect x="-136" y="444" width="272" height="280" rx="28" fill="#3b434e" />

      {/* torso: blazer */}
      <path d="M-128 730 C-128 600 -90 548 -30 532 L0 540 L30 532 C90 548 128 600 128 730 Z" fill="url(#el-blazer)" />
      {/* blouse */}
      <path d="M-30 532 L0 626 L30 532 L18 526 L0 548 L-18 526 Z" fill="#ffffff" />
      {/* lapels */}
      <path d="M-30 532 L-64 650 L-6 600 Z" fill={lapel} />
      <path d="M30 532 L64 650 L6 600 Z" fill={lapel} />
      {/* arms resting on the table */}
      <path d="M-128 650 C-150 690 -150 720 -140 740 L-60 740 C-70 712 -80 690 -96 660 Z" fill={blazer} />
      <path d="M128 650 C150 690 150 720 140 740 L60 740 C70 712 80 690 96 660 Z" fill={blazer} />
      {/* hands, folded */}
      <ellipse cx="-22" cy="728" rx="34" ry="14" fill={skin} />
      <ellipse cx="22" cy="724" rx="34" ry="14" fill={skinShade} />
      <ellipse cx="18" cy="722" rx="30" ry="12" fill={skin} />

      {/* neck */}
      <rect x="-22" y="470" width="44" height="70" rx="14" fill={skinShade} />
      {/* hair behind the head */}
      <ellipse cx="0" cy="398" rx="78" ry="86" fill={hair} />
      <circle cx="58" cy="452" r="26" fill={hair} />
      {/* head */}
      <ellipse cx="0" cy="410" rx="62" ry="74" fill={skin} />
      {/* hair front, swept to the side */}
      <path d="M-62 400 C-64 330 -10 318 30 330 C62 340 66 380 62 400 C50 372 30 366 10 374 C-10 382 -22 398 -34 410 C-44 390 -56 388 -62 400 Z" fill={hair} />
      {/* ears */}
      <ellipse cx="-62" cy="416" rx="9" ry="13" fill={skinShade} />
      <ellipse cx="62" cy="416" rx="9" ry="13" fill={skinShade} />
      {/* earrings */}
      <circle cx="-63" cy="430" r="3.5" fill="#00539b" />
      <circle cx="63" cy="430" r="3.5" fill="#00539b" />
      {/* brows */}
      <path d="M-40 396 C-32 388 -16 388 -8 394" fill="none" stroke={hair} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M8 394 C16 388 32 388 40 396" fill="none" stroke={hair} strokeWidth="3.5" strokeLinecap="round" />
      {/* eyes */}
      <ellipse cx="-24" cy="412" rx="6" ry="6.5" fill="#2b1d16" />
      <ellipse cx="24" cy="412" rx="6" ry="6.5" fill="#2b1d16" />
      <circle cx="-22" cy="409" r="1.8" fill="#ffffff" />
      <circle cx="26" cy="409" r="1.8" fill="#ffffff" />
      {/* nose + cheeks */}
      <path d="M-2 418 C-8 432 -8 440 2 442" fill="none" stroke={skinShade} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="-36" cy="438" r="16" fill="url(#el-cheek)" />
      <circle cx="36" cy="438" r="16" fill="url(#el-cheek)" />
      {/* a warm, slightly knowing smile */}
      <path d="M-20 456 C-10 468 10 468 20 456" fill="none" stroke="#a9604f" strokeWidth="3" strokeLinecap="round" />
      {/* glasses: thin frames */}
      <circle cx="-24" cy="412" r="15" fill="none" stroke="#1f2328" strokeWidth="1.8" />
      <circle cx="24" cy="412" r="15" fill="none" stroke="#1f2328" strokeWidth="1.8" />
      <line x1="-9" y1="412" x2="9" y2="412" stroke="#1f2328" strokeWidth="1.8" />
      {/* table in front of her hands */}
      <rect x="-200" y="736" width="400" height="30" fill="#47362a" />
    </g>
  );
}
