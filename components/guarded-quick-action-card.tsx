"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { useStaffActionGuard } from "@/hooks/use-staff-action-guard";

export type QuickActionCardProps = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  guardAction: (action: () => void) => void;
  sessionLoading: boolean;
};

/** Single quick-action tile; pass `guardAction` / `sessionLoading` from a parent `useStaffActionGuard()` to share one session fetch and dialog. */
export function QuickActionCard({
  href,
  label,
  description,
  icon: Icon,
  guardAction,
  sessionLoading,
}: QuickActionCardProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={sessionLoading}
      onClick={() => guardAction(() => router.push(href))}
      className="group relative flex h-full w-full flex-col justify-between rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs font-medium text-primary">
        <span>Go to action</span>
        <ArrowRight
          className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
    </button>
  );
}

/** Self-contained card with its own session check (use one shared guard on dashboards with many tiles). */
export function GuardedQuickActionCard(props: Omit<QuickActionCardProps, "guardAction" | "sessionLoading">) {
  const { guardAction, blockedDialog, sessionLoading } = useStaffActionGuard();
  return (
    <>
      <QuickActionCard {...props} guardAction={guardAction} sessionLoading={sessionLoading} />
      {blockedDialog}
    </>
  );
}
