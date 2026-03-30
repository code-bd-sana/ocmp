"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { TrainingDetail } from "@/lib/training/training.types";

interface ViewHelperTrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: TrainingDetail | null;
  loading: boolean;
}

export default function ViewHelperTrainingModal({
  open,
  onOpenChange,
  training,
  loading,
}: ViewHelperTrainingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>View Training</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : training ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Training Name
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {training.trainingName}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Interval Days
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {training.intervalDays?.length
                  ? training.intervalDays.join(", ")
                  : "-"}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            No data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
