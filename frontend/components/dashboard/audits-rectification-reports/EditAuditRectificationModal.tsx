"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, Loader2, Trash2 } from "lucide-react";
import {
  AuditRectificationReportRow,
  AuditStatus,
  UpdateAuditRectificationReportInput,
} from "@/lib/audits-rectification-reports/audits-rectification-reports.types";

const editReportSchema = z.object({
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
  attachments: z.any().optional(),
});

type EditReportForm = z.infer<typeof editReportSchema>;

interface EditAuditRectificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateAuditRectificationReportInput) => Promise<void> | void;
  report: AuditRectificationReportRow | null;
  loading: boolean;
}

const statusOptions: { label: string; value: AuditStatus }[] = [
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export default function EditAuditRectificationModal({
  open,
  onOpenChange,
  onSubmit,
  report,
  loading,
}: EditAuditRectificationModalProps) {
  const fields: FieldConfig<EditReportForm>[] = [
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
    {
      name: "attachments",
      label: "Add New Attachments",
      type: "file",
      multiple: true,
    },
  ];

  const [removeAttachmentIds, setRemoveAttachmentIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setRemoveAttachmentIds([]);
    }
  }, [open, report?._id]);

  const toggleRemoveAttachment = (attachmentId: string) => {
    setRemoveAttachmentIds((prev) => {
      if (prev.includes(attachmentId)) {
        return prev.filter((id) => id !== attachmentId);
      }
      return [...prev, attachmentId];
    });
  };

  const renderAttachmentRemoveSection = () => {
    if (!report) return null;

    if (!report.attachments?.length) {
      return (
        <div className="mt-4 rounded-md border p-3">
          <p className="text-sm font-semibold">Remove Existing Attachments</p>
          <p className="text-muted-foreground mt-2 text-sm">
            No attachments found.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4 rounded-md border p-3">
        <p className="text-sm font-semibold">Remove Existing Attachments</p>
        <div className="mt-2 space-y-2">
          {report.attachments.map((attachment) => {
            const markedForRemoval = removeAttachmentIds.includes(
              attachment._id,
            );

            return (
              <div
                key={attachment._id}
                className="flex items-center justify-between gap-3 rounded-md border p-2"
              >
                <span
                  className={`min-w-0 truncate text-sm ${markedForRemoval ? "text-red-600 line-through" : ""}`}
                >
                  {attachment.originalName || attachment.filename}
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={attachment.downloadUrl || attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => toggleRemoveAttachment(attachment._id)}
                    className={
                      markedForRemoval
                        ? "text-red-600 hover:text-red-700"
                        : "text-muted-foreground hover:text-red-600"
                    }
                    title={
                      markedForRemoval ? "Undo remove" : "Remove on update"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {removeAttachmentIds.length > 0 ? (
          <p className="mt-2 text-xs text-amber-600">
            {removeAttachmentIds.length} attachment(s) marked for removal on
            update.
          </p>
        ) : null}
      </div>
    );
  };

  const handleSubmit = async (data: EditReportForm) => {
    const attachmentFiles = data.attachments
      ? Array.from(data.attachments as FileList)
      : undefined;

    const payload: UpdateAuditRectificationReportInput = {
      title: data.title,
      type: data.type,
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
      ...(attachmentFiles?.length && { attachments: attachmentFiles }),
      ...(removeAttachmentIds.length && { removeAttachmentIds }),
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
          Edit Audit & Rectification Report
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : report ? (
          <UniversalForm<EditReportForm>
            title="Report Details"
            fields={fields}
            schema={editReportSchema}
            defaultValues={{
              auditDate: toDateInput(report.auditDate),
              title: report.title || "",
              type: report.type || "",
              auditDetails: report.auditDetails || "",
              status: report.status || "Pending",
              responsiblePerson: report.responsiblePerson || "",
              finalizeDate: toDateInput(report.finalizeDate),
              attachments: undefined,
            }}
            onSubmit={handleSubmit}
            submitText="Update Report"
            setOpen={onOpenChange}
            renderAfterField={(fieldName) =>
              fieldName === "attachments"
                ? renderAttachmentRemoveSection()
                : null
            }
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No report data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
