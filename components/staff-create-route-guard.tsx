"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { STAFF_CREATE_BLOCKED_MESSAGE } from "@/components/staff-create-messages";
import { useSessionUser } from "@/hooks/use-session-user";

export function StaffCreateRouteGuard({
  backHref,
  children,
}: {
  backHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useSessionUser();
  const [open, setOpen] = useState(true);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (user?.role === "STAFF") {
    return (
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) router.replace(backHref);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permission required</AlertDialogTitle>
            <AlertDialogDescription>{STAFF_CREATE_BLOCKED_MESSAGE}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              type="button"
              onClick={() => {
                setOpen(false);
                router.replace(backHref);
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return <>{children}</>;
}
