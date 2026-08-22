import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/api";
import { formatCurrency, formatLabel, formatPercent, formatSigned } from "../lib/format";
import { Card } from "../components/ui/Card";
import { StatTile } from "../components/ui/StatTile";
import { SectionHeading } from "../components/ui/SectionHeading";
import { useTheme, CHART_COLORS } from "../lib/theme";
import type { AcquisitionPoint, AnalyticsSummary, BreakdownItem, Car, ValueHistoryPoint } from "../types";

const RANGES = [
  { value: "7D", label: "7D" },
  { value: "1M", label: "1M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "All" },
];

function Breakdown({ title, data }: { title: string; data: BreakdownItem[] }) {
  const { theme } = useTheme();
  const { series, tooltipBg, tooltipBorder, tooltipLabel, tooltipText } = CHART_COLORS[theme];
  const formatted = data.map((item) => ({ ...item, label: formatLabel(item.label) }));

  return (
    <Card className="p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-graphite-text">{title}</p>
      <div className="flex items-center gap-6">
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={formatted} dataKey="count" nameKey="label" innerRadius={38} outerRadius={56} paddingAngle={2}>
                {formatted.map((_, i) => (
                  <Cell key={i} fill={series[i % series.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 10 }}
                labelStyle={{ color: tooltipLabel }}
                itemStyle={{ color: tooltipText }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          {formatted.slice(0, 5).map((item, i) => (
            <div key={item.label} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 truncate text-graphite-text">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: series[i % series.length] }} />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-graphite-text">{item.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MoverRow({ car, tone }: { car: Car; tone: "positive" | "negative" }) {
  const gain = car.estimatedValue - car.purchasePrice;
  const gainPercent = car.purchasePrice > 0 ? (gain / car.purchasePrice) * 100 : 0;
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{car.model}</p>
        <p className="text-xs text-graphite-text">{car.brand.name}</p>
      </div>
      <p
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          tone === "positive" ? "text-racing-green" : "text-negative"
        }`}
      >
        {formatSigned(gain)} · {formatPercent(gainPercent)}
      </p>
    </div>
  );
}

export function AnalyticsPage() {
  const { theme } = useTheme();
  const chartColors = CHART_COLORS[theme];
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byBrand, setByBrand] = useState<BreakdownItem[]>([]);
  const [byScale, setByScale] = useState<BreakdownItem[]>([]);
  const [byYear, setByYear] = useState<BreakdownItem[]>([]);
  const [byCondition, setByCondition] = useState<BreakdownItem[]>([]);
  const [byPackaging, setByPackaging] = useState<BreakdownItem[]>([]);
  const [byHuntType, setByHuntType] = useState<BreakdownItem[]>([]);
  const [mostValuable, setMostValuable] = useState<Car[]>([]);
  const [gainers, setGainers] = useState<Car[]>([]);
  const [losers, setLosers] = useState<Car[]>([]);
  const [acquisitions, setAcquisitions] = useState<AcquisitionPoint[]>([]);
  const [history, setHistory] = useState<ValueHistoryPoint[]>([]);
  const [range, setRange] = useState("6M");
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<AnalyticsSummary>("/analytics/summary"),
      api.get<BreakdownItem[]>("/analytics/by-brand"),
      api.get<BreakdownItem[]>("/analytics/by-scale"),
      api.get<BreakdownItem[]>("/analytics/by-year"),
      api.get<BreakdownItem[]>("/analytics/by-condition"),
      api.get<BreakdownItem[]>("/analytics/by-packaging"),
      api.get<BreakdownItem[]>("/analytics/by-hunt-type"),
      api.get<Car[]>("/analytics/most-valuable", { params: { limit: 5 } }),
      api.get<Car[]>("/analytics/top-gainers", { params: { limit: 5 } }),
      api.get<Car[]>("/analytics/top-losers", { params: { limit: 5 } }),
      api.get<AcquisitionPoint[]>("/analytics/acquisitions"),
    ])
      .then(
        ([summaryRes, brand, scale, year, condition, packaging, huntType, valuable, gainersRes, losersRes, acquisitionsRes]) => {
          setSummary(summaryRes.data);
          setByBrand(brand.data);
          setByScale(scale.data);
          setByYear(year.data);
          setByCondition(condition.data);
          setByPackaging(packaging.data);
          setByHuntType(huntType.data);
          setMostValuable(valuable.data);
          setGainers(gainersRes.data);
          setLosers(losersRes.data);
          setAcquisitions(acquisitionsRes.data);
        },
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setIsHistoryLoading(true);
    api
      .get<ValueHistoryPoint[]>("/analytics/value-history", { params: { range } })
      .then((res) => setHistory(res.data))
      .finally(() => setIsHistoryLoading(false));
  }, [range]);

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-card bg-cream" />;
  }

  if (byBrand.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-card border border-dashed border-line-strong text-sm text-graphite-text">
        Add a few cars to unlock analytics
      </div>
    );
  }

  const hasHuntTypeSignal = byHuntType.some((item) => item.label !== "NORMAL");

  return (
    <div className="space-y-10">
      <SectionHeading eyebrow="Your Garage" title="Collection Report" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-graphite-text">Value Over Time</p>
          <div className="flex gap-1 rounded-button bg-cream p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`rounded-button px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === r.value ? "bg-paper text-ink shadow-sm" : "text-graphite-text hover:text-ink"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56">
          {isHistoryLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-graphite-text">Loading…</div>
          ) : history.length > 1 ? (
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
              Not enough history yet for this range
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-graphite-text">Collecting Pace</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={acquisitions} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} strokeDasharray="3 6" />
              <XAxis
                dataKey="month"
                tickFormatter={(m) => new Date(`${m}-01`).toLocaleDateString("en-IN", { month: "short" })}
                stroke={chartColors.axis}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke={chartColors.axis} fontSize={11} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 10 }}
                labelStyle={{ color: chartColors.tooltipLabel }}
                itemStyle={{ color: chartColors.tooltipText }}
                labelFormatter={(m) => new Date(`${m}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                formatter={(value) => [value, "Added"]}
              />
              <Bar dataKey="count" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {(gainers.length > 0 || losers.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-graphite-text">Biggest Gainers</p>
            <div className="divide-y divide-line">
              {gainers.length > 0 ? (
                gainers.map((car) => <MoverRow key={car.id} car={car} tone="positive" />)
              ) : (
                <p className="py-3 text-sm text-graphite-text">No gainers yet</p>
              )}
            </div>
          </Card>
          <Card className="p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-graphite-text">Biggest Losers</p>
            <div className="divide-y divide-line">
              {losers.length > 0 ? (
                losers.map((car) => <MoverRow key={car.id} car={car} tone="negative" />)
              ) : (
                <p className="py-3 text-sm text-graphite-text">No losers yet</p>
              )}
            </div>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-graphite-text">Most Valuable Cars</p>
        <div className="divide-y divide-line">
          {mostValuable.map((car) => (
            <div key={car.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{car.model}</p>
                <p className="text-xs text-graphite-text">{car.brand.name}</p>
              </div>
              <p className="shrink-0 font-semibold text-ink tabular-nums">{formatCurrency(car.estimatedValue)}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Breakdown title="Collection by Brand" data={byBrand} />
        <Breakdown title="Collection by Scale" data={byScale} />
        <Breakdown title="Collection by Condition" data={byCondition} />
        <Breakdown title="Collection by Year" data={byYear} />
        <Breakdown title="Collection by Packaging" data={byPackaging} />
        {hasHuntTypeSignal && <Breakdown title="Collection by Hunt Type" data={byHuntType} />}
      </div>
    </div>
  );
}
