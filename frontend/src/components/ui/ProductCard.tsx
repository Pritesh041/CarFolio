import { Link } from "react-router-dom";
import clsx from "clsx";
import { formatCurrency } from "../../lib/format";

type Variant = "feature" | "standard" | "compact";
type Status = "FOR_SALE" | "TRADE";

interface ProductCardProps {
  href: string;
  imageUrl?: string | null;
  brand?: string;
  title: string;
  scale?: string | null;
  price?: number | null;
  status?: Status;
  sellerName?: string | null;
  variant?: Variant;
  className?: string;
}

const aspectByVariant: Record<Variant, string> = {
  feature: "aspect-[4/5] sm:aspect-[16/11]",
  standard: "aspect-[4/3]",
  compact: "aspect-square",
};

export function ProductCard({
  href,
  imageUrl,
  brand,
  title,
  scale,
  price,
  status = "FOR_SALE",
  sellerName,
  variant = "standard",
  className,
}: ProductCardProps) {
  return (
    <Link to={href} className={clsx("group block", className)}>
      <div className={clsx("relative overflow-hidden rounded-card bg-cream", aspectByVariant[variant])}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-graphite-text">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="20" width="36" height="12" rx="4" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="15" cy="34" r="4" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="33" cy="34" r="4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
        )}

        <span
          className={clsx(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            status === "FOR_SALE" ? "bg-paper/90 text-ink" : "bg-racing-green text-paper",
          )}
        >
          {status === "FOR_SALE" ? "For Sale" : "Trade"}
        </span>

        {variant === "feature" && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent p-5 pt-16">
            {brand && <p className="text-xs font-semibold uppercase tracking-wide text-paper/80">{brand}</p>}
            <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-paper">{title}</h3>
            <div className="mt-2 flex items-center justify-between text-paper/90">
              {scale && <span className="text-sm">{scale}</span>}
              {price != null && <span className="text-lg font-semibold">{formatCurrency(price)}</span>}
            </div>
          </div>
        )}
      </div>

      {variant !== "feature" && (
        <div className="mt-3">
          {brand && <p className="text-xs font-semibold uppercase tracking-wide text-graphite-text">{brand}</p>}
          <h3 className="mt-0.5 truncate font-display text-lg font-semibold text-ink">{title}</h3>
          <div className="mt-1 flex items-center justify-between">
            {scale && <span className="text-sm text-graphite-text">{scale}</span>}
            {price != null && <span className="font-semibold text-ink">{formatCurrency(price)}</span>}
          </div>
          {sellerName && <p className="mt-1 truncate text-xs text-graphite-text">@{sellerName}</p>}
        </div>
      )}
    </Link>
  );
}
