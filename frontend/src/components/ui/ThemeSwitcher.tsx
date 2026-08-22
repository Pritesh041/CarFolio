import clsx from "clsx";
import { THEMES, useTheme, type ThemeName } from "../../lib/theme";

const PREVIEW_SWATCHES: Record<ThemeName, { bg: string; accent: string; ink: string }> = {
  editorial: { bg: "#f5f3ee", accent: "#e0531f", ink: "#17150f" },
  midnight: { bg: "#14130f", accent: "#e0531f", ink: "#f3efe6" },
  heritage: { bg: "#f2e9d8", accent: "#7a2323", ink: "#2b1e14" },
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {THEMES.map((t) => {
        const swatch = PREVIEW_SWATCHES[t.name];
        const active = theme === t.name;
        return (
          <button
            key={t.name}
            type="button"
            onClick={() => setTheme(t.name)}
            className={clsx(
              "rounded-card border p-4 text-left transition-colors",
              active ? "border-accent" : "border-line hover:border-line-strong",
            )}
          >
            <div
              className="flex h-16 w-full items-end gap-1.5 overflow-hidden rounded-input p-2"
              style={{ backgroundColor: swatch.bg }}
            >
              <span className="h-6 w-6 rounded-full" style={{ backgroundColor: swatch.accent }} />
              <span className="h-3 flex-1 rounded-full" style={{ backgroundColor: swatch.ink, opacity: 0.15 }} />
            </div>
            <p className="mt-3 font-display text-base font-semibold text-ink">
              {t.label}
              {active && <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-accent">Active</span>}
            </p>
            <p className="mt-1 text-xs text-graphite-text">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
