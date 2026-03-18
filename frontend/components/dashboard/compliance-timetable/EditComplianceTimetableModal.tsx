"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  ComplianceStatus,
  ComplianceTimetableRow,
  UpdateComplianceTimetableInput,
} from "@/lib/compliance-timetable/compliance-timetable.types";

const editComplianceTimetableSchema = z.object({
  task: z
    .string()
    .min(1, "Task is required")
    .max(150, "Task must not exceed 150 characters"),
  responsibleParty: z
    .string()
    .min(1, "Responsible party is required")
    .max(150, "Responsible party must not exceed 150 characters"),
  dueDate: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"] as const).optional(),
});

type EditComplianceTimetableForm = z.infer<
  typeof editComplianceTimetableSchema
>;

interface EditComplianceTimetableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateComplianceTimetableInput) => Promise<void> | void;
  complianceTimetable: ComplianceTimetableRow | null;
  loading: boolean;
}

const statusOptions: { label: string; value: ComplianceStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export default function EditComplianceTimetableModal({
  open,
  onOpenChange,
  onSubmit,
  complianceTimetable,
  loading,
}: EditComplianceTimetableModalProps) {
  const fields: FieldConfig<EditComplianceTimetableForm>[] = [
    {
      name: "task",
      label: "Task",
      type: "text",
      required: true,
      placeholder: "Enter task",
    },
    {
      name: "responsibleParty",
      label: "Responsible Party",
      type: "text",
      required: true,
      placeholder: "Enter responsible party",
    },
    {
      name: "dueDate",
      label: "Due Date",
      type: "date",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
  ];

  const handleSubmit = async (data: EditComplianceTimetableForm) => {
    const payload: UpdateComplianceTimetableInput = {
      task: data.task,
      responsibleParty: data.responsibleParty,
      ...(data.dueDate && { dueDate: data.dueDate }),
      ...(data.status && { status: data.status }),
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
          Edit Compliance Timetable
        </DialogTitle>
        <DialogDescription className="sr-only">
          Edit compliance timetable task details such as task name, responsible
          party, due date, and status.
        </DialogDescription>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : complianceTimetable ? (
          <UniversalForm<EditComplianceTimetableForm>
            title="Compliance Timetable Details"
            fields={fields}
            schema={editComplianceTimetableSchema}
            defaultValues={{
              task: complianceTimetable.task || "",
              responsibleParty: complianceTimetable.responsibleParty || "",
              dueDate: toDateInput(complianceTimetable.dueDate),
              status: complianceTimetable.status || "PENDING",
            }}
            onSubmit={handleSubmit}
            submitText="Update Task"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No compliance timetable data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
