import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({ className, checked, onChange, onCheckedChange, disabled, id, ...props }) {
  const handleChange = (e) => {
    const isChecked = e.target.checked;
    if (onChange) onChange(e);
    if (onCheckedChange) onCheckedChange(isChecked);
  };

  const handleToggle = () => {
    if (disabled) return;
    const nextChecked = !checked;
    if (onCheckedChange) onCheckedChange(nextChecked);
    if (onChange) onChange({ target: { checked: nextChecked } });
  };

  return (
    <div className="inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <div
        onClick={handleToggle}
        className={cn(
          "h-4 w-4 shrink-0 rounded border border-input bg-background flex items-center justify-center transition-all cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          checked && "bg-primary text-primary-foreground border-primary",
          className
        )}
      >
        {checked && <Check className="h-3 w-3 stroke-3" />}
      </div>
    </div>
  );
}

export { Checkbox };

