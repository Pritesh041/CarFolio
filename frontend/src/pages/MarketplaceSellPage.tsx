import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { api, extractErrorMessage } from "../lib/api";
import { useConfirm } from "../lib/confirm";
import { formatCurrency, formatDate, formatLabel } from "../lib/format";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { FieldGroup, Input, Label, Select, Textarea } from "../components/ui/Field";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ProductCard } from "../components/ui/ProductCard";
import type { Car, Condition, Listing, ListingRequest, Offer, Page } from "../types";

const CONDITIONS: Condition[] = ["MINT", "NEAR_MINT", "GOOD", "FAIR", "POOR"];

const STATUS_TONE = {
  ACTIVE: "success",
  PENDING: "warning",
  SOLD: "neutral",
  CANCELLED: "danger",
} as const;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function suggestedPrice(car: Car): number {
  return Math.max(round2(car.estimatedValue * 0.8), car.purchasePrice);
}

async function photoToStagedImage(url: string, name: string): Promise<StagedImage> {
  const blob = await (await fetch(url)).blob();
  const file = new File([blob], name, { type: blob.type || "image/jpeg" });
  return { file, previewUrl: URL.createObjectURL(blob) };
}

async function stageCarPhotos(car: Car): Promise<{ hero: StagedImage | null; extra: StagedImage[] }> {
  if (car.photos.length === 0) return { hero: null, extra: [] };
  const staged = await Promise.all(
    car.photos.map((photo, i) => photoToStagedImage(photo.url, `${car.model.replace(/\s+/g, "-")}-${i}.jpg`)),
  );
  return { hero: staged[0], extra: staged.slice(1) };
}

function emptyForm(): Omit<ListingRequest, "carId"> & { carId: string } {
  return { carId: "", price: 0, condition: "MINT", description: "", shippingInfo: "" };
}

interface StagedImage {
  file: File;
  previewUrl: string;
}

