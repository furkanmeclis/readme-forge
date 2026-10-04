import type { RepoLanguage } from "../types.ts";

export interface LanguageShare {
  name: string;
  color: string;
  size: number;
  /** 0–100, rounded to one decimal. */
  percent: number;
}

export interface LanguageOptions {
  top: number;
  exclude?: string[];
}

const OTHER_COLOR = "#8b949e";

export function aggregateLanguages(repos: RepoLanguage[], opts: LanguageOptions): LanguageShare[] {
  const exclude = new Set((opts.exclude ?? []).map((n) => n.toLowerCase()));
  const totals = new Map<string, { color: string; size: number }>();
  for (const l of repos) {
    if (exclude.has(l.name.toLowerCase())) continue;
    const t = totals.get(l.name) ?? { color: l.color ?? OTHER_COLOR, size: 0 };
    t.size += l.size;
    totals.set(l.name, t);
  }
  const sum = [...totals.values()].reduce((a, t) => a + t.size, 0);
  if (sum === 0) return [];

  const sorted = [...totals.entries()]
    .map(([name, t]) => ({ name, color: t.color, size: t.size }))
    .sort((a, b) => b.size - a.size);
  const head = sorted.slice(0, opts.top);
  const restSize = sorted.slice(opts.top).reduce((a, l) => a + l.size, 0);
  if (restSize > 0) head.push({ name: "Other", color: OTHER_COLOR, size: restSize });

  return head.map((l) => ({ ...l, percent: Math.round((l.size / sum) * 1000) / 10 }));
}
