"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useStaffActionGuard } from "@/hooks/use-staff-action-guard";

type Props = {
  href: string;
  children: React.ReactNode;
} & Omit<ComponentProps<typeof Button>, "asChild" | "onClick" | "type">;

export function GuardedCreateButton({ href, children, disabled, ...buttonProps }: Props) {
  const router = useRouter();
  const { guardAction, blockedDialog, sessionLoading } = useStaffActionGuard();

  return (
    <>
      <Button
        type="button"
        {...buttonProps}
        disabled={disabled ?? sessionLoading}
        onClick={() => guardAction(() => router.push(href))}
      >
        {children}
      </Button>
      {blockedDialog}
    </>
  );
}
