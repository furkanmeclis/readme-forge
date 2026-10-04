import { themeCss, type ThemeName } from "./theme.ts";

export interface CardOptions {
  theme: ThemeName;
  hideBorder: boolean;
  animate: boolean;
}

export const DEFAULT_CARD_OPTIONS: CardOptions = { theme: "midnight", hideBorder: false, animate: true };

export const FONT = `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Ubuntu, Arial, sans-serif`;

export function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function num(n: number): string {
  return n.toLocaleString("en-US");
}

export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-03-04" → "Mar 4" (or "Mar 4, 2026" with year). */
export function shortDate(iso: string, withYear = false): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}${withYear ? `, ${y}` : ""}`;
}

/** Staggered fade-up; returns a style attribute (or nothing when animation is off). */
export function fadeIn(opts: CardOptions, delayMs: number): string {
  return opts.animate ? ` class="fade" style="animation-delay:${delayMs}ms"` : "";
}

const BASE_CSS = `
text{font-family:${FONT};fill:var(--text)}
.title{font-size:17px;font-weight:700;fill:var(--title)}
.sub{font-size:12px;fill:var(--muted)}
.label{font-size:12px;fill:var(--muted);letter-spacing:.3px}
.value{font-size:15px;font-weight:700;fill:var(--text);font-variant-numeric:tabular-nums}
.big{font-weight:800;fill:var(--text);font-variant-numeric:tabular-nums}
.fade{animation:fadeUp .7s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes pulse{0%,100%{opacity:.55}50%{opacity:1}}
`;

export interface CardShell {
  id: string;
  width: number;
  height: number;
  title: string;
  /** Accessible description. */
  desc: string;
  css?: string;
  defs?: string;
  body: string;
}

/** Root SVG: themed background with a soft glow, gradient border, extra css/defs. */
export function card(shell: CardShell, opts: CardOptions): string {
  const { id, width: w, height: h } = shell;
  const css = themeCss(opts.theme) + BASE_CSS + (shell.css ?? "") + (opts.animate ? "" : "*{animation:none!important}");
  const border = opts.hideBorder
    ? ""
    : `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="none" stroke="url(#${id}-stroke)" stroke-width="1"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-t ${id}-d">
<title id="${id}-t">${esc(shell.title)}</title>
<desc id="${id}-d">${esc(shell.desc)}</desc>
<style>${css}</style>
<defs>
<linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--bg1)"/><stop offset="1" style="stop-color:var(--bg2)"/></linearGradient>
<linearGradient id="${id}-stroke" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.55"/><stop offset=".35" style="stop-color:var(--border)"/><stop offset="1" style="stop-color:var(--accent2);stop-opacity:.55"/></linearGradient>
<linearGradient id="${id}-accent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--accent2)"/></linearGradient>
<radialGradient id="${id}-glow" cx="1" cy="0" r="1"><stop offset="0" style="stop-color:var(--accent2);stop-opacity:.22"/><stop offset=".6" style="stop-color:var(--accent2);stop-opacity:0"/></radialGradient>
<radialGradient id="${id}-glow2" cx="0" cy="1" r=".9"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.12"/><stop offset=".6" style="stop-color:var(--accent);stop-opacity:0"/></radialGradient>
<clipPath id="${id}-clip"><rect width="${w}" height="${h}" rx="14"/></clipPath>
${shell.defs ?? ""}
</defs>
<g clip-path="url(#${id}-clip)">
<rect width="${w}" height="${h}" fill="url(#${id}-bg)"/>
<rect width="${w}" height="${h}" fill="url(#${id}-glow)"/>
<rect width="${w}" height="${h}" fill="url(#${id}-glow2)"/>
</g>
${border}
${shell.body}
</svg>
`;
}

/** Card heading: accent bar + title (+ optional subtitle on the right). */
export function heading(id: string, title: string, opts: CardOptions, width: number, right?: string): string {
  return `<g${fadeIn(opts, 0)}>
<rect x="24" y="22" width="4" height="18" rx="2" fill="url(#${id}-accent)"/>
<text x="36" y="37" class="title">${esc(title)}</text>
${right ? `<text x="${width - 24}" y="36" class="sub" text-anchor="end">${esc(right)}</text>` : ""}
</g>`;
}

/** Rough text width for layout (system sans, average glyph ≈ 0.56em). */
export function textWidth(s: string, fontSize: number): number {
  return s.length * fontSize * 0.56;
}
