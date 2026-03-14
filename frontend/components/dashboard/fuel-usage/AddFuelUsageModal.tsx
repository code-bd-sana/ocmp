"use client";

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
import { FieldConfig } from "@/components/universal-form/form.types";
import UniversalForm from "@/components/universal-form/UniversalForm";
import {
  CreateFuelUsageBody,
  DriverWithVehicles,
} from "@/lib/fuel-usage/fuel-usage.types";
import { FuelUsageAction } from "@/service/fuel-usage";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const addFuelUsageSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  date: z.string().min(1, "Date is required"), // ISO string
  adBlueUsed: z.coerce
    .number()
    .min(0, "AdBlue used must be 0 or more")
    .optional(),
  fuelUsed: z.coerce.number().min(0, "Fuel used must be 0 or more").optional(),
});

type AddFuelUsageForm = z.infer<typeof addFuelUsageSchema>;

interface AddFuelUsageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFuelUsageBody) => Promise<void> | void;
  standAloneId: string;
}

export default function AddFuelUsageModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddFuelUsageModalProps) {
  const [dataLoading, setDataLoading] = useState(false);
  const [driversWithVehicles, setDriversWithVehicles] = useState<
    DriverWithVehicles[]
  >([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  useEffect(() => {
    if (!open) return;
    // schedule state updates and the fetch after render to avoid
    // calling setState synchronously within the effect (prevents
    // cascading renders warning)
    Promise.resolve().then(() => {
      setSelectedDriverId("");
      setDataLoading(true);

      FuelUsageAction.getDriversWithVehicles(standAloneId)
        .then((res) => {
          if (res.status && res.data) {
            setDriversWithVehicles(res.data);
          } else {
            setDriversWithVehicles([]);
          }
        })
        .catch(() => setDriversWithVehicles([]))
        .finally(() => setDataLoading(false));
    });
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

  const fields: FieldConfig<AddFuelUsageForm>[] = [
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
      name: "date",
      label: "Date",
      type: "date",
      placeholder: "Select date",
      required: true,
    },
    {
      name: "adBlueUsed",
      label: "AdBlue Used (L)",
      type: "number",
      placeholder: "Enter AdBlue used in liters",
      required: false,
    },
    {
      name: "fuelUsed",
      label: "Fuel Used (L)",
      type: "number",
      placeholder: "Enter fuel used in liters",
      required: false,
    },
  ];

  const handleSubmit = async (data: AddFuelUsageForm) => {
    if (!selectedDriverId) return;
    const payload: CreateFuelUsageBody = {
      ...data,
      driverId: selectedDriverId,
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogTitle>Add Fuel Usage</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new fuel usage entry for a vehicle.
        </DialogDescription>

        {dataLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin" />
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
              <UniversalForm<AddFuelUsageForm>
                key={selectedDriverId}
                title="Fuel Usage Details"
                fields={fields}
                schema={addFuelUsageSchema}
                defaultValues={{
                  vehicleId: "",
                  date: "",
                  adBlueUsed: undefined,
                  fuelUsed: undefined,
                }}
                onSubmit={handleSubmit}
                submitText="Create Fuel Usage"
                setOpen={onOpenChange}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
