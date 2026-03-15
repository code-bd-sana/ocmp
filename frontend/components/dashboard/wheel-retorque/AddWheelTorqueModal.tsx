//   vehicleId: mongoose.Types.ObjectId;
//   dateChanged?: Date;
//   tyreSize?: string;
//   tyreLocation?: string;
//   reTorqueDue?: Date;
//   reTorqueCompleted?: Date;
//   technician?: string;
//   standAloneId?: mongoose.Types.ObjectId;
//   createdBy: mongoose.Types.ObjectId;

"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FieldConfig } from "@/components/universal-form/form.types";
import UniversalForm from "@/components/universal-form/UniversalForm";

import { CreateWheelReTorqueInput } from "@/lib/wheel-retorque/wheel-retorque";
import { VehicleAction } from "@/service/vehicle";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import z from "zod";

const addWheelTorque = z.object({
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

type AddWheelTorqueForm = z.infer<typeof addWheelTorque>;

interface AddWheelTorqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWheelReTorqueInput) => Promise<void> | void;
  standAloneId: string;
}

export default function AddWheelTorqueModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddWheelTorqueModalProps) {
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
  
    const fields: FieldConfig<AddWheelTorqueForm>[] = [
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
        placeholder: "Select date changed",
      },
      {
        name: "tyreSize",
        label: "Tyre Size",
        type: "text",
        placeholder: "Enter tyre size",
      },
      {
        name: "tyreLocation",
        label: "Tyre Location",
        type: "text",
        placeholder: "Enter tyre location",
      },
      {
        name: "reTorqueDue",
        label: "Re-Torque Due",
        type: "date",
        placeholder: "Select re-torque due date",
      },
      {
        name: "reTorqueCompleted",
        label: "Re-Torque Completed",
        type: "date",
        placeholder: "Select re-torque completed date",
      },
      {
        name: "technician",
        label: "Technician",
        type: "text",
        placeholder: "Enter technician name",
      },
    ]

    const handleSubmit = async (data: AddWheelTorqueForm) => {
      const payload : CreateWheelReTorqueInput = {
        ...data, 
        standAloneId,
      }
      await onSubmit(payload);
    }
     
return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogTitle className="text-primary mb-4 text-xl font-bold">
          Add Wheel Torque
        </DialogTitle>
        {vehiclesLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : (
          <UniversalForm<AddWheelTorqueForm>
            title="Wheel Torque Details"
            fields={fields}
            schema={addWheelTorque}
            defaultValues={{
              vehicleId: "",
              dateChanged: "",
              tyreSize: "",
              tyreLocation: "",
              reTorqueDue: "",
              reTorqueCompleted: "",
              technician: "",
            }}
            onSubmit={handleSubmit}
            submitText="Create Wheel Torque"
            setOpen={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}