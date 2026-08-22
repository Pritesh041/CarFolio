import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatCurrency, formatLabel, formatPercent } from "../../lib/format";
import type { Car } from "../../types";

interface CarCardProps {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}

export function CarCard({ car, onEdit, onDelete }: CarCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const gain = car.estimatedValue - car.purchasePrice;
  const gainPercent = car.purchasePrice > 0 ? (gain / car.purchasePrice) * 100 : 0;
  const primaryPhoto = car.photos.find((p) => p.isPrimary) ?? car.photos[0];

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <Link to={`/collection/${car.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={car.model}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                <rect x="6" y="20" width="36" height="12" rx="4" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="15" cy="34" r="4" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="33" cy="34" r="4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge tone="accent">{formatLabel(car.packagingCondition)}</Badge>
          </div>
        </div>

        <div className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-graphite-text">{car.brand.name}</p>
          <h3 className="mt-1 truncate font-display text-xl font-semibold text-ink">{car.model}</h3>
          <p className="mt-0.5 truncate text-sm text-graphite-text">
            {[car.series, car.year, car.scale].filter(Boolean).join(" · ")}
          </p>

          <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
            <div>
              <p className="text-lg font-semibold text-ink tabular-nums">{formatCurrency(car.estimatedValue)}</p>
              <p className={gain >= 0 ? "text-xs font-semibold text-racing-green" : "text-xs font-semibold text-negative"}>
                {gain >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(gain))} · {formatPercent(gainPercent)}
              </p>
            </div>
            <p className="text-xs text-graphite-text">{formatLabel(car.condition)}</p>
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen((v) => !v);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-paper backdrop-blur transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Car actions"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3.5" r="1.3" />
            <circle cx="8" cy="8" r="1.3" />
            <circle cx="8" cy="12.5" r="1.3" />
          </svg>
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 mt-1 w-36 overflow-hidden rounded-button border border-line bg-paper shadow-xl"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onEdit(car);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-ink/5"
            >
              Quick edit
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete(car);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-negative hover:bg-ink/5"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
