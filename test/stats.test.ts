import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStreaks } from "../src/stats/streak.ts";
import { aggregateLanguages } from "../src/stats/languages.ts";
import { activitySeries } from "../src/stats/activity.ts";
import { computeLevel } from "../src/stats/level.ts";
import type { ContributionDay } from "../src/types.ts";

const days = (counts: number[], start = "2026-01-01"): ContributionDay[] => {
  const t0 = Date.parse(start + "T00:00:00Z");
  return counts.map((count, i) => ({ date: new Date(t0 + i * 86_400_000).toISOString().slice(0, 10), count }));
};

test("streak: current streak survives an empty today", () => {
  const s = computeStreaks(days([1, 0, 3, 4, 5, 0]));
  assert.equal(s.current.length, 3);
  assert.equal(s.current.start, "2026-01-03");
  assert.equal(s.current.end, "2026-01-05");
});

test("streak: current streak includes a non-empty today", () => {
  const s = computeStreaks(days([0, 2, 2]));
  assert.equal(s.current.length, 2);
});

test("streak: broken when yesterday and today are empty", () => {
  const s = computeStreaks(days([5, 5, 0, 0]));
  assert.equal(s.current.length, 0);
  assert.equal(s.longest.length, 2);
});

test("streak: longest and total", () => {
  const s = computeStreaks(days([1, 1, 1, 0, 1, 1, 0, 2]));
  assert.equal(s.longest.length, 3);
  assert.equal(s.longest.start, "2026-01-01");
  assert.equal(s.longest.end, "2026-01-03");
  assert.equal(s.total, 7);
});

test("streak: empty calendar", () => {
  const s = computeStreaks([]);
  assert.equal(s.current.length, 0);
  assert.equal(s.longest.length, 0);
  assert.equal(s.total, 0);
});

test("languages: aggregates, excludes, buckets the rest into Other", () => {
  const langs = aggregateLanguages(
    [
      { name: "PHP", color: "#4F5D95", size: 60 },
      { name: "PHP", color: "#4F5D95", size: 40 },
      { name: "Go", color: "#00ADD8", size: 50 },
      { name: "Blade", color: "#f7523f", size: 500 },
      { name: "CSS", color: "#563d7c", size: 25 },
      { name: "Shell", color: null, size: 25 },
    ],
    { top: 2, exclude: ["blade"] },
  );
  assert.deepEqual(
    langs.map((l) => [l.name, l.percent]),
    [
      ["PHP", 50],
      ["Go", 25],
      ["Other", 25],
    ],
  );
});

test("languages: empty input", () => {
  assert.deepEqual(aggregateLanguages([], { top: 5 }), []);
});

test("activity: returns the last N days, padding missing ones", () => {
  const s = activitySeries(days([1, 2, 3]), 5);
  assert.equal(s.length, 5);
  assert.deepEqual(s.map((d) => d.count), [0, 0, 1, 2, 3]);
  assert.equal(s.at(-1)!.date, "2026-01-03");
});

test("level: monotonic and bounded", () => {
  const low = computeLevel({ commits: 1, pullRequests: 0, issues: 0, stars: 0, followers: 0, contributedTo: 0 });
  const high = computeLevel({ commits: 5000, pullRequests: 800, issues: 300, stars: 2000, followers: 900, contributedTo: 80 });
  assert.ok(low.percent >= 0 && low.percent < high.percent && high.percent <= 1);
  assert.equal(high.label, "S");
});

test("activity axis: whole-number gridlines with little headroom", async () => {
  const { niceMax } = await import("../src/render/cards/activity.ts");
  for (const v of [0, 3, 7, 13, 50, 99, 225, 1234]) {
    const m = niceMax(v);
    assert.ok(m >= v, `${m} >= ${v}`);
    assert.ok(Number.isInteger(m / 4), `${m}/4 integer`);
    if (v > 10) assert.ok(m <= v * 1.6, `${m} tight for ${v}`);
  }
});
