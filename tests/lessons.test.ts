import { describe, expect, it } from "vitest";
import { GLOSSARY, LESSONS, LESSON_COUNT } from "@/lib/lessons";

const sentences = (t: string) => t.split(/[.!?](\s|$)/).filter((x) => x.trim().length > 1).length;

describe("Training Day lessons", () => {
  it("has the fifteen lessons in the requested order", () => {
    expect(LESSON_COUNT).toBe(15);
    expect(LESSONS.map((l) => l.id)).toEqual([
      "stock", "spy", "trade", "buyhold", "option", "call", "put", "strike", "expiry", "premium", "breakeven", "risk", "sharpe", "drawdown", "irr",
    ]);
  });
  it("keeps explanations to three sentences and quizzes well-formed", () => {
    for (const l of LESSONS) {
      expect(sentences(l.body), l.id).toBeLessThanOrEqual(3);
      expect(l.quiz.options.length).toBeGreaterThanOrEqual(3);
      expect(l.quiz.answer).toBeGreaterThanOrEqual(0);
      expect(l.quiz.answer).toBeLessThan(l.quiz.options.length);
      expect(l.example).toMatch(/\$|%/);
    }
  });
  it("exports a glossary entry per lesson", () => {
    expect(GLOSSARY).toHaveLength(15);
    for (const g of GLOSSARY) expect(g.text.length).toBeGreaterThan(10);
  });
});
