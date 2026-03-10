"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { WTDTableRow } from "./WorkingTimeDirectivesTable";

interface ViewWorkingTimeDirectiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directive: WTDTableRow | null;
  loading: boolean;
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-foreground text-sm">{value || "—"}</span>
    </div>
  );
}

export default function ViewWorkingTimeDirectiveModal({
  open,
  onOpenChange,
  directive,
  loading,
}: ViewWorkingTimeDirectiveModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="text-primary text-xl font-bold">
          Working Time Directive Details
        </DialogTitle>
        <DialogDescription className="sr-only">
          View working time directive details for the selected record.
        </DialogDescription>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : directive ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem label="Driver" value={directive.driverName} />
            <DetailItem label="Vehicle" value={directive.vehicleRegId} />
            <DetailItem
              label="Working Hours"
              value={String(directive.workingHours)}
            />
            <DetailItem label="Rest Hours" value={directive.restHours} />
            <DetailItem
              label="Compliance Status"
              value={
                <span
                  className={
                    directive.complianceStatus.toLowerCase() === "compliant"
                      ? "font-medium text-green-600"
                      : directive.complianceStatus.toLowerCase() ===
                            "non-compliant" ||
                          directive.complianceStatus.toLowerCase() ===
                            "violation"
                        ? "font-medium text-red-500"
                        : directive.complianceStatus.toLowerCase() === "pending"
                          ? "font-medium text-yellow-600"
                          : "font-medium"
                  }
                >
                  {directive.complianceStatus}
                </span>
              }
            />
            <DetailItem
              label="Tacho Report Available"
              value={
                <span
                  className={
                    directive.tachoReportAvailable
                      ? "font-medium text-green-600"
                      : "font-medium text-red-500"
                  }
                >
                  {directive.tachoReportAvailable ? "Yes" : "No"}
                </span>
              }
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No directive data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
