"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GameState, MarketData, OptionOrder, OptionQuote } from "@/lib/types";
import { buyOption, buyShares, clearPause, nextWeek, quoteOption, sellOption, sellShares, skipWeeks, newGame } from "@/lib/engine";
import { computeStats } from "@/lib/metrics";
import { playChime, playClick, playFanfare } from "@/lib/sound";
import { PRACTICE_STEPS, practiceData, type ActionKind, type Spot } from "@/lib/practice";
import { nextTip } from "@/lib/tips";
import { MONITOR } from "@/lib/layout";
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
import PracticeCoach from "@/components/PracticeCoach";
import HelpPanel, { HelpButton } from "@/components/HelpPanel";
import LevelSelect, { type Level, type LevelsDone } from "@/components/LevelSelect";
import LessonCard from "@/components/training/LessonCard";
import LessonList from "@/components/training/LessonList";
import TrainingRecap from "@/components/training/TrainingRecap";
import { LESSONS, LESSON_COUNT } from "@/lib/lessons";
import { Button, Card, FounderAvatar, Overlay } from "@/components/ui";
import { FOUNDER_NAME } from "@/lib/messages";

type Phase = "start" | "levels" | "training" | "practice" | "playing" | "review";
type Modal =
  | { kind: "trainingWelcome" }
  | { kind: "trainingRecap" }
  | { kind: "faq" }
  | { kind: "bonus" }
  | { kind: "preview"; quote: OptionQuote; order: OptionOrder }
  | null;

const TIMES: TimeOfDay[] = ["morning", "midday", "afternoon"];
const LEVELS_KEY = "gothic-capital-levels";
const NO_LEVELS: LevelsDone = { training: false, practice: false, real: false };

function readLevels(): LevelsDone {
  try {
    const raw = window.localStorage.getItem(LEVELS_KEY);
    return raw ? { ...NO_LEVELS, ...(JSON.parse(raw) as Partial<LevelsDone>) } : NO_LEVELS;
  } catch {
    return NO_LEVELS;
  }
}
function writeLevels(v: LevelsDone) {
  try {
    window.localStorage.setItem(LEVELS_KEY, JSON.stringify(v));
  } catch {
    /* private mode etc. */
  }
}

