"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VehicleAction } from "@/service/vehicle";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { WheelRetorqueRow } from "./WheelRetorqueTable";

interface ViewWheelRetorqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wheelRetorque: WheelRetorqueRow | null;
  loading: boolean;
  standAloneId: string;
}

function formatDate(value?: string | Date): string {
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
      <label className="text-muted-foreground text-sm font-medium">
        {label}
      </label>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

export default function ViewWheelRetorqueModal({
  open,
  onOpenChange,
  wheelRetorque,
  loading,
  standAloneId,
}: ViewWheelRetorqueModalProps) {
  const [fetchedVehicleLabel, setFetchedVehicleLabel] = useState<string | null>(
    null,
  );

  // Resolve vehicle name from vehicleId
  useEffect(() => {
    if (!open || !standAloneId || !wheelRetorque?.vehicleId) return;

    let cancelled = false;

    VehicleAction.getVehicles(standAloneId, { showPerPage: 100 })
      .then((res) => {
        if (cancelled) return;
        if (res.status && res.data?.vehicles) {
          const match = res.data.vehicles.find(
            (v) => v._id === wheelRetorque.vehicleId,
          );
          if (match) {
            setFetchedVehicleLabel(
              `${match.vehicleRegId} — ${match.licensePlate}`,
            );
          } else {
            setFetchedVehicleLabel(wheelRetorque.vehicleId);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setFetchedVehicleLabel(wheelRetorque.vehicleId);
      });

    return () => {
      cancelled = true;
    };
  }, [open, standAloneId, wheelRetorque?.vehicleId]);

  const vehicleLabel = !open
    ? "—"
    : (fetchedVehicleLabel ?? wheelRetorque?.vehicleId ?? "—");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Wheel Retorque Policy Details</DialogTitle>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : wheelRetorque ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Vehicle" value={vehicleLabel} />
              <DetailItem
                label="Date Changed"
                value={formatDate(wheelRetorque.dateChanged)}
              />
              <DetailItem
                label="Tyre Size"
                value={wheelRetorque.tyreSize || "—"}
              />
              <DetailItem
                label="Tyre Location"
                value={wheelRetorque.tyreLocation || "—"}
              />
              <DetailItem
                label="Re-Torque Due"
                value={formatDate(wheelRetorque.reTorqueDue)}
              />
              <DetailItem
                label="Re-Torque Completed"
                value={formatDate(wheelRetorque.reTorqueCompleted)}
              />
              <DetailItem
                label="Technician"
                value={wheelRetorque.technician || "—"}
              />
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
