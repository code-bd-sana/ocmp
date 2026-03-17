"use client";

import z from "zod";
import { PG9AndPG13IssueType } from "./AddPg9AndPg13PlanModal";
import {
  Pg9AndPg13PlanRow,
  UpdatePg9AndPg13PlanInput,
} from "@/lib/pg9AndPg13Plan/pg9AndPg13Plan.types";
import { useEffect, useState } from "react";
import { VehicleAction } from "@/service/vehicle";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import UniversalForm from "@/components/universal-form/UniversalForm";

/** Zod schema for validating the edit Pg9 and Pg13 Plan form */
const editPg9AndPg13PlanSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
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

type EditPg9AndPg13PlanForm = z.infer<typeof editPg9AndPg13PlanSchema>;

/** Format a date string/Date to YYYY-MM-DD for form defaults */
function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditPg9AndPg13PlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdatePg9AndPg13PlanInput) => Promise<void> | void;
  plan: Pg9AndPg13PlanRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditPg9AndPg13PlanModal({
  open,
  onOpenChange,
  onSubmit,
  plan,
  standAloneId,
  loading,
}: EditPg9AndPg13PlanModalProps) {
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

  const fields: FieldConfig<EditPg9AndPg13PlanForm>[] = [
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
      placeholder: "Describe the defect in detail",
    },
    {
      name: "clearanceStatus",
      label: "Clearance Status",
      type: "text",
      placeholder: "Enter the current clearance status",
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
      placeholder: "Enter the maintenance provider",
    },
    {
      name: "meetingDate",
      label: "Meeting Date",
      type: "date",
    },
    {
      name: "notes",
      label: "Notes",
      placeholder: "Add any additional notes",
      type: "textarea",
    },
    {
      name: "followUp",
      label: "Follow Up Needed",
      type: "switch",
    },
  ];

  const handleSubmit = async (data: EditPg9AndPg13PlanForm) => {
    const payload: UpdatePg9AndPg13PlanInput = {
      ...data,
      meetingDate: data.meetingDate
        ? new Date(data.meetingDate).toISOString()
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
          Edit Pg9 And Pg13 Plan
        </DialogTitle>

        {loading || vehiclesLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : plan ? (
          <UniversalForm<EditPg9AndPg13PlanForm>
            title="Pg9 And Pg13 Plan Details"
            fields={fields}
            schema={editPg9AndPg13PlanSchema}
            defaultValues={{
              vehicleId: plan.vehicleId,
              issueType: plan.issueType as PG9AndPG13IssueType,
              defectDescription: plan.defectDescription,
              clearanceStatus: plan.clearanceStatus,
              tcContactMade: plan.tcContactMade,
              maintenanceProvider: plan.maintenanceProvider,
              meetingDate: toDateInput(plan.meetingDate),
              notes: plan.notes,
              followUp: plan.followUp,
            }}
            onSubmit={handleSubmit}
            submitText="Update Pg9 And Pg13 Plan"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No pg9 and pg13 plan data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
