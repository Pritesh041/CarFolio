import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { FieldGroup, Input, Select, Textarea } from "../ui/Field";
import { useBrands } from "../../lib/useBrands";
import { api, extractErrorMessage } from "../../lib/api";
import { formatCurrency } from "../../lib/format";
import type {
  Car,
  CarRequest,
  Condition,
  HotWheelsSeriesType,
  HuntType,
  IdentificationResponse,
  PackagingCondition,
} from "../../types";

interface MarketPriceResponse {
  found: boolean;
  estimatedValue: number | null;
  currency: string | null;
  source: string;
  message: string | null;
}

type PriceLookupStatus = "idle" | "loading" | "found" | "not_found" | "error";
type IdentifyStatus = "idle" | "loading" | "found" | "not_found" | "error";

const CONDITIONS: Condition[] = ["MINT", "NEAR_MINT", "GOOD", "FAIR", "POOR"];
const PACKAGING: PackagingCondition[] = ["MOC", "MIP", "LOOSE", "OPENED", "DAMAGED"];

const HUNT_MULTIPLIER: Record<HuntType, number> = {
  NORMAL: 1,
  TREASURE_HUNT: 2,
  SUPER_TREASURE_HUNT: 3,
};

const STEP_LABELS = ["Add your model", "Identify", "Collection details", "Save to garage"];
const TOTAL_STEPS = STEP_LABELS.length;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

interface CarFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (car: Car) => void;
  initialCar?: Car;
}

function emptyForm(): CarRequest {
  return {
    brandId: "",
    model: "",
    variant: "",
    series: "",
    scale: "1:64",
    color: "",
    condition: "MINT",
    packagingCondition: "MOC",
    purchasePrice: 0,
    estimatedValue: 0,
    quantity: 1,
    notes: "",
  };
}

