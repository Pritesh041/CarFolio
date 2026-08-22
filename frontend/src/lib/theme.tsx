import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeName = "editorial" | "midnight" | "heritage";

export const THEMES: { name: ThemeName; label: string; description: string }[] = [
  { name: "editorial", label: "Editorial", description: "Ivory & burnt orange — the classic Carfolio look" },
  { name: "midnight", label: "Midnight", description: "Dark racing garage, same orange accent" },
  { name: "heritage", label: "Heritage", description: "Warm parchment & deep maroon, vintage plaque feel" },
];

const STORAGE_KEY = "carfolio.theme";

// Mirrors the CSS custom properties per theme in index.css — kept here as plain
// hex so chart libraries (recharts) that need literal color strings stay in sync
// with the active theme without relying on CSS var() resolution inside SVG.
export const CHART_COLORS: Record<
  ThemeName,
  {
    grid: string;
    axis: string;
    accent: string;
    positive: string;
    negative: string;
    series: string[];
    tooltipBg: string;
    tooltipBorder: string;
    tooltipLabel: string;
    tooltipText: string;
  }
> = {
  editorial: {
    grid: "#ddd6c4",
    axis: "#9c9179",
    accent: "#e0531f",
    positive: "#1f4d3d",
    negative: "#b91c1c",
    series: ["#e0531f", "#1f4d3d", "#9c9179", "#b23e14", "#5c5648", "#c7bfa8"],
    tooltipBg: "#fffdfa",
    tooltipBorder: "#ddd6c4",
    tooltipLabel: "#5c5648",
    tooltipText: "#17150f",
  },
  midnight: {
    grid: "#35312a",
    axis: "#8f8676",
    accent: "#e0531f",
    positive: "#5fbf8f",
    negative: "#f87171",
    series: ["#e0531f", "#5fbf8f", "#8f8676", "#ff7a45", "#a89f8c", "#4a453c"],
    tooltipBg: "#1e1c17",
    tooltipBorder: "#35312a",
    tooltipLabel: "#a89f8c",
    tooltipText: "#f3efe6",
  },
  heritage: {
    grid: "#d8c7a0",
    axis: "#a3854f",
    accent: "#7a2323",
    positive: "#1f4d3d",
    negative: "#a13a2b",
    series: ["#7a2323", "#1f4d3d", "#a3854f", "#5c1919", "#6b5a44", "#c2ac7c"],
    tooltipBg: "#fffaf0",
    tooltipBorder: "#d8c7a0",
    tooltipLabel: "#6b5a44",
    tooltipText: "#2b1e14",
  },
};

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): ThemeName {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "midnight" || stored === "heritage" || stored === "editorial" ? stored : "editorial";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function setTheme(next: ThemeName) {
    setThemeState(next);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
