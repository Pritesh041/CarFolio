import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractErrorMessage } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useConfirm } from "../lib/confirm";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { CollectionCard } from "../components/ui/CollectionCard";
import type { Collection } from "../types";

export function ShowcasePage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setIsLoading(true);
    api
      .get<Collection[]>("/collections")
      .then((res) => setCollections(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handlePublishToggle(collection: Collection) {
    setError(null);
    try {
      const action = collection.isPublic ? "unpublish" : "publish";
      const { data } = await api.post<Collection>(`/collections/${collection.id}/${action}`);
      setCollections((prev) => prev.map((c) => (c.id === data.id ? data : c)));
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update this showcase"));
    }
  }

  async function handleDelete(collection: Collection) {
    const ok = await confirm({
      title: "Delete showcase",
      message: `Delete "${collection.name}"? This can't be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    await api.delete(`/collections/${collection.id}`);
    setCollections((prev) => prev.filter((c) => c.id !== collection.id));
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Your Garage, Published</p>
          <h1 className="mt-1 font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-5xl">
            Showcases
          </h1>
          <p className="mt-2 text-sm text-graphite-text">
            {collections.length} {collections.length === 1 ? "showcase" : "showcases"}
          </p>
        </div>
        <Link to="/showcase/new">
          <Button size="lg">+ New Showcase</Button>
        </Link>
      </div>

      {error && <p className="text-sm text-negative">{error}</p>}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-cream" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          eyebrow="No showcases yet"
          title="Show off your favorites"
          description="Build a curated showcase from your collection and share it publicly."
          action={
            <Link to="/showcase/new">
              <Button>+ New Showcase</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection.id} className="space-y-3">
              <div className="relative">
                <CollectionCard
                  href={`/showcase/${collection.id}/edit`}
                  imageUrl={collection.coverImageUrl}
                  title={collection.name}
                  modelCount={collection.cars.length}
                  description={collection.description}
                />
                <div className="absolute left-4 top-4">
                  <Badge tone={collection.isPublic ? "success" : "neutral"}>
                    {collection.isPublic ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/showcase/${collection.id}/edit`}>
                  <Button size="sm" variant="secondary">
                    Edit
                  </Button>
                </Link>
                <Button size="sm" variant="secondary" onClick={() => handlePublishToggle(collection)}>
                  {collection.isPublic ? "Unpublish" : "Publish"}
                </Button>
                {collection.isPublic && collection.shareSlug && user && (
                  <Link to={`/showcase/${user.username}/${collection.shareSlug}`} target="_blank">
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </Link>
                )}
                <Button size="sm" variant="danger" onClick={() => handleDelete(collection)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
