import { describe, expect, it, vi } from "vitest";

// Simulate Yahoo being unavailable: the SPY game must fall back to the saved snapshot.
vi.mock("@/lib/marketData", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/marketData")>();
  return {
    ...real,
    fetchTickerLive: vi.fn(async () => {
      throw new Error("Yahoo down");
    }),
    fetchRatesLive: vi.fn(async () => {
      throw new Error("Yahoo down");
    }),
    resolveSymbol: vi.fn(async () => null),
  };
});

import { GET } from "@/app/api/prices/route";

describe("/api/prices when the live fetch fails", () => {
  it("serves the saved SPY snapshot and says so", async () => {
    const res = await GET(new Request("http://localhost/api/prices?ticker=SPY"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("snapshot");
    expect(body.ticker).toBe("SPY");
    expect(body.prices.length).toBeGreaterThan(200);
    expect(body.rates.length).toBeGreaterThan(200);
  });
  it("returns a friendly error for another ticker instead of SPY's data", async () => {
    const res = await GET(new Request("http://localhost/api/prices?ticker=AAPL"));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/Couldn't find prices for "AAPL"/);
    expect(body.prices).toBeUndefined();
  });
  it("rejects nonsense input politely", async () => {
    const res = await GET(new Request("http://localhost/api/prices?ticker=%24%24%24%24"));
    expect(res.status).toBe(400);
  });
});
