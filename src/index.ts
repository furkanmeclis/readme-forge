import type { ProfileData } from "./types.ts";
import { computeStreaks } from "./stats/streak.ts";
import { aggregateLanguages } from "./stats/languages.ts";
import { activitySeries } from "./stats/activity.ts";
import { DEFAULT_CARD_OPTIONS, type CardOptions } from "./render/svg.ts";
import { renderStats } from "./render/cards/stats.ts";
import { renderLanguages } from "./render/cards/languages.ts";
import { renderStreak } from "./render/cards/streak.ts";
import { renderActivity } from "./render/cards/activity.ts";

export type { ProfileData } from "./types.ts";
export type { CardOptions } from "./render/svg.ts";
export { fetchProfile, GitHubError } from "./github/client.ts";
export { THEMES, THEME_NAMES, isTheme, type ThemeName } from "./render/theme.ts";

export const CARD_NAMES = ["stats", "languages", "streak", "activity"] as const;
export type CardName = (typeof CARD_NAMES)[number];

export interface RenderOptions extends CardOptions {
  /** languages: how many to show before bucketing into "Other". */
  top: number;
  /** languages: names to ignore (case-insensitive). */
  exclude: string[];
  /** activity: window size in days. */
  days: number;
}

export const DEFAULT_RENDER_OPTIONS: RenderOptions = { ...DEFAULT_CARD_OPTIONS, top: 8, exclude: [], days: 60 };

/** Render one card for a profile. Pure: no I/O, safe to call from an HTTP handler. */
export function renderCard(name: CardName, profile: ProfileData, options: Partial<RenderOptions> = {}): string {
  const o = { ...DEFAULT_RENDER_OPTIONS, ...options };
  switch (name) {
    case "stats":
      return renderStats(profile, o);
    case "languages":
      return renderLanguages(aggregateLanguages(profile.languages, { top: o.top, exclude: o.exclude }), o);
    case "streak":
      return renderStreak(computeStreaks(profile.calendar), profile.createdAt, o);
    case "activity":
      return renderActivity(activitySeries(profile.calendar, o.days), o);
  }
}
