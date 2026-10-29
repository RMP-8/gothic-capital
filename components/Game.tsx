"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GameState, MarketData, OptionOrder, OptionQuote } from "@/lib/types";
import {
  buyOption,
  buyShares,
  clearPause,
  nextWeek,
  quoteOption,
  sellOption,
  sellShares,
  skipWeeks,
  newGame,
} from "@/lib/engine";
import { playChime, playClick, playFanfare } from "@/lib/sound";
import Stage from "@/components/Stage";
import OfficeScene, { MOODS, type PlantMood, type TimeOfDay } from "@/components/office/OfficeScene";
import MonitorFrame from "@/components/office/MonitorFrame";
import MainMonitor from "@/components/monitors/MainMonitor";
import SideMonitor from "@/components/monitors/SideMonitor";
import InboxMonitor from "@/components/monitors/InboxMonitor";
import StatusStrip from "@/components/StatusStrip";
import Controls, { type Speed } from "@/components/Controls";
import OptionPreview from "@/components/OptionPreview";
import FounderModal from "@/components/FounderModal";
import BonusPopup from "@/components/BonusPopup";
import StartScreen from "@/components/StartScreen";
import ReviewScreen from "@/components/ReviewScreen";

type Phase = "start" | "playing" | "review";
type Modal =
  | { kind: "tutorial" }
  | { kind: "faq" }
  | { kind: "bonus" }
  | { kind: "preview"; quote: OptionQuote; order: OptionOrder }
  | null;

const TIMES: TimeOfDay[] = ["morning", "midday", "afternoon"];

