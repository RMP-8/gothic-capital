export const money = (n: number, digits = 0) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const money2 = (n: number) => money(n, 2);

export const pct = (p: number, digits = 1) =>
  `${p > 0 ? "+" : ""}${(p * 100).toFixed(digits)}%`;

export const pctPlain = (p: number, digits = 1) => `${(p * 100).toFixed(digits)}%`;

export const num = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2023-04-17" -> "Apr 17, 2023" */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** "2023-04-17" -> "Apr '23" */
export function shortDate(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} '${String(y).slice(2)}`;
}

export const signClass = (n: number) => (n > 0 ? "text-gain" : n < 0 ? "text-loss" : "text-silver");
