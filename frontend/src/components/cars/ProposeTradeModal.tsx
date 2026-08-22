import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FieldGroup, Textarea } from "../ui/Field";
import { api, extractErrorMessage } from "../../lib/api";
import { formatCurrency } from "../../lib/format";
import type { Car, Page } from "../../types";

interface ProposeTradeModalProps {
  open: boolean;
  onClose: () => void;
  recipientUsername: string;
  targetCarId: string;
  targetCarLabel: string;
}

export function ProposeTradeModal({
  open,
  onClose,
  recipientUsername,
  targetCarId,
  targetCarLabel,
}: ProposeTradeModalProps) {
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    setError(null);
    setSent(false);
    setSelectedIds([]);
    setMessage("");
    api
      .get<Page<Car>>("/cars", { params: { size: 200 } })
      .then((res) => setMyCars(res.data.content))
      .finally(() => setIsLoading(false));
  }, [open]);

  function toggle(carId: string) {
    setSelectedIds((prev) => (prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]));
  }

  async function handlePropose() {
    if (selectedIds.length === 0) {
      setError("Pick at least one of your cars to offer");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/trades", {
        recipientUsername,
        requestedCarId: targetCarId,
        offeredCarIds: selectedIds,
        message: message || undefined,
      });
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't propose this trade"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Propose a trade">
      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-graphite-text">
            Trade proposed for <span className="text-ink">{targetCarLabel}</span>. You'll see it under
            "Outgoing" on the Trades page once they respond.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-graphite-text">
            Offer one or more of your own cars in exchange for their{" "}
            <span className="text-ink">{targetCarLabel}</span>.
          </p>

          {isLoading ? (
            <p className="text-sm text-graphite-text">Loading your collection…</p>
          ) : myCars.length === 0 ? (
            <p className="text-sm text-graphite-text">You don't have any cars to offer yet.</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {myCars.map((car) => {
                const checked = selectedIds.includes(car.id);
                return (
                  <label
                    key={car.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-input border p-3 transition-colors ${
                      checked
                        ? "border-accent bg-accent-soft/40"
                        : "border-line hover:border-line-strong hover:bg-cream/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(car.id)}
                      className="sr-only"
                    />
                    <div className="h-10 w-14 shrink-0 overflow-hidden rounded-input border border-line bg-cream">
                      {car.photos[0] && <img src={car.photos[0].url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {car.brand.name} {car.model}
                      </p>
                      <p className="text-xs text-graphite-text">{formatCurrency(car.estimatedValue)}</p>
                    </div>
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        checked ? "border-accent bg-accent text-paper" : "border-line-strong text-transparent"
                      }`}
                    >
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5L4 7.5L10 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <FieldGroup label="Message (optional)">
            <Textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note…"
            />
          </FieldGroup>

          {error && <p className="text-sm text-negative">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handlePropose} disabled={isSubmitting || myCars.length === 0}>
              {isSubmitting ? "Proposing…" : "Propose trade"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
