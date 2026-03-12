"use client";

import { Pg9AndPg13PlanRow } from "./Pg9AndPg13PlanTable";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VehicleAction } from "@/service/vehicle";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ViewPg9AndPg13PlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Pg9AndPg13PlanRow | null;
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
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-foreground text-sm">{value || "—"}</span>
    </div>
  );
}

export default function ViewPg9AndPg13PlanModal({
  open,
  onOpenChange,
  plan,
  loading,
  standAloneId,
}: ViewPg9AndPg13PlanModalProps) {
  const [fetchedVehicleLabel, setFetchedVehicleLabel] = useState<string | null>(
    null,
  );

  // Resolve vehicle name from vehicleId
  useEffect(() => {
    if (!open || !standAloneId || !plan?.vehicleId) return;

    let cancelled = false;

    VehicleAction.getVehicles(standAloneId, { showPerPage: 100 })
      .then((res) => {
        if (cancelled) return;
        if (res.status && res.data?.vehicles) {
          const match = res.data.vehicles.find((v) => v._id === plan.vehicleId);
          if (match) {
            setFetchedVehicleLabel(
              `${match.vehicleRegId} — ${match.licensePlate}`,
            );
          } else {
            setFetchedVehicleLabel(plan.vehicleId);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setFetchedVehicleLabel(plan.vehicleId);
      });

    return () => {
      cancelled = true;
    };
  }, [open, standAloneId, plan?.vehicleId]);

  const vehicleLabel = !open
    ? "—"
    : (fetchedVehicleLabel ?? plan?.vehicleId ?? "—");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Pg9 And Pg13 Plan Details</DialogTitle>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : plan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Vehicle" value={vehicleLabel} />
              <DetailItem label="Issue Type" value={plan.issueType} />
              <DetailItem
                label="Defect Description"
                value={plan.defectDescription}
              />
              <DetailItem
                label="Clearance Status"
                value={plan.clearanceStatus}
              />
              <DetailItem
                label="TC Contact Made"
                value={plan.tcContactMade ? "Yes" : "No"}
              />
              <DetailItem
                label="Maintenance Provider"
                value={plan.maintenanceProvider}
              />
              <DetailItem
                label="Meeting Date"
                value={formatDate(plan.meetingDate)}
              />
              <DetailItem label="Notes" value={plan.notes} />
              <DetailItem
                label="Follow Up Needed"
                value={plan.followUp ? "Yes" : "No"}
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
