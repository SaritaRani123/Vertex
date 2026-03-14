"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopover() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used within Popover");
  return ctx;
}

function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const value = React.useMemo(
    () => ({ open, setOpen, triggerRef }),
    [open, setOpen]
  );
  return (
    <PopoverContext.Provider value={value}>
      {children}
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, setOpen, triggerRef } = usePopover();
  return (
    <div
      ref={triggerRef}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(!open);
        }
      }}
      className={cn("cursor-pointer outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function PopoverContent({
  className,
  children,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "center" | "end"; sideOffset?: number }) {
  const { open, setOpen, triggerRef } = usePopover();
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        contentRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen, triggerRef]);

  React.useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;
    const rect = trigger.getBoundingClientRect();
    content.style.position = "fixed";
    content.style.top = `${rect.bottom + sideOffset}px`;
    content.style.left = `${rect.left}px`;
    content.style.width = `${rect.width}px`;
    content.style.minWidth = `${rect.width}px`;
  }, [open, sideOffset, triggerRef]);

  if (!open) return null;

  const content = (
    <div
      ref={contentRef}
      role="dialog"
      className={cn(
        "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 z-50 rounded-lg border border-border shadow-md outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
}

export { Popover, PopoverTrigger, PopoverContent };
