"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SpotCheckRow } from "@/lib/spot-checks/spot-check.types";
import { Download, FileText, Loader2 } from "lucide-react";
import { VehicleAction } from "@/service/vehicle";

interface ViewSpotCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spotCheck: SpotCheckRow | null;
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

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
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

export default function ViewSpotCheckModal({
  open,
  onOpenChange,
  spotCheck,
  loading,
  standAloneId,
}: ViewSpotCheckModalProps) {
  const [vehicleLabel, setVehicleLabel] = useState<string>("—");

  // Resolve vehicle name from vehicleId
  useEffect(() => {
    if (!open || !standAloneId || !spotCheck?.vehicleId) {
      setVehicleLabel("—");
      return;
    }
    VehicleAction.getVehicles(standAloneId, { showPerPage: 100 })
      .then((res) => {
        if (res.status && res.data?.vehicles) {
          const match = res.data.vehicles.find(
            (v) => v._id === spotCheck.vehicleId,
          );
          if (match) {
            setVehicleLabel(`${match.vehicleRegId} — ${match.licensePlate}`);
          } else {
            setVehicleLabel(spotCheck.vehicleId);
          }
        }
      })
      .catch(() => {
        setVehicleLabel(spotCheck.vehicleId);
      });
  }, [open, standAloneId, spotCheck?.vehicleId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="text-primary text-xl font-bold">
          Spot Check Details
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : spotCheck ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem label="Vehicle" value={vehicleLabel} />
            <DetailItem label="Issue Details" value={spotCheck.issueDetails} />
            <DetailItem
              label="Rectification Required"
              value={formatDate(spotCheck.rectificationRequired)}
            />
            <DetailItem
              label="Action Taken"
              value={spotCheck.actionTaken || "—"}
            />
            <DetailItem
              label="Date Completed"
              value={formatDate(spotCheck.dateCompleted)}
            />
            <DetailItem
              label="Completed By"
              value={spotCheck.completedBy || "—"}
            />
            <DetailItem
              label="Follow-Up Needed"
              value={spotCheck.followUpNeeded || "—"}
            />
            <DetailItem label="Notes" value={spotCheck.notes || "—"} />

            <div className="sm:col-span-2">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Attachments
              </span>

              {spotCheck.attachments?.length ? (
                <div className="mt-2 space-y-2">
                  {spotCheck.attachments.map((attachment) => (
                    <a
                      key={attachment._id}
                      href={attachment.downloadUrl || attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:border-primary/40 flex items-center justify-between gap-3 rounded-md border p-3 transition"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {attachment.originalName || attachment.filename}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {attachment.mimeType || "Unknown type"} •{" "}
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>

                      <Download className="text-muted-foreground h-4 w-4 shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-foreground mt-1 text-sm">—</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No spot check data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
