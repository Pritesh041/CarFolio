import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { formatCurrency, formatDate, formatSigned } from "../lib/format";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";
import type { Listing, Purchase } from "../types";

export function HistoryPage() {
  const [sales, setSales] = useState<Listing[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Listing[]>("/listings/mine").then((res) => setSales(res.data.filter((l) => l.status === "SOLD"))),
      api.get<Purchase[]>("/offers/mine/purchases").then((res) => setPurchases(res.data)),
    ]).finally(() => setIsLoading(false));
  }, []);

  const totalProfit = sales.reduce((sum, s) => sum + (s.profit ?? 0), 0);

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Collector Ledger"
        title="History"
        description="Everything you've bought and sold on the marketplace."
      />

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-card bg-cream" />
      ) : (
        <>
          {sales.length > 0 && (
            <Card className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-graphite-text">Total Profit</p>
              <p
                className={`mt-1 font-display text-5xl font-bold tracking-tight sm:text-6xl ${
                  totalProfit >= 0 ? "text-racing-green" : "text-negative"
                }`}
              >
                {formatSigned(totalProfit)}
              </p>
            </Card>
          )}

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Sold</h2>

            {sales.length === 0 ? (
              <EmptyState eyebrow="No sales yet" title="You haven't sold anything yet" />
            ) : (
              <div className="space-y-3">
                {sales.map((listing) => (
                  <Card key={listing.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-input bg-cream">
                        {listing.photos[0] && (
                          <img src={listing.photos[0].url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-lg font-semibold text-ink">{listing.car.model}</p>
                        <p className="text-sm text-graphite-text">
                          Sold {formatCurrency(listing.soldPrice ?? listing.price)}
                          {listing.purchasePriceAtListing != null &&
                            ` · You paid ${formatCurrency(listing.purchasePriceAtListing)}`}
                          {listing.soldAt && ` · ${formatDate(listing.soldAt)}`}
                        </p>
                      </div>
                      {listing.profit != null && (
                        <p
                          className={`shrink-0 font-display text-lg font-bold ${
                            listing.profit >= 0 ? "text-racing-green" : "text-negative"
                          }`}
                        >
                          {formatSigned(listing.profit)}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Bought</h2>

            {purchases.length === 0 ? (
              <EmptyState eyebrow="No purchases yet" title="You haven't bought anything yet" />
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <Card key={purchase.offerId} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-input bg-cream">
                        {purchase.photos[0] && (
                          <img src={purchase.photos[0].url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/collection/${purchase.car.id}`}
                          className="truncate font-display text-lg font-semibold text-ink hover:text-accent"
                        >
                          {purchase.car.model}
                        </Link>
                        <p className="text-sm text-graphite-text">
                          Bought {formatCurrency(purchase.amount)} from {purchase.sellerName} ·{" "}
                          {formatDate(purchase.purchasedAt)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
