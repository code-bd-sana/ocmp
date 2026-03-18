"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OcrsPlanRow } from "@/lib/ocrs-plan/ocrs-plan.types";
import { Download, FileText, Loader2 } from "lucide-react";

interface ViewOcrsPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ocrsPlan: OcrsPlanRow | null;
  loading: boolean;
}

function formatDate(value?: string): string {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
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
                  {ocrsPlan.roadWorthinessScore || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Overall Traffic Score
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {ocrsPlan.overallTrafficScore || "-"}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Action Required
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {ocrsPlan.actionRequired || "-"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Attachments
              </label>

              {ocrsPlan.attachments?.length ? (
                <div className="mt-2 space-y-2">
                  {ocrsPlan.attachments.map((attachment) => (
                    <a
                      key={attachment._id}
                      href={attachment.downloadUrl || attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:border-primary/40 flex items-center justify-between gap-3 rounded-md border p-3 transition"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {attachment.originalName || attachment.filename}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {attachment.mimeType || "Unknown type"} •{" "}
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>

                      <Download className="text-muted-foreground h-4 w-4 shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-900">-</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Created At
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(ocrsPlan.createdAt)}
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
