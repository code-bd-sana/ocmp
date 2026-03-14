"use client";

import { FieldConfig } from "@/components/universal-form/form.types";
import UniversalForm from "@/components/universal-form/UniversalForm";
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
import {
  CreateWorkingTimeDirectiveInput,
  DriverWithVehicles,
} from "@/lib/working-time-directives/working-time-directive.types";
import { WorkingTimeDirectiveAction } from "@/service/working-time-directive";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const addWTDSchema = z.object({
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

type AddWTDForm = z.infer<typeof addWTDSchema>;

interface AddWorkingTimeDirectiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWorkingTimeDirectiveInput) => Promise<void> | void;
  standAloneId: string;
}

export default function AddWorkingTimeDirectiveModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddWorkingTimeDirectiveModalProps) {
  const [dataLoading, setDataLoading] = useState(false);
  const [driversWithVehicles, setDriversWithVehicles] = useState<
    DriverWithVehicles[]
  >([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedDriverId("");
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

  const vehicleOptions = useMemo(() => {
    if (!selectedDriverId) return [];
    const driver = driversWithVehicles.find((d) => d._id === selectedDriverId);
    if (!driver) return [];
    return driver.vehicles.map((v) => ({
      label: `${v.vehicleRegId} — ${v.licensePlate}`,
      value: v._id,
    }));
  }, [selectedDriverId, driversWithVehicles]);

  const fields: FieldConfig<AddWTDForm>[] = [
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

  const handleSubmit = async (data: AddWTDForm) => {
    if (!selectedDriverId) return;
    const payload: CreateWorkingTimeDirectiveInput = {
      driverId: selectedDriverId,
      vehicleId: data.vehicleId,
      workingHours: data.workingHours,
      standAloneId,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogTitle className="text-primary mb-4 text-xl font-bold">
          Add Working Time Directive
        </DialogTitle>
        <DialogDescription className="sr-only">
          Create a new working time directive by selecting a driver first, then
          a vehicle assigned to that driver.
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
                {!selectedDriverId && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Select a driver to see their assigned vehicles
                  </p>
                )}
              </div>
            </div>

            {selectedDriverId && (
              <UniversalForm<AddWTDForm>
                key={selectedDriverId}
                title="Directive Details"
                fields={fields}
                schema={addWTDSchema}
                defaultValues={{
                  vehicleId: "",
                  workingHours: 0,
                  restHours: undefined,
                  complianceStatus: "",
                  tachoReportAvailable: false,
                }}
                onSubmit={handleSubmit}
                submitText="Create Directive"
                setOpen={onOpenChange}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
