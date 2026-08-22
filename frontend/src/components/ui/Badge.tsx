import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-ink/5 text-graphite-text",
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-racing-green-soft text-racing-green",
  warning: "bg-warning-soft text-warning",
  danger: "bg-negative-soft text-negative",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
