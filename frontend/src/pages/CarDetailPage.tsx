import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useConfirm } from "../lib/confirm";
import { formatCurrency, formatLabel, formatPercent } from "../lib/format";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { CarFormModal } from "../components/cars/CarFormModal";
import { AddToShowcaseModal } from "../components/cars/AddToShowcaseModal";
import type { Car, CarRequest } from "../types";

interface MarketPriceResponse {
  found: boolean;
  estimatedValue: number | null;
  currency: string | null;
  source: string;
  message: string | null;
}

function toCarRequest(car: Car): CarRequest {
  return {
    brandId: car.brand.id,
    model: car.model,
    variant: car.variant ?? undefined,
    series: car.series ?? undefined,
    year: car.year ?? undefined,
    scale: car.scale ?? undefined,
    color: car.color ?? undefined,
    condition: car.condition,
    packagingCondition: car.packagingCondition,
    hotWheelsSeriesType: car.hotWheelsSeriesType ?? undefined,
    huntType: car.huntType ?? undefined,
    purchasePrice: car.purchasePrice,
    purchaseDate: car.purchaseDate ?? undefined,
    estimatedValue: car.estimatedValue,
    quantity: car.quantity,
    notes: car.notes ?? undefined,
  };
}

export function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddToShowcaseOpen, setIsAddToShowcaseOpen] = useState(false);
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);
  const [priceCheck, setPriceCheck] = useState<MarketPriceResponse | null>(null);
  const [isApplyingPrice, setIsApplyingPrice] = useState(false);

  function load() {
    if (!id) return;
    api.get<Car>(`/cars/${id}`).then((res) => {
      setCar(res.data);
      setActivePhoto(0);
      setPriceCheck(null);
    });
  }

  useEffect(load, [id]);

  async function handleCheckMarketPrice() {
    if (!car) return;
    setIsCheckingPrice(true);
    setPriceCheck(null);
    try {
      const { data } = await api.get<MarketPriceResponse>("/pricing/market-value", {
        params: {
          brand: car.brand.name,
          model: car.model,
          series: car.series || undefined,
          scale: car.scale || undefined,
          year: car.year || undefined,
        },
      });
      setPriceCheck(data);
    } finally {
      setIsCheckingPrice(false);
    }
  }

  async function handleApplyMarketPrice() {
    if (!car || priceCheck?.estimatedValue == null) return;
    setIsApplyingPrice(true);
    try {
      const { data } = await api.patch<Car>(`/cars/${car.id}`, {
        ...toCarRequest(car),
        estimatedValue: priceCheck.estimatedValue,
      });
      setCar(data);
      setPriceCheck(null);
    } finally {
      setIsApplyingPrice(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    if (!id) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/cars/${id}/photos`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      load();
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!id) return;
    await api.delete(`/cars/${id}/photos/${photoId}`);
    load();
  }

  async function handleDelete() {
    if (!car) return;
    const ok = await confirm({
      title: "Remove car",
      message: `Remove ${car.model} from your collection? This can't be undone.`,
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    await api.delete(`/cars/${car.id}`);
    navigate("/collection");
  }

  if (!car) {
    return <div className="h-96 animate-pulse rounded-card bg-cream" />;
  }

  const gain = car.estimatedValue - car.purchasePrice;
  const gainPercent = car.purchasePrice > 0 ? (gain / car.purchasePrice) * 100 : 0;
  const photo = car.photos[activePhoto];

  return (
    <div className="space-y-10">
      <button onClick={() => navigate("/collection")} className="text-sm font-medium text-graphite-text hover:text-ink">
        ← Back to collection
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-card border border-line bg-cream">
            {photo ? (
              <img src={photo.url} alt={car.model} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300">
                <svg width="72" height="72" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="20" width="36" height="12" rx="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="15" cy="34" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="33" cy="34" r="4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {car.photos.map((p, i) => (
              <div key={p.id} className="group/thumb relative h-16 w-16 shrink-0">
                <button
                  onClick={() => setActivePhoto(i)}
                  className={`h-16 w-16 overflow-hidden rounded-input border ${
                    i === activePhoto ? "border-accent" : "border-line"
                  }`}
                >
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(p.id);
                  }}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-paper text-xs text-graphite-text opacity-0 shadow ring-1 ring-line transition-opacity hover:text-negative group-hover/thumb:opacity-100"
                  aria-label="Delete photo"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-input border border-dashed border-line text-graphite-text hover:border-line-strong hover:text-ink"
            >
              {isUploading ? "…" : "+"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{car.brand.name}</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">{car.model}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {car.series && <Badge tone="neutral">{car.series}</Badge>}
            {car.year && <Badge tone="neutral">{car.year}</Badge>}
            {car.scale && <Badge tone="neutral">{car.scale}</Badge>}
            <Badge tone="accent">{formatLabel(car.condition)}</Badge>
            <Badge tone="accent">{formatLabel(car.packagingCondition)}</Badge>
          </div>

          <div className="mt-8 flex flex-wrap items-end gap-8 border-t border-line pt-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-graphite-text">Purchase Price</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{formatCurrency(car.purchasePrice)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-graphite-text">Current Value</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{formatCurrency(car.estimatedValue)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-graphite-text">Gain</p>
              <p
                className={
                  gain >= 0
                    ? "mt-1 font-display text-2xl font-semibold text-racing-green"
                    : "mt-1 font-display text-2xl font-semibold text-negative"
                }
              >
                {gain >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(gain))}{" "}
                <span className="text-base font-medium">({formatPercent(gainPercent)})</span>
              </p>
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleCheckMarketPrice}
              disabled={isCheckingPrice}
              className="text-xs font-semibold uppercase tracking-wide text-graphite-text underline decoration-dotted hover:text-accent"
            >
              {isCheckingPrice ? "Estimating…" : "Check current market price"}
            </button>
            {priceCheck && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-input bg-accent-soft px-4 py-3 text-sm">
                {priceCheck.found && priceCheck.estimatedValue != null ? (
                  <>
                    <span className="text-accent-strong">
                      AI estimate suggests{" "}
                      <span className="font-semibold">{formatCurrency(priceCheck.estimatedValue)}</span>
                    </span>
                    <Button size="sm" onClick={handleApplyMarketPrice} disabled={isApplyingPrice}>
                      {isApplyingPrice ? "Updating…" : "Update value"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setPriceCheck(null)}
                      className="text-xs font-medium text-accent-strong hover:text-ink"
                    >
                      Dismiss
                    </button>
                  </>
                ) : (
                  <span className="text-graphite-text">
                    {priceCheck.message ?? "No listings found — keeping your current estimate"}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Add Photo
            </Button>
            <Link to={`/marketplace/sell?carId=${car.id}`}>
              <Button variant="secondary">List for Sale</Button>
            </Link>
            <Button variant="secondary" onClick={() => setIsAddToShowcaseOpen(true)}>
              Add to Showcase
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>

          <Card className="mt-10 divide-y divide-line p-0">
            {[
              ["Brand", car.brand.name],
              ["Series", car.series ?? "—"],
              ["Year", car.year ? String(car.year) : "—"],
              ["Scale", car.scale ?? "—"],
              ["Color", car.color ?? "—"],
              ["Condition", formatLabel(car.condition)],
              ["Packaging", formatLabel(car.packagingCondition)],
              ...(car.hotWheelsSeriesType
                ? [["Series Type", car.hotWheelsSeriesType === "FANTASY" ? "Fantasy" : "Mainline"]]
                : []),
              ...(car.huntType ? [["Hunt Type", formatLabel(car.huntType)]] : []),
              ["Quantity", String(car.quantity)],
              ["Purchase Date", car.purchaseDate ?? "—"],
              ["Notes", car.notes || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-graphite-text">{label}</span>
                <span className="font-medium text-ink">{value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <CarFormModal
        open={isEditing}
        initialCar={car}
        onClose={() => setIsEditing(false)}
        onSaved={(updated) => {
          setCar(updated);
          setIsEditing(false);
        }}
      />

      <AddToShowcaseModal open={isAddToShowcaseOpen} onClose={() => setIsAddToShowcaseOpen(false)} carId={car.id} />
    </div>
  );
}
