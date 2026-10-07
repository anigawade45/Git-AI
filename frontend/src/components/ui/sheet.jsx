import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function Sheet({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange && onOpenChange(false)}
      />
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        {React.Children.map(children, (child) => {
          if (!child) return null;
          return React.cloneElement(child, {
            onClose: () => onOpenChange && onOpenChange(false),
          });
        })}
      </div>
    </div>
  );
}

function SheetContent({ className, side = "left", children, onClose, ...props }) {
  const sideClasses = {
    left: "animate-in slide-in-from-left duration-300",
    right: "animate-in slide-in-from-right duration-300",
  };

  return (
    <div
      className={cn(
        "relative w-72 h-full border-r border-border bg-card p-6 shadow-2xl backdrop-blur flex flex-col justify-between text-card-foreground",
        sideClasses[side] || sideClasses.left,
        className
      )}
      {...props}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      {children}
    </div>
  );
}

export { Sheet, SheetContent };
