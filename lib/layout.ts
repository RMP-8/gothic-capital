/** Stage coordinates (1600x900) of the interactive areas, shared by the game, the practice spotlight and the scene. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const MONITOR = {
  inbox: { x: 40, y: 445, w: 460, h: 305 },
  main: { x: 512, y: 390, w: 576, h: 360 },
  ticket: { x: 1100, y: 445, w: 460, h: 305 },
} as const;

export const MONITOR_BEZEL = 6;
export const KEYBOARD: Rect = { x: 480, y: 796, w: 640, h: 64 };
export const STRIP: Rect = { x: 40, y: 866, w: 1520, h: 30 };

/** Padded rectangle around a monitor including its bezel. */
export function monitorRect(m: Rect): Rect {
  return { x: m.x - MONITOR_BEZEL, y: m.y - MONITOR_BEZEL, w: m.w + MONITOR_BEZEL * 2, h: m.h + MONITOR_BEZEL * 2 + 4 };
}
