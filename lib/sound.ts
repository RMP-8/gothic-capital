/** Tiny synthesized sound effects with the Web Audio API. No audio files. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
}

/** Trade confirmation: a short, crisp click. */
export function playClick() {
  tone(1800, 0, 0.04, "square", 0.05);
  tone(900, 0.02, 0.06, "sine", 0.08);
}

/** New inbox message: a soft two-note chime. */
export function playChime() {
  tone(880, 0, 0.25, "sine", 0.07);
  tone(1320, 0.12, 0.35, "sine", 0.06);
}

/** Year-end bonus: a brighter three-note rise. */
export function playFanfare() {
  tone(660, 0, 0.2, "triangle", 0.07);
  tone(880, 0.15, 0.2, "triangle", 0.07);
  tone(1320, 0.3, 0.45, "triangle", 0.08);
}
