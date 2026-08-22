import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import { api, extractErrorMessage } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatCurrency } from "../lib/format";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FieldGroup, Input, Textarea } from "../components/ui/Field";
import type { Car, Collection, CollectionRequest, Page } from "../types";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function emptyForm(): CollectionRequest {
  return { name: "", description: "", hidePurchasePrices: true, showEstimatedValues: true };
}

function PrivacyToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-input border border-line px-4 py-3 transition-colors hover:border-line-strong">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-xs text-graphite-text">{description}</span>
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-accent" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function CheckOverlay() {
  return (
    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-paper shadow">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.2L4.5 8.7L10 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function CarThumb({
  photoUrl,
  eyebrow,
  title,
  selected,
  onClick,
}: {
  photoUrl?: string;
  eyebrow: string;
  title: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative aspect-square overflow-hidden rounded-input border-2 text-left transition-colors",
        selected ? "border-accent" : "border-line hover:border-line-strong",
      )}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-cream text-xs text-graphite-text">No photo</div>
      )}
      <div
        className={clsx(
          "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/85 via-ink/10 to-transparent p-2 transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-paper/80">{eyebrow}</p>
        <p className="truncate text-xs font-medium text-paper">{title}</p>
      </div>
      {selected && <CheckOverlay />}
    </button>
  );
}

