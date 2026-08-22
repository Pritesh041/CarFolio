import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { CollectionCard } from "../components/ui/CollectionCard";
import { ProductCard } from "../components/ui/ProductCard";
import type { CommunityFeedResponse } from "../types";

export function CommunityPage() {
  const [data, setData] = useState<CommunityFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<CommunityFeedResponse>("/community/feed")
      .then((res) => setData(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Your Network"
        title="From the Community"
        description={
          isLoading
            ? "Loading…"
            : `Updates from the ${data?.followingCount ?? 0} collector${data?.followingCount === 1 ? "" : "s"} you follow.`
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-card bg-cream" />
          ))}
        </div>
      ) : !data || data.followingCount === 0 ? (
        <EmptyState
          eyebrow="Nobody yet"
          title="You're not following any collectors"
          description="Follow collectors from their public profile to see their new showcases and listings here."
          action={
            <Link to="/discover">
              <Badge tone="accent">Discover collectors</Badge>
            </Link>
          }
        />
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Showcases</h2>
            {data.showcases.length === 0 ? (
              <EmptyState eyebrow="Nothing yet" title="No new showcases from people you follow" />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.showcases.map((s, i) => (
                  <CollectionCard
                    key={`${s.username}/${s.slug}`}
                    href={`/showcase/${s.username}/${s.slug}`}
                    imageUrl={s.coverImageUrl}
                    title={s.name}
                    ownerName={s.ownerName}
                    size={i === 0 ? "lg" : "md"}
                    className={i === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Listings</h2>
            {data.listings.length === 0 ? (
              <EmptyState eyebrow="Nothing yet" title="No new listings from people you follow" />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {data.listings.map((listing, i) => (
                  <ProductCard
                    key={listing.id}
                    href={`/marketplace/${listing.id}`}
                    imageUrl={listing.photos[0]?.url}
                    brand={listing.car.brand.name}
                    title={listing.car.model}
                    scale={listing.car.scale}
                    price={listing.price}
                    sellerName={listing.sellerName}
                    variant={i === 0 ? "feature" : "standard"}
                    className={i === 0 ? "col-span-2 sm:col-span-2" : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
