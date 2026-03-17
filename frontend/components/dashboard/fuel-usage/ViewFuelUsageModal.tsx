"use client";

import { FuelUsageRow } from "@/lib/fuel-usage/fuel-usage.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ViewFuelUsageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fuelUsage: FuelUsageRow | null;
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

export default function ViewFuelUsageModal({
  open,
  onOpenChange,
  fuelUsage,
  loading,
}: ViewFuelUsageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="text-primary text-xl font-bold">
          Fuel Usage Details
        </DialogTitle>
        <DialogDescription className="sr-only">
          View fuel usage details for the selected record.
        </DialogDescription>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : fuelUsage ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem label="Driver ID" value={fuelUsage.driverId} />
            <DetailItem label="Vehicle ID" value={fuelUsage.vehicleId} />
            <DetailItem
              label="Date"
              value={new Date(fuelUsage.date).toLocaleDateString()}
            />
            <DetailItem label="Fuel Used (L)" value={fuelUsage.fuelUsed} />
            <DetailItem label="AdBlue Used (L)" value={fuelUsage.adBlueUsed} />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No fuel usage data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
