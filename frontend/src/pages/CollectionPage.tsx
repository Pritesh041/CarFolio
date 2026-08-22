import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAddCar } from "../lib/addCarStore";
import { useConfirm } from "../lib/confirm";
import { useBrands } from "../lib/useBrands";
import { CarCard } from "../components/cars/CarCard";
import { CarFormModal } from "../components/cars/CarFormModal";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { StatTile } from "../components/ui/StatTile";
import { Select, Input } from "../components/ui/Field";
import { formatCurrency, formatPercent, formatSigned } from "../lib/format";
import type { AnalyticsSummary, Car, Page } from "../types";

export function CollectionPage() {
  const addCar = useAddCar();
  const confirm = useConfirm();
  const { brands } = useBrands();
  const [cars, setCars] = useState<Car[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [brandId, setBrandId] = useState("");
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string> = { size: "48" };
    if (query) params.q = query;
    if (brandId) params.brandId = brandId;

    api
      .get<Page<Car>>("/cars", { params })
      .then((res) => setCars(res.data.content))
      .finally(() => setIsLoading(false));
  }, [query, brandId, addCar.refreshKey]);

  useEffect(() => {
    api.get<AnalyticsSummary>("/analytics/summary").then((res) => setSummary(res.data));
  }, [addCar.refreshKey]);

  async function handleDelete(car: Car) {
    const ok = await confirm({
      title: "Remove car",
      message: `Remove ${car.model} from your collection? This can't be undone.`,
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    await api.delete(`/cars/${car.id}`);
    setCars((prev) => prev.filter((c) => c.id !== car.id));
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Your Collection</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">My Garage</h1>
          <p className="mt-2 text-sm text-graphite-text">
            {cars.length} {cars.length === 1 ? "model" : "models"} on display
          </p>
        </div>
        <Button onClick={addCar.openModal} size="lg">
          + Add Car
        </Button>
      </div>

      {summary && summary.totalModels > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Total Models" value={String(summary.totalModels)} />
          <StatTile label="Collection Value" value={formatCurrency(summary.collectionValue)} />
          <StatTile label="Total Invested" value={formatCurrency(summary.totalInvested)} />
          <StatTile
            label="Estimated Gain"
            value={formatSigned(summary.estimatedGain)}
            delta={formatPercent(summary.growthPercent)}
            deltaTone={summary.estimatedGain >= 0 ? "positive" : "negative"}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 border-b border-line pb-8 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search model, series…"
          className="sm:max-w-xs"
        />
        <Select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="sm:max-w-[200px]">
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-card bg-cream" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <EmptyState
          eyebrow="Your garage is empty"
          title="Every collection starts with one car"
          description="Start building yours — add your first model manually or scan its packaging."
          action={<Button onClick={addCar.openModal}>+ Add Your First Car</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} onEdit={setEditingCar} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CarFormModal
        open={!!editingCar}
        initialCar={editingCar ?? undefined}
        onClose={() => setEditingCar(null)}
        onSaved={(car) => {
          setEditingCar(null);
          setCars((prev) => prev.map((c) => (c.id === car.id ? car : c)));
        }}
      />
    </div>
  );
}
