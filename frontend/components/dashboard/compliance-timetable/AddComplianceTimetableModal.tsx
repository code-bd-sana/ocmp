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
import {
  ComplianceStatus,
  CreateComplianceTimetableInput,
} from "@/lib/compliance-timetable/compliance-timetable.types";
import { getCurrentUserRole } from "@/service/shared/role-scope";

const addComplianceTimetableSchema = z.object({
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

type AddComplianceTimetableForm = z.infer<typeof addComplianceTimetableSchema>;

interface AddComplianceTimetableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateComplianceTimetableInput) => Promise<void> | void;
  standAloneId: string;
}

const statusOptions: { label: string; value: ComplianceStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

export default function AddComplianceTimetableModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddComplianceTimetableModalProps) {
  const fields: FieldConfig<AddComplianceTimetableForm>[] = [
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

  const handleSubmit = async (data: AddComplianceTimetableForm) => {
    const userRole = await getCurrentUserRole();

    const payload: CreateComplianceTimetableInput = {
      task: data.task,
      responsibleParty: data.responsibleParty,
      ...(userRole !== "STANDALONE_USER" && { standAloneId }),
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
          Add Compliance Timetable
        </DialogTitle>
        <DialogDescription className="sr-only">
          Add a compliance timetable task with responsible party, due date, and
          status.
        </DialogDescription>

        <UniversalForm<AddComplianceTimetableForm>
          title="Compliance Timetable Details"
          fields={fields}
          schema={addComplianceTimetableSchema}
          defaultValues={{
            task: "",
            responsibleParty: "",
            dueDate: "",
            status: "PENDING",
          }}
          onSubmit={handleSubmit}
          submitText="Create Task"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
