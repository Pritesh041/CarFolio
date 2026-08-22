import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { SectionHeading } from "../components/ui/SectionHeading";
import { EmptyState } from "../components/ui/EmptyState";
import { CollectionCard } from "../components/ui/CollectionCard";
import { ProductCard } from "../components/ui/ProductCard";
import type { DiscoverResponse } from "../types";

export function DiscoverPage() {
  const [data, setData] = useState<DiscoverResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<DiscoverResponse>("/public/discover")
      .then((res) => setData(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  const showcases = data?.showcases ?? [];
  const listings = data?.listings ?? [];
  const featuredListings = listings.slice(0, 4);
  const moreListings = listings.slice(4);

  return (
    <div className="space-y-16 py-2">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Explore</p>
        <h1 className="mt-2 font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl">
          Discover the Collection
        </h1>
        <p className="mt-4 text-base text-graphite-text sm:text-lg">
          Fresh garages and recently listed models from collectors around the world.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-card bg-cream" />
          ))}
        </div>
      ) : (
        <>
          <section className="space-y-6">
            <SectionHeading
              eyebrow="Collector Garages"
              title="Showcases Worth a Look"
              description="Step inside curated garages assembled by the community."
            />
            {showcases.length === 0 ? (
              <EmptyState eyebrow="Nothing yet" title="No public showcases yet" />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {showcases.map((s, i) => (
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

          <section className="space-y-6">
            <SectionHeading
              eyebrow="Fresh To Market"
              title="Recently Listed"
              description="The newest models added to the marketplace."
              action={{ label: "View all", to: "/marketplace" }}
            />
            {listings.length === 0 ? (
              <EmptyState eyebrow="Nothing yet" title="No listings yet" />
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {featuredListings.map((listing, i) => (
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
                      className={i === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}
                    />
                  ))}
                </div>

                {moreListings.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                    {moreListings.map((listing) => (
                      <ProductCard
                        key={listing.id}
                        href={`/marketplace/${listing.id}`}
                        imageUrl={listing.photos[0]?.url}
                        brand={listing.car.brand.name}
                        title={listing.car.model}
                        scale={listing.car.scale}
                        price={listing.price}
                        sellerName={listing.sellerName}
                        variant="compact"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
