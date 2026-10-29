"use client";

import { Button, Segmented } from "@/components/ui";

export type Speed = 1 | 2 | 4;

export interface ControlsProps {
  playing: boolean;
  finished: boolean;
  /** Practice round: no auto-play */
  practice?: boolean;
  autoplay: boolean;
  speed: Speed;
  sound: boolean;
  onNext: () => void;
  onSkip: () => void;
  onToggleAutoplay: () => void;
  onSpeed: (s: Speed) => void;
  onToggleSound: () => void;
  onAskFounder: () => void;
  onReview: () => void;
}

export default function Controls(p: ControlsProps) {
  return (
    <div
      className="absolute rounded-[12px]"
      style={{
        left: 480,
        top: 796,
        width: 640,
        height: 64,
        background: "linear-gradient(180deg, #eceff3 0%, #d5dae1 60%, #b9c0ca 100%)",
        boxShadow: "0 14px 24px rgba(40,30,12,0.28), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 0 rgba(0,0,0,0.12)",
      }}
    >
      {/* function-key row */}
      <div className="absolute left-2.5 right-2.5 top-1.5 grid grid-cols-[repeat(20,1fr)] gap-[3px]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-[6px] rounded-[2px] bg-[#30353c] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
        ))}
      </div>
      {/* key deck with the real controls */}
      <div
        className="absolute left-2.5 right-2.5 flex items-center gap-1.5 rounded-[6px] px-2 text-white"
        style={{ top: 13, height: 46, background: "linear-gradient(180deg, #2e333a, #22262c)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
      >
        {p.finished ? (
          <>
            <span className="text-[12px] text-silver">Five years are done. Eleanor is waiting in the conference room.</span>
            <Button className="ml-auto px-4 py-1.5 text-[13px] whitespace-nowrap" onClick={p.onReview}>
              Go to your review
            </Button>
          </>
        ) : (
          <>
            <Button data-spot="next" className="px-3 py-1.5 text-[13px] whitespace-nowrap" disabled={!p.playing} onClick={p.onNext}>
              Next week →
            </Button>
            <Button data-spot="skip" variant="ghost" className="px-2.5 py-1.5 text-[12px] whitespace-nowrap" disabled={!p.playing} onClick={p.onSkip}>
              Skip 4 weeks
            </Button>
            <div className="mx-0.5 h-5 w-px bg-white/10" />
            <Button variant={p.autoplay ? "loss" : "ghost"} className="px-2.5 py-1.5 text-[12px] whitespace-nowrap" disabled={!p.playing || p.practice} title={p.practice ? "Auto-play is off during practice" : undefined} onClick={p.onToggleAutoplay}>
              {p.autoplay ? "■ Pause" : "▶ Auto-play"}
            </Button>
            <Segmented
              value={String(p.speed) as "1" | "2" | "4"}
              onChange={(v) => p.onSpeed(Number(v) as Speed)}
              options={[
                { value: "1", label: "1×" },
                { value: "2", label: "2×" },
                { value: "4", label: "4×" },
              ]}
            />
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" className="px-2.5 py-1.5 text-[12px] whitespace-nowrap" onClick={p.onAskFounder}>
                Ask the founder
              </Button>
              <button
                type="button"
                onClick={p.onToggleSound}
                title={p.sound ? "Mute sounds" : "Unmute sounds"}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-silver hover:bg-white/10"
                aria-label={p.sound ? "Mute sounds" : "Unmute sounds"}
              >
                {p.sound ? "🔊" : "🔇"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
