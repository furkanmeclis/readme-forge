export interface Palette {
  bg1: string;
  bg2: string;
  border: string;
  title: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  track: string;
  grid: string;
}

export const THEMES = {
  midnight: {
    bg1: "#0d1117", bg2: "#161b2e", border: "#30363d", title: "#ff4d8d", text: "#e6edf3",
    muted: "#8b949e", accent: "#ff4d8d", accent2: "#7c5cff", track: "#21262d", grid: "#1f2633",
  },
  neon: {
    bg1: "#07070f", bg2: "#12122a", border: "#2a2a4a", title: "#00f5d4", text: "#f0f0ff",
    muted: "#8a8ab0", accent: "#00f5d4", accent2: "#f15bb5", track: "#1c1c36", grid: "#191930",
  },
  dracula: {
    bg1: "#21222c", bg2: "#2b2d3a", border: "#44475a", title: "#ff79c6", text: "#f8f8f2",
    muted: "#9ea3c0", accent: "#ff79c6", accent2: "#bd93f9", track: "#373948", grid: "#33354a",
  },
  ocean: {
    bg1: "#071826", bg2: "#0d2a42", border: "#1d3d5a", title: "#4cc9f0", text: "#e0f2ff",
    muted: "#7fa3bf", accent: "#4cc9f0", accent2: "#4361ee", track: "#123049", grid: "#123049",
  },
  light: {
    bg1: "#ffffff", bg2: "#f4f1fb", border: "#d0d7de", title: "#d6336c", text: "#1f2328",
    muted: "#656d76", accent: "#d6336c", accent2: "#6741d9", track: "#eaeef2", grid: "#eef0f3",
  },
} satisfies Record<string, Palette>;

export type ThemeName = keyof typeof THEMES | "auto";

export const THEME_NAMES = [...Object.keys(THEMES), "auto"] as ThemeName[];

export function isTheme(name: string): name is ThemeName {
  return (THEME_NAMES as string[]).includes(name);
}

function vars(p: Palette): string {
  return Object.entries(p)
    .map(([k, v]) => `--${k}:${v};`)
    .join("");
}

/** CSS custom properties for a theme; "auto" follows the viewer's color scheme. */
export function themeCss(name: ThemeName): string {
  if (name === "auto") {
    return `svg{${vars(THEMES.light)}}@media (prefers-color-scheme: dark){svg{${vars(THEMES.midnight)}}}`;
  }
  return `svg{${vars(THEMES[name])}}`;
}
