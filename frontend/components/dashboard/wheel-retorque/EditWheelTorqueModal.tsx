"use client";
import { FieldConfig } from "@/components/universal-form/form.types";
import {
  UpdateWheelReTorqueInput,
  WheelReTorqueRow,
} from "@/lib/wheel-retorque/wheel-retorque.types";
import { VehicleAction } from "@/service/vehicle";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import z from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";

// vehicleId: mongoose.Types.ObjectId;
// dateChanged?: Date;
// tyreSize?: string;
// tyreLocation?: string;
// reTorqueDue?: Date;
// reTorqueCompleted?: Date;
// technician?: string;
// standAloneId?: mongoose.Types.ObjectId;
// createdBy: mongoose.Types.ObjectId;

const editWheelTorqueSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  dateChanged: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Please enter a valid date",
    })
    .optional(),
  tyreSize: z.string().trim().optional(),
  tyreLocation: z.string().trim().optional(),
  reTorqueDue: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Please enter a valid date",
    })
    .optional(),
  reTorqueCompleted: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Please enter a valid date",
    })
    .optional(),
  technician: z.string().trim().optional(),
});

type EditWheelTorqueForm = z.infer<typeof editWheelTorqueSchema>;

/** Format a date string/Date to YYYY-MM-DD for form defaults */
function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditWheelTorqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateWheelReTorqueInput) => Promise<void> | void;
  wheelRetorque: WheelReTorqueRow | null;
  standAloneId: string;
  loading: boolean;
}

export default function EditWheelTorqueModal({
  open,
  onOpenChange,
  onSubmit,
  wheelRetorque,
  standAloneId,
  loading,
}: EditWheelTorqueModalProps) {
  const [vehicleOptions, setVehicleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  // Fetch vehicles when modal opens
  useEffect(() => {
    let isActive = true;
    if (!open) return;
    const fetchVehicles = async () => {
      setVehiclesLoading(true);
      try {
        const res = await VehicleAction.getVehicles(standAloneId, {
          showPerPage: 100,
        });
        if (isActive && res.status && res.data?.vehicles) {
          setVehicleOptions(
            res.data.vehicles.map((v) => ({
              label: `${v.vehicleRegId} — ${v.licensePlate}`,
              value: v._id,
            })),
          );
        }
      } catch {
        // handle error if needed
      } finally {
        if (isActive) setVehiclesLoading(false);
      }
    };
    fetchVehicles();
    return () => {
      isActive = false;
    };
  }, [open, standAloneId]);

  const fields: FieldConfig<EditWheelTorqueForm>[] = [
    {
      name: "vehicleId",
      label: "Vehicle",
      type: "select",
      options: vehicleOptions,
      required: true,
    },
    {
      name: "dateChanged",
      label: "Date Changed",
      type: "date",
    },
    {
      name: "tyreSize",
      label: "Tyre Size",
      type: "text",
    },
    {
      name: "tyreLocation",
      label: "Tyre Location",
      type: "text",
    },
    {
      name: "reTorqueDue",
      label: "Re-Torque Due",
      type: "date",
    },
    {
      name: "reTorqueCompleted",
      label: "Re-Torque Completed",
      type: "date",
    },
    {
      name: "technician",
      label: "Technician",
      type: "text",
    },
  ];

  const handleSubmit = async (data: EditWheelTorqueForm) => {
    const payload: UpdateWheelReTorqueInput = {
      ...data,
      dateChanged: data.dateChanged
        ? new Date(data.dateChanged).toISOString()
        : undefined,
      reTorqueDue: data.reTorqueDue
        ? new Date(data.reTorqueDue).toISOString()
        : undefined,
      reTorqueCompleted: data.reTorqueCompleted
        ? new Date(data.reTorqueCompleted).toISOString()
        : undefined,
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
          Edit Wheel Torque
        </DialogTitle>

        {loading || vehiclesLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : wheelRetorque ? (
          <UniversalForm<EditWheelTorqueForm>
            title="Wheel Torque Policy Details"
            fields={fields}
            schema={editWheelTorqueSchema}
            defaultValues={{
              vehicleId: wheelRetorque?.vehicleId || "",
              dateChanged: toDateInput(wheelRetorque?.dateChanged),
              tyreSize: wheelRetorque?.tyreSize || "",
              tyreLocation: wheelRetorque?.tyreLocation || "",
              reTorqueDue: toDateInput(wheelRetorque?.reTorqueDue),
              reTorqueCompleted: toDateInput(wheelRetorque?.reTorqueCompleted),
            }}
            onSubmit={handleSubmit}
            submitText="Update Wheel Torque"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No wheel torque data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
