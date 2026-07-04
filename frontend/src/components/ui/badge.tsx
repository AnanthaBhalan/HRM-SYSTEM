import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "secondary";
  children?: ReactNode;
}) {
  const styles = {
    default: "bg-sky-100 text-sky-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    secondary: "bg-slate-100 text-slate-700",
  } as const;

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", styles[variant], className)}>
      {children ?? (variant === "default" ? "Active" : variant)}
    </span>
  );
}