export function ShowcaseBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<CollectionRequest>(emptyForm());
  const [collection, setCollection] = useState<Collection | null>(null);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    api.get<Page<Car>>("/cars", { params: { size: 200 } }).then((res) => setAvailableCars(res.data.content));
  }, []);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .get<Collection>(`/collections/${id}`)
      .then((res) => {
        setCollection(res.data);
        setForm({
          name: res.data.name,
          description: res.data.description ?? "",
          coverImageUrl: res.data.coverImageUrl ?? undefined,
          hidePurchasePrices: res.data.hidePurchasePrices,
          showEstimatedValues: res.data.showEstimatedValues,
        });
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCoverFile(file);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      let payload = form;
      if (coverFile) {
        payload = { ...form, coverImageUrl: await fileToDataUrl(coverFile) };
      }

      const saved = isEditing
        ? (await api.patch<Collection>(`/collections/${id}`, payload)).data
        : (await api.post<Collection>("/collections", payload)).data;

      setCollection(saved);
      setCoverFile(null);
      if (!isEditing) {
        navigate(`/showcase/${saved.id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't save this showcase"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddCar(carId: string) {
    if (!collection) return;
    setError(null);
    try {
      const { data } = await api.post<Collection>(`/collections/${collection.id}/cars`, { carIds: [carId] });
      setCollection(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't add that car"));
    }
  }

  async function handleRemoveCar(carId: string) {
    if (!collection) return;
    const { data } = await api.delete<Collection>(`/collections/${collection.id}/cars/${carId}`);
    setCollection(data);
  }

  async function moveCar(carId: string, direction: -1 | 1) {
    if (!collection) return;
    const ids = collection.cars.map((cc) => cc.carId);
    const index = ids.indexOf(carId);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    const { data } = await api.patch<Collection>(`/collections/${collection.id}/cars/order`, { carIds: ids });
    setCollection(data);
  }

  async function handlePublishToggle() {
    if (!collection) return;
    setError(null);
    try {
      const action = collection.isPublic ? "unpublish" : "publish";
      const { data } = await api.post<Collection>(`/collections/${collection.id}/${action}`);
      setCollection(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update publish status"));
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      </div>
    );
  }

  const inCollection = new Set(collection?.cars.map((cc) => cc.carId) ?? []);
  const sortedCars = [...(collection?.cars ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {isEditing ? "Edit Feature" : "New Feature"}
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-5xl">
          {isEditing ? "Edit Showcase" : "Compose Your Showcase"}
        </h1>
        <p className="mt-2 text-sm text-graphite-text">Curate a public, magazine-style feature of your favorite models.</p>
      </div>

      <Card className="p-5 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <FieldGroup label="Cover image">
            <label className="group relative flex aspect-[21/9] w-full cursor-pointer items-center justify-center overflow-hidden rounded-card border border-dashed border-line-strong bg-cream transition-colors hover:border-accent">
              {coverPreviewUrl ?? form.coverImageUrl ? (
                <>
                  <img src={coverPreviewUrl ?? form.coverImageUrl} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-opacity group-hover:bg-ink/50 group-hover:opacity-100">
                    <span className="text-xs font-semibold uppercase tracking-widest text-paper">Change cover image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 px-6 text-center text-graphite-text">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="9" width="24" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="11" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 22L11 16L16 20L22 14L28 19" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  <span className="text-sm font-medium text-ink">Upload a cover image</span>
                  <span className="text-xs text-graphite-text">Recommended wide format — shown atop your public feature</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </label>
          </FieldGroup>

          <FieldGroup label="Name">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My JDM Collection"
              className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            />
          </FieldGroup>

          <FieldGroup label="Description">
            <Textarea
              rows={4}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell visitors what this showcase is about"
            />
          </FieldGroup>

          <div className="space-y-2">
            <PrivacyToggle
              label="Show purchase prices publicly"
              description="Visitors will see what you paid for each model."
              checked={!(form.hidePurchasePrices ?? true)}
              onChange={(checked) => setForm({ ...form, hidePurchasePrices: !checked })}
            />
            <PrivacyToggle
              label="Show estimated values publicly"
              description="Visitors will see the current estimated value of each model."
              checked={form.showEstimatedValues ?? true}
              onChange={(checked) => setForm({ ...form, showEstimatedValues: checked })}
            />
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => navigate("/showcase")}>
                Back
              </Button>
              {collection && (
                <Button type="button" variant="secondary" onClick={handlePublishToggle}>
                  {collection.isPublic ? "Unpublish" : "Publish"}
                </Button>
              )}
              {collection?.isPublic && collection.shareSlug && user && (
                <Link to={`/showcase/${user.username}/${collection.shareSlug}`} target="_blank">
                  <Button type="button" variant="ghost">
                    View public page
                  </Button>
                </Link>
              )}
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create showcase"}
            </Button>
          </div>
        </form>
      </Card>

      {collection && (
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Cars in this showcase</h2>
            <p className="mt-0.5 text-sm text-graphite-text">Drag the order with the arrows — this is the order visitors will see.</p>

            {sortedCars.length === 0 ? (
              <p className="mt-3 text-sm text-graphite-text">No cars added yet — pick some from the grid below.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {sortedCars.map((cc, index) => (
                  <Card key={cc.carId} className="flex items-center gap-3 p-3">
                    <div className="flex shrink-0 flex-col">
                      <button
                        type="button"
                        onClick={() => moveCar(cc.carId, -1)}
                        disabled={index === 0}
                        className="px-1 text-graphite-text hover:text-ink disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCar(cc.carId, 1)}
                        disabled={index === sortedCars.length - 1}
                        className="px-1 text-graphite-text hover:text-ink disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ▼
                      </button>
                    </div>
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-input bg-cream">
                      {cc.car.photos[0] && (
                        <img src={cc.car.photos[0].url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{cc.car.model}</p>
                      <p className="truncate text-xs text-graphite-text">
                        {cc.car.brand.name} · {formatCurrency(cc.car.estimatedValue)}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveCar(cc.carId)}>
                      Remove
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold text-ink">Add cars</h3>
            <p className="mt-0.5 text-sm text-graphite-text">
              {availableCars.length === 0
                ? "Add cars to your collection first."
                : "Tap a car to add or remove it from the showcase."}
            </p>
            {availableCars.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {availableCars.map((car) => {
                  const selected = inCollection.has(car.id);
                  return (
                    <CarThumb
                      key={car.id}
                      photoUrl={car.photos[0]?.url}
                      eyebrow={car.brand.name}
                      title={car.model}
                      selected={selected}
                      onClick={() => (selected ? handleRemoveCar(car.id) : handleAddCar(car.id))}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
