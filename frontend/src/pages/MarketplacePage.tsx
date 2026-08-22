import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useBrands } from "../lib/useBrands";
import { formatLabel } from "../lib/format";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Input, Select } from "../components/ui/Field";
import { ProductCard } from "../components/ui/ProductCard";
import type { Condition, Listing, Page } from "../types";

const CONDITIONS: Condition[] = ["MINT", "NEAR_MINT", "GOOD", "FAIR", "POOR"];

export function MarketplacePage() {
  const { user } = useAuth();
  const { brands } = useBrands();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [brandId, setBrandId] = useState("");
  const [condition, setCondition] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string> = { size: "48" };
    if (query) params.q = query;
    if (brandId) params.brandId = brandId;
    if (condition) params.condition = condition;

    api
      .get<Page<Listing>>("/marketplace/listings", { params })
      .then((res) => setListings(res.data.content))
      .finally(() => setIsLoading(false));
  }, [query, brandId, condition]);

  return (
    <div className="space-y-10 py-2">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Marketplace</p>
          <h1 className="mt-2 font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl">
            THE MARKET
          </h1>
          <p className="mt-4 text-base text-graphite-text sm:text-lg">
            Find the next piece for your garage — {listings.length} models currently for sale.
          </p>
        </div>
        {user && (
          <Link to="/marketplace/sell" className="shrink-0">
            <Button size="lg">+ Sell a Car</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4 sm:flex-row sm:items-center sm:gap-4">
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
        <Select value={condition} onChange={(e) => setCondition(e.target.value)} className="sm:max-w-[180px]">
          <option value="">Any condition</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {formatLabel(c)}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-card bg-cream" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState eyebrow="Nothing here yet" title="No listings match your filters" />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing, i) => {
            const isFeature = i % 8 === 0;
            return (
              <ProductCard
                key={listing.id}
                href={`/marketplace/${listing.id}`}
                imageUrl={listing.photos[0]?.url}
                brand={listing.car.brand.name}
                title={listing.car.model}
                scale={listing.car.scale}
                price={listing.price}
                sellerName={listing.sellerName}
                variant={isFeature ? "feature" : "standard"}
                className={isFeature ? "sm:col-span-2 lg:col-span-2" : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
