import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, extractErrorMessage } from "../lib/api";
import { formatCurrency, formatLabel } from "../lib/format";
import { useAuth } from "../lib/auth";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ProposeTradeModal } from "../components/cars/ProposeTradeModal";
import type { PublicShowcase, ShowcaseCar } from "../types";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold text-ink sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-graphite-text">{label}</p>
    </div>
  );
}

export function PublicShowcasePage() {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const { user } = useAuth();
  const [showcase, setShowcase] = useState<PublicShowcase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeTarget, setTradeTarget] = useState<ShowcaseCar | null>(null);

  useEffect(() => {
    if (!username || !slug) return;
    setIsLoading(true);
    api
      .get<PublicShowcase>(`/public/showcase/${username}/${slug}`)
      .then((res) => setShowcase(res.data))
      .catch((err) => setError(extractErrorMessage(err, "This showcase isn't available")))
      .finally(() => setIsLoading(false));
  }, [username, slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      </div>
    );
  }

  if (error || !showcase) {
    return (
      <div className="mx-auto max-w-2xl py-24">
        <EmptyState
          eyebrow="Not found"
          title="Showcase not available"
          description={error ?? "This showcase doesn't exist or is no longer public."}
        />
      </div>
    );
  }

  const brandCount = new Set(showcase.cars.map((c) => c.brand.name)).size;
  const years = showcase.cars.map((c) => c.year).filter((y): y is number => !!y);

  return (
    <div className="space-y-10 pb-16">
      {showcase.coverImageUrl ? (
        <div className="-mx-5 sm:-mx-8">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink sm:aspect-[21/8]">
            <img src={showcase.coverImageUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/0" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-8 sm:pb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-paper/70">
                By{" "}
                <Link to={`/u/${showcase.owner.username}`} className="text-paper hover:text-accent">
                  @{showcase.owner.username}
                </Link>
              </p>
              <h1 className="mt-2 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-paper sm:text-7xl">
                {showcase.name}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            By{" "}
            <Link to={`/u/${showcase.owner.username}`} className="hover:underline">
              @{showcase.owner.username}
            </Link>
          </p>
          <h1 className="mt-2 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink sm:text-7xl">
            {showcase.name}
          </h1>
        </div>
      )}

      {showcase.description && (
        <p className="max-w-2xl text-lg leading-relaxed text-graphite-text">{showcase.description}</p>
      )}

      <div className="flex flex-wrap gap-10 border-y border-line py-6">
        <Stat value={showcase.cars.length} label="Models" />
        <Stat value={brandCount} label="Brands" />
        {years.length > 0 && (
          <Stat value={years.length > 1 ? `${Math.min(...years)}–${Math.max(...years)}` : years[0]} label="Era" />
        )}
      </div>

      {showcase.cars.length === 0 ? (
        <EmptyState eyebrow="Empty" title="No cars in this showcase yet" />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {showcase.cars.map((car) => {
            const primaryPhoto = car.photos[0];
            return (
              <Card key={car.id} className="overflow-hidden">
                <div className="aspect-[4/3] bg-cream">
                  {primaryPhoto ? (
                    <img src={primaryPhoto.url} alt={car.model} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-graphite-text">No photo</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-graphite-text">{car.brand.name}</p>
                  <h3 className="mt-1 truncate font-display text-lg font-semibold text-ink">{car.model}</h3>
                  <p className="mt-0.5 truncate text-sm text-graphite-text">
                    {[car.series, car.year, car.scale].filter(Boolean).join(" · ")}
                  </p>
                  {car.estimatedValue != null && (
                    <p className="mt-2 text-sm font-semibold text-ink">{formatCurrency(car.estimatedValue)}</p>
                  )}
                  {car.purchasePrice != null && (
                    <p className="text-xs text-graphite-text">Purchased for {formatCurrency(car.purchasePrice)}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Badge>{formatLabel(car.condition)}</Badge>
                    {user && user.username !== showcase.owner.username && (
                      <Button size="sm" variant="secondary" onClick={() => setTradeTarget(car)}>
                        Propose trade
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tradeTarget && (
        <ProposeTradeModal
          open={true}
          onClose={() => setTradeTarget(null)}
          recipientUsername={showcase.owner.username}
          targetCarId={tradeTarget.id}
          targetCarLabel={`${tradeTarget.brand.name} ${tradeTarget.model}`}
        />
      )}
    </div>
  );
}
