import type { ReactNode } from "react";

interface EmptyStateProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ eyebrow, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong px-8 py-20 text-center">
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="mb-6 opacity-50">
        <rect x="8" y="30" width="56" height="18" rx="6" stroke="currentColor" strokeWidth="2" className="text-graphite-text" />
        <circle cx="22" cy="50" r="6" stroke="currentColor" strokeWidth="2" className="text-graphite-text" />
        <circle cx="50" cy="50" r="6" stroke="currentColor" strokeWidth="2" className="text-graphite-text" />
        <path d="M14 30L20 16H52L58 30" stroke="currentColor" strokeWidth="2" className="text-graphite-text" />
      </svg>
      <p className="text-xs font-semibold uppercase tracking-widest text-graphite-text">{eyebrow}</p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-graphite-text">{description}</p>}
      {action && <div className="mt-6 flex items-center gap-3">{action}</div>}
    </div>
  );
}
