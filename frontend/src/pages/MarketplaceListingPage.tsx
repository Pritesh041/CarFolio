import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, extractErrorMessage } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatCurrency, formatDate, formatLabel } from "../lib/format";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { FieldGroup, Input, Textarea } from "../components/ui/Field";
import type { Conversation, Listing } from "../types";

const STATUS_TONE = {
  ACTIVE: "success",
  PENDING: "warning",
  SOLD: "neutral",
  CANCELLED: "danger",
} as const;

export function MarketplaceListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerSent, setOfferSent] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .get<Listing>(`/listings/${id}`)
      .then((res) => setListing(res.data))
      .catch((err) => setError(extractErrorMessage(err, "This listing isn't available")))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleMakeOffer(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!listing) return;
    setIsSubmittingOffer(true);
    setOfferError(null);
    try {
      await api.post(`/listings/${listing.id}/offers`, { amount: Number(amount), message: message || undefined });
      setOfferSent(true);
      setAmount("");
      setMessage("");
    } catch (err) {
      setOfferError(extractErrorMessage(err, "Couldn't submit your offer"));
    } finally {
      setIsSubmittingOffer(false);
    }
  }

  async function handleMessageSeller() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!listing) return;
    setIsMessaging(true);
    setMessageError(null);
    try {
      const { data } = await api.post<Conversation>("/conversations", { username: listing.sellerUsername });
      navigate(`/chat/${data.id}`);
    } catch (err) {
      setMessageError(extractErrorMessage(err, "Couldn't start a conversation"));
    } finally {
      setIsMessaging(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 sm:px-8">
        <EmptyState eyebrow="Not found" title="Listing not available" description={error ?? "This listing no longer exists."} />
      </div>
    );
  }

  const isOwnListing = user?.id === listing.sellerId;
  const photo = listing.photos[activePhoto];

  return (
    <div className="py-2">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/3] overflow-hidden rounded-card bg-cream">
            {photo ? (
              <img src={photo.url} alt={listing.car.model} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-graphite-text">No photo</div>
            )}
          </div>
          {listing.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {listing.photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActivePhoto(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-input border ${
                    i === activePhoto ? "border-accent" : "border-line"
                  }`}
                >
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">{listing.car.brand.name}</p>
              <Badge tone={STATUS_TONE[listing.status]}>{listing.status}</Badge>
            </div>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-5xl">
              {listing.car.model}
            </h1>
            <p className="mt-2 text-sm text-graphite-text">
              {[listing.car.series, listing.car.year, listing.car.scale].filter(Boolean).join(" · ")}
            </p>
          </div>

          <p className="font-display text-4xl font-bold tracking-tight text-ink tabular-nums">
            {formatCurrency(listing.price)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>{formatLabel(listing.condition)}</Badge>
            <span className="text-xs text-graphite-text">Listed {formatDate(listing.createdAt)}</span>
          </div>

          {listing.description && <p className="text-graphite-text">{listing.description}</p>}
          {listing.shippingInfo && (
            <p className="text-sm text-graphite-text">
              <span className="font-medium text-ink">Shipping: </span>
              {listing.shippingInfo}
            </p>
          )}

          <p className="text-sm text-graphite-text">
            Sold by{" "}
            <Link to={`/u/${listing.sellerUsername}`} className="font-medium text-accent hover:text-accent-strong">
              {listing.sellerName}
            </Link>
          </p>

          {!isOwnListing && (
            <div>
              <Button variant="secondary" onClick={handleMessageSeller} disabled={isMessaging}>
                {isMessaging ? "Starting…" : "Message Seller"}
              </Button>
              {messageError && <p className="mt-1 text-sm text-negative">{messageError}</p>}
            </div>
          )}

          {!isOwnListing && listing.status === "ACTIVE" && (
            <Card className="p-5">
              {offerSent ? (
                <p className="text-sm font-medium text-accent">Your offer has been sent to the seller.</p>
              ) : (
                <form onSubmit={handleMakeOffer} className="space-y-4">
                  <h2 className="font-display text-lg font-semibold text-ink">Make an offer</h2>
                  <FieldGroup label="Offer amount (₹)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup label="Message (optional)">
                    <Textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
                  </FieldGroup>
                  {offerError && <p className="text-sm text-negative">{offerError}</p>}
                  <Button type="submit" disabled={isSubmittingOffer} className="w-full">
                    {isSubmittingOffer ? "Sending…" : user ? "Send offer" : "Sign in to make an offer"}
                  </Button>
                </form>
              )}
            </Card>
          )}

          {isOwnListing && (
            <p className="text-sm text-graphite-text">
              This is your listing — manage it and view offers from the{" "}
              <Link to="/marketplace/sell" className="font-medium text-accent hover:text-accent-strong">
                sell page
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
