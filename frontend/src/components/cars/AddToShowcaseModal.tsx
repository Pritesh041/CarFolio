import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { api, extractErrorMessage } from "../../lib/api";
import type { Collection } from "../../types";

interface AddToShowcaseModalProps {
  open: boolean;
  onClose: () => void;
  carId: string;
}

export function AddToShowcaseModal({ open, onClose, carId }: AddToShowcaseModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    setError(null);
    setAddedId(null);
    api
      .get<Collection[]>("/collections")
      .then((res) => setCollections(res.data))
      .finally(() => setIsLoading(false));
  }, [open]);

  async function handleAdd(collectionId: string) {
    setError(null);
    try {
      await api.post(`/collections/${collectionId}/cars`, { carIds: [carId] });
      setAddedId(collectionId);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't add this car to that showcase"));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to showcase">
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-graphite-text">Loading your showcases…</p>
        ) : collections.length === 0 ? (
          <p className="text-sm text-graphite-text">
            You don't have any showcases yet.{" "}
            <Link to="/showcase/new" className="text-accent hover:underline" onClick={onClose}>
              Create one
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-2">
            {collections.map((collection) => {
              const alreadyIn = collection.cars.some((cc) => cc.carId === carId);
              const justAdded = addedId === collection.id;
              return (
                <div
                  key={collection.id}
                  className="flex items-center justify-between gap-4 rounded-input border border-line px-4 py-3 transition-colors hover:border-line-strong hover:bg-cream/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{collection.name}</p>
                    <p className="text-xs text-graphite-text">{collection.cars.length} cars</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={alreadyIn || justAdded}
                    onClick={() => handleAdd(collection.id)}
                  >
                    {alreadyIn || justAdded ? "Added" : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
