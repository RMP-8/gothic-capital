"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Message } from "@/lib/types";
import { FOUNDER_NAME } from "@/lib/messages";
import { longDate } from "@/lib/format";
import { FounderAvatar, Monitor } from "@/components/ui";

export default function InboxMonitor({ messages }: { messages: Message[] }) {
  const list = messages.slice().reverse();
  return (
    <Monitor title="Inbox" right={<span className="text-[11px] text-silver/60">{messages.length}</span>}>
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
                i === 0 ? "border-royal/50 bg-royal/10" : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                {m.from === "founder" ? (
                  <FounderAvatar size={20} />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-silver/20 text-[9px] font-semibold text-silver">
                    IR
                  </div>
                )}
                <span className="text-[12px] font-semibold text-white">
                  {m.from === "founder" ? FOUNDER_NAME : "Investor Relations"}
                </span>
                <span className="ml-auto text-[10px] text-silver/50">{longDate(m.date)}</span>
              </div>
              <p className="text-[13px] leading-snug text-silver">{m.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Monitor>
  );
}
