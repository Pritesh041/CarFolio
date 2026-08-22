import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import clsx from "clsx";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: { label: string; to: string };
  className?: string;
  light?: boolean;
}

export function SectionHeading({ eyebrow, title, description, action, className, light }: SectionHeadingProps) {
  return (
    <div className={clsx("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && (
          <p className={clsx("text-xs font-semibold uppercase tracking-widest", light ? "text-paper/70" : "text-accent")}>
            {eyebrow}
          </p>
        )}
        <h2
          className={clsx(
            "mt-1 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl",
            light ? "text-paper" : "text-ink",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={clsx("mt-2 max-w-xl text-sm sm:text-base", light ? "text-paper/80" : "text-graphite-text")}>
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className={clsx(
            "shrink-0 text-sm font-semibold uppercase tracking-wide",
            light ? "text-paper hover:text-paper/80" : "text-ink hover:text-accent",
          )}
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
