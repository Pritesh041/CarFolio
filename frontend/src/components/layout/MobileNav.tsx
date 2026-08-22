import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { OverviewIcon, CollectionIcon, WishlistIcon } from "./icons";
import { useAuth } from "../../lib/auth";

const items = [
  { to: "/dashboard", label: "Overview", icon: OverviewIcon },
  { to: "/collection", label: "Garage", icon: CollectionIcon },
];

export function MobileNav({ onAddCar }: { onAddCar: () => void }) {
  const { user } = useAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-paper/95 px-2 py-2 backdrop-blur lg:hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              "flex flex-1 flex-col items-center gap-1 rounded-button py-1.5 text-[11px] font-medium",
              isActive ? "text-accent" : "text-graphite-text",
            )
          }
        >
          <Icon />
          {label}
        </NavLink>
      ))}

      <button
        onClick={onAddCar}
        className="mx-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-paper shadow-lg"
        aria-label="Add to garage"
      >
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          clsx(
            "flex flex-1 flex-col items-center gap-1 rounded-button py-1.5 text-[11px] font-medium",
            isActive ? "text-accent" : "text-graphite-text",
          )
        }
      >
        <WishlistIcon />
        Wishlist
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          clsx(
            "flex flex-1 flex-col items-center gap-1 rounded-button py-1.5 text-[11px] font-medium",
            isActive ? "text-accent" : "text-graphite-text",
          )
        }
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-paper">
          {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
        </span>
        Profile
      </NavLink>
    </nav>
  );
}
