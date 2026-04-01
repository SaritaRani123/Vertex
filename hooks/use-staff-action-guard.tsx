"use client";

import { useState, useCallback } from "react";
import { StaffBlockedCreateDialog } from "@/components/staff-blocked-create-dialog";
import { useSessionUser } from "@/hooks/use-session-user";

/** Blocks STAFF from running `action` and shows the permission dialog instead. */
export function useStaffActionGuard() {
  const { user, loading } = useSessionUser();
  const [blockedOpen, setBlockedOpen] = useState(false);

  const guardAction = useCallback(
    (action: () => void) => {
      if (loading) return;
      if (user?.role === "STAFF") {
        setBlockedOpen(true);
        return;
      }
      action();
    },
    [user, loading]
  );

  const blockedDialog = (
    <StaffBlockedCreateDialog open={blockedOpen} onOpenChange={setBlockedOpen} />
  );

  return { guardAction, blockedDialog, sessionLoading: loading };
}
