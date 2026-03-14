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
  CreateDriverTachographInput,
  DriverWithVehicles,
} from "@/lib/driver-tachograph/tachograph.types";
import { DriverTachographAction } from "@/service/driver-tachograph";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const addTachographSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  typeOfInfringement: z.string().optional(),
  details: z.string().optional(),
  actionTaken: z.string().optional(),
  signed: z.coerce.boolean().optional(),
});

type AddTachographForm = z.infer<typeof addTachographSchema>;

interface AddTachographModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDriverTachographInput) => Promise<void> | void;
  standAloneId: string;
}

export const AddTachographModal = ({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddTachographModalProps) => {
  const [dataLoading, setDataLoading] = useState(false);
  const [driversWithVehicles, setDriversWithVehicles] = useState<
    DriverWithVehicles[]
  >([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedDriverId("");
    setDataLoading(true);
    DriverTachographAction.getDriversWithVehicles(standAloneId)
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

  const fields: FieldConfig<AddTachographForm>[] = [
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
      name: "typeOfInfringement",
      label: "Type of Infringement",
      type: "text",
      placeholder: "Enter infringement type",
    },
    {
      name: "details",
      label: "Details",
      type: "textarea",
      placeholder: "Enter details (optional)",
    },
    {
      name: "actionTaken",
      label: "Action Taken",
      type: "textarea",
      placeholder: "Enter action taken (optional)",
    },
    {
      name: "signed",
      label: "Signed",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  ];

  const handleSubmit = async (data: AddTachographForm) => {
    if (!selectedDriverId) return;
    const payload: CreateDriverTachographInput = {
      driverId: selectedDriverId,
      vehicleId: data.vehicleId,
      typeOfInfringement: data.typeOfInfringement,
      details: data.details,
      actionTaken: data.actionTaken,
      signed: data.signed ?? false,
      standAloneId,
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogTitle className="text-primary mb-4 text-2xl font-bold">
          Add New Tachograph
        </DialogTitle>
        <DialogDescription className="sr-only">
          Create a new tachograph record by selecting a driver first, then a
          vehicle assigned to that driver.
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
              <UniversalForm<AddTachographForm>
                key={selectedDriverId}
                title="Tachograph Details"
                fields={fields}
                schema={addTachographSchema}
                defaultValues={{
                  vehicleId: "",
                  typeOfInfringement: "",
                  details: "",
                  actionTaken: "",
                  signed: false,
                }}
                onSubmit={handleSubmit}
                submitText="Create Tachograph"
                setOpen={onOpenChange}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
