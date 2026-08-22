import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { TopNav } from "../components/layout/TopNav";
import { Button } from "../components/ui/Button";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ProductCard } from "../components/ui/ProductCard";
import { CollectionCard } from "../components/ui/CollectionCard";
import { CollectionIcon, SellIcon, TradesIcon, CommunityIcon } from "../components/layout/icons";
import type { DiscoverResponse, PublicShowcase } from "../types";

const actions = [
  { icon: CollectionIcon, title: "Buy", description: "Find models you love", to: "/marketplace" },
  { icon: SellIcon, title: "Sell", description: "List your die-cast", to: "/marketplace/sell" },
  { icon: TradesIcon, title: "Trade", description: "Trade with collectors", to: "/trades" },
  { icon: CommunityIcon, title: "Community", description: "Connect & discuss", to: "/community" },
];

export function LandingPage() {
  const [discover, setDiscover] = useState<DiscoverResponse | null>(null);
  const [featured, setFeatured] = useState<PublicShowcase | null>(null);

  useEffect(() => {
    api.get<DiscoverResponse>("/public/discover").then((res) => setDiscover(res.data));
  }, []);

  useEffect(() => {
    const first = discover?.showcases[0];
    if (!first) return;
    api.get<PublicShowcase>(`/public/showcase/${first.username}/${first.slug}`).then((res) => setFeatured(res.data));
  }, [discover]);

  const heroImage = discover?.listings[0]?.photos[0]?.url ?? discover?.showcases[0]?.coverImageUrl ?? null;
  const collectors = discover?.showcases.slice(0, 4) ?? [];
  const listings = discover?.listings.slice(0, 5) ?? [];
  const activity = [
    ...(discover?.showcases.slice(1, 3).map((s) => ({
      key: `s-${s.username}-${s.slug}`,
      href: `/showcase/${s.username}/${s.slug}`,
      image: s.coverImageUrl,
      lede: `@${s.ownerName} published a showcase`,
      title: s.name,
    })) ?? []),
    ...(discover?.listings.slice(1, 3).map((l) => ({
      key: `l-${l.id}`,
      href: `/marketplace/${l.id}`,
      image: l.photos[0]?.url,
      lede: `@${l.sellerUsername} listed a model`,
      title: `${l.car.brand.name} ${l.car.model}`,
    })) ?? []),
  ].slice(0, 4);

  const brandCount = featured ? new Set(featured.cars.map((c) => c.brand.name)).size : 0;
  const years = featured?.cars.map((c) => c.year).filter((y): y is number => !!y) ?? [];

  return (
    <div className="bg-ivory text-ink">
      {/* HERO */}
      <section className="relative flex min-h-[92vh] flex-col overflow-hidden bg-ink">
        {heroImage && (
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-transparent" />

        <TopNav variant="overlay" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-32 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Carfolio</p>
          <h1 className="mt-4 max-w-3xl font-display text-6xl font-bold leading-[0.95] tracking-tight text-paper sm:text-7xl lg:text-8xl">
            Your Collection.
            <br />
            Your Garage.
            <br />
            Your Portfolio.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-paper/80">
            Collect, discover, trade and showcase the cars that matter to you.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/discover">
              <Button size="lg">Explore Collections</Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="border-paper/60 text-paper hover:border-paper hover:bg-paper/10">
                Start Your Garage
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
          {actions.map((a) => (
            <Link key={a.title} to={a.to} className="group bg-paper p-6 transition-colors hover:bg-accent-soft/40">
              <a.icon className="text-accent" />
              <p className="mt-3 font-display text-lg font-semibold text-ink">{a.title}</p>
              <p className="mt-0.5 text-sm text-graphite-text">{a.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* COLLECTORS TO WATCH */}
      {collectors.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <SectionHeading
            eyebrow="Featured Collectors"
            title="Collectors to Watch"
            description="Garages worth following — curated collections from serious collectors around the world."
            action={{ label: "View all", to: "/discover" }}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {collectors.map((s, i) => (
              <CollectionCard
                key={`${s.username}/${s.slug}`}
                href={`/showcase/${s.username}/${s.slug}`}
                imageUrl={s.coverImageUrl}
                title={s.name}
                ownerName={s.ownerName}
                size={i === 0 ? "lg" : "md"}
                className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
              />
            ))}
          </div>
        </section>
      )}

      {/* THE MARKET */}
      {listings.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <SectionHeading
            eyebrow="The Market"
            title="Rare Pieces. Everyday Favourites."
            description="Collector finds from garages across the community."
            action={{ label: "Browse market", to: "/marketplace" }}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings[0] && (
              <ProductCard
                variant="feature"
                className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
                href={`/marketplace/${listings[0].id}`}
                imageUrl={listings[0].photos[0]?.url}
                brand={listings[0].car.brand.name}
                title={listings[0].car.model}
                scale={listings[0].car.scale}
                price={listings[0].price}
              />
            )}
            {listings.slice(1).map((l) => (
              <ProductCard
                key={l.id}
                href={`/marketplace/${l.id}`}
                imageUrl={l.photos[0]?.url}
                brand={l.car.brand.name}
                title={l.car.model}
                scale={l.car.scale}
                price={l.price}
                sellerName={l.sellerUsername}
              />
            ))}
          </div>
        </section>
      )}

      {/* FEATURED COLLECTION ARCHIVE */}
      {featured && (
        <section className="border-y border-line bg-cream">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">The Archive</p>
            <h2 className="mt-2 max-w-2xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-5xl">
              {featured.name}
            </h2>
            {featured.description && <p className="mt-4 max-w-xl text-graphite-text">{featured.description}</p>}

            <div className="mt-8 flex flex-wrap gap-8 text-sm">
              <div>
                <p className="font-display text-2xl font-bold text-ink">{featured.cars.length}</p>
                <p className="text-graphite-text">Models</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-ink">{brandCount}</p>
                <p className="text-graphite-text">Brands</p>
              </div>
              {years.length > 0 && (
                <div>
                  <p className="font-display text-2xl font-bold text-ink">
                    {Math.min(...years)}–{Math.max(...years)}
                  </p>
                  <p className="text-graphite-text">Era</p>
                </div>
              )}
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {featured.cars.slice(0, 12).map((c) => (
                <div key={c.id} className="aspect-square overflow-hidden rounded-input bg-paper">
                  {c.photos[0] ? (
                    <img src={c.photos[0].url} alt={c.model} className="h-full w-full object-cover" />
                  ) : null}
                </div>
              ))}
            </div>

            <Link to={`/showcase/${discover?.showcases[0]?.username}/${discover?.showcases[0]?.slug}`} className="mt-8 inline-block">
              <Button variant="dark">Explore Collection</Button>
            </Link>
          </div>
        </section>
      )}

      {/* FROM THE COMMUNITY */}
      {activity.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <SectionHeading eyebrow="Community" title="From the Community" action={{ label: "See more", to: "/community" }} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {activity.map((item) => (
              <Link key={item.key} to={item.href} className="group block">
                <div className="aspect-square overflow-hidden rounded-card bg-cream">
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-graphite-text">{item.lede}</p>
                <p className="mt-1 truncate font-display text-lg font-semibold text-ink">{item.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TRUST STRIP */}
      <section className="border-t border-line bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-12 sm:grid-cols-4 sm:px-8">
          {[
            { title: "Free to Join", description: "Track your collection at no cost" },
            { title: "Collector Community", description: "Connect with real collectors" },
            { title: "Direct Messaging", description: "Talk before you trade or buy" },
            { title: "Built for Collectors", description: "By people who get the hobby" },
          ].map((t) => (
            <div key={t.title}>
              <p className="font-display text-lg font-semibold text-ink">{t.title}</p>
              <p className="mt-1 text-sm text-graphite-text">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line px-5 py-8 text-center text-sm text-graphite-text sm:px-8">
        <p className="font-display text-base font-bold text-ink">CARFOLIO</p>
        <p className="mt-2">© {new Date().getFullYear()} Carfolio. Collect. Track. Showcase. Trade.</p>
      </footer>
    </div>
  );
}
