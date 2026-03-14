"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OcrsPlanTableRow } from "./OcrsPlanTable";
import { Loader2 } from "lucide-react";

interface ViewOcrsPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ocrsPlan: OcrsPlanTableRow | null;
  loading: boolean;
}

export default function ViewOcrsPlanModal({
  open,
  onOpenChange,
  ocrsPlan,
  loading,
}: ViewOcrsPlanModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>View OCRS Plan</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : ocrsPlan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Road Worthiness Score
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {ocrsPlan.roadWorthinessScore}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Overall Traffic Score
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {ocrsPlan.overallTrafficScore}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Action Required
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {ocrsPlan.actionRequired}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Documents
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {ocrsPlan.documentsCount}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Created At
              </label>
              <p className="mt-1 text-sm text-gray-900">{ocrsPlan.createdAt}</p>
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
