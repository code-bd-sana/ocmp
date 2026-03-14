"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteWorkingTimeDirectiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverName: string;
  vehicleRegId: string;
  onConfirm: () => Promise<void> | void;
  loading: boolean;
}

export default function DeleteWorkingTimeDirectiveDialog({
  open,
  onOpenChange,
  driverName,
  vehicleRegId,
  onConfirm,
  loading,
}: DeleteWorkingTimeDirectiveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Working Time Directive</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the directive for driver{" "}
            <span className="font-semibold">{driverName}</span> / vehicle{" "}
            <span className="font-semibold">{vehicleRegId}</span>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              await onConfirm();
            }}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
