import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { api, extractErrorMessage } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";
import type { Trade, TradeStatus } from "../types";

const STATUS_TONE: Record<TradeStatus, "neutral" | "success" | "warning" | "danger"> = {
  PROPOSED: "warning",
  ACCEPTED: "success",
  COMPLETED: "success",
  DECLINED: "danger",
  CANCELLED: "neutral",
};

function TradeItemsList({ label, items }: { label: string; items: Trade["items"] }) {
  return (
    <div className="min-w-0 flex-1 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-graphite-text">{label}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-input bg-cream">
              {item.car.primaryPhotoUrl && (
                <img src={item.car.primaryPhotoUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold leading-tight text-ink">
                {item.car.brand.name} {item.car.model}
              </p>
              <p className="text-xs text-graphite-text">{formatCurrency(item.estimatedValueAtTrade)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TradesPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  function load() {
    return api.get<Trade[]>("/trades/mine").then((res) => setTrades(res.data));
  }

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, []);

  async function handleAction(tradeId: string, status: "ACCEPTED" | "DECLINED" | "CANCELLED") {
    setActionError(null);
    try {
      await api.patch(`/trades/${tradeId}`, { status });
      await load();
    } catch (err) {
      setActionError(extractErrorMessage(err, "Couldn't update that trade"));
    }
  }

  if (!user) return null;

  const incoming = trades.filter((t) => t.recipient.id === user.id);
  const outgoing = trades.filter((t) => t.initiator.id === user.id);

  function renderTrade(trade: Trade, direction: "incoming" | "outgoing") {
    const otherParty = direction === "incoming" ? trade.initiator : trade.recipient;
    const yourItems = trade.items.filter((item) => item.offeredByUserId === user!.id);
    const theirItems = trade.items.filter((item) => item.offeredByUserId !== user!.id);

    return (
      <Card key={trade.id} className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-graphite-text">
            {direction === "incoming" ? "Proposed by" : "Proposed to"}{" "}
            <span className="font-semibold text-ink">{otherParty.name}</span>
            <span> · {formatDate(trade.createdAt)}</span>
          </p>
          <Badge tone={STATUS_TONE[trade.status]}>{trade.status}</Badge>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <TradeItemsList label="Your Model(s)" items={yourItems} />
          <div className="flex shrink-0 items-center justify-center font-display text-2xl text-accent sm:px-2">
            ⇄
          </div>
          <TradeItemsList label="Their Model(s)" items={theirItems} />
        </div>

        {trade.status === "PROPOSED" && (
          <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
            {direction === "incoming" ? (
              <>
                <Button size="sm" onClick={() => handleAction(trade.id, "ACCEPTED")}>
                  Accept
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAction(trade.id, "DECLINED")}>
                  Decline
                </Button>
              </>
            ) : (
              <Button size="sm" variant="danger" onClick={() => handleAction(trade.id, "CANCELLED")}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Collector Exchange"
        title="Trades"
        description="Propose and manage trades with other collectors."
      />

      {actionError && <p className="text-sm font-medium text-negative">{actionError}</p>}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-card bg-cream" />
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Proposed to You</h2>
            {incoming.length === 0 ? (
              <EmptyState eyebrow="Nothing yet" title="No incoming trade proposals" />
            ) : (
              <div className="space-y-4">{incoming.map((trade) => renderTrade(trade, "incoming"))}</div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Your Proposals</h2>
            {outgoing.length === 0 ? (
              <EmptyState
                eyebrow="Nothing yet"
                title="No outgoing trade proposals"
                description="Propose a trade from another collector's showcase."
              />
            ) : (
              <div className="space-y-4">{outgoing.map((trade) => renderTrade(trade, "outgoing"))}</div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
