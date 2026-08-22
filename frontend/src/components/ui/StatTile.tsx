import { Card } from "./Card";
import clsx from "clsx";

interface StatTileProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
}

export function StatTile({ label, value, delta, deltaTone = "positive" }: StatTileProps) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-graphite-text">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink tabular-nums sm:text-4xl">{value}</p>
      {delta && (
        <p
          className={clsx(
            "mt-1 text-sm font-medium",
            deltaTone === "positive" && "text-racing-green",
            deltaTone === "negative" && "text-negative",
            deltaTone === "neutral" && "text-graphite-text",
          )}
        >
          {delta}
        </p>
      )}
    </Card>
  );
}
