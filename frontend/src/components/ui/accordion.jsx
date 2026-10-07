import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

function Accordion({ children, className }) {
  return <div className={cn("divide-y divide-border rounded-xl border border-border bg-card", className)}>{children}</div>
}

function AccordionItem({ children, className }) {
  return <div className={cn("p-4", className)}>{children}</div>
}

function AccordionTrigger({ children, isOpen, onToggle, className }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between font-medium text-left transition-all hover:underline py-1",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
}

function AccordionContent({ children, isOpen, className }) {
  if (!isOpen) return null;
  return (
    <div className={cn("pt-2 text-sm text-muted-foreground leading-relaxed animate-in fade-in-0", className)}>
      {children}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
