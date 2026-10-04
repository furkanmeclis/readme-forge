import { test } from "node:test";
import assert from "node:assert/strict";
import { CARD_NAMES, THEME_NAMES, renderCard, type ProfileData } from "../src/index.ts";
import { demoProfile } from "../src/demo.ts";

function assertSaneSvg(svg: string, label: string) {
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, label);
  assert.ok(svg.trimEnd().endsWith("</svg>"), `${label}: closes`);
  assert.doesNotMatch(svg, /NaN|undefined|Infinity|\[object/, `${label}: no bad values`);
  // Every opened <g> is closed.
  assert.equal((svg.match(/<g[\s>]/g) ?? []).length, (svg.match(/<\/g>/g) ?? []).length, `${label}: balanced <g>`);
}

test("every card renders in every theme", () => {
  const p = demoProfile();
  for (const card of CARD_NAMES) {
    for (const theme of THEME_NAMES) assertSaneSvg(renderCard(card, p, { theme }), `${card}/${theme}`);
  }
});

test("user-controlled text is escaped", () => {
  const p = { ...demoProfile(), name: `<script>alert("x")</script>`, login: "a&b" };
  const svg = renderCard("stats", p);
  assert.ok(!svg.includes("<script>"));
  assert.ok(svg.includes("&lt;script&gt;"));
  assert.ok(svg.includes("@a&amp;b"));
});

test("empty profile renders without crashing", () => {
  const empty: ProfileData = {
    login: "ghost", name: "ghost", createdAt: "2026-10-01T00:00:00Z", followers: 0, stars: 0, repos: 0,
    contributedTo: 0, pullRequests: 0, issues: 0, yearContributions: 0, yearCommits: 0,
    calendar: [{ date: "2026-10-04", count: 0 }], languages: [],
  };
  for (const card of CARD_NAMES) assertSaneSvg(renderCard(card, empty), `empty/${card}`);
});

test("auto theme switches palettes with prefers-color-scheme", () => {
  const svg = renderCard("streak", demoProfile(), { theme: "auto" });
  assert.match(svg, /@media \(prefers-color-scheme: dark\)/);
});

test("animate=false disables animations", () => {
  const svg = renderCard("activity", demoProfile(), { animate: false });
  assert.match(svg, /\*\{animation:none!important\}/);
});
