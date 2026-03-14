"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

export interface CheckboxProps extends Omit<React.ComponentProps<"button">, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onCheckedChange?.(!checked);
      onClick?.(e);
    };

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        ref={ref}
        onClick={handleClick}
        className={cn(
          "border-primary size-4 shrink-0 rounded-[4px] border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className
        )}
        data-state={checked ? "checked" : "unchecked"}
        {...props}
      >
        {checked ? <CheckIcon className="size-3" /> : null}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
