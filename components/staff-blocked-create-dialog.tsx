"use client";

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StaffBlockedCreateDialog({ open, onOpenChange }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permission required</AlertDialogTitle>
          <AlertDialogDescription>{STAFF_CREATE_BLOCKED_MESSAGE}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction type="button" onClick={() => onOpenChange(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
