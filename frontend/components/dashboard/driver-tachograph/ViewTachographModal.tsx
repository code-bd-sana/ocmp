"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { TachoGraphTableRow } from "./TachoGraphTable";

interface ViewTachographModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: TachoGraphTableRow | null;
  loading: boolean;
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

export default function ViewTachographModal({
  open,
  onOpenChange,
  vehicle,
  loading,
}: ViewTachographModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="text-primary text-xl font-bold">
          Tachograph Details
        </DialogTitle>
        <DialogDescription className="sr-only">
          View tachograph details for the selected record.
        </DialogDescription>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : vehicle ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem label="Driver" value={vehicle.driverName} />
            <DetailItem label="Vehicle" value={vehicle.vehicleRegId} />
            <DetailItem
              label="Type of Infringement"
              value={vehicle.typeOfInfringement}
            />
            <DetailItem label="Details" value={vehicle.details} />
            <DetailItem label="Action Taken" value={vehicle.actionTaken} />
            <DetailItem
              label="Reviewed By"
              value={vehicle.reviewedByName}
            />
            <DetailItem label="Signed" value={vehicle.signed ? "Yes" : "No"} />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No tachograph data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