/** Today's date in the player's local time zone, as YYYY-MM-DD. */
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  const [helpOpen, setHelpOpen] = useState(false);
  /** Bumps on every new game so the order ticket resets its inputs. */
  const [session, setSession] = useState(0);
  // practice round
  const [stepIdx, setStepIdx] = useState(0);
  const [before, setBefore] = useState<GameState | null>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const [ticketTab, setTicketTab] = useState<"shares" | "call" | "put">("shares");
  // levels + training day
  const [levelsDone, setLevelsDone] = useState<LevelsDone>(NO_LEVELS);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [lessonPassed, setLessonPassed] = useState<boolean[]>(() => Array(LESSON_COUNT).fill(false));

  // Refs let event handlers and the auto-play timer see the latest state without re-subscribing.
  const gameRef = useRef<GameState | null>(null);
  const fullData = useRef<MarketData | null>(null);
  const phaseRef = useRef<Phase>("start");
  const stepRef = useRef(0);
  const soundRef = useRef(false);
  const coffeeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refillCoffee = useCallback(() => {
    setCoffee(1);
    if (coffeeTimer.current) clearTimeout(coffeeTimer.current);
    coffeeTimer.current = setTimeout(() => setCoffee(0.25), 2500);
  }, []);

  const setGameAndPhase = useCallback(
    (g: GameState, p: Phase) => {
      gameRef.current = g;
      phaseRef.current = p;
      setGame(g);
      setPhase(p);
      setAutoplay(false);
      setError(null);
      setToast(null);
      setModal(null);
      setHelpOpen(false);
      setSession((n) => n + 1);
      setTicketTab("shares");
      refillCoffee();
    },
    [refillCoffee],
  );

  /* ---------- starting games ---------- */
  const startPractice = useCallback(() => {
    const full = fullData.current;
    if (!full) return;
    stepRef.current = 0;
    setStepIdx(0);
    setBefore(null);
    setNudge(null);
    setGameAndPhase(newGame(practiceData(full), todayIso()), "practice");
  }, [setGameAndPhase]);

  const startReal = useCallback(() => {
    const full = fullData.current;
    if (!full) return;
    setGameAndPhase(newGame(full, todayIso()), "playing");
  }, [setGameAndPhase]);

  const markDone = useCallback((level: Level) => {
    setLevelsDone((prev) => {
      const next = { ...prev, [level]: true };
      writeLevels(next);
      return next;
    });
  }, []);

  const startTraining = useCallback(() => {
    const full = fullData.current;
    if (!full) return;
    setLessonIdx(0);
    setLessonPassed(Array(LESSON_COUNT).fill(false));
    setGameAndPhase(newGame(full, todayIso()), "training");
    setModal({ kind: "trainingWelcome" });
  }, [setGameAndPhase]);

  const showLevels = useCallback(() => {
    const full = fullData.current;
    if (!full) return;
    setLevelsDone(readLevels());
    setGameAndPhase(newGame(full, todayIso()), "levels");
  }, [setGameAndPhase]);

  const load = useCallback(
    async (t: string, then: "levels" | "practice" | "training" | "real") => {
      setLoading(true);
      setLoadError(null);
      setTicker(t);
      try {
        const res = await fetch(`/api/prices?ticker=${encodeURIComponent(t)}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Couldn't load prices.");
        fullData.current = body as MarketData;
        if (then === "practice") startPractice();
        else if (then === "training") startTraining();
        else if (then === "real") startReal();
        else showLevels();
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [startPractice, startReal, startTraining, showLevels],
  );

  /* ---------- actions ---------- */
  const apply = useCallback(
    (fn: (g: GameState) => GameState, kind: ActionKind | null, click = false): boolean => {
      const prev = gameRef.current;
      if (!prev || prev.status !== "playing") return false;

      // In the practice round, only the step's action is allowed.
      const practicing = phaseRef.current === "practice";
      const step = PRACTICE_STEPS[stepRef.current];
      if (practicing && kind) {
        const ok = step.action === kind || step.also?.includes(kind);
        if (!ok) {
          setNudge(step.nudge ?? "Not yet. Follow the step in the card above.");
          return false;
        }
      }

      let next: GameState;
      try {
        next = fn(prev);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return false;
      }
      setError(null);
      if (click && soundRef.current) playClick();

      if (next.week !== prev.week) refillCoffee();
      if (next.messages.length > prev.messages.length && soundRef.current && next.pauseReason !== "yearEnd") playChime();
      if (!practicing) {
        if (next.pauseReason === "yearEnd") {
          setAutoplay(false);
          setModal({ kind: "bonus" });
          if (soundRef.current) playFanfare();
        } else if (next.pauseReason === "expiry") {
          setAutoplay(false);
          setToast("An option expired and settled in cash. Auto-play paused.");
        }
      }
      if (next.status === "finished") {
        setAutoplay(false);
        if (!practicing) markDone("real");
      }
      next = clearPause(next);
      gameRef.current = next;
      setGame(next);

      if (practicing && kind && step.action === kind) {
        setBefore(prev);
        setNudge(null);
        stepRef.current += 1;
        setStepIdx(stepRef.current);
      }
      return true;
    },
    [refillCoffee, markDone],
  );

  const step = useCallback(() => apply((g) => nextWeek(g), "nextWeek"), [apply]);
  const skip = useCallback(() => apply((g) => skipWeeks(g, 4), "skip"), [apply]);

  const coachContinue = () => {
    const s = PRACTICE_STEPS[stepRef.current];
    if (s.id === "wrap" || stepRef.current >= PRACTICE_STEPS.length - 1) {
      markDone("practice");
      startReal();
      return;
    }
    setBefore(gameRef.current);
    setNudge(null);
    stepRef.current += 1;
    setStepIdx(stepRef.current);
  };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const playing = !!game && game.status === "playing";
  useEffect(() => {
    if (!autoplay || !playing || modal || helpOpen || phase !== "playing") return;
    const id = setInterval(step, 1000 / speed);
    return () => clearInterval(id);
  }, [autoplay, speed, modal, helpOpen, playing, phase, step]);

  const toggleSound = () => {
    soundRef.current = !soundRef.current;
    setSound(soundRef.current);
  };

  const openHelp = () => {
    setAutoplay(false);
    setHelpOpen(true);
  };
  const replayPractice = () => {
    setHelpOpen(false);
    if (fullData.current) startPractice();
    else void load(ticker, "practice");
  };
  const goTraining = () => {
    setHelpOpen(false);
    if (fullData.current) startTraining();
    else void load(ticker, "training");
  };
  const askFounder = () => {
    setHelpOpen(false);
    setAutoplay(false);
    setModal({ kind: "faq" });
  };

  /* ---------- derived ---------- */
  const timeOfDay: TimeOfDay = TIMES[(game?.week ?? 0) % 3];
  const shadow = MOODS[timeOfDay].shadow;
  let plantMood: PlantMood = "neutral";
  if (game) {
    const ratio = game.history[game.week] / game.bnhHistory[game.week] - 1;
    plantMood = ratio > 0.01 ? "perky" : ratio < -0.01 ? "droopy" : "neutral";
  }
  const practicing = phase === "practice" && !!game;
  const coachStep = PRACTICE_STEPS[Math.min(stepIdx, PRACTICE_STEPS.length - 1)];
  // Once the right tab is open, point at the preview button instead of the tab.
  let coachSpot: Spot = coachStep.spot;
  if (coachStep.id === "buy-call" && ticketTab === "call") coachSpot = "preview";
  if (coachStep.id === "buy-put" && ticketTab === "put") coachSpot = "preview";
  const tip = nextTip(phase, game);
  const training = phase === "training" && !!game;
  const lesson = LESSONS[Math.min(lessonIdx, LESSON_COUNT - 1)];
  const finishTraining = () => {
    markDone("training");
    setModal({ kind: "trainingRecap" });
  };

  const helpUi = (
    <>
      <HelpButton onClick={openHelp} />
      <HelpPanel open={helpOpen} tip={tip} onClose={() => setHelpOpen(false)} onReplayPractice={replayPractice} onTraining={goTraining} onAskFounder={askFounder} />
      <AnimatePresence>{modal?.kind === "faq" && <FounderModal key="faq" mode="faq" onClose={() => setModal(null)} />}</AnimatePresence>
    </>
  );

  if (phase === "review" && game) {
    return (
      <Stage>
        <ReviewScreen
          state={game}
          onPlayAgain={startReal}
          onNewTicker={() => {
            setPhase("start");
            phaseRef.current = "start";
            setGame(null);
            gameRef.current = null;
            fullData.current = null;
          }}
        />
        {helpUi}
      </Stage>
    );
  }

  return (
    <Stage>
      <OfficeScene timeOfDay={timeOfDay} plantMood={plantMood} coffeeLevel={coffee} title={game?.title ?? "Junior PM"} badge={levelsDone.training} />
      {training && game && (
        <>
          <MonitorFrame {...MONITOR.inbox} shadow={shadow} spot="inbox">
            <InboxMonitor messages={game.messages} dateOffset={game.dateOffset} />
          </MonitorFrame>
          <MonitorFrame {...MONITOR.ticket} shadow={shadow} spot="ticket">
            <LessonList current={lessonIdx} passed={lessonPassed} onPick={setLessonIdx} />
          </MonitorFrame>
          <MonitorFrame {...MONITOR.main} shadow={shadow} spot="chart">
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={lessonIdx}
              passed={lessonPassed[lessonIdx]}
              onPassed={() => setLessonPassed((p) => p.map((v, i) => (i === lessonIdx ? true : v)))}
              onNext={() => (lessonIdx >= LESSON_COUNT - 1 ? finishTraining() : setLessonIdx(lessonIdx + 1))}
              onBack={() => setLessonIdx(Math.max(0, lessonIdx - 1))}
            />
          </MonitorFrame>
          <div
            className="absolute flex items-center gap-3 rounded-lg border border-white/10 bg-[#071537]/95 px-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
            style={{ left: 480, top: 806, width: 640, height: 48 }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-royal-bright">Level 1 · Training Day</span>
            <span className="text-[12px] text-silver">
              {lessonPassed.filter(Boolean).length} of {LESSON_COUNT} questions answered
            </span>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" className="py-1" onClick={showLevels}>
                Back to levels
              </Button>
              <Button variant="ghost" className="py-1" onClick={startPractice}>
                Skip to Level 2
              </Button>
            </div>
          </div>
        </>
      )}
      {game && (phase === "playing" || phase === "practice" || phase === "levels") && (
        <>
          <MonitorFrame {...MONITOR.inbox} shadow={shadow} spot="inbox">
            <InboxMonitor messages={game.messages} dateOffset={game.dateOffset} />
          </MonitorFrame>
          <MonitorFrame {...MONITOR.ticket} shadow={shadow} spot="ticket">
            <SideMonitor
              key={session}
              state={game}
              error={error}
              onTabChange={setTicketTab}
              onBuyShares={(n) => apply((g) => buyShares(g, n), "buyShares", true)}
              onSellShares={(n) => apply((g) => sellShares(g, n), "sellShares", true)}
              onSellOption={(id) => apply((g) => sellOption(g, id), "sellOption", true)}
              onPreviewOption={(order) => {
                if (practicing) {
                  const s = PRACTICE_STEPS[stepRef.current];
                  const wanted = order.type === "call" ? "buyCall" : "buyPut";
                  if (s.action !== wanted) {
                    setNudge(s.nudge ?? "Not yet. Follow the step in the card above.");
                    return;
                  }
                }
                try {
                  setModal({ kind: "preview", quote: quoteOption(game, order), order });
                  setAutoplay(false);
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e));
                }
              }}
            />
          </MonitorFrame>
          <MonitorFrame {...MONITOR.main} shadow={shadow} spot="chart">
            <MainMonitor state={game} />
          </MonitorFrame>
          <Controls
            playing={playing && !modal}
            finished={game.status === "finished"}
            practice={practicing}
            autoplay={autoplay}
            speed={speed}
            sound={sound}
            onNext={step}
            onSkip={skip}
            onToggleAutoplay={() => setAutoplay((a) => !a)}
            onSpeed={setSpeed}
            onToggleSound={toggleSound}
            onAskFounder={askFounder}
            onReview={() => {
              setPhase("review");
              phaseRef.current = "review";
            }}
          />
          <StatusStrip state={game} />
        </>
      )}

      {practicing && (
        <>
          <PracticeCoach
            spot={coachSpot}
            step={coachStep}
            index={stepIdx}
            text={coachStep.text({ g: game, before })}
            nudge={nudge}
            scoreboard={coachStep.id === "scoreboard" ? { you: computeStats(game.history, game.rates), bnh: computeStats(game.bnhHistory, game.rates) } : null}
            onContinue={coachContinue}
            onSkip={startReal}
          />
        </>
      )}

      {phase === "start" && <StartScreen onStart={(t) => load(t, "levels")} loading={loading} error={loadError} initialTicker={ticker} />}
      {phase === "levels" && (
        <LevelSelect
          ticker={ticker}
          done={levelsDone}
          onPick={(l) => {
            if (l === "training") startTraining();
            else if (l === "practice") startPractice();
            else startReal();
          }}
        />
      )}

      <AnimatePresence>
        {modal?.kind === "trainingWelcome" && (
          <Overlay key="tw">
            <Card className="w-[540px] p-7">
              <div className="flex items-center gap-3">
                <FounderAvatar size={44} />
                <div>
                  <div className="text-[14px] font-semibold">{FOUNDER_NAME}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-silver/60">Founder, Gothic Capital</div>
                </div>
              </div>
              <h2 className="mt-5 text-[22px] font-semibold">Welcome to your first day at Gothic Capital.</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-silver">
                Before I hand you the fund, we&apos;ll cover the basics: fifteen short lessons on the middle monitor, each with one quick question. Take your time; nobody here was born knowing this.
              </p>
              <div className="mt-6 flex justify-end">
                <Button className="px-5" onClick={() => setModal(null)}>
                  Let&apos;s start
                </Button>
              </div>
            </Card>
          </Overlay>
        )}
        {modal?.kind === "trainingRecap" && (
          <TrainingRecap
            key="recap"
            onPractice={() => {
              setModal(null);
              startPractice();
            }}
            onLevels={() => {
              setModal(null);
              showLevels();
            }}
          />
        )}
        {modal?.kind === "bonus" && game && game.bonuses.length > 0 && (
          <BonusPopup key="bonus" bonus={game.bonuses[game.bonuses.length - 1]} title={game.title} onClose={() => setModal(null)} />
        )}
        {modal?.kind === "preview" && (
          <OptionPreview
            key="preview"
            quote={modal.quote}
            onCancel={() => setModal(null)}
            onConfirm={() => {
              apply((g) => buyOption(g, modal.order), modal.order.type === "call" ? "buyCall" : "buyPut", true);
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>

      {helpUi}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 z-30 -translate-x-1/2 rounded-md border border-white/10 bg-[#0a1a45] px-4 py-2 text-[13px] text-white shadow-lg"
            style={{ top: 370 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
