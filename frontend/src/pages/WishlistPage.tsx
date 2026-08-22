import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/format";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { StatTile } from "../components/ui/StatTile";
import { EmptyState } from "../components/ui/EmptyState";
import { WishlistFormModal } from "../components/wishlist/WishlistFormModal";
import type { Priority, WishlistItem } from "../types";

const PRIORITY_TONE: Record<Priority, "danger" | "warning" | "neutral"> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "neutral",
};

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function load() {
    setIsLoading(true);
    api
      .get<WishlistItem[]>("/wishlist")
      .then((res) => setItems(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleRemove(id: string) {
    await api.delete(`/wishlist/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const highPriority = items.filter((i) => i.priority === "HIGH").length;
  const mediumPriority = items.filter((i) => i.priority === "MEDIUM").length;
  const lowPriority = items.filter((i) => i.priority === "LOW").length;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Collector wishlist</p>
          <h1 className="mt-1 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            My Wanted List
          </h1>
          <p className="mt-2 text-sm text-graphite-text">
            {items.length} models tracked{highPriority > 0 && ` · ${highPriority} high priority`}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add to Wishlist</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-card bg-cream" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          eyebrow="Nothing here yet"
          title="Track the models you're chasing"
          description="Add models you want, set a target price, and get notified when they show up."
          action={<Button onClick={() => setIsModalOpen(true)}>+ Add to Wishlist</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatTile label="High Priority" value={String(highPriority)} />
            <StatTile label="Medium Priority" value={String(mediumPriority)} />
            <StatTile label="Low Priority" value={String(lowPriority)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-graphite-text">
                      {item.brand?.name ?? "Any brand"}
                    </p>
                    <h3 className="mt-1 truncate font-display text-2xl font-bold leading-tight text-ink">{item.model}</h3>
                    <p className="mt-1 truncate text-sm text-graphite-text">
                      {[item.series, item.scale, item.year].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <Badge tone={PRIORITY_TONE[item.priority]}>{item.priority}</Badge>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-graphite-text">Target Price</p>
                    <p className="mt-1 font-display text-xl font-semibold text-ink">
                      {item.targetPrice != null ? formatCurrency(item.targetPrice) : "—"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(item.id)} aria-label="Remove from wishlist">
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <WishlistFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={(item) => {
          setItems((prev) => [item, ...prev]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
