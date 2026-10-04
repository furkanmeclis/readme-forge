// Stroke icons on a 16×16 grid, colored by the caller via `stroke`/`color`.

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const PATHS = {
  star: `<polygon points="${starPoints(8, 8.6, 7, 3)}" stroke-linejoin="round"/>`,
  commit: `<circle cx="8" cy="8" r="3"/><path d="M1 8h4M11 8h4"/>`,
  pr: `<circle cx="4" cy="3.5" r="1.8"/><circle cx="4" cy="12.5" r="1.8"/><circle cx="12" cy="12.5" r="1.8"/><path d="M4 5.3v5.4M12 10.7V6.5a2 2 0 0 0-2-2H7.5M9 3 7.5 4.5 9 6"/>`,
  issue: `<circle cx="8" cy="8" r="6.3"/><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none"/>`,
  repo: `<rect x="3" y="1.5" width="10" height="13" rx="1.6"/><path d="M6 1.5v13M8.5 5h2"/>`,
  people: `<circle cx="6" cy="5" r="2.5"/><path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"/><circle cx="11.6" cy="5.4" r="1.9"/><path d="M12.2 9.6c1.8.4 2.8 2 2.8 4"/>`,
  fork: `<circle cx="4" cy="3" r="1.7"/><circle cx="12" cy="3" r="1.7"/><circle cx="8" cy="13" r="1.7"/><path d="M4 4.7V6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4.7M8 8v3.3"/>`,
  calendar: `<rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/>`,
  trophy: `<path d="M5 2h6v4a3 3 0 0 1-6 0zM5 3.5H2.5a2.5 2.5 0 0 0 2.6 3M11 3.5h2.5a2.5 2.5 0 0 1-2.6 3M8 9v3M5.5 14h5M6.5 12h3"/>`,
  bolt: `<path d="M9 1.5 3.5 9H8l-1 5.5L12.5 7H8z" stroke-linejoin="round"/>`,
} as const;

export type IconName = keyof typeof PATHS;

export function icon(name: IconName, x: number, y: number, size = 16, color = "var(--accent)"): string {
  const s = size / 16;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke-width="${(1.4 / s).toFixed(2)}" stroke-linecap="round" style="stroke:${color};color:${color}">${PATHS[name]}</g>`;
}

/** Flame on a 24×24 grid with gradient fill + inner core. */
export function flame(x: number, y: number, size: number, gradientId: string): string {
  const s = size / 24;
  return `<g transform="translate(${x} ${y}) scale(${s})">
<path d="M12 1.5c.8 3.3-1.6 5.2-1.6 8 0 1.6 1.1 2.7 2.4 2.7 1.5 0 2.4-1.2 2.2-3.6 2.6 2.2 4.5 5.1 4.5 8.4A7.5 7.5 0 0 1 4.5 17c0-4.6 3.2-7 4.9-10.3C10.3 5 11.3 3.3 12 1.5z" fill="url(#${gradientId})"/>
<path d="M12 22.5a3.6 3.6 0 0 1-3.6-3.6c0-2.3 1.8-3.4 2.6-5.3.4 1.4 1.4 2.1 2.3 2.1.9 0 1.5-.6 1.6-1.6 1 1.1 1.9 2.6 1.9 4.6A3.8 3.8 0 0 1 12 22.5z" style="fill:var(--bg1)" opacity=".55"/>
</g>`;
}
