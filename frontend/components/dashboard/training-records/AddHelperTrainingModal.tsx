"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreateTrainingInput } from "@/lib/training/training.types";

const addTrainingSchema = z.object({
  trainingName: z
    .string()
    .min(2, "Training name must be at least 2 characters"),
  intervalDays: z.string().min(1, "Interval days is required"),
});

type AddTrainingForm = z.infer<typeof addTrainingSchema>;

interface AddHelperTrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTrainingInput) => Promise<void> | void;
  standAloneId?: string;
}

export default function AddHelperTrainingModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddHelperTrainingModalProps) {
  const fields: FieldConfig<AddTrainingForm>[] = [
    {
      name: "trainingName",
      label: "Training Name",
      type: "text",
      placeholder: "Enter training name",
    },
    {
      name: "intervalDays",
      label: "Interval Days",
      type: "text",
      placeholder: "Example: 30, 60, 90",
    },
  ];

  const handleFormSubmit = async (data: AddTrainingForm) => {
    await onSubmit({
      trainingName: data.trainingName,
      intervalDays: data.intervalDays,
      standAloneId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Add Training</DialogTitle>
        <UniversalForm<AddTrainingForm>
          title=""
          schema={addTrainingSchema}
          fields={fields}
          onSubmit={handleFormSubmit}
          submitText="Add Training"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