export default function Game() {
  const [phase, setPhase] = useState<Phase>("start");
  const [game, setGame] = useState<GameState | null>(null);
  const [ticker, setTicker] = useState("SPY");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [sound, setSound] = useState(false);
  const [coffee, setCoffee] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  // Refs let event handlers and the auto-play timer see the latest state without re-subscribing.
  const gameRef = useRef<GameState | null>(null);
  const soundRef = useRef(false);
  const seenTutorial = useRef(false);
  const coffeeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refillCoffee = useCallback(() => {
    setCoffee(1);
    if (coffeeTimer.current) clearTimeout(coffeeTimer.current);
    coffeeTimer.current = setTimeout(() => setCoffee(0.25), 2500);
  }, []);

  /* ---------- start / load ---------- */
  const start = useCallback(
    async (t: string) => {
      setLoading(true);
      setLoadError(null);
      setTicker(t);
      try {
        const res = await fetch(`/api/prices?ticker=${encodeURIComponent(t)}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Couldn't load prices.");
        const g = newGame(body as MarketData);
        gameRef.current = g;
        setGame(g);
        setAutoplay(false);
        setError(null);
        setToast(null);
        refillCoffee();
        setPhase("playing");
        setModal(seenTutorial.current ? null : { kind: "tutorial" });
        seenTutorial.current = true;
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [refillCoffee],
  );

  /* ---------- actions ---------- */
  const apply = useCallback(
    (fn: (g: GameState) => GameState, click = false) => {
      const prev = gameRef.current;
      if (!prev || prev.status !== "playing") return;
      let next: GameState;
      try {
        next = fn(prev);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return;
      }
      setError(null);
      if (click && soundRef.current) playClick();

      // Reactions to what just happened.
      if (next.week !== prev.week) refillCoffee();
      if (next.messages.length > prev.messages.length && soundRef.current && next.pauseReason !== "yearEnd") playChime();
      if (next.pauseReason === "yearEnd") {
        setAutoplay(false);
        setModal({ kind: "bonus" });
        if (soundRef.current) playFanfare();
      } else if (next.pauseReason === "expiry") {
        setAutoplay(false);
        setToast("An option expired and settled in cash. Auto-play paused.");
      }
      if (next.status === "finished") setAutoplay(false);
      next = clearPause(next);
      gameRef.current = next;
      setGame(next);
    },
    [refillCoffee],
  );

  const step = useCallback(() => apply((g) => nextWeek(g)), [apply]);
  const skip = useCallback(() => apply((g) => skipWeeks(g, 4)), [apply]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const playing = !!game && game.status === "playing";
  useEffect(() => {
    if (!autoplay || !playing || modal) return;
    const id = setInterval(step, 1000 / speed);
    return () => clearInterval(id);
  }, [autoplay, speed, modal, playing, step]);

  const toggleSound = () => {
    soundRef.current = !soundRef.current;
    setSound(soundRef.current);
  };

  /* ---------- derived scene props ---------- */
  const timeOfDay: TimeOfDay = TIMES[(game?.week ?? 0) % 3];
  const shadow = MOODS[timeOfDay].shadow;
  let plantMood: PlantMood = "neutral";
  if (game) {
    const ratio = game.history[game.week] / game.bnhHistory[game.week] - 1;
    plantMood = ratio > 0.01 ? "perky" : ratio < -0.01 ? "droopy" : "neutral";
  }

  if (phase === "review" && game) {
    return (
      <Stage>
        <ReviewScreen
          state={game}
          onPlayAgain={() => start(game.ticker)}
          onNewTicker={() => {
            setPhase("start");
            setGame(null);
            gameRef.current = null;
          }}
        />
      </Stage>
    );
  }

  return (
    <Stage>
      <OfficeScene timeOfDay={timeOfDay} plantMood={plantMood} coffeeLevel={coffee} title={game?.title ?? "Junior PM"} />
      {game && phase === "playing" && (
        <>
          <MonitorFrame x={128} y={498} w={404} h={252} shadow={shadow}>
            <InboxMonitor messages={game.messages} />
          </MonitorFrame>
          <MonitorFrame x={1068} y={498} w={404} h={252} shadow={shadow}>
            <SideMonitor
              state={game}
              error={error}
              onBuyShares={(n) => apply((g) => buyShares(g, n), true)}
              onSellShares={(n) => apply((g) => sellShares(g, n), true)}
              onSellOption={(id) => apply((g) => sellOption(g, id), true)}
              onPreviewOption={(order) => {
                try {
                  setModal({ kind: "preview", quote: quoteOption(game, order), order });
                  setAutoplay(false);
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e));
                }
              }}
            />
          </MonitorFrame>
          <MonitorFrame x={550} y={438} w={500} h={312} shadow={shadow}>
            <MainMonitor state={game} />
          </MonitorFrame>
          <Controls
            playing={playing && !modal}
            finished={game.status === "finished"}
            autoplay={autoplay}
            speed={speed}
            sound={sound}
            onNext={step}
            onSkip={skip}
            onToggleAutoplay={() => setAutoplay((a) => !a)}
            onSpeed={setSpeed}
            onToggleSound={toggleSound}
            onAskFounder={() => {
              setAutoplay(false);
              setModal({ kind: "faq" });
            }}
            onReview={() => setPhase("review")}
          />
          <StatusStrip state={game} />
        </>
      )}

      {phase === "start" && <StartScreen onStart={start} loading={loading} error={loadError} initialTicker={ticker} />}

      <AnimatePresence>
        {modal?.kind === "tutorial" && <FounderModal key="tut" mode="tutorial" onClose={() => setModal(null)} />}
        {modal?.kind === "faq" && <FounderModal key="faq" mode="faq" onClose={() => setModal(null)} />}
        {modal?.kind === "bonus" && game && game.bonuses.length > 0 && (
          <BonusPopup
            key="bonus"
            bonus={game.bonuses[game.bonuses.length - 1]}
            title={game.title}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.kind === "preview" && (
          <OptionPreview
            key="preview"
            quote={modal.quote}
            onCancel={() => setModal(null)}
            onConfirm={() => {
              apply((g) => buyOption(g, modal.order), true);
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 z-30 -translate-x-1/2 rounded-md border border-white/10 bg-[#0a1a45] px-4 py-2 text-[13px] text-white shadow-lg"
            style={{ top: 400 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
