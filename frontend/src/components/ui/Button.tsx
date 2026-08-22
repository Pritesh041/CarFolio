import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-paper hover:bg-accent-strong active:scale-[0.98]",
  secondary: "bg-transparent text-ink border border-ink/60 hover:border-ink hover:bg-ink/5 active:scale-[0.98]",
  dark: "bg-ink text-paper hover:bg-neutral-800 active:scale-[0.98]",
  ghost: "bg-transparent text-graphite-text hover:bg-ink/5 active:scale-[0.98]",
  danger: "bg-negative-soft text-negative border border-negative/30 hover:bg-negative-soft/70",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-button font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
