"use client";

import z from "zod";
import { ToolBoxType } from "./AddToolboxModal";
import {
  TrainingToolboxRow,
  UpdateTrainingToolboxInput,
} from "@/lib/training-toolbox/training-toolbox.type";
import { useEffect, useState } from "react";
import { DriverAction } from "@/service/driver";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import UniversalForm from "@/components/universal-form/UniversalForm";

/** Zod schema for the edit form */
const editToolboxSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),
  driverId: z.string().min(1, "Driver ID is required"),
  toolboxTitle: z
    .string()
    .min(2, "Toolbox title must be at least 2 characters"),
  typeOfToolbox: z.enum([ToolBoxType.TRAINING, ToolBoxType.TOOLBOX_TALK], {
    message: "Please select a type of toolbox",
  }),
  deliveredBy: z.string().optional(),
  notes: z.string().optional(),
  signed: z.boolean().optional(),
  followUpNeeded: z.boolean().optional(),
  followUpDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Please enter a valid follow-up date",
    })
    .optional(),
  signOff: z.boolean().optional(),
  attachments: z.array(z.instanceof(File)).optional(),
});

type EditToolboxForm = z.infer<typeof editToolboxSchema>;

/** Format a date string/Date to YYYY-MM-DD for form defaults */
function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditToolboxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateTrainingToolboxInput) => Promise<void> | void;
  toolbox: TrainingToolboxRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditToolboxModal({
  open,
  onOpenChange,
  onSubmit,
  toolbox,
  standAloneId,
  loading,
}: EditToolboxModalProps) {
  const [driverOptions, setDriverOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [driversLoading, setDriversLoading] = useState(false);

  // Fetch drivers when modal opens
  useEffect(() => {
    let isActive = true;
    if (!open) return;
    const fetchDrivers = async () => {
      setDriversLoading(true);
      try {
        const res = await DriverAction.getDrivers(standAloneId, {
          showPerPage: 100,
        });
        if (isActive && res.status && res.data?.drivers) {
          setDriverOptions(
            res.data.drivers.map((d) => ({
              label: `${d.fullName}`,
              value: d._id,
            })),
          );
        }
      } catch {
        // handle error if needed
      } finally {
        if (isActive) setDriversLoading(false);
      }
    };
    fetchDrivers();
    return () => {
      isActive = false;
    };
  }, [open, standAloneId]);

  const fields: FieldConfig<EditToolboxForm>[] = [
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
    },
    {
      name: "driverId",
      label: "Driver",
      type: "select",
      options: driverOptions,
      required: true,
    },
    {
      name: "toolboxTitle",
      label: "Toolbox Title",
      type: "text",
      required: true,
      placeholder: "Enter a title for the toolbox session",
    },
    {
      name: "typeOfToolbox",
      label: "Type of Toolbox",
      type: "select",
      options: Object.values(ToolBoxType).map((value) => ({
        label: value,
        value,
      })),
      required: true,
    },
    // deliveredBy will be the current logged in user
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Enter any additional notes ",
    },
    {
      name: "signed",
      label: "Signed",
      type: "checkbox",
    },
    {
      name: "followUpNeeded",
      label: "Follow-Up Needed",
      type: "checkbox",
    },
    {
      name: "followUpDate",
      label: "Follow-Up Date",
      type: "date",
    },
    {
      name: "signOff",
      label: "Sign Off",
      type: "checkbox",
    },
    {
      name: "attachments",
      label: "Attachments",
      type: "file",
      multiple: true,
    },
  ];

  const handleSubmit = async (data: EditToolboxForm) => {
    const payload: UpdateTrainingToolboxInput = {
      ...data,
      attachments: data.attachments?.map((file) => file.name),
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
          Edit Training Toolbox
        </DialogTitle>

        {loading || driversLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : toolbox ? (
          <UniversalForm<EditToolboxForm>
            title="Training Toolbox Details"
            fields={fields}
            schema={editToolboxSchema}
            defaultValues={{
              date: toDateInput(toolbox.date),
              driverId: toolbox.driverId || "",
              toolboxTitle: toolbox.toolboxTitle || "",
              typeOfToolbox:
                toolbox.typeOfToolbox === ToolBoxType.TOOLBOX_TALK
                  ? ToolBoxType.TOOLBOX_TALK
                  : ToolBoxType.TRAINING,
              deliveredBy: toolbox.deliveredBy || "",
              notes: toolbox.notes || "",
              signed: Boolean(toolbox.signed),
              followUpNeeded: Boolean(toolbox.followUpNeeded),
              followUpDate: toDateInput(toolbox.followUpDate),
              signOff: Boolean(toolbox.signOff),
              attachments: undefined,
            }}
            onSubmit={handleSubmit}
            submitText="Update Training Toolbox"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No training toolbox data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
