"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ListSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  id?: string;
  /**
   * When true, show the clear control even if the input is empty
   * (e.g. programs page with `?department_id=` but no search text).
   */
  clearActive?: boolean;
  /** Full reset; defaults to clearing the input only. */
  onClear?: () => void;
};

export function ListSearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  id,
  clearActive = false,
  onClear,
}: ListSearchFieldProps) {
  const hasText = value.trim().length > 0;
  const showClear = hasText || clearActive;

  const handleClear = () => {
    if (onClear) onClear();
    else onChange("");
  };

  return (
    <div className="relative w-full max-w-md sm:ml-auto sm:min-w-[14rem]">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        type="text"
        inputMode="search"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 border-[0.5px] border-border bg-background pr-9 pl-9 focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary"
        aria-label={ariaLabel}
      />
      {showClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
