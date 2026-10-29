import type { JobTitle } from "./types";

export const PROMOTION_WEEKS: Record<number, JobTitle> = {
  104: "Portfolio Manager",
  208: "Senior PM",
};

export const TITLE_RANK: Record<JobTitle, number> = {
  "Junior PM": 0,
  "Portfolio Manager": 1,
  "Senior PM": 2,
};

/** Promotions only happen when the player is beating buy-and-hold at the checkpoint. */
export function promotionAt(week: number, current: JobTitle, beatingBenchmark: boolean): JobTitle | null {
  const next = PROMOTION_WEEKS[week];
  if (!next || !beatingBenchmark) return null;
  return TITLE_RANK[next] > TITLE_RANK[current] ? next : null;
}
