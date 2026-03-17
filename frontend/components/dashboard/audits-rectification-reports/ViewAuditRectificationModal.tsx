"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { AuditRectificationReportRow } from "@/lib/audits-rectification-reports/audits-rectification-reports.types";

interface ViewAuditRectificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: AuditRectificationReportRow | null;
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

export default function ViewAuditRectificationModal({
  open,
  onOpenChange,
  report,
  loading,
}: ViewAuditRectificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="text-primary text-xl font-bold">
          Audit & Rectification Report Details
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : report ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem
              label="Audit Date"
              value={formatDate(report.auditDate)}
            />
            <DetailItem label="Title" value={report.title} />
            <DetailItem label="Type" value={report.type} />
            <DetailItem label="Status" value={report.status || "Pending"} />
            <DetailItem
              label="Responsible Person"
              value={report.responsiblePerson || "-"}
            />
            <DetailItem
              label="Finalize Date"
              value={formatDate(report.finalizeDate)}
            />
            <DetailItem
              label="Audit Details"
              value={report.auditDetails || "-"}
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No report data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
