"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Message } from "@/lib/types";
import { FOUNDER_NAME } from "@/lib/messages";
import { longDate } from "@/lib/format";
import { shownDate } from "@/lib/engine";
import { FounderAvatar, Monitor } from "@/components/ui";

export default function InboxMonitor({ messages, dateOffset = 0 }: { messages: Message[]; dateOffset?: number }) {
  const list = messages.slice().reverse();
  return (
    <Monitor title="Inbox" right={<span className="text-[11px] text-ink-2/60">{messages.length}</span>}>
      <div className="monitor-scroll h-full overflow-y-auto px-2 py-2">
        <AnimatePresence initial={false}>
          {list.map((m, i) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className={`mb-1.5 rounded-md border px-2.5 py-2 ${
                i === 0 ? "border-royal/40 bg-royal/[0.07]" : "border-ink/[0.08] bg-ink/[0.03]"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                {m.from === "founder" ? (
                  <FounderAvatar size={20} />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ink/15 text-[9px] font-semibold text-ink-2">
                    IR
                  </div>
                )}
                <span className="text-[12px] font-semibold text-ink">
                  {m.from === "founder" ? FOUNDER_NAME : "Investor Relations"}
                </span>
                <span className="ml-auto text-[10px] text-ink-2/50">{longDate(shownDate({ dateOffset }, m.date))}</span>
              </div>
              <p className="text-[13.5px] leading-snug text-ink-2">{m.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Monitor>
  );
}
