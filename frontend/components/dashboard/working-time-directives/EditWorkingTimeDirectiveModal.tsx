"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  DriverWithVehicles,
  UpdateWorkingTimeDirectiveInput,
} from "@/lib/working-time-directives/working-time-directive.types";
import { WTDTableRow } from "./WorkingTimeDirectivesTable";
import { WorkingTimeDirectiveAction } from "@/service/working-time-directive";

const editWTDSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  workingHours: z.coerce
    .number()
    .min(0, "Working hours must be 0 or more"),
  restHours: z.coerce
    .number()
    .min(0, "Rest hours must be 0 or more")
    .optional()
    .or(z.literal("")),
  complianceStatus: z.string().optional(),
  tachoReportAvailable: z.coerce.boolean().optional(),
});

type EditWTDForm = z.infer<typeof editWTDSchema>;

interface EditWorkingTimeDirectiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateWorkingTimeDirectiveInput) => Promise<void> | void;
  directive: WTDTableRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditWorkingTimeDirectiveModal({
  open,
  onOpenChange,
  onSubmit,
  directive,
  loading,
  standAloneId,
}: EditWorkingTimeDirectiveModalProps) {
  const [dataLoading, setDataLoading] = useState(false);
  const [driversWithVehicles, setDriversWithVehicles] = useState<
    DriverWithVehicles[]
  >([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  // Fetch drivers with vehicles when modal opens
  useEffect(() => {
    if (!open) return;
    setDataLoading(true);
    WorkingTimeDirectiveAction.getDriversWithVehicles(standAloneId)
      .then((res) => {
        if (res.status && res.data) {
          setDriversWithVehicles(res.data);
        } else {
          setDriversWithVehicles([]);
        }
      })
      .catch(() => setDriversWithVehicles([]))
      .finally(() => setDataLoading(false));
  }, [open, standAloneId]);

  // Pre-fill selected driver from existing directive
  useEffect(() => {
    if (open && directive?.driverId) {
      setSelectedDriverId(directive.driverId);
    }
  }, [open, directive]);

  const vehicleOptions = useMemo(() => {
    if (!selectedDriverId) return [];
    const driver = driversWithVehicles.find((d) => d._id === selectedDriverId);
    if (!driver) return [];
    return driver.vehicles.map((v) => ({
      label: `${v.vehicleRegId} — ${v.licensePlate}`,
      value: v._id,
    }));
  }, [selectedDriverId, driversWithVehicles]);

  const fields: FieldConfig<EditWTDForm>[] = [
    {
      name: "vehicleId",
      label: "Vehicle",
      type: "select",
      placeholder:
        vehicleOptions.length > 0
          ? "Select vehicle"
          : "No vehicles for this driver",
      options: vehicleOptions,
      required: true,
    },
    {
      name: "workingHours",
      label: "Working Hours",
      type: "number",
      placeholder: "Enter working hours",
      required: true,
    },
    {
      name: "restHours",
      label: "Rest Hours",
      type: "number",
      placeholder: "Enter rest hours (optional)",
    },
    {
      name: "complianceStatus",
      label: "Compliance Status",
      type: "text",
      placeholder: "e.g. Compliant, Non-Compliant, Pending",
    },
    {
      name: "tachoReportAvailable",
      label: "Tacho Report Available",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  ];

  const handleSubmit = async (data: EditWTDForm) => {
    if (!selectedDriverId) return;
    const payload: UpdateWorkingTimeDirectiveInput = {
      driverId: selectedDriverId,
      vehicleId: data.vehicleId,
      workingHours: data.workingHours,
      ...(data.restHours !== undefined &&
        data.restHours !== ("" as unknown) && {
          restHours: Number(data.restHours),
        }),
      ...(data.complianceStatus && {
        complianceStatus: data.complianceStatus,
      }),
      ...(data.tachoReportAvailable !== undefined && {
        tachoReportAvailable: data.tachoReportAvailable,
      }),
    };
    await onSubmit(payload);
  };

  if (loading || !directive) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle className="sr-only">Edit Working Time Directive</DialogTitle>
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogTitle className="text-primary mb-4 text-xl font-bold">
          Edit Working Time Directive
        </DialogTitle>
        <DialogDescription className="sr-only">
          Update working time directive details. Select a driver first, then
          choose a vehicle assigned to that driver.
        </DialogDescription>

        {dataLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Driver select — outside UniversalForm */}
            <div className="bg-white px-6 pb-4 dark:bg-gray-800">
              <div className="flex flex-col">
                <label className="text-foreground mb-4 text-xl font-medium">
                  Driver <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedDriverId}
                  onValueChange={(val) => setSelectedDriverId(val)}
                >
                  <SelectTrigger className="border-input-border w-full rounded-none border">
                    <SelectValue placeholder="Select driver first" />
                  </SelectTrigger>
                  <SelectContent>
                    {driversWithVehicles.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.fullName} ({d.licenseNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedDriverId && (
              <UniversalForm<EditWTDForm>
                key={selectedDriverId}
                title="Directive Details"
                fields={fields}
                schema={editWTDSchema}
                defaultValues={{
                  vehicleId: directive.vehicleId || "",
                  workingHours: directive.workingHours ?? 0,
                  restHours:
                    directive.restHours !== "—"
                      ? Number(directive.restHours)
                      : undefined,
                  complianceStatus:
                    directive.complianceStatus !== "—"
                      ? directive.complianceStatus
                      : "",
                  tachoReportAvailable:
                    directive.tachoReportAvailable ?? false,
                }}
                onSubmit={handleSubmit}
                submitText="Update Directive"
                setOpen={onOpenChange}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
