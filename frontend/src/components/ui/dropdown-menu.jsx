import * as React from "react";
import { cn } from "@/lib/utils";

function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", isOpen ? "z-50" : "z-10")}>
      {React.Children.map(children, (child) => {
        if (!child) return null;
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            isOpen,
            onToggle: () => setIsOpen((prev) => !prev),
          });
        }
        if (child.type === DropdownMenuContent) {
          return isOpen
            ? React.cloneElement(child, {
                onClose: () => setIsOpen(false),
              })
            : null;
        }
        return child;
      })}
    </div>
  );
}

function DropdownMenuTrigger({ children, isOpen, onToggle, onClick, className, asChild, ...props }) {
  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (onClick) onClick(e);
    if (onToggle) onToggle();
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e);
        handleClick(e);
      },
    });
  }

  return (
    <div onClick={handleClick} className={cn("inline-flex cursor-pointer", className)} {...props}>
      {children}
    </div>
  );
}

function DropdownMenuContent({
  className,
  align = "right",
  children,
  onClose,
  ...props
}) {
  const alignClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={cn(
        "absolute top-full mt-2 z-50 min-w-50 rounded-2xl border border-border bg-card p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150 text-card-foreground ring-1 ring-black/5",
        alignClasses[align] || alignClasses.right,
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!child) return null;
        if (child.type === DropdownMenuItem) {
          return React.cloneElement(child, {
            onClick: (e) => {
              if (child.props.onClick) child.props.onClick(e);
              if (onClose) onClose();
            },
          });
        }
        return child;
      })}
    </div>
  );
}

function DropdownMenuItem({ className, destructive, children, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-foreground gap-2",
        destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuSeparator({ className, ...props }) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-border/60", className)} {...props} />
  );
}

function DropdownMenuLabel({ className, ...props }) {
  return (
    <div
      className={cn("px-2.5 py-1.5 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
