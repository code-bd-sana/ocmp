"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  CreateTransportManagerTrainingInput,
  TransportManagerTrainingRenewalTracker,
} from "@/lib/transport-manager-training/transport-manager-training.types";

const addTrainingSchema = z.object({
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

type AddTrainingForm = z.infer<typeof addTrainingSchema>;

interface AddTransportManagerTrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTransportManagerTrainingInput) => Promise<void> | void;
}

function parseAttachmentIds(raw?: string): string[] {
  if (!raw?.trim()) return [];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AddTransportManagerTrainingModal({
  open,
  onOpenChange,
  onSubmit,
}: AddTransportManagerTrainingModalProps) {
  const fields: FieldConfig<AddTrainingForm>[] = [
    {
      name: "trainingCourse",
      label: "Training Course",
      type: "text",
      placeholder: "e.g. National CPC Refresher",
      required: true,
    },
    {
      name: "unitTitle",
      label: "Unit Title",
      type: "text",
      placeholder: "e.g. Operator Licensing Compliance",
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
        {
          label: "No",
          value: TransportManagerTrainingRenewalTracker.NO,
        },
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

  const handleFormSubmit = async (data: AddTrainingForm) => {
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
          Add Transport Manager Training
        </DialogTitle>
        <UniversalForm<AddTrainingForm>
          title="Training Details"
          schema={addTrainingSchema}
          fields={fields}
          defaultValues={{
            trainingCourse: "",
            unitTitle: "",
            completionDate: "",
            renewalTracker: TransportManagerTrainingRenewalTracker.NO,
            nextDueDate: "",
            attachments: "",
          }}
          onSubmit={handleFormSubmit}
          submitText="Create Training"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
