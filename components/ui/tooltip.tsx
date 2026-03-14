"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  scheduleOpen: () => void;
  scheduleClose: () => void;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltip() {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within Tooltip");
  return ctx;
}

function Tooltip({
  children,
  delayMs = 200,
}: {
  children: React.ReactNode;
  delayMs?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const delayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleOpen = React.useCallback(() => {
    if (delayRef.current) clearTimeout(delayRef.current);
    delayRef.current = setTimeout(() => setOpen(true), delayMs);
  }, [delayMs]);

  const scheduleClose = React.useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    setOpen(false);
  }, []);

  React.useEffect(() => () => {
    if (delayRef.current) clearTimeout(delayRef.current);
  }, []);

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      scheduleOpen,
      scheduleClose,
    }),
    [open, scheduleOpen, scheduleClose]
  );

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { scheduleOpen, scheduleClose, triggerRef } = useTooltip();
  return (
    <div
      ref={triggerRef}
      className={cn("inline-flex", className)}
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      {...props}
    >
      {children}
    </div>
  );
}

function TooltipContent({
  className,
  children,
  side = "top",
  sideOffset = 6,
  ...props
}: React.ComponentProps<"div"> & { side?: "top" | "bottom" | "left" | "right"; sideOffset?: number }) {
  const { open, triggerRef } = useTooltip();
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

  React.useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    const updatePosition = () => {
      const rect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      let top = 0;
      let left = rect.left + rect.width / 2 - contentRect.width / 2;
      if (side === "top") {
        top = rect.top - contentRect.height - sideOffset;
      } else if (side === "bottom") {
        top = rect.bottom + sideOffset;
      } else if (side === "left") {
        top = rect.top + rect.height / 2 - contentRect.height / 2;
        left = rect.left - contentRect.width - sideOffset;
      } else {
        top = rect.top + rect.height / 2 - contentRect.height / 2;
        left = rect.right + sideOffset;
      }
      setPosition({ top, left });
    };

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(raf);
  }, [open, side, sideOffset, triggerRef]);

  React.useEffect(() => {
    if (!open) setPosition(null);
  }, [open]);

  if (!open) return null;

  const content = (
    <div
      ref={contentRef}
      role="tooltip"
      style={
        position
          ? { position: "fixed" as const, top: position.top, left: position.left }
          : { position: "fixed" as const, top: -9999, left: -9999 }
      }
      className={cn(
        "bg-popover text-popover-foreground z-50 max-w-sm rounded-lg border border-border px-3 py-2 text-sm shadow-md",
        "animate-in fade-in-0 zoom-in-95",
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

export { Tooltip, TooltipTrigger, TooltipContent };
