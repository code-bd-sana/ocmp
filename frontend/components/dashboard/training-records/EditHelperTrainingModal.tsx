"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  TrainingDetail,
  UpdateTrainingInput,
} from "@/lib/training/training.types";

const editTrainingSchema = z.object({
  trainingName: z
    .string()
    .min(2, "Training name must be at least 2 characters"),
  intervalDays: z.string().min(1, "Interval days is required"),
});

type EditTrainingForm = z.infer<typeof editTrainingSchema>;

interface EditHelperTrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: UpdateTrainingInput) => Promise<void> | void;
  training: TrainingDetail;
}

export default function EditHelperTrainingModal({
  open,
  onOpenChange,
  onSubmit,
  training,
}: EditHelperTrainingModalProps) {
  const fields: FieldConfig<EditTrainingForm>[] = [
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

  const defaultValues: EditTrainingForm = {
    trainingName: training.trainingName || "",
    intervalDays: Array.isArray(training.intervalDays)
      ? training.intervalDays.join(", ")
      : "",
  };

  const handleFormSubmit = async (data: EditTrainingForm) => {
    await onSubmit(training._id, {
      trainingName: data.trainingName,
      intervalDays: data.intervalDays,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Edit Training</DialogTitle>
        <UniversalForm<EditTrainingForm>
          title=""
          schema={editTrainingSchema}
          fields={fields}
          defaultValues={defaultValues}
          onSubmit={handleFormSubmit}
          submitText="Update Training"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
