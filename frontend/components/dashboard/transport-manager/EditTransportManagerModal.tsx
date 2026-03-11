"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  TransportManagerTrainingRenewalTracker,
  TransportManagerTrainingRow,
  UpdateTransportManagerTrainingInput,
} from "@/lib/transport-manager-training/transport-manager-training.types";
import { Loader2 } from "lucide-react";

const editTrainingSchema = z.object({
  trainingCourse: z
    .string()
    .min(1, "Training course is required")
    .max(200, "Training course is too long"),
  unitTitle: z
    .string()
    .min(1, "Unit title is required")
    .max(200, "Unit title is too long"),
  completionDate: z.string().min(1, "Completion date is required"),
  renewalTracker: z.nativeEnum(TransportManagerTrainingRenewalTracker),
  nextDueDate: z.string().optional(),
  attachments: z.string().optional(),
});

type EditTrainingForm = z.infer<typeof editTrainingSchema>;

interface EditTransportManagerTrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateTransportManagerTrainingInput) => Promise<void> | void;
  training: TransportManagerTrainingRow | null;
  loading: boolean;
}

function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function parseAttachmentIds(raw?: string): string[] {
  if (!raw?.trim()) return [];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function EditTransportManagerTrainingModal({
  open,
  onOpenChange,
  onSubmit,
  training,
  loading,
}: EditTransportManagerTrainingModalProps) {
  const fields: FieldConfig<EditTrainingForm>[] = [
    {
      name: "trainingCourse",
      label: "Training Course",
      type: "text",
      required: true,
    },
    {
      name: "unitTitle",
      label: "Unit Title",
      type: "text",
      required: true,
    },
    {
      name: "completionDate",
      label: "Completion Date",
      type: "date",
      required: true,
    },
    {
      name: "renewalTracker",
      label: "Renewal Tracker",
      type: "select",
      options: [
        { label: "No", value: TransportManagerTrainingRenewalTracker.NO },
        {
          label: "Recommended",
          value: TransportManagerTrainingRenewalTracker.RECOMMENDED,
        },
      ],
      required: true,
    },
    {
      name: "nextDueDate",
      label: "Next Due Date",
      type: "date",
    },
    {
      name: "attachments",
      label: "Attachment IDs (optional)",
      type: "textarea",
      placeholder: "Comma-separated document IDs",
    },
  ];

  const handleFormSubmit = async (data: EditTrainingForm) => {
    await onSubmit({
      trainingCourse: data.trainingCourse,
      unitTitle: data.unitTitle,
      completionDate: data.completionDate,
      renewalTracker: data.renewalTracker,
      ...(data.nextDueDate && { nextDueDate: data.nextDueDate }),
      attachments: parseAttachmentIds(data.attachments),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="text-primary mb-4 text-xl font-bold">
          Edit Transport Manager Training
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : training ? (
          <UniversalForm<EditTrainingForm>
            title="Training Details"
            schema={editTrainingSchema}
            fields={fields}
            defaultValues={{
              trainingCourse: training.trainingCourse || "",
              unitTitle: training.unitTitle || "",
              completionDate: toDateInput(training.completionDate),
              renewalTracker:
                training.renewalTracker ||
                TransportManagerTrainingRenewalTracker.NO,
              nextDueDate: toDateInput(training.nextDueDate),
              attachments: training.attachments?.join(", ") || "",
            }}
            onSubmit={handleFormSubmit}
            submitText="Update Training"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No training data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
