import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useAddCar } from "../lib/addCarStore";
import { useTheme, CHART_COLORS } from "../lib/theme";
import { formatCurrency, formatPercent, formatSigned } from "../lib/format";
import { StatTile } from "../components/ui/StatTile";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { SectionHeading } from "../components/ui/SectionHeading";
import type { AnalyticsSummary, Car, ValueHistoryPoint } from "../types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function OwnedCarTile({ car }: { car: Car }) {
  const photo = car.photos[0];
  return (
    <Link to={`/collection/${car.id}`} className="group block w-64 shrink-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-cream">
        {photo ? (
          <img
            src={photo.url}
            alt={car.model}
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent p-4 pt-14">
          <p className="text-xs font-semibold uppercase tracking-wide text-paper/80">{car.brand.name}</p>
          <h3 className="mt-0.5 truncate font-display text-lg font-bold leading-tight text-paper">{car.model}</h3>
          <p className="mt-1 text-sm font-semibold tabular-nums text-paper/90">{formatCurrency(car.estimatedValue)}</p>
        </div>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const addCar = useAddCar();
  const { theme } = useTheme();
  const chartColors = CHART_COLORS[theme];
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [history, setHistory] = useState<ValueHistoryPoint[]>([]);
  const [featured, setFeatured] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get<AnalyticsSummary>("/analytics/summary"),
      api.get<ValueHistoryPoint[]>("/analytics/value-history", { params: { range: "6M" } }),
      api.get<Car[]>("/analytics/most-valuable", { params: { limit: 6 } }),
    ])
      .then(([summaryRes, historyRes, featuredRes]) => {
        setSummary(summaryRes.data);
        setHistory(historyRes.data);
        setFeatured(featuredRes.data);
      })
      .finally(() => setIsLoading(false));
  }, [addCar.refreshKey]);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-card bg-cream" />;
  }

  const hasCars = (summary?.totalModels ?? 0) > 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {greeting()}, {user?.name?.split(" ")[0]}
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Your Garage
          </h1>
          {summary && <p className="mt-2 text-sm text-graphite-text">{summary.totalModels} models in the collection</p>}
        </div>
        {hasCars && <Button onClick={addCar.openModal}>+ Add Car</Button>}
      </div>

      {!hasCars ? (
        <EmptyState
          eyebrow="Your garage is empty"
          title="Every collection starts with one car"
          description="Start building yours — add your first model manually or scan its packaging."
          action={
            <>
              <Button onClick={addCar.openModal}>+ Add Your First Car</Button>
              <Button variant="secondary" disabled title="Coming in a future phase">
                Scan a Car
              </Button>
            </>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Total Models" value={String(summary?.totalModels ?? 0)} />
            <StatTile label="Collection Value" value={formatCurrency(summary?.collectionValue ?? 0)} />
            <StatTile label="Total Invested" value={formatCurrency(summary?.totalInvested ?? 0)} />
            <StatTile
              label="Estimated Gain"
              value={formatSigned(summary?.estimatedGain ?? 0)}
              delta={formatPercent(summary?.growthPercent ?? 0)}
              deltaTone={(summary?.estimatedGain ?? 0) >= 0 ? "positive" : "negative"}
            />
          </div>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-graphite-text">Collection Growth</p>
                <p className="mt-1 font-display text-2xl font-semibold text-accent">
                  {formatPercent(summary?.growthPercent ?? 0)}
                </p>
              </div>
            </div>
            <div className="h-56">
              {history.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={chartColors.grid} vertical={false} strokeDasharray="3 6" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      stroke={chartColors.axis}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke={chartColors.axis} fontSize={11} tickLine={false} axisLine={false} width={48} />
                    <Tooltip
                      contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 10 }}
                      labelStyle={{ color: chartColors.tooltipLabel }}
                      itemStyle={{ color: chartColors.tooltipText }}
                      formatter={(value) => [formatCurrency(Number(value)), "Value"]}
                    />
                    <Line type="monotone" dataKey="value" stroke={chartColors.accent} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-graphite-text">
                  Value history builds up as your collection grows
                </div>
              )}
            </div>
          </Card>

          {featured.length > 0 && (
            <div className="space-y-4">
              <SectionHeading
                eyebrow="Top of the collection"
                title="Most Valuable"
                action={{ label: "View Collection", to: "/collection" }}
              />
              <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 no-scrollbar">
                {featured.map((car) => (
                  <OwnedCarTile key={car.id} car={car} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
