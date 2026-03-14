"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function Command({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex h-full w-full flex-col overflow-hidden rounded-md", className)}
      {...props}
    />
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn("border-0 rounded-none border-b bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0", className)}
      {...props}
    />
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-h-[min(16rem,calc(var(--available-height)-2rem))] overflow-y-auto overflow-x-hidden p-1",
        className
      )}
      {...props}
    />
  );
}

function CommandItem({
  className,
  onSelect,
  ...props
}: React.ComponentProps<"div"> & { onSelect?: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        onSelect?.();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      {...props}
    />
  );
}

export { Command, CommandInput, CommandList, CommandItem };
