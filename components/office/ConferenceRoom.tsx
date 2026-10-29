"use client";

import { MOODS, Skyline } from "./OfficeScene";

/** Glass conference room for the performance review, late-afternoon light, straight-on like the office. */
export function ConferenceRoom() {
  const m = MOODS.afternoon;
  const bottom = 660;
  return (
    <svg viewBox="0 0 1600 900" width="1600" height="900" className="absolute inset-0" aria-hidden>
      <defs>
        <linearGradient id="cr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f8fa" />
          <stop offset="1" stopColor="#e3e7ed" />
        </linearGradient>
        <linearGradient id="cr-table" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a4634" />
          <stop offset="0.6" stopColor="#47362a" />
          <stop offset="1" stopColor="#33261d" />
        </linearGradient>
        <linearGradient id="cr-tableSheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffd9a8" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cr-glassware" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#dfe6ee" stopOpacity="0.7" />
        </linearGradient>
        <filter id="cr-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <Skyline mood={m} bottom={bottom} idPrefix="cr" />
      {[266, 532, 800, 1068, 1334].map((x) => (
        <rect key={x} x={x - 4} y="0" width="8" height={bottom + 6} fill="#2b3340" />
      ))}
      <rect x="0" y="0" width="1600" height="6" fill="#2b3340" />

      {/* etched name on the glass, top left */}
      <text x="60" y="52" fontSize="13" fontWeight="600" letterSpacing="4" fill="#ffffff" fillOpacity="0.55">
        GOTHIC CAPITAL · CONFERENCE ROOM A
      </text>

      {/* wall band */}
      <rect x="0" y={bottom} width="1600" height="60" fill="url(#cr-wall)" />
      <rect x="0" y={bottom} width="1600" height="8" fill="#d6dbe3" />

      {/* conference table, straight on */}
      <rect x="0" y="720" width="1600" height="180" fill="url(#cr-table)" />
      <rect x="0" y="720" width="1600" height="4" fill="#ffffff" fillOpacity="0.25" />
      <rect x="0" y="724" width="1600" height="120" fill="url(#cr-tableSheen)" />
      <rect x="0" y="716" width="1600" height="6" fill="#2a1f17" fillOpacity="0.5" />

      {/* chairs along the far side, peeking above the table */}
      {[300, 800, 1300].map((cx) => (
        <g key={cx}>
          <rect x={cx - 70} y="612" width="140" height="110" rx="18" fill="#2f3640" />
          <rect x={cx - 60} y="622" width="120" height="90" rx="14" fill="#3b434e" />
        </g>
      ))}

      {/* carafe and two glasses, right side of the table */}
      <g>
        <ellipse cx="1390" cy="780" rx="60" ry="8" fill="#000000" fillOpacity="0.25" filter="url(#cr-soft)" />
        <path d="M1356 720 L1384 720 L1388 700 L1352 700 Z" fill="url(#cr-glassware)" />
        <path d="M1346 720 L1394 720 L1402 778 L1338 778 Z" fill="url(#cr-glassware)" />
        <rect x="1346" y="748" width="56" height="30" fill="#9fc0e2" fillOpacity="0.45" />
        <path d="M1416 732 L1446 732 L1442 776 L1420 776 Z" fill="url(#cr-glassware)" />
        <path d="M1456 732 L1486 732 L1482 776 L1460 776 Z" fill="url(#cr-glassware)" />
      </g>

      {/* warm late-afternoon light across the room */}
      <rect x="0" y={bottom} width="1600" height={900 - bottom} style={{ fill: m.roomTint, fillOpacity: 0.12 }} pointerEvents="none" />
    </svg>
  );
}

export default ConferenceRoom;
