import type { LanguageShare } from "../../stats/languages.ts";
import { card, esc, fadeIn, heading, type CardOptions } from "../svg.ts";

const W = 500;
const ID = "rf-langs";

export function renderLanguages(langs: LanguageShare[], opts: CardOptions, title = "Most Used Languages"): string {
  const rows = Math.max(1, Math.ceil(langs.length / 2));
  const H = Math.max(210, 82 + rows * 30);

  // Donut
  const cx = 104;
  const cy = 50 + (H - 50) / 2;
  const r = 56;
  const c = 2 * Math.PI * r;
  const gap = langs.length > 1 ? 3 : 0;
  let acc = 0;
  const segments = langs
    .map((l, i) => {
      const len = (l.percent / 100) * c;
      const dash = Math.max(len - gap, 0.5);
      const seg = `<circle class="seg" style="stroke:${l.color};animation-delay:${200 + i * 110}ms"
  cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="18"
  stroke-dasharray="${dash.toFixed(2)} ${(c - dash).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}"
  transform="rotate(-90 ${cx} ${cy})"/>`;
      acc += len;
      return seg;
    })
    .join("\n");

  const top = langs[0];
  const center = top
    ? `<g${fadeIn(opts, 500)}>
<text x="${cx}" y="${cy + 2}" class="big" font-size="22" text-anchor="middle">${top.percent.toFixed(0)}%</text>
<text x="${cx}" y="${cy + 20}" class="label" font-size="11" text-anchor="middle">${esc(top.name)}</text>
</g>`
    : `<text x="${cx}" y="${cy + 4}" class="label" text-anchor="middle">No data</text>`;

  const legend = langs
    .map((l, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 212 + col * 144;
      const y = 76 + row * 30;
      return `<g${fadeIn(opts, 250 + i * 70)}>
<circle cx="${x + 5}" cy="${y - 4}" r="5" style="fill:${l.color}"/>
<text x="${x + 17}" y="${y}" class="label" style="fill:var(--text)">${esc(l.name)}</text>
<text x="${x + 17}" y="${y + 14}" class="sub" font-size="10.5">${l.percent.toFixed(1)}%</text>
<rect x="${x + 56}" y="${y + 9}" width="60" height="3" rx="1.5" style="fill:var(--track)"/>
<rect class="bar" x="${x + 56}" y="${y + 9}" width="${Math.max((60 * l.percent) / (top?.percent || 1), 2).toFixed(1)}" height="3" rx="1.5" style="fill:${l.color};animation-delay:${400 + i * 70}ms"/>
</g>`;
    })
    .join("\n");

  return card(
    {
      id: ID,
      width: W,
      height: H,
      title,
      desc: langs.map((l) => `${l.name} ${l.percent}%`).join(", "),
      css: `.seg{stroke-linecap:butt;animation:seg 1s cubic-bezier(.3,.8,.3,1) both}
@keyframes seg{from{stroke-dasharray:0 ${c.toFixed(2)}}}
.bar{transform-box:fill-box;transform-origin:left;animation:grow .9s cubic-bezier(.3,.8,.3,1) both}`,
      body: [
        heading(ID, title, opts, W),
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--track)" stroke-width="18"/>`,
        segments,
        center,
        legend,
      ].join("\n"),
    },
    opts,
  );
}