export function CarFormModal({ open, onClose, onSaved, initialCar }: CarFormModalProps) {
  const { brands } = useBrands();
  const [form, setForm] = useState<CarRequest>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedValueTouched, setEstimatedValueTouched] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [priceLookupStatus, setPriceLookupStatus] = useState<PriceLookupStatus>("idle");
  const [priceLookupMessage, setPriceLookupMessage] = useState<string | null>(null);
  const [identifyStatus, setIdentifyStatus] = useState<IdentifyStatus>("idle");
  const [identifyMessage, setIdentifyMessage] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const isCreate = !initialCar;
  const selectedBrand = brands.find((b) => b.id === form.brandId);
  const isHotWheels = selectedBrand?.name === "Hot Wheels";
  const canProceedPastIdentify = !!form.brandId && form.model.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    setEstimatedValueTouched(!!initialCar);
    setPriceLookupStatus("idle");
    setPriceLookupMessage(null);
    setIdentifyStatus("idle");
    setIdentifyMessage(null);
    setPhotoFile(null);
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStep(1);
    if (initialCar) {
      setForm({
        brandId: initialCar.brand.id,
        model: initialCar.model,
        variant: initialCar.variant ?? "",
        series: initialCar.series ?? "",
        year: initialCar.year ?? undefined,
        scale: initialCar.scale ?? "",
        color: initialCar.color ?? "",
        condition: initialCar.condition,
        packagingCondition: initialCar.packagingCondition,
        hotWheelsSeriesType: initialCar.hotWheelsSeriesType ?? undefined,
        huntType: initialCar.huntType ?? undefined,
        purchasePrice: initialCar.purchasePrice,
        purchaseDate: initialCar.purchaseDate ?? undefined,
        estimatedValue: initialCar.estimatedValue,
        quantity: initialCar.quantity,
        notes: initialCar.notes ?? "",
      });
    } else {
      setForm(emptyForm());
    }
    setError(null);
  }, [open, initialCar]);

  function handleBrandChange(brandId: string) {
    const stillHotWheels = brands.find((b) => b.id === brandId)?.name === "Hot Wheels";
    setForm((prev) => {
      const next: CarRequest = { ...prev, brandId };
      if (stillHotWheels) {
        next.hotWheelsSeriesType = prev.hotWheelsSeriesType ?? "MAINLINE";
        next.huntType = prev.huntType ?? "NORMAL";
      } else {
        next.hotWheelsSeriesType = undefined;
        next.huntType = undefined;
        if (!estimatedValueTouched) {
          next.estimatedValue = round2(prev.purchasePrice);
        }
      }
      return next;
    });
  }

  function handleHuntTypeChange(huntType: HuntType) {
    setForm((prev) => ({
      ...prev,
      huntType,
      estimatedValue: estimatedValueTouched ? prev.estimatedValue : round2(prev.purchasePrice * HUNT_MULTIPLIER[huntType]),
    }));
  }

  function handlePurchasePriceChange(purchasePrice: number) {
    setForm((prev) => ({
      ...prev,
      purchasePrice,
      estimatedValue: estimatedValueTouched
        ? prev.estimatedValue
        : round2(purchasePrice * (prev.huntType ? HUNT_MULTIPLIER[prev.huntType] : 1)),
    }));
  }

  async function lookupMarketPrice() {
    if (!selectedBrand || !form.model.trim()) return;
    setPriceLookupStatus("loading");
    setPriceLookupMessage(null);
    try {
      const { data } = await api.get<MarketPriceResponse>("/pricing/market-value", {
        params: {
          brand: selectedBrand.name,
          model: form.model,
          series: form.series || undefined,
          scale: form.scale || undefined,
          year: form.year,
        },
      });

      if (data.found && data.estimatedValue != null) {
        setEstimatedValueTouched(true);
        setForm((prev) => ({ ...prev, estimatedValue: data.estimatedValue as number }));
        setPriceLookupStatus("found");
        setPriceLookupMessage(`Market value is — ${formatCurrency(data.estimatedValue)}`);
      } else {
        setPriceLookupStatus("not_found");
        setPriceLookupMessage(data.message ?? "Couldn't estimate a price — keeping our estimate");
      }
    } catch {
      setPriceLookupStatus("error");
      setPriceLookupMessage("Couldn't look up market price right now — keeping our estimate");
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPhotoFile(file);
    setIdentifyStatus("idle");
    setIdentifyMessage(null);
  }

  async function identifyFromPhoto() {
    if (!photoFile) return;
    setIdentifyStatus("loading");
    setIdentifyMessage(null);
    try {
      const photoData = new FormData();
      photoData.append("file", photoFile);
      const { data } = await api.post<IdentificationResponse>("/identify", photoData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.found) {
        const matchedBrand = data.brandGuess
          ? brands.find((b) => b.name.toLowerCase() === data.brandGuess!.toLowerCase())
          : undefined;
        setForm((prev) => ({
          ...prev,
          brandId: matchedBrand?.id ?? prev.brandId,
          model: prev.model || data.modelGuess || prev.model,
          series: prev.series || data.seriesGuess || prev.series,
          scale: prev.scale || data.scaleGuess || prev.scale,
          color: prev.color || data.colorGuess || prev.color,
        }));
        setIdentifyStatus("found");
        const brandNote = data.brandGuess && !matchedBrand ? ` (brand "${data.brandGuess}" not in our list — pick manually)` : "";
        setIdentifyMessage(`Looks like a ${[data.brandGuess, data.modelGuess].filter(Boolean).join(" ")}${brandNote}`);
      } else {
        setIdentifyStatus("not_found");
        setIdentifyMessage(data.message ?? "Couldn't identify this car");
      }
    } catch {
      setIdentifyStatus("error");
      setIdentifyMessage("Couldn't reach the identification service right now");
    }
  }

  function clearPhoto() {
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhotoFile(null);
    setIdentifyStatus("idle");
    setIdentifyMessage(null);
  }

  function goNext() {
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.brandId) {
      setError("Choose a brand");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = { ...form, year: form.year || undefined };
      let { data } = initialCar
        ? await api.patch<Car>(`/cars/${initialCar.id}`, payload)
        : await api.post<Car>("/cars", payload);

      if (photoFile) {
        const photoData = new FormData();
        photoData.append("file", photoFile);
        await api.post(`/cars/${data.id}/photos`, photoData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        data = (await api.get<Car>(`/cars/${data.id}`)).data;
      }

      onSaved(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't save this car"));
    } finally {
      setIsSaving(false);
    }
  }

  const photoField = (
    <FieldGroup label="Photo">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-input border border-dashed border-line-strong text-graphite-text transition-colors hover:border-accent hover:text-accent"
        >
          {photoPreviewUrl ? (
            <img src={photoPreviewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl">+</span>
          )}
        </button>
        <div className="text-sm text-graphite-text">
          {photoFile ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[160px] truncate text-ink">{photoFile.name}</span>
              <button type="button" onClick={clearPhoto} className="text-negative hover:underline">
                Remove
              </button>
            </div>
          ) : (
            <span>Add a photo of this model (optional)</span>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
      {photoFile && (
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={identifyFromPhoto}
            disabled={identifyStatus === "loading"}
          >
            {identifyStatus === "loading" ? "Identifying…" : "Identify from photo"}
          </Button>
          {identifyMessage && (
            <p className={`text-xs ${identifyStatus === "found" ? "text-accent" : "text-graphite-text"}`}>
              {identifyMessage}
            </p>
          )}
        </div>
      )}
    </FieldGroup>
  );

  const identifyFields = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Brand">
          <Select value={form.brandId} onChange={(e) => handleBrandChange(e.target.value)} required>
            <option value="" disabled>
              Select brand
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Model">
          <Input
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="Porsche 911 GT3 RS"
            required
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Series / Variant">
          <Input
            value={form.series}
            onChange={(e) => setForm({ ...form, series: e.target.value, variant: e.target.value })}
            placeholder="Car Culture"
          />
        </FieldGroup>
        <FieldGroup label="Scale">
          <Input value={form.scale} onChange={(e) => setForm({ ...form, scale: e.target.value })} placeholder="1:64" />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Year">
          <Input
            type="number"
            value={form.year ?? ""}
            onChange={(e) => setForm({ ...form, year: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="2025"
          />
        </FieldGroup>
        <FieldGroup label="Color">
          <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="GT Silver" />
        </FieldGroup>
      </div>
    </>
  );

  const collectionDetailFields = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Condition">
          <Select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value as Condition })}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Packaging">
          <Select
            value={form.packagingCondition}
            onChange={(e) => setForm({ ...form, packagingCondition: e.target.value as PackagingCondition })}
          >
            {PACKAGING.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      {isHotWheels && (
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Series Type">
            <Select
              value={form.hotWheelsSeriesType ?? "MAINLINE"}
              onChange={(e) => setForm({ ...form, hotWheelsSeriesType: e.target.value as HotWheelsSeriesType })}
            >
              <option value="MAINLINE">Mainline</option>
              <option value="FANTASY">Fantasy</option>
            </Select>
          </FieldGroup>
          <FieldGroup label="Hunt Type">
            <Select
              value={form.huntType ?? "NORMAL"}
              onChange={(e) => handleHuntTypeChange(e.target.value as HuntType)}
            >
              <option value="NORMAL">Normal</option>
              <option value="TREASURE_HUNT">Treasure Hunt</option>
              <option value="SUPER_TREASURE_HUNT">Super Treasure Hunt</option>
            </Select>
          </FieldGroup>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Purchase price (₹)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.purchasePrice}
            onChange={(e) => handlePurchasePriceChange(Number(e.target.value))}
            required
          />
        </FieldGroup>
        <FieldGroup label="Estimated value (₹)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.estimatedValue}
            onChange={(e) => {
              setEstimatedValueTouched(true);
              setForm({ ...form, estimatedValue: Number(e.target.value) });
            }}
            required
          />
        </FieldGroup>
      </div>
      {isHotWheels && (
        <p className="-mt-2 text-xs text-graphite-text">
          Estimated value defaults to 1× purchase price for Normal, 2× for Treasure Hunt, and 3× for Super Treasure Hunt —
          edit it directly to override.
        </p>
      )}

      <div className="-mt-2 flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={lookupMarketPrice}
          disabled={!form.brandId || !form.model.trim() || priceLookupStatus === "loading"}
        >
          {priceLookupStatus === "loading" ? "Looking up…" : "Look up market price"}
        </Button>
        {priceLookupMessage && (
          <p className={`text-xs ${priceLookupStatus === "found" ? "text-accent" : "text-graphite-text"}`}>
            {priceLookupMessage}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Purchase date">
          <Input
            type="date"
            value={form.purchaseDate ?? ""}
            onChange={(e) => setForm({ ...form, purchaseDate: e.target.value || undefined })}
          />
        </FieldGroup>
        <FieldGroup label="Quantity">
          <Input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Notes">
        <Textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Optional"
        />
      </FieldGroup>
    </>
  );

  if (!isCreate) {
    return (
      <Modal open={open} onClose={onClose} title="Edit car">
        <form onSubmit={handleSubmit} className="space-y-4">
          {photoField}
          {identifyFields}
          {collectionDetailFields}

          {error && <p className="text-sm text-negative">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to Garage">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-graphite-text">
            <span>
              Step {step} of {TOTAL_STEPS}
            </span>
            <span>{STEP_LABELS[step - 1]}</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-2xl text-ink">Add your model</h3>
              <p className="mt-1 text-sm text-graphite-text">
                Start with a photo, or skip ahead and enter the details yourself.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line-strong bg-cream/40 p-8 text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-line bg-paper text-graphite-text transition-colors hover:border-accent hover:text-accent"
              >
                {photoPreviewUrl ? (
                  <img src={photoPreviewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">+</span>
                )}
              </button>
              <div className="text-sm text-graphite-text">
                {photoFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="max-w-[200px] truncate text-ink">{photoFile.name}</span>
                    <button type="button" onClick={clearPhoto} className="text-negative hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <span>Drop in a snapshot of the model (optional)</span>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-2xl text-ink">Identify the model</h3>
              <p className="mt-1 text-sm text-graphite-text">Tell us what it is — or let the photo do the guessing.</p>
            </div>

            {photoFile ? (
              <div className="flex flex-wrap items-center gap-3 rounded-input bg-cream/60 p-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={identifyFromPhoto}
                  disabled={identifyStatus === "loading"}
                >
                  {identifyStatus === "loading" ? "Identifying…" : "Identify from photo"}
                </Button>
                {identifyMessage && (
                  <p className={`text-xs ${identifyStatus === "found" ? "text-accent" : "text-graphite-text"}`}>
                    {identifyMessage}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-graphite-text">
                Add a photo on the previous step to identify this model automatically.
              </p>
            )}

            {identifyFields}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-2xl text-ink">Collection details</h3>
              <p className="mt-1 text-sm text-graphite-text">Condition, value, and anything else worth noting.</p>
            </div>
            {collectionDetailFields}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-display text-2xl text-ink">Save to garage</h3>
              <p className="mt-1 text-sm text-graphite-text">Take one last look before it joins your collection.</p>
            </div>

            <div className="flex gap-4 rounded-card border border-line bg-cream/40 p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-input border border-line bg-paper">
                {photoPreviewUrl ? (
                  <img src={photoPreviewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-graphite-text">No photo</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-ink">
                  {selectedBrand?.name ?? "—"} {form.model}
                </p>
                <p className="truncate text-sm text-graphite-text">
                  {[form.series, form.scale, form.year].filter(Boolean).join(" · ") || "—"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge>{form.condition.replace("_", " ")}</Badge>
                  <Badge>{form.packagingCondition}</Badge>
                  {isHotWheels && form.huntType && form.huntType !== "NORMAL" && (
                    <Badge tone="accent">{form.huntType.replace(/_/g, " ")}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-graphite-text">Purchase price</p>
                <p className="text-ink">{formatCurrency(form.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-graphite-text">Estimated value</p>
                <p className="text-ink">{formatCurrency(form.estimatedValue)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-graphite-text">Quantity</p>
                <p className="text-ink">{form.quantity}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-graphite-text">Purchase date</p>
                <p className="text-ink">{form.purchaseDate || "—"}</p>
              </div>
            </div>

            {form.notes && <p className="text-sm italic text-graphite-text">"{form.notes}"</p>}
          </div>
        )}

        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="flex items-center justify-between gap-3 pt-2">
          {step === 1 ? (
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={goBack}>
              Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button type="button" onClick={goNext} disabled={step === 2 && !canProceedPastIdentify}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save to Garage"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
