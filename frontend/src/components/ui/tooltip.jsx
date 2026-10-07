import * as React from "react"
import { cn } from "@/lib/utils"

function Tooltip({ children, content, className }) {
  const [show, setShow] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <div
          className={cn(
            "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs text-popover-foreground bg-popover border border-border rounded shadow-md z-50 whitespace-nowrap animate-in fade-in-0 zoom-in-95",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip }
