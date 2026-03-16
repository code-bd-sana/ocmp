"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ComplianceTimetableRow } from "@/lib/compliance-timetable/compliance-timetable.types";

interface ViewComplianceTimetableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complianceTimetable: ComplianceTimetableRow | null;
  loading: boolean;
}

function formatDate(value?: string | Date): string {
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
      <span className="text-foreground text-sm">{value || "-"}</span>
    </div>
  );
}

function formatStatus(value?: string): string {
  if (!value) return "PENDING";
  return value.replace(/_/g, " ");
}

export default function ViewComplianceTimetableModal({
  open,
  onOpenChange,
  complianceTimetable,
  loading,
}: ViewComplianceTimetableModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="text-primary text-xl font-bold">
          Compliance Timetable Details
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : complianceTimetable ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem label="Task" value={complianceTimetable.task} />
            <DetailItem
              label="Responsible Party"
              value={complianceTimetable.responsibleParty || "-"}
            />
            <DetailItem
              label="Due Date"
              value={formatDate(complianceTimetable.dueDate)}
            />
            <DetailItem
              label="Status"
              value={formatStatus(complianceTimetable.status)}
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No compliance timetable data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
