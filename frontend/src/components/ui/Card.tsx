import { type HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("rounded-card border border-line bg-paper", className)} {...props}>
      {children}
    </div>
  );
}
