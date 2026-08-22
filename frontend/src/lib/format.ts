export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatSigned(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

const LABELS: Record<string, string> = {
  MINT: "Mint",
  NEAR_MINT: "Near Mint",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  MOC: "MOC",
  MIP: "MIP",
  LOOSE: "Loose",
  OPENED: "Opened",
  DAMAGED: "Damaged",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  NORMAL: "Normal",
  TREASURE_HUNT: "Treasure Hunt",
  SUPER_TREASURE_HUNT: "Super Treasure Hunt",
};

export function formatLabel(value: string): string {
  return LABELS[value] ?? value;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
