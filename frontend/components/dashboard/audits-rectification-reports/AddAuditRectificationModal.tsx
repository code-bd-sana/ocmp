"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AuditStatus,
  CreateAuditRectificationReportInput,
} from "@/lib/audits-rectification-reports/audits-rectification-reports.types";

const addReportSchema = z.object({
  auditDate: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(150, "Title must not exceed 150 characters"),
  type: z
    .string()
    .min(1, "Type is required")
    .max(150, "Type must not exceed 150 characters"),
  auditDetails: z.string().optional(),
  status: z.enum(["In Progress", "Completed", "Pending"] as const).optional(),
  responsiblePerson: z
    .string()
    .max(150, "Responsible person must not exceed 150 characters")
    .optional(),
  finalizeDate: z.string().optional(),
});

type AddReportForm = z.infer<typeof addReportSchema>;

interface AddAuditRectificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAuditRectificationReportInput) => Promise<void> | void;
  standAloneId: string;
}

const statusOptions: { label: string; value: AuditStatus }[] = [
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

export default function AddAuditRectificationModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddAuditRectificationModalProps) {
  const fields: FieldConfig<AddReportForm>[] = [
    { name: "auditDate", label: "Audit Date", type: "date" },
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "Enter audit title",
    },
    {
      name: "type",
      label: "Type",
      type: "text",
      required: true,
      placeholder: "Enter audit type",
    },
    {
      name: "auditDetails",
      label: "Audit Details",
      type: "textarea",
      placeholder: "Enter audit details",
    },
    { name: "status", label: "Status", type: "select", options: statusOptions },
    {
      name: "responsiblePerson",
      label: "Responsible Person",
      type: "text",
      placeholder: "Enter responsible person",
    },
    { name: "finalizeDate", label: "Finalize Date", type: "date" },
  ];

  const handleSubmit = async (data: AddReportForm) => {
    const payload: CreateAuditRectificationReportInput = {
      title: data.title,
      type: data.type,
      standAloneId,
      ...(data.auditDate && {
        auditDate: new Date(data.auditDate).toISOString(),
      }),
      ...(data.auditDetails && { auditDetails: data.auditDetails }),
      ...(data.status && { status: data.status }),
      ...(data.responsiblePerson && {
        responsiblePerson: data.responsiblePerson,
      }),
      ...(data.finalizeDate && {
        finalizeDate: new Date(data.finalizeDate).toISOString(),
      }),
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
          Add Audit & Rectification Report
        </DialogTitle>

        <UniversalForm<AddReportForm>
          title="Report Details"
          fields={fields}
          schema={addReportSchema}
          defaultValues={{
            auditDate: "",
            title: "",
            type: "",
            auditDetails: "",
            status: "Pending",
            responsiblePerson: "",
            finalizeDate: "",
          }}
          onSubmit={handleSubmit}
          submitText="Create Report"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
