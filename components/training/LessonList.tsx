"use client";

import { LESSONS } from "@/lib/lessons";
import { Monitor } from "@/components/ui";

export default function LessonList({ current, passed, onPick }: { current: number; passed: boolean[]; onPick: (i: number) => void }) {
  const done = passed.filter(Boolean).length;
  return (
    <Monitor title="Lessons" right={<span className="text-[10px] text-silver/70">{done} / {LESSONS.length} done</span>}>
      <div className="monitor-scroll h-full overflow-y-auto px-2 py-1.5">
        {LESSONS.map((l, i) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onPick(i)}
            className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[11.5px] transition-colors ${
              i === current ? "bg-royal text-white" : "text-silver hover:bg-white/5"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${
                passed[i] ? "bg-gain text-white" : i === current ? "bg-white/20 text-white" : "bg-white/10 text-silver/70"
              }`}
            >
              {passed[i] ? "✓" : i + 1}
            </span>
            <span className="truncate">{l.title}</span>
          </button>
        ))}
      </div>
    </Monitor>
  );
}
