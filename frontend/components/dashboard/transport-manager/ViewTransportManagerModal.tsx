"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Loader2 } from "lucide-react";
import { TransportManagerTrainingRow } from "@/lib/transport-manager-training/transport-manager-training.types";

interface ViewTransportManagerTrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: TransportManagerTrainingRow | null;
  loading: boolean;
}

function formatDate(value?: string): string {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
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

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-foreground text-sm">{value || "—"}</span>
    </div>
  );
}

export default function ViewTransportManagerTrainingModal({
  open,
  onOpenChange,
  training,
  loading,
}: ViewTransportManagerTrainingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="text-primary text-xl font-bold">
          Transport Manager Training Details
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : training ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem label="Name" value={training.name} />
            <DetailItem
              label="Training Course"
              value={training.trainingCourse}
            />
            <DetailItem label="Unit Title" value={training.unitTitle} />
            <DetailItem
              label="Completion Date"
              value={formatDate(training.completionDate)}
            />
            <DetailItem
              label="Renewal Tracker"
              value={training.renewalTracker}
            />
            <DetailItem
              label="Next Due Date"
              value={formatDate(training.nextDueDate)}
            />
            <div className="sm:col-span-2">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Attachments
              </span>

              {training.attachments?.length ? (
                <div className="mt-2 space-y-2">
                  {training.attachments.map((attachment) => (
                    <a
                      key={attachment._id}
                      href={attachment.downloadUrl || attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:border-primary/40 flex w-full items-center justify-between gap-3 rounded-md border p-3 transition"
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
                <p className="text-foreground mt-1 text-sm">—</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No training data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
