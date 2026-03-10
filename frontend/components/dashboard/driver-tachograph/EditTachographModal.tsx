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
  UpdateDriverTachographInput,
} from "@/lib/driver-tachograph/tachograph.types";
import { TachoGraphTableRow } from "./TachoGraphTable";
import { DriverTachographAction } from "@/service/driver-tachograph";

const editTachographSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  typeOfInfringement: z.string().optional(),
  details: z.string().optional(),
  actionTaken: z.string().optional(),
  signed: z.coerce.boolean().optional(),
});

type EditTachographForm = z.infer<typeof editTachographSchema>;

interface EditTachographModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateDriverTachographInput) => Promise<void> | void;
  vehicle: TachoGraphTableRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditTachographModal({
  open,
  onOpenChange,
  onSubmit,
  vehicle,
  loading,
  standAloneId,
}: EditTachographModalProps) {
  const [dataLoading, setDataLoading] = useState(false);
  const [driversWithVehicles, setDriversWithVehicles] = useState<
    DriverWithVehicles[]
  >([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  // Fetch drivers with vehicles when modal opens
  useEffect(() => {
    if (!open) return;
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

  // Pre-fill selected driver from existing tachograph
  useEffect(() => {
    if (open && vehicle?.driverId) {
      setSelectedDriverId(vehicle.driverId);
    }
  }, [open, vehicle]);

  const vehicleOptions = useMemo(() => {
    if (!selectedDriverId) return [];
    const driver = driversWithVehicles.find((d) => d._id === selectedDriverId);
    if (!driver) return [];
    return driver.vehicles.map((v) => ({
      label: `${v.vehicleRegId} — ${v.licensePlate}`,
      value: v._id,
    }));
  }, [selectedDriverId, driversWithVehicles]);

  const fields: FieldConfig<EditTachographForm>[] = [
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
    },
    {
      name: "details",
      label: "Details",
      type: "textarea",
    },
    {
      name: "actionTaken",
      label: "Action Taken",
      type: "textarea",
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

  const handleSubmit = async (data: EditTachographForm) => {
    if (!selectedDriverId) return;
    const payload: UpdateDriverTachographInput = {
      id: vehicle?.id,
      driverId: selectedDriverId,
      vehicleId: data.vehicleId,
      typeOfInfringement: data.typeOfInfringement,
      details: data.details,
      actionTaken: data.actionTaken,
      signed: data.signed,
    };
    await onSubmit(payload);
  };

  if (loading || !vehicle) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle className="sr-only">Edit Tachograph</DialogTitle>
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
          Edit Tachograph
        </DialogTitle>
        <DialogDescription className="sr-only">
          Update tachograph details. Select a driver first, then choose a
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
              </div>
            </div>

            {selectedDriverId && (
              <UniversalForm<EditTachographForm>
                key={selectedDriverId}
                title="Tachograph Details"
                fields={fields}
                schema={editTachographSchema}
                defaultValues={{
                  vehicleId: vehicle.vehicleId || "",
                  typeOfInfringement: vehicle.typeOfInfringement || "",
                  details: vehicle.details || "",
                  actionTaken: vehicle.actionTaken || "",
                  signed: vehicle.signed || false,
                }}
                onSubmit={handleSubmit}
                submitText="Update Tachograph"
                setOpen={onOpenChange}
              />
            )}
            <p className="text-muted-foreground px-6 pb-2 text-xs">
              Reviewed by is set automatically to the currently logged-in user
              on update.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