export function MarketplaceSellPage() {
  const [searchParams] = useSearchParams();
  const confirm = useConfirm();
  const preselectedCarId = searchParams.get("carId");
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [priceTouched, setPriceTouched] = useState(false);
  const [heroImage, setHeroImage] = useState<StagedImage | null>(null);
  const [extraImages, setExtraImages] = useState<StagedImage[]>([]);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedListingId, setExpandedListingId] = useState<string | null>(null);
  const [offersByListing, setOffersByListing] = useState<Record<string, Offer[]>>({});
  const [offerActionError, setOfferActionError] = useState<string | null>(null);

  function loadListings() {
    api.get<Listing[]>("/listings/mine").then((res) => setMyListings(res.data));
  }

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get<Page<Car>>("/cars", { params: { size: 200 } }).then(async (res) => {
        setMyCars(res.data.content);
        const preselectedCar = res.data.content.find((c) => c.id === preselectedCarId);
        if (preselectedCar) {
          setForm((prev) => ({ ...prev, carId: preselectedCar.id, price: suggestedPrice(preselectedCar) }));
          const { hero, extra } = await stageCarPhotos(preselectedCar);
          setHeroImage(hero);
          setExtraImages(extra);
        }
      }),
      api.get<Listing[]>("/listings/mine").then((res) => setMyListings(res.data)),
    ]).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCarChange(carId: string) {
    const car = myCars.find((c) => c.id === carId);
    setForm((prev) => ({
      ...prev,
      carId,
      price: car && !priceTouched ? suggestedPrice(car) : prev.price,
    }));

    clearHero();
    setExtraImages((prev) => {
      prev.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return [];
    });
    if (car) {
      const { hero, extra } = await stageCarPhotos(car);
      setHeroImage(hero);
      setExtraImages(extra);
    }
  }

  function handleHeroChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setHeroImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file) };
    });
  }

  function clearHero() {
    setHeroImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }

  function handleExtraChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setExtraImages((prev) => [...prev, ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))]);
  }

  function removeExtra(index: number) {
    setExtraImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleCreateListing(e: FormEvent) {
    e.preventDefault();
    if (!form.carId) {
      setError("Choose a car to sell");
      return;
    }
    if (!heroImage) {
      setError("Add a hero image before listing for sale");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const { data } = await api.post<Listing>("/listings", form);

      const heroData = new FormData();
      heroData.append("file", heroImage.file);
      await api.post(`/listings/${data.id}/photos`, heroData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      for (const image of extraImages) {
        const photoData = new FormData();
        photoData.append("file", image.file);
        await api.post(`/listings/${data.id}/photos`, photoData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setForm(emptyForm());
      setPriceTouched(false);
      clearHero();
      extraImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setExtraImages([]);
      loadListings();
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't create this listing"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel(listing: Listing) {
    const ok = await confirm({
      title: "Cancel listing",
      message: `Cancel the listing for ${listing.car.model}?`,
      confirmLabel: "Cancel Listing",
      tone: "danger",
    });
    if (!ok) return;
    await api.delete(`/listings/${listing.id}`);
    loadListings();
  }

  async function handleMarkSold(listing: Listing) {
    await api.post(`/listings/${listing.id}/mark-sold`);
    loadListings();
  }

  async function toggleOffers(listingId: string) {
    if (expandedListingId === listingId) {
      setExpandedListingId(null);
      return;
    }
    setExpandedListingId(listingId);
    if (!offersByListing[listingId]) {
      const { data } = await api.get<Offer[]>(`/listings/${listingId}/offers`);
      setOffersByListing((prev) => ({ ...prev, [listingId]: data }));
    }
  }

  async function handleOfferAction(listingId: string, offerId: string, status: "ACCEPTED" | "DECLINED") {
    setOfferActionError(null);
    try {
      await api.patch(`/offers/${offerId}`, { status });
      const { data } = await api.get<Offer[]>(`/listings/${listingId}/offers`);
      setOffersByListing((prev) => ({ ...prev, [listingId]: data }));
      loadListings();
    } catch (err) {
      setOfferActionError(extractErrorMessage(err, "Couldn't update that offer"));
    }
  }

  const selectedCar = myCars.find((c) => c.id === form.carId) ?? null;

  return (
    <div className="space-y-14">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Marketplace</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          Sell a Car
        </h1>
        <p className="mt-3 max-w-xl text-base text-graphite-text">
          List a car from your collection, set your price, and manage offers from buyers — all in one place.
        </p>
      </div>

      <form onSubmit={handleCreateListing} className="space-y-14">
        {/* 1. Pick a car */}
        <section className="space-y-5">
          <SectionHeading eyebrow="Step 1" title="Pick a car to sell" description="Choose a car from your collection." />

          {isLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-card bg-cream" />
              ))}
            </div>
          ) : myCars.length === 0 ? (
            <EmptyState eyebrow="No cars yet" title="Your collection is empty" description="Add a car to your garage before listing it for sale." />
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {myCars.map((car) => {
                const isSelected = form.carId === car.id;
                return (
                  <button
                    type="button"
                    key={car.id}
                    onClick={() => handleCarChange(car.id)}
                    className={clsx(
                      "group relative overflow-hidden rounded-card border-2 bg-paper text-left transition-colors",
                      isSelected ? "border-accent" : "border-line hover:border-line-strong",
                    )}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-cream">
                      {car.photos[0] ? (
                        <img src={car.photos[0].url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-graphite-text">
                          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                            <rect x="6" y="20" width="36" height="12" rx="4" stroke="currentColor" strokeWidth="1.6" />
                            <circle cx="15" cy="34" r="4" stroke="currentColor" strokeWidth="1.6" />
                            <circle cx="33" cy="34" r="4" stroke="currentColor" strokeWidth="1.6" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-paper">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                          <path d="M4 10.5L8 14.5L16 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                    <div className="p-2">
                      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-graphite-text">
                        {car.brand.name}
                      </p>
                      <p className="truncate font-display text-sm font-semibold leading-tight text-ink">{car.model}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. Set your price */}
        <section className="space-y-5">
          <SectionHeading eyebrow="Step 2" title="Set your price" description="Suggested price defaults to 20% below estimated value, never below what you paid." />

          <Card className="space-y-4 p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Price (₹)">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => {
                    setPriceTouched(true);
                    setForm({ ...form, price: Number(e.target.value) });
                  }}
                  required
                />
              </FieldGroup>
              <FieldGroup label="Condition">
                <Select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value as Condition })}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {formatLabel(c)}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </div>
            {selectedCar && (
              <p className="text-xs text-graphite-text">
                Suggested price for this car is {formatCurrency(suggestedPrice(selectedCar))} — edit the field above to override.
              </p>
            )}

            <FieldGroup label="Description">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Condition notes, what's included, etc."
              />
            </FieldGroup>

            <FieldGroup label="Shipping info">
              <Input
                value={form.shippingInfo}
                onChange={(e) => setForm({ ...form, shippingInfo: e.target.value })}
                placeholder="Ships within India, buyer pays shipping"
              />
            </FieldGroup>
          </Card>
        </section>

        {/* 3. Photos */}
        <section className="space-y-5">
          <SectionHeading
            eyebrow="Step 3"
            title="Photos"
            description={
              selectedCar && selectedCar.photos.length > 0
                ? "We've carried over the photos from your collection. Swap them out or add more angles if you'd like."
                : "Add a hero photo and any extra angles buyers will want to see."
            }
          />

          <Card className="space-y-5 p-5 sm:p-6">
            <div>
              <Label>Hero photo</Label>
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                className={clsx(
                  "relative flex aspect-[4/3] w-full max-w-[220px] items-center justify-center overflow-hidden rounded-card border-2 border-dashed text-graphite-text transition-colors",
                  heroImage ? "border-line" : "border-line hover:border-accent hover:text-accent",
                )}
              >
                {heroImage ? (
                  <img src={heroImage.previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1.5 px-4 text-center">
                    <span className="text-2xl leading-none">+</span>
                    <span className="text-xs font-semibold uppercase tracking-wide">Add hero photo</span>
                    <span className="text-[11px] text-graphite-text">Required — first photo buyers see</span>
                  </span>
                )}
              </button>
              {heroImage && (
                <div className="mt-2 flex items-center gap-2 text-sm text-graphite-text">
                  <span className="max-w-[180px] truncate">{heroImage.file.name}</span>
                  <button type="button" onClick={clearHero} className="font-medium text-negative hover:underline">
                    Remove
                  </button>
                </div>
              )}
              <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeroChange} />
            </div>

            <div>
              <Label>Additional photos (optional)</Label>
              <div className="flex flex-wrap items-center gap-3">
                {extraImages.map((image, index) => (
                  <div key={image.previewUrl} className="group/thumb relative h-20 w-20 shrink-0">
                    <img
                      src={image.previewUrl}
                      alt=""
                      className="h-20 w-20 rounded-input border border-line object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExtra(index)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-xs text-paper opacity-0 shadow ring-1 ring-line transition-opacity group-hover/thumb:opacity-100"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => extraInputRef.current?.click()}
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-input border-2 border-dashed border-line text-graphite-text transition-colors hover:border-accent hover:text-accent"
                >
                  <span className="text-2xl leading-none">+</span>
                </button>
                <input
                  ref={extraInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleExtraChange}
                />
              </div>
            </div>
          </Card>
        </section>

        {error && <p className="text-sm text-negative">{error}</p>}

        <div>
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? "Listing…" : "List for sale"}
          </Button>
        </div>
      </form>

      {/* 4. Active listings */}
      <section className="space-y-5">
        <SectionHeading title="Your active listings" description="Everything you currently have up for sale." />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-card bg-cream" />
            ))}
          </div>
        ) : myListings.length === 0 ? (
          <EmptyState eyebrow="No listings yet" title="You haven't listed anything for sale" />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {myListings.map((listing) => (
              <div key={listing.id} className="space-y-3">
                <ProductCard
                  href={`/marketplace/${listing.id}`}
                  imageUrl={listing.photos[0]?.url}
                  brand={listing.car.brand.name}
                  title={listing.car.model}
                  scale={listing.car.scale}
                  price={listing.price}
                  status="FOR_SALE"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone={STATUS_TONE[listing.status]}>{listing.status}</Badge>
                  {listing.status === "ACTIVE" && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleMarkSold(listing)}>
                        Mark sold
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleCancel(listing)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Incoming offers */}
      <section className="space-y-5">
        <SectionHeading title="Incoming offers" description="Review and respond to offers on your listings." />

        {offerActionError && <p className="text-sm text-negative">{offerActionError}</p>}

        {isLoading ? (
          <div className="h-24 animate-pulse rounded-card bg-cream" />
        ) : myListings.length === 0 ? (
          <EmptyState eyebrow="Nothing to review" title="No listings to show offers for" />
        ) : (
          <div className="space-y-4">
            {myListings.map((listing) => (
              <Card key={listing.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-input bg-cream">
                      {listing.photos[0] && (
                        <img src={listing.photos[0].url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold text-ink">
                        {listing.car.brand.name} {listing.car.model}
                      </p>
                      <p className="text-sm text-graphite-text">
                        {formatCurrency(listing.price)} · Listed {formatDate(listing.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => toggleOffers(listing.id)}>
                    {expandedListingId === listing.id ? "Hide offers" : "View offers"}
                  </Button>
                </div>

                {expandedListingId === listing.id && (
                  <div className="mt-4 space-y-2 border-t border-line pt-4">
                    {!offersByListing[listing.id] ? (
                      <p className="text-sm text-graphite-text">Loading offers…</p>
                    ) : offersByListing[listing.id].length === 0 ? (
                      <p className="text-sm text-graphite-text">No offers yet.</p>
                    ) : (
                      offersByListing[listing.id].map((offer) => (
                        <div
                          key={offer.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-input border border-line bg-cream/60 p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink">
                              {formatCurrency(offer.amount)}{" "}
                              <span className="font-normal text-graphite-text">from {offer.buyerName}</span>
                            </p>
                            {offer.message && (
                              <p className="mt-0.5 max-w-md truncate text-xs text-graphite-text">{offer.message}</p>
                            )}
                          </div>
                          {offer.status === "PENDING" ? (
                            <div className="flex shrink-0 items-center gap-2">
                              <Button size="sm" onClick={() => handleOfferAction(listing.id, offer.id, "ACCEPTED")}>
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleOfferAction(listing.id, offer.id, "DECLINED")}
                              >
                                Decline
                              </Button>
                            </div>
                          ) : (
                            <Badge tone={offer.status === "ACCEPTED" ? "success" : "neutral"}>{offer.status}</Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
