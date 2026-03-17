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

interface DeleteFuelUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverName?: string;
  vehicleRegId: string;
  date: string;
  onConfirm: () => Promise<void> | void;
  loading: boolean;
}

export default function DeleteFuelUsageDialog({
  open,
  onOpenChange,
  driverName,
  vehicleRegId,
  date,
  onConfirm,
  loading,
}: DeleteFuelUsageDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Fuel Usage</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the fuel usage entry for
            {driverName ? (
              <>
                {" "}
                <span className="font-semibold">{driverName}</span> (
              </>
            ) : (
              " "
            )}
            <span className="font-semibold">{vehicleRegId}</span> on{" "}
            <span className="font-semibold">{date}</span>? This action cannot be
            undone.
            {driverName ? <span>{")"}</span> : null}
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
            className="bg-destructive hover:bg-destructive/90 text-white"
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
