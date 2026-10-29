"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQ, TUTORIAL } from "@/lib/founderContent";
import { FOUNDER_NAME } from "@/lib/messages";
import { Button, Card, FounderAvatar, Overlay } from "@/components/ui";

export default function FounderModal({ mode, onClose }: { mode: "tutorial" | "faq"; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState(FAQ[0].id);

  if (mode === "tutorial") {
    const lesson = TUTORIAL[step];
    const last = step === TUTORIAL.length - 1;
    return (
      <Overlay>
        <Card className="w-[560px] p-7">
          <div className="flex items-center gap-3">
            <FounderAvatar size={44} />
            <div>
              <div className="text-[14px] font-semibold">{FOUNDER_NAME}</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-silver/60">Founder, Gothic Capital</div>
            </div>
            <div className="ml-auto flex gap-1.5">
              {TUTORIAL.map((t, i) => (
                <i key={t.id} className={`block h-1.5 w-5 rounded-full ${i <= step ? "bg-royal-bright" : "bg-white/15"}`} />
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="mt-5 min-h-[120px]"
            >
              <h2 className="text-[22px] font-semibold">{lesson.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-silver">{lesson.body}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-5 flex items-center justify-between">
            <Button variant="ghost" onClick={onClose}>
              Skip
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button className="px-5" onClick={() => (last ? onClose() : setStep(step + 1))}>
                {last ? "Start trading" : "Next"}
              </Button>
            </div>
          </div>
        </Card>
      </Overlay>
    );
  }

  const current = FAQ.find((f) => f.id === topic) ?? FAQ[0];
  return (
    <Overlay onClose={onClose}>
      <Card className="flex w-[760px] overflow-hidden">
        <div className="monitor-scroll w-[260px] shrink-0 overflow-y-auto border-r border-white/10 bg-white/[0.02] p-3">
          <div className="mb-2 px-2 text-[10px] uppercase tracking-[0.18em] text-silver/55">Ask the founder</div>
          {FAQ.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTopic(f.id)}
              className={`block w-full rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                f.id === topic ? "bg-royal text-white" : "text-silver hover:bg-white/5"
              }`}
            >
              {f.title}
            </button>
          ))}
        </div>
        <div className="flex min-h-[380px] flex-1 flex-col p-6">
          <div className="flex items-center gap-3">
            <FounderAvatar size={40} />
            <div>
              <div className="text-[14px] font-semibold">{FOUNDER_NAME}</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-silver/60">Founder</div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-5"
            >
              <h2 className="text-[20px] font-semibold">{current.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-silver">{current.body}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-auto flex justify-end pt-4">
            <Button onClick={onClose}>Back to the desk</Button>
          </div>
        </div>
      </Card>
    </Overlay>
  );
}
