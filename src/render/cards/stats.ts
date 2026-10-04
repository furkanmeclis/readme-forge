import type { ProfileData } from "../../types.ts";
import { computeLevel } from "../../stats/level.ts";
import { card, compact, esc, fadeIn, heading, num, type CardOptions } from "../svg.ts";
import { icon, type IconName } from "../icons.ts";

const W = 500;
const H = 210;
const ID = "rf-stats";

export function renderStats(p: ProfileData, opts: CardOptions): string {
  const level = computeLevel({
    commits: p.yearCommits,
    pullRequests: p.pullRequests,
    issues: p.issues,
    stars: p.stars,
    followers: p.followers,
    contributedTo: p.contributedTo,
  });

  const rows: [IconName, string, number][] = [
    ["star", "Total Stars", p.stars],
    ["commit", "Commits (1y)", p.yearCommits],
    ["pr", "Pull Requests", p.pullRequests],
    ["issue", "Issues", p.issues],
    ["repo", "Repositories", p.repos],
    ["fork", "Contributed to", p.contributedTo],
  ];

  const metrics = rows
    .map(([ic, label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 24 + col * 160;
      const y = 76 + row * 34;
      return `<g${fadeIn(opts, 150 + i * 90)}>
${icon(ic, x, y - 12)}
<text x="${x + 24}" y="${y}" class="label">${esc(label)}</text>
<text x="${x + 148}" y="${y}" class="value" text-anchor="end">${compact(value)}</text>
</g>`;
    })
    .join("\n");

  // Level ring
  const cx = 412;
  const cy = 112;
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - level.percent);
  const ring = `<g${fadeIn(opts, 100)}>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--track)" stroke-width="9"/>
<circle class="ring" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#${ID}-accent)" stroke-width="9" stroke-linecap="round"
  stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" filter="url(#${ID}-soft)"/>
<text x="${cx}" y="${cy + 9}" class="big" font-size="30" text-anchor="middle">${esc(level.label)}</text>
<text x="${cx}" y="${cy + 26}" class="label" font-size="9" text-anchor="middle" letter-spacing="2">LEVEL</text>
</g>`;

  const footer = `<g${fadeIn(opts, 750)}>
<line x1="24" x2="${W - 24}" y1="${H - 34}" y2="${H - 34}" style="stroke:var(--grid)"/>
${icon("bolt", 24, H - 25, 14)}
<text x="44" y="${H - 14}" class="sub"><tspan class="value" font-size="12">${num(p.yearContributions)}</tspan> contributions in the last year · <tspan class="value" font-size="12">${compact(p.followers)}</tspan> followers</text>
</g>`;

  return card(
    {
      id: ID,
      width: W,
      height: H,
      title: `${p.name}'s GitHub stats`,
      desc: `Stars ${p.stars}, commits ${p.yearCommits}, pull requests ${p.pullRequests}, issues ${p.issues}, level ${level.label}`,
      css: `.ring{animation:ring 1.4s cubic-bezier(.3,.8,.3,1) .2s both}@keyframes ring{from{stroke-dashoffset:${c.toFixed(2)}}}`,
      defs: `<filter id="${ID}-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
      body: [heading(ID, p.name, opts, W, `@${p.login}`), metrics, ring, footer].join("\n"),
    },
    opts,
  );
}
