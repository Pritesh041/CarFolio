import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { subscribeToNotifications } from "../../lib/chatSocket";
import { formatDate } from "../../lib/format";
import { BellIcon } from "./icons";
import type { AppNotification } from "../../types";

export function NotificationsPanel() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function load() {
    api.get<AppNotification[]>("/notifications").then((res) => setNotifications(res.data));
  }

  useEffect(() => {
    load();
    let unsubscribe: (() => void) | undefined;
    subscribeToNotifications((raw) => {
      setNotifications((prev) => [raw as AppNotification, ...prev]);
    }).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleOpenNotification(notification: AppNotification) {
    setIsOpen(false);
    if (!notification.isRead) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
      api.post(`/notifications/${notification.id}/read`).catch(() => {});
    }
    if (notification.link) navigate(notification.link);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await api.post("/notifications/read-all");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-full p-2 text-graphite-text hover:bg-ink/5 hover:text-ink"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-paper">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-card border border-line bg-paper shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-graphite-text hover:text-ink">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-graphite-text">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleOpenNotification(n)}
                  className={`block w-full border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-ink/5 ${
                    n.isRead ? "" : "bg-accent-soft/40"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{n.title}</p>
                      {n.body && <p className="truncate text-xs text-graphite-text">{n.body}</p>}
                      <p className="mt-0.5 text-[11px] text-graphite-text">{formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
