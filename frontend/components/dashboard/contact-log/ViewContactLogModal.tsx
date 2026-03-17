"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ContactLogRow } from "@/lib/contact-log/contact-log.types";
import { Loader2 } from "lucide-react";

interface ViewContactLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactLog: ContactLogRow | null;
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

export default function ViewContactLogModal({
  open,
  onOpenChange,
  contactLog,
  loading,
}: ViewContactLogModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="text-primary text-xl font-bold">
          Contact Log Details
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : contactLog ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem label="Date" value={formatDate(contactLog.date)} />
            <DetailItem
              label="Contact Method"
              value={contactLog.contactMethod || "-"}
            />
            <DetailItem label="Person" value={contactLog.person} />
            <DetailItem label="Subject" value={contactLog.subject} />
            <DetailItem label="Outcome" value={contactLog.outcome || "-"} />
            <DetailItem
              label="Follow-Up Required"
              value={contactLog.followUpRequired ? "Yes" : "No"}
            />
            <DetailItem
              label="Follow-Up Date"
              value={formatDate(contactLog.followUpDate)}
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No contact-log data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
