import type { ContributionDay } from "../types.ts";

/** The last `n` days ending at the calendar's last day, zero-filled. */
export function activitySeries(calendar: ContributionDay[], n: number): ContributionDay[] {
  if (calendar.length === 0) return [];
  const counts = new Map(calendar.map((d) => [d.date, d.count]));
  const end = Date.parse(calendar.at(-1)!.date + "T00:00:00Z");
  const out: ContributionDay[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(end - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ date, count: counts.get(date) ?? 0 });
  }
  return out;
}
