import type { ContributionDay } from "../../types.ts";
import { GRID, card, compact, esc, fadeIn, heading, inner, num, shortDate, type CardOptions } from "../svg.ts";

const W = inner(GRID.FULL);
const H = 270;
const ID = "rf-activity";
const PAD = { left: 58, right: 28, top: 74, bottom: 46 };

type Pt = [number, number];

/** Monotone cubic (Fritsch–Carlson) path: smooth, never overshoots below zero. */
export function monotonePath(pts: Pt[]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0][0]},${pts[0][1]}`;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    m.push((pts[i + 1][1] - pts[i][1]) / dx[i]);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      t[i] = k * a * m[i];
      t[i + 1] = k * b * m[i];
    }
  }
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = dx[i] / 3;
    d += `C${f(x0 + h)},${f(y0 + t[i] * h)} ${f(x1 - h)},${f(y1 - t[i + 1] * h)} ${f(x1)},${f(y1)}`;
  }
  return d;
}

/** Axis top as 4 × a "nice" integer step, so every gridline label is a whole number. */
export function niceMax(v: number): number {
  if (v <= 4) return 4;
  const raw = v / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const s of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10]) {
    const step = s * pow;
    if (Number.isInteger(step) && step >= raw) return step * 4;
  }
  return Math.ceil(raw) * 4;
}

export function renderActivity(series: ContributionDay[], opts: CardOptions): string {
  const n = series.length;
  const total = series.reduce((a, d) => a + d.count, 0);
  const max = niceMax(Math.max(0, ...series.map((d) => d.count)));
  const x0 = PAD.left;
  const x1 = W - PAD.right;
  const y0 = H - PAD.bottom;
  const y1 = PAD.top;
  const x = (i: number) => (n <= 1 ? x0 : x0 + ((x1 - x0) * i) / (n - 1));
  const y = (v: number) => y0 - ((y0 - y1) * v) / max;

  const pts: Pt[] = series.map((d, i) => [x(i), y(d.count)]);
  const line = monotonePath(pts);
  const area = n ? `${line}L${x(n - 1).toFixed(1)},${y0}L${x0},${y0}Z` : "";

  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const gy = y(max * f);
      return `<line x1="${x0}" x2="${x1}" y1="${gy.toFixed(1)}" y2="${gy.toFixed(1)}" style="stroke:var(--grid)" ${f === 0 ? "" : 'stroke-dasharray="3 5"'}/>
<text x="${x0 - 12}" y="${(gy + 4).toFixed(1)}" class="sub" font-size="10.5" text-anchor="end">${compact(max * f)}</text>`;
    })
    .join("\n");

  const step = Math.max(1, Math.round(n / 8));
  const xLabels = series
    .map((d, i) => (i % step === 0 || i === n - 1) && (n - 1 - i >= step / 2 || i === n - 1)
      ? `<text x="${x(i).toFixed(1)}" y="${y0 + 22}" class="sub" font-size="10.5" text-anchor="middle">${shortDate(d.date)}</text>`
      : "")
    .join("");

  let peak = 0;
  series.forEach((d, i) => {
    if (d.count >= series[peak].count) peak = i;
  });
  const peakMarker =
    n && series[peak].count > 0
      ? (() => {
          const px = x(peak);
          const py = y(series[peak].count);
          const label = `${num(series[peak].count)} · ${shortDate(series[peak].date)}`;
          const lw = label.length * 6.4 + 16;
          const lx = Math.min(Math.max(px - lw / 2, x0), x1 - lw);
          return `<g${fadeIn(opts, 1500)}>
<line x1="${px.toFixed(1)}" x2="${px.toFixed(1)}" y1="${py.toFixed(1)}" y2="${y0}" style="stroke:var(--accent)" stroke-dasharray="2 4" opacity=".6"/>
<rect x="${lx.toFixed(1)}" y="${(py - 34).toFixed(1)}" width="${lw.toFixed(1)}" height="22" rx="11" style="fill:var(--accent)"/>
<text x="${(lx + lw / 2).toFixed(1)}" y="${(py - 19).toFixed(1)}" font-size="11" font-weight="700" text-anchor="middle" style="fill:var(--bg1)">${esc(label)}</text>
<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" style="fill:var(--bg1);stroke:var(--accent)" stroke-width="2.5"/>
</g>`;
        })()
      : "";

  const last = n
    ? `<circle class="pulse" cx="${x(n - 1).toFixed(1)}" cy="${y(series[n - 1].count).toFixed(1)}" r="9" style="fill:var(--accent2)" opacity=".35"/>
<circle cx="${x(n - 1).toFixed(1)}" cy="${y(series[n - 1].count).toFixed(1)}" r="4" style="fill:var(--accent2)"/>`
    : "";

  const subtitle = `Last ${n} days · ${num(total)} contributions`;

  return card(
    {
      id: ID,
      width: W,
      height: H,
      title: "Contribution activity",
      desc: `${subtitle}; peak ${n ? series[peak].count : 0}`,
      css: `.line{stroke-dasharray:1;stroke-dashoffset:0;animation:line 2s cubic-bezier(.4,.1,.2,1) .2s both}
@keyframes line{from{stroke-dashoffset:1}}
.area{animation:fadeUp 1s ease-out 1s both}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2s ease-in-out infinite}`,
      defs: `<linearGradient id="${ID}-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.38"/><stop offset="1" style="stop-color:var(--accent2);stop-opacity:0"/></linearGradient>
<linearGradient id="${ID}-line" gradientUnits="userSpaceOnUse" x1="${x0}" y1="0" x2="${x1}" y2="0"><stop offset="0" style="stop-color:var(--accent2)"/><stop offset="1" style="stop-color:var(--accent)"/></linearGradient>
<filter id="${ID}-glow" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>`,
      body: [
        heading(ID, "Contribution Activity", opts, W, subtitle),
        grid,
        xLabels,
        `<path class="area" d="${area}" fill="url(#${ID}-fill)"/>`,
        `<path class="line" d="${line}" pathLength="1" fill="none" stroke="url(#${ID}-line)" stroke-width="6" opacity=".45" filter="url(#${ID}-glow)"/>`,
        `<path class="line" d="${line}" pathLength="1" fill="none" stroke="url(#${ID}-line)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
        peakMarker,
        last,
      ].join("\n"),
    },
    opts,
  );
}
