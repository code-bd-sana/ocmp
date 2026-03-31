"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TrainingRecordStatus } from "@/lib/training-records/training-records.types";

const updateStatusSchema = z.object({
  status: z.enum(["Pending", "Overdue", "Upcoming", "Completed"]),
});

type UpdateStatusForm = z.infer<typeof updateStatusSchema>;

interface UpdateTrainingRecordStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: TrainingRecordStatus;
  onSubmit: (status: TrainingRecordStatus) => Promise<void> | void;
}

export default function UpdateTrainingRecordStatusModal({
  open,
  onOpenChange,
  currentStatus,
  onSubmit,
}: UpdateTrainingRecordStatusModalProps) {
  const fields: FieldConfig<UpdateStatusForm>[] = [
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select status",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Overdue", value: "Overdue" },
        { label: "Upcoming", value: "Upcoming" },
        { label: "Completed", value: "Completed" },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Update Record Status</DialogTitle>
        <UniversalForm<UpdateStatusForm>
          title=""
          schema={updateStatusSchema}
          fields={fields}
          defaultValues={{ status: currentStatus }}
          onSubmit={async (values) => onSubmit(values.status)}
          submitText="Update Status"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
