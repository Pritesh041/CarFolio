import { useState, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FieldGroup, Input, Select } from "../ui/Field";
import { useBrands } from "../../lib/useBrands";
import { api, extractErrorMessage } from "../../lib/api";
import type { Priority, WishlistItem, WishlistRequest } from "../../types";

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

interface WishlistFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (item: WishlistItem) => void;
}

export function WishlistFormModal({ open, onClose, onSaved }: WishlistFormModalProps) {
  const { brands } = useBrands();
  const [form, setForm] = useState<WishlistRequest>({
    model: "",
    priority: "MEDIUM",
    notifyOnAvailable: true,
    notifyOnPriceDrop: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const { data } = await api.post<WishlistItem>("/wishlist", form);
      onSaved(data);
      setForm({ model: "", priority: "MEDIUM", notifyOnAvailable: true, notifyOnPriceDrop: false });
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't add this to your wishlist"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to wishlist">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Brand">
            <Select value={form.brandId ?? ""} onChange={(e) => setForm({ ...form, brandId: e.target.value || undefined })}>
              <option value="">Any brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="Model">
            <Input
              required
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Nissan Skyline R34"
            />
          </FieldGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Target price (₹)">
            <Input
              type="number"
              min="0"
              value={form.targetPrice ?? ""}
              onChange={(e) => setForm({ ...form, targetPrice: e.target.value ? Number(e.target.value) : undefined })}
            />
          </FieldGroup>
          <FieldGroup label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </FieldGroup>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-graphite-text">
            <input
              type="checkbox"
              checked={form.notifyOnAvailable ?? false}
              onChange={(e) => setForm({ ...form, notifyOnAvailable: e.target.checked })}
              className="rounded border-line accent-[#e0531f]"
            />
            Notify when available
          </label>
          <label className="flex items-center gap-2 text-sm text-graphite-text">
            <input
              type="checkbox"
              checked={form.notifyOnPriceDrop ?? false}
              onChange={(e) => setForm({ ...form, notifyOnPriceDrop: e.target.checked })}
              className="rounded border-line accent-[#e0531f]"
            />
            Notify when price drops
          </label>
        </div>

        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Adding…" : "Add to wishlist"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
