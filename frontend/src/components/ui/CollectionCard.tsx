import { Link } from "react-router-dom";
import clsx from "clsx";

interface CollectionCardProps {
  href: string;
  imageUrl?: string | null;
  title: string;
  ownerName?: string | null;
  modelCount?: number | null;
  description?: string | null;
  size?: "lg" | "md";
  className?: string;
}

export function CollectionCard({
  href,
  imageUrl,
  title,
  ownerName,
  modelCount,
  description,
  size = "md",
  className,
}: CollectionCardProps) {
  return (
    <Link to={href} className={clsx("group block", className)}>
      <div
        className={clsx(
          "relative overflow-hidden rounded-card bg-cream",
          size === "lg" ? "aspect-[4/5] sm:aspect-[16/10]" : "aspect-[4/5]",
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-graphite-text">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="8" y="22" width="40" height="14" rx="5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="19" cy="40" r="5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="37" cy="40" r="5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5">
          {modelCount != null && (
            <p className="text-xs font-bold uppercase tracking-widest text-paper/80">{modelCount} Models</p>
          )}
          <h3 className={clsx("mt-1 font-display font-bold leading-[1.05] text-paper", size === "lg" ? "text-3xl" : "text-xl")}>
            {title}
          </h3>
          {ownerName && <p className="mt-1 text-sm text-paper/80">@{ownerName}</p>}
          {description && <p className="mt-2 max-w-sm text-sm text-paper/70">{description}</p>}
          <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-paper opacity-0 transition-opacity group-hover:opacity-100">
            View Garage →
          </span>
        </div>
      </div>
    </Link>
  );
}
