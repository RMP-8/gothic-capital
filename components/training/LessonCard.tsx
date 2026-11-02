"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Lesson } from "@/lib/lessons";
import { LESSON_COUNT } from "@/lib/lessons";
import LessonVisual from "./Visuals";
import { Button, Monitor } from "@/components/ui";

export interface LessonCardProps {
  lesson: Lesson;
  index: number;
  passed: boolean;
  onPassed: () => void;
  onNext: () => void;
  onBack: () => void;
}

/** One lesson on the middle monitor: explanation + visual + example, then a one-question quiz. */
export default function LessonCard({ lesson, index, passed, onPassed, onNext, onBack }: LessonCardProps) {
  const [view, setView] = useState<"lesson" | "quiz">("lesson");
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked !== null && picked === lesson.quiz.answer;
  const wrong = picked !== null && !correct;
  const last = index === LESSON_COUNT - 1;

  return (
    <Monitor
      title={`Level 1 · Training Day`}
      right={
        <span className="text-[10px] text-silver/70">
          Lesson {index + 1} of {LESSON_COUNT}
        </span>
      }
    >
      <div className="flex h-full flex-col px-3 pt-2">
        {/* progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-royal-bright" initial={false} animate={{ width: `${((index + (passed ? 1 : 0)) / LESSON_COUNT) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        {view === "lesson" ? (
            <motion.div key="lesson" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="flex min-h-0 flex-1 gap-3 pt-2">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-royal-bright">{lesson.term}</div>
                <h2 className="text-[16px] font-semibold leading-tight">{lesson.title}</h2>
                <p className="mt-1 text-[12px] leading-snug text-silver">{lesson.body}</p>
                <div className="mt-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11px] leading-snug text-silver/90">
                  <span className="font-semibold text-white">Example. </span>
                  {lesson.example}
                </div>
                <div className="mt-auto flex items-center justify-between pb-2 pt-1.5">
                  <Button variant="ghost" className="whitespace-nowrap px-2.5 py-1 text-[11.5px]" disabled={index === 0} onClick={onBack}>
                    ← Back
                  </Button>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" className="whitespace-nowrap px-2.5 py-1 text-[11.5px]" onClick={onNext}>
                      {last ? "Finish" : "Skip →"}
                    </Button>
                    <Button className="whitespace-nowrap px-3 py-1 text-[12px]" onClick={() => setView("quiz")}>
                      {passed ? "Review question" : "Quick question"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex w-[232px] shrink-0 items-start justify-center pt-1">
                <LessonVisual kind={lesson.visual} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="quiz" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="flex min-h-0 flex-1 flex-col pt-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-royal-bright">Quick check</div>
              <p className="mt-0.5 text-[14px] font-semibold leading-snug">{lesson.quiz.question}</p>
              <div className="mt-2 space-y-1.5">
                {lesson.quiz.options.map((opt, i) => {
                  const state = picked === null ? "idle" : i === lesson.quiz.answer && correct ? "right" : i === picked ? "wrong" : "idle";
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={correct}
                      onClick={() => {
                        setPicked(i);
                        if (i === lesson.quiz.answer) onPassed();
                      }}
                      className={`block w-full rounded-md border px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                        state === "right"
                          ? "border-gain/60 bg-gain/15 text-white"
                          : state === "wrong"
                            ? "border-loss/60 bg-loss/15 text-white"
                            : "border-white/10 bg-white/[0.04] text-silver hover:border-royal-bright hover:text-white"
                      }`}
                    >
                      <span className="mr-1.5 text-silver/60">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {wrong && (
                  <motion.p key="wrong" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 rounded-md border border-loss/40 bg-loss/10 px-2 py-1.5 text-[11.5px] leading-snug text-silver">
                    <span className="font-semibold text-white">Not quite, and that&apos;s fine. </span>
                    {lesson.quiz.explain} Give it another go.
                  </motion.p>
                )}
                {correct && (
                  <motion.p key="right" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-md border border-gain/40 bg-gain/10 px-2 py-1.5 text-[11.5px] leading-snug text-silver">
                    <span className="font-semibold text-white">Correct. </span>
                    {lesson.quiz.explain}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="mt-auto flex items-center justify-between pb-2 pt-1.5">
                <Button variant="ghost" className="whitespace-nowrap px-2.5 py-1 text-[11.5px]" onClick={() => setView("lesson")}>
                  ← Re-read
                </Button>
                {wrong ? (
                  <Button className="whitespace-nowrap px-3 py-1 text-[12px]" onClick={() => setPicked(null)}>
                    Try again
                  </Button>
                ) : (
                  <Button className="whitespace-nowrap px-3 py-1 text-[12px]" disabled={!correct && !passed} onClick={onNext}>
                    {last ? "Finish Training Day" : "Next lesson →"}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
      </div>
    </Monitor>
  );
}
