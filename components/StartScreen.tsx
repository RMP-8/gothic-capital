"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Card } from "@/components/ui";

export default function StartScreen({
  onStart,
  loading,
  error,
  initialTicker,
}: {
  onStart: (ticker: string) => void;
  loading: boolean;
  error: string | null;
  initialTicker: string;
}) {
  const [ticker, setTicker] = useState(initialTicker);
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/25 backdrop-blur-[3px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}>
        <Card className="w-[600px] p-9">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-silver/60">Manhattan · 54th floor</div>
          <h1 className="mt-2 text-[40px] font-semibold leading-none tracking-tight">Gothic Capital</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-silver">
            You&apos;re the new portfolio manager. The founder hands you <span className="text-white">$100,000</span> and one
            ticker. You&apos;ll trade through the last five years of real weekly prices, one week at a time, and at the end
            she&apos;ll compare you to simply buying and holding.
          </p>
          <form
            className="mt-6 flex items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading) onStart(ticker.trim().toUpperCase() || "SPY");
            }}
          >
            <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.18em] text-silver/60">
              Ticker
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                maxLength={10}
                className="h-11 w-40 rounded-md border border-white/15 bg-white/5 px-3 text-[18px] font-semibold tracking-wider text-white outline-none focus:border-royal-bright"
                disabled={loading}
              />
            </label>
            <Button type="submit" className="h-11 px-6 text-[15px]" disabled={loading}>
              {loading ? "Loading five years of prices…" : "Take the job"}
            </Button>
          </form>
          <p className="mt-3 text-[12px] text-silver/55">
            SPY (an S&amp;P 500 fund) is the default. Any ticker with five years of history works, e.g. AAPL, MSFT, QQQ.
          </p>
          {error && <p className="mt-3 text-[13px] text-loss">{error}</p>}
        </Card>
      </motion.div>
    </div>
  );
}
