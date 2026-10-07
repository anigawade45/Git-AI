import * as React from "react";
import { cn } from "@/lib/utils";

function Alert({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-background text-foreground border-border",
    destructive:
      "border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/20",
    success:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/20",
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-xl border p-3.5 text-sm flex items-start gap-3",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <h5
      className={cn("font-semibold leading-tight tracking-tight text-sm", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div className={cn("text-xs opacity-90 mt-0.5 leading-relaxed", className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription };
