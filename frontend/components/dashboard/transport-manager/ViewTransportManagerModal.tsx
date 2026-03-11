"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
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
            <DetailItem
              label="Attachment IDs"
              value={
                training.attachments?.length
                  ? training.attachments.join(", ")
                  : "—"
              }
            />
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
