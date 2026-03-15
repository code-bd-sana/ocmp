"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { MaintenanceProviderCommunicationRow } from "@/lib/maintenance-meeting/maintenance-meeting.types";

interface ViewMaintenanceProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MaintenanceProviderCommunicationRow | null;
  loading: boolean;
}

export default function ViewMaintenanceProviderModal({
  open,
  onOpenChange,
  item,
  loading,
}: ViewMaintenanceProviderModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogTitle>Maintenance Provider Communication Details</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : item ? (
          <div className="grid grid-cols-1 gap-3 text-sm">
            <p>
              <span className="font-medium">Provider Name:</span>{" "}
              {item.providerName}
            </p>
            <p>
              <span className="font-medium">Date of Communication:</span>{" "}
              {item.dateOfCommunication
                ? new Date(item.dateOfCommunication).toLocaleDateString()
                : "—"}
            </p>
            <p>
              <span className="font-medium">Type:</span> {item.type || "—"}
            </p>
            <p>
              <span className="font-medium">Details:</span>{" "}
              {item.details || "—"}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No data available
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
