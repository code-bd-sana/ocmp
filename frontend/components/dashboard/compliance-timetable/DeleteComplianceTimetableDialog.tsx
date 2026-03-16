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

interface DeleteComplianceTimetableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: string;
  onConfirm: () => Promise<void> | void;
  loading: boolean;
}

export default function DeleteComplianceTimetableDialog({
  open,
  onOpenChange,
  task,
  onConfirm,
  loading,
}: DeleteComplianceTimetableDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Compliance Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this compliance task
            {task && (
              <>
                : <span className="font-semibold">{task}</span>
              </>
            )}
            ? This action cannot be undone.
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
                Deleting...
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
