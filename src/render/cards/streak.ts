import type { StreakStats, Streak } from "../../stats/streak.ts";
import { GRID, card, esc, fadeIn, heading, inner, num, shortDate, type CardOptions } from "../svg.ts";
import { flame, icon } from "../icons.ts";

const W = inner(GRID.HALF);
const H = inner(GRID.HALF_HEIGHT);
const ID = "rf-streak";

function range(s: Streak): string {
  if (!s.start || !s.end) return "—";
  if (s.start === s.end) return shortDate(s.start, true);
  const sameYear = s.start.slice(0, 4) === s.end.slice(0, 4);
  return `${shortDate(s.start, !sameYear)} – ${shortDate(s.end, true)}`;
}

export function renderStreak(s: StreakStats, since: string, opts: CardOptions): string {
  const cx = W / 2;
  const cy = 124;
  const r = 42;
  const c = 2 * Math.PI * r;

  const side = (x: number, value: string, label: string, sub: string, ic: "calendar" | "trophy", delay: number) =>
    `<g${fadeIn(opts, delay)}>
${icon(ic, x - 8, 66, 16, "var(--muted)")}
<text x="${x}" y="${cy + 6}" class="big" font-size="28" text-anchor="middle">${esc(value)}</text>
<text x="${x}" y="${cy + 34}" class="label" text-anchor="middle" style="fill:var(--text)">${esc(label)}</text>
<text x="${x}" y="${cy + 52}" class="sub" font-size="11" text-anchor="middle">${esc(sub)}</text>
</g>`;

  const center = `<g${fadeIn(opts, 120)}>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--track)" stroke-width="6"/>
<circle class="ring" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#${ID}-accent)" stroke-width="6" stroke-linecap="round"
  stroke-dasharray="${c.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" filter="url(#${ID}-soft)"/>
<circle cx="${cx}" cy="${cy - r}" r="15" style="fill:var(--bg1)"/>
<g class="flicker">${flame(cx - 12, cy - r - 14, 24, `${ID}-fire`)}</g>
<text x="${cx}" y="${cy + 12}" class="big" font-size="34" text-anchor="middle">${num(s.current.length)}</text>
<text x="${cx}" y="${cy + r + 24}" class="label" text-anchor="middle" style="fill:var(--accent);font-weight:700">Current Streak</text>
<text x="${cx}" y="${cy + r + 41}" class="sub" font-size="11" text-anchor="middle">${esc(range(s.current))}</text>
</g>`;

  const dividers = [W / 3 - 4, (2 * W) / 3 + 4]
    .map((x) => `<line x1="${x}" x2="${x}" y1="74" y2="${H - 30}" style="stroke:var(--grid)" stroke-width="1"/>`)
    .join("");

  return card(
    {
      id: ID,
      width: W,
      height: H,
      title: "Contribution streak",
      desc: `Current streak ${s.current.length} days, longest ${s.longest.length} days, ${s.total} total contributions`,
      css: `.ring{animation:ring 1.3s cubic-bezier(.3,.8,.3,1) .25s both}@keyframes ring{from{stroke-dashoffset:${c.toFixed(2)}}}
.flicker{transform-box:fill-box;transform-origin:50% 100%;animation:flicker 2.4s ease-in-out infinite}
@keyframes flicker{0%,100%{transform:scale(1)}30%{transform:scale(1.06,.96)}60%{transform:scale(.97,1.05)}}`,
      defs: `<linearGradient id="${ID}-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:#ffb347"/></linearGradient>
<filter id="${ID}-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
      body: [
        heading(ID, "Contribution Streak", opts, W, `since ${shortDate(since, true)}`),
        dividers,
        side(W / 6 - 2, num(s.total), "Total Contributions", "all time", "calendar", 250),
        center,
        side((5 * W) / 6 + 2, num(s.longest.length), "Longest Streak", range(s.longest), "trophy", 350),
      ].join("\n"),
    },
    opts,
  );
}
