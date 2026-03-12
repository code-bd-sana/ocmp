// import mongoose, { Document, Schema } from "mongoose";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreatePg9AndPg13PlanInput } from "@/lib/pg9AndPg13Plan/pg9AndPg13Plan.types";
import { VehicleAction } from "@/service/vehicle";
import { useEffect, useState } from "react";
import z from "zod";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Loader2 } from "lucide-react";
import UniversalForm from "@/components/universal-form/UniversalForm";

// export enum PG9AndPG13IssueType {
//   PG9 = "PG9",
//   DV79D = "DV79D",
// }

// // Define and export an interface representing a pg9AndPg13Plan document
// export interface Ipg9AndPg13Plan extends Document {
//   vehicleId: mongoose.Types.ObjectId;
//   issueType: PG9AndPG13IssueType;
//   defectDescription?: string;
//   clearanceStatus?: string;
//   tcContactMade?: boolean;
//   maintenanceProvider?: string;
//   meetingDate?: Date;
//   notes?: string;
//   followUp?: boolean;
//   standAloneId?: mongoose.Types.ObjectId;
//   createdBy: mongoose.Types.ObjectId;
// }

// // Define the pg9AndPg13Plan schema
// const pg9AndPg13PlanSchema: Schema<Ipg9AndPg13Plan> = new Schema(
//   {
//     vehicleId: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: "Vehicle", // Reference from Vehicle model
//     },
//     issueType: {
//       type: String,
//       enum: Object.values(PG9AndPG13IssueType),
//       required: true,
//     },
//     defectDescription: {
//       type: String,
//     },
//     clearanceStatus: {
//       type: String,
//     },
//     tcContactMade: {
//       type: Boolean,
//     },
//     maintenanceProvider: {
//       type: String,
//     },
//     meetingDate: {
//       type: Date,
//     },
//     notes: {
//       type: String,
//     },
//     followUp: {
//       type: Boolean,
//     },
//     standAloneId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: "User", // Reference from User model
//     },
//   },
//   { timestamps: true, versionKey: false },
// );

// // Create the pg9AndPg13Plan model
// const pg9AndPg13Plan = mongoose.model<Ipg9AndPg13Plan>(
//   "pg9AndPg13Plan",
//   pg9AndPg13PlanSchema,
// );

// // Export the pg9AndPg13Plan model
// export default pg9AndPg13Plan;

export enum PG9AndPG13IssueType {
  PG9 = "PG9",
  DV79D = "DV79D",
}

const addPg9AndPg13Plan = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  issueType: z.enum([PG9AndPG13IssueType.PG9, PG9AndPG13IssueType.DV79D], {
    message: "Please select a valid issue type",
  }),
  defectDescription: z.string().trim().optional(),
  clearanceStatus: z.string().trim().optional(),
  tcContactMade: z.boolean().optional(),
  maintenanceProvider: z.string().trim().optional(),
  meetingDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Please enter a valid date",
    })
    .optional(),
  notes: z.string().trim().optional(),
  followUp: z.boolean().optional(),
});

type AddPg9AndPg13PlanForm = z.infer<typeof addPg9AndPg13Plan>;

interface AddPg9AndPg13PlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePg9AndPg13PlanInput) => Promise<void> | void;
  standAloneId: string;
}

export default function AddPg9AndPg13PlanModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddPg9AndPg13PlanModalProps) {
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

  const fields: FieldConfig<AddPg9AndPg13PlanForm>[] = [
    {
      name: "vehicleId",
      label: "Vehicle",
      type: "select",
      options: vehicleOptions,
      required: true,
    },
    {
      name: "issueType",
      label: "Issue Type",
      type: "select",
      options: Object.values(PG9AndPG13IssueType).map((value) => ({
        label: value,
        value,
      })),
      required: true,
    },
    {
      name: "defectDescription",
      label: "Defect Description",
      type: "textarea",
    },
    {
      name: "clearanceStatus",
      label: "Clearance Status",
      type: "text",
    },
    {
      name: "tcContactMade",
      label: "TC Contact Made",
      type: "switch",
    },
    {
      name: "maintenanceProvider",
      label: "Maintenance Provider",
      type: "text",
    },
    {
      name: "meetingDate",
      label: "Meeting Date",
      type: "date",
    },
    {
      name: "notes",
      label: "Notes",

      type: "textarea",
    },
    {
      name: "followUp",
      label: "Follow Up Needed",
      type: "switch",
    },
  ];

  const handleSubmit = async (data: AddPg9AndPg13PlanForm) => {
    const payload: CreatePg9AndPg13PlanInput = {
      ...data,
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
        <DialogTitle className="text-primary mb-4 text-xl font-bold">
          Add Pg9 and Pg13 Plan
        </DialogTitle>
        {vehiclesLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : (
          <UniversalForm<AddPg9AndPg13PlanForm>
            title="Pg9 and Pg13 Plan Details"
            fields={fields}
            schema={addPg9AndPg13Plan}
            defaultValues={{
              vehicleId: "",
              issueType: PG9AndPG13IssueType.PG9,
              defectDescription: "",
              clearanceStatus: "",
              tcContactMade: false,
              maintenanceProvider: "",
              meetingDate: "",
              notes: "",
              followUp: false,
            }}
            onSubmit={handleSubmit}
            submitText="Create Pg9 and Pg13 Plan"
            setOpen={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
