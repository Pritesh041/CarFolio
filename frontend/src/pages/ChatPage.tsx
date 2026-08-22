import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate } from "../lib/format";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { EmptyState } from "../components/ui/EmptyState";
import { subscribeToConversation, subscribeToInbox, publishMessage } from "../lib/chatSocket";
import type { Conversation, Message } from "../types";

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  function loadConversations() {
    setIsLoadingList(true);
    api
      .get<Conversation[]>("/conversations")
      .then((res) => setConversations(res.data))
      .finally(() => setIsLoadingList(false));
  }

  useEffect(loadConversations, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    subscribeToInbox(() => loadConversations()).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    api
      .get<Message[]>(`/conversations/${conversationId}/messages`)
      .then((res) => setMessages(res.data))
      .finally(() => setIsLoadingMessages(false));

    api.post(`/conversations/${conversationId}/read`).then(loadConversations);

    let unsubscribe: (() => void) | undefined;
    subscribeToConversation(conversationId, (raw) => {
      const message = raw as Message;
      setMessages((prev) => [...prev, message]);
      if (message.senderId !== user?.id) {
        api.post(`/conversations/${conversationId}/read`).then(loadConversations);
      } else {
        loadConversations();
      }
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!conversationId || !draft.trim()) return;
    await publishMessage(conversationId, draft.trim());
    setDraft("");
  }

  const activeConversation = conversations.find((c) => c.id === conversationId);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 sm:h-[calc(100vh-6rem)]">
      <Card className={clsx("w-full max-w-xs shrink-0 overflow-y-auto p-0", conversationId ? "hidden sm:block" : "block")}>
        <div className="border-b border-line p-4">
          <h1 className="font-display text-xl font-bold text-ink">Messages</h1>
        </div>
        {isLoadingList ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-input bg-cream" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4">
            <EmptyState eyebrow="No messages yet" title="Start a conversation from a listing" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/chat/${c.id}`)}
                className={clsx(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent-soft/40",
                  c.id === conversationId && "bg-accent-soft/60",
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-display text-sm font-bold text-paper">
                  {c.otherParticipant.avatarUrl ? (
                    <img src={c.otherParticipant.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    c.otherParticipant.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{c.otherParticipant.name}</p>
                  <p className="truncate text-xs text-graphite-text">{c.lastMessage ?? "No messages yet"}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-paper">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className={clsx("flex-1 flex-col p-0", conversationId ? "flex" : "hidden sm:flex")}>
        {!conversationId ? (
          <div className="flex flex-1 items-center justify-center text-sm text-graphite-text">Select a conversation</div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-line p-4">
              <button onClick={() => navigate("/chat")} className="text-graphite-text hover:text-ink sm:hidden">
                ←
              </button>
              <div>
                <p className="font-medium text-ink">{activeConversation?.otherParticipant.name ?? "…"}</p>
                {activeConversation && (
                  <Link
                    to={`/u/${activeConversation.otherParticipant.username}`}
                    className="text-xs text-graphite-text hover:text-accent"
                  >
                    @{activeConversation.otherParticipant.username}
                  </Link>
                )}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {isLoadingMessages ? (
                <p className="text-sm text-graphite-text">Loading…</p>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={clsx("flex", isMine ? "justify-end" : "justify-start")}>
                      <div
                        className={clsx(
                          "max-w-[75%] rounded-card px-3.5 py-2.5 text-sm",
                          isMine ? "bg-ink text-paper" : "bg-cream text-ink",
                        )}
                      >
                        <p>{m.content}</p>
                        <p className={clsx("mt-1 text-[10px]", isMine ? "text-paper/60" : "text-graphite-text")}>
                          {formatDate(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3">
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" className="flex-1" />
              <Button type="submit" disabled={!draft.trim()}>
                Send
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
