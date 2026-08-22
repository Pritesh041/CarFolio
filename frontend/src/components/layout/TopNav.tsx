import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../../lib/auth";
import { useAddCar } from "../../lib/addCarStore";
import { api } from "../../lib/api";
import { subscribeToInbox } from "../../lib/chatSocket";
import type { Conversation } from "../../types";
import { Button } from "../ui/Button";
import { NotificationsPanel } from "./NotificationsPanel";
import {
  LogoMark,
  SearchIcon,
  MenuIcon,
  CloseIcon,
  ChevronDownIcon,
  WishlistIcon,
  ChatIcon,
  ShowcaseIcon,
  CollectionIcon,
  SellIcon,
  TradesIcon,
  HistoryIcon,
  AnalyticsIcon,
  SettingsIcon,
  OverviewIcon,
} from "./icons";

const primaryLinks = [
  { to: "/discover", label: "Discover" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/community", label: "Community" },
];

const menuLinks = [
  { to: "/dashboard", label: "Overview", icon: OverviewIcon },
  { to: "/collection", label: "My Garage", icon: CollectionIcon },
  { to: "/showcase", label: "Showcases", icon: ShowcaseIcon },
  { to: "/marketplace/sell", label: "Sell a Car", icon: SellIcon },
  { to: "/trades", label: "Trades", icon: TradesIcon },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

interface TopNavProps {
  variant?: "solid" | "overlay";
}

export function TopNav({ variant = "solid" }: TopNavProps) {
  const { user, logout } = useAuth();
  const addCar = useAddCar();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(variant === "solid");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "overlay") return;
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    if (!user) return;
    function refreshUnread() {
      api.get<Conversation[]>("/conversations").then((res) => {
        setUnreadTotal(res.data.reduce((sum, c) => sum + c.unreadCount, 0));
      });
    }
    refreshUnread();
    let unsubscribe: (() => void) | undefined;
    subscribeToInbox(() => refreshUnread()).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => unsubscribe?.();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOverlay = variant === "overlay" && !scrolled;

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/marketplace?q=${encodeURIComponent(searchValue.trim())}`);
    setSearchOpen(false);
    setSearchValue("");
  }

  const collectionsHref = user ? "/collection" : "/discover";

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-40 transition-colors duration-300",
          isOverlay ? "bg-transparent" : "border-b border-line bg-ivory/95 backdrop-blur-sm",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className={clsx("flex items-center gap-2", isOverlay ? "text-paper" : "text-ink")}>
            <LogoMark />
            <span className="font-display text-xl font-bold tracking-tight">CARFOLIO</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {primaryLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  clsx(
                    "text-sm font-semibold uppercase tracking-wide transition-colors",
                    isOverlay
                      ? isActive
                        ? "text-paper"
                        : "text-paper/70 hover:text-paper"
                      : isActive
                        ? "text-accent"
                        : "text-graphite-text hover:text-ink",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <NavLink
              to={collectionsHref}
              className={({ isActive }) =>
                clsx(
                  "text-sm font-semibold uppercase tracking-wide transition-colors",
                  isOverlay
                    ? isActive
                      ? "text-paper"
                      : "text-paper/70 hover:text-paper"
                    : isActive
                      ? "text-accent"
                      : "text-graphite-text hover:text-ink",
                )
              }
            >
              Collections
            </NavLink>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="relative flex items-center">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    autoFocus
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => !searchValue && setSearchOpen(false)}
                    placeholder="Search models, brands…"
                    className={clsx(
                      "w-56 rounded-full border px-4 py-1.5 text-sm outline-none",
                      isOverlay
                        ? "border-paper/40 bg-paper/10 text-paper placeholder:text-paper/60"
                        : "border-line bg-paper text-ink placeholder:text-neutral-500",
                    )}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className={clsx(
                    "rounded-full p-2 transition-colors",
                    isOverlay ? "text-paper/80 hover:bg-paper/10 hover:text-paper" : "text-graphite-text hover:bg-ink/5 hover:text-ink",
                  )}
                >
                  <SearchIcon />
                </button>
              )}
            </div>

            {user && (
              <>
                <Link
                  to="/wishlist"
                  aria-label="Wishlist"
                  className={clsx(
                    "rounded-full p-2 transition-colors",
                    isOverlay ? "text-paper/80 hover:bg-paper/10 hover:text-paper" : "text-graphite-text hover:bg-ink/5 hover:text-ink",
                  )}
                >
                  <WishlistIcon />
                </Link>
                <Link
                  to="/chat"
                  aria-label="Messages"
                  className={clsx(
                    "relative rounded-full p-2 transition-colors",
                    isOverlay ? "text-paper/80 hover:bg-paper/10 hover:text-paper" : "text-graphite-text hover:bg-ink/5 hover:text-ink",
                  )}
                >
                  <ChatIcon />
                  {unreadTotal > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-paper">
                      {unreadTotal}
                    </span>
                  )}
                </Link>
                <NotificationsPanel />

                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition-colors",
                      isOverlay ? "hover:bg-paper/10" : "hover:bg-ink/5",
                    )}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-paper">
                      {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                    <ChevronDownIcon className={isOverlay ? "text-paper/80" : "text-graphite-text"} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full z-20 mt-2 w-60 rounded-card border border-line bg-paper py-2 shadow-lg">
                      {menuLinks.map(({ to, label, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
                        >
                          <Icon className="text-graphite-text" />
                          {label}
                        </Link>
                      ))}
                      <div className="my-2 border-t border-line" />
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full px-4 py-2 text-left text-sm font-medium text-negative hover:bg-negative-soft"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>

                <Button size="sm" onClick={addCar.openModal} className="ml-1">
                  + Add to Garage
                </Button>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  className={clsx(
                    "text-sm font-medium",
                    isOverlay ? "text-paper/90 hover:text-paper" : "text-graphite-text hover:text-ink",
                  )}
                >
                  Sign in
                </Link>
                <Link to="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className={clsx("rounded-full p-2 lg:hidden", isOverlay ? "text-paper" : "text-ink")}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-ivory p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-ink">Menu</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="rounded-full p-2 text-ink hover:bg-ink/5">
                <CloseIcon />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              {[...primaryLinks, { to: collectionsHref, label: "Collections" }].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-button px-3 py-3 text-base font-semibold text-ink hover:bg-ink/5"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {user ? (
              <>
                <div className="my-4 border-t border-line" />
                <nav className="flex flex-col gap-1">
                  <Link
                    to="/wishlist"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-button px-3 py-3 text-sm font-medium text-ink hover:bg-ink/5"
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-button px-3 py-3 text-sm font-medium text-ink hover:bg-ink/5"
                  >
                    Messages{unreadTotal > 0 ? ` (${unreadTotal})` : ""}
                  </Link>
                  {menuLinks.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-button px-3 py-3 text-sm font-medium text-ink hover:bg-ink/5"
                    >
                      {label}
                    </Link>
                  ))}
                  <Link
                    to="/profile"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-button px-3 py-3 text-sm font-medium text-ink hover:bg-ink/5"
                  >
                    Profile
                  </Link>
                </nav>
                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setDrawerOpen(false);
                      addCar.openModal();
                    }}
                  >
                    + Add to Garage
                  </Button>
                  <Button variant="secondary" onClick={logout}>
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-6 flex flex-col gap-2">
                <Link to="/signup" onClick={() => setDrawerOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
                <Link to="/login" onClick={() => setDrawerOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign in
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
