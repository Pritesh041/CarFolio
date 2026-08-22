import type { SVGProps } from "react";

const base = { width: 20, height: 20, viewBox: "0 0 20 20", fill: "none" } satisfies SVGProps<SVGSVGElement>;
const stroke = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function OverviewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10.5L10 4l7 6.5" {...stroke} />
      <path d="M5 9v7h10V9" {...stroke} />
    </svg>
  );
}

export function CollectionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="14" height="9" rx="2" {...stroke} />
      <path d="M6.5 6V5a2 2 0 012-2h3a2 2 0 012 2v1" {...stroke} />
    </svg>
  );
}

export function ShowcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1.2" {...stroke} />
      <rect x="11" y="3" width="6" height="6" rx="1.2" {...stroke} />
      <rect x="3" y="11" width="6" height="6" rx="1.2" {...stroke} />
      <rect x="11" y="11" width="6" height="6" rx="1.2" {...stroke} />
    </svg>
  );
}

export function WishlistIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 17s-6.2-3.9-6.2-8.4A3.6 3.6 0 0110 6.3a3.6 3.6 0 016.2 2.3C16.2 13.1 10 17 10 17z" {...stroke} />
    </svg>
  );
}

export function DiscoverIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="7" {...stroke} />
      <path d="M13 7l-2 5-4 1 2-5 4-1z" {...stroke} strokeLinejoin="round" />
    </svg>
  );
}

export function MarketplaceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7l1.5-3h11L17 7" {...stroke} />
      <rect x="3" y="7" width="14" height="9" rx="1.5" {...stroke} />
      <path d="M7.5 10a2.5 2.5 0 005 0" {...stroke} />
    </svg>
  );
}

export function SellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M11 3.5l5.5 5.5-8 8-6.5-6.5V4.5a1 1 0 011-1h8z" {...stroke} />
      <circle cx="7" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M3 6.5A2.5 2.5 0 015.5 4h9A2.5 2.5 0 0117 6.5v4A2.5 2.5 0 0114.5 13H9l-4 3v-3H5.5A2.5 2.5 0 013 10.5v-4z"
        {...stroke}
      />
    </svg>
  );
}

export function CommunityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="7" cy="8" r="2.4" {...stroke} />
      <circle cx="14" cy="8" r="2.4" {...stroke} />
      <path d="M2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" {...stroke} />
      <path d="M9.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" {...stroke} />
    </svg>
  );
}

export function TradesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h11M15 7l-2.5-2.5M15 7l-2.5 2.5" {...stroke} />
      <path d="M16 13H5M5 13l2.5-2.5M5 13l2.5 2.5" {...stroke} />
    </svg>
  );
}

export function HistoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10.5" r="6.5" {...stroke} />
      <path d="M10 7v3.5l2.5 1.5" {...stroke} />
      <path d="M4.5 5.5L3.8 8l2.5-.6" {...stroke} />
    </svg>
  );
}

export function AnalyticsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16V9M10 16V4M16 16v-6" {...stroke} />
    </svg>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 8a5 5 0 0110 0c0 3 1 4 1 4H4s1-1 1-4z" {...stroke} />
      <path d="M8.5 15a1.5 1.5 0 003 0" {...stroke} />
    </svg>
  );
}

export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="2.6" {...stroke} />
      <path
        d="M10 3.5v1.6M10 14.9v1.6M16.5 10h-1.6M5.1 10H3.5M14.6 5.4l-1.1 1.1M6.5 13.5l-1.1 1.1M14.6 14.6l-1.1-1.1M6.5 6.5L5.4 5.4"
        {...stroke}
      />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="5.5" {...stroke} />
      <path d="M17 17l-3.8-3.8" {...stroke} />
    </svg>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6h14M3 10h14M3 14h14" {...stroke} />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l10 10M15 5L5 15" {...stroke} />
    </svg>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 7.5l5 5 5-5" {...stroke} />
    </svg>
  );
}

export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 17s5-4.6 5-8.7A5 5 0 005 8.3C5 12.4 10 17 10 17z" {...stroke} />
      <circle cx="10" cy="8.3" r="1.7" {...stroke} />
    </svg>
  );
}

export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M8.5 11.5a3 3 0 004.2 0l2-2a3 3 0 10-4.2-4.2l-1 1" {...stroke} />
      <path d="M11.5 8.5a3 3 0 00-4.2 0l-2 2a3 3 0 104.2 4.2l1-1" {...stroke} />
    </svg>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" {...stroke} />
      <path d="M3.5 8h13M7 3v3M13 3v3" {...stroke} />
    </svg>
  );
}

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="30" height="30" viewBox="0 0 64 64" fill="none" {...props}>
      <path
        d="M44 20C40.8 16.9 36.6 15 32 15C22.6 15 15 22.6 15 32C15 41.4 22.6 49 32 49C36.6 49 40.8 47.1 44 44"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="6" fill="var(--color-accent)" />
    </svg>
  );
}
