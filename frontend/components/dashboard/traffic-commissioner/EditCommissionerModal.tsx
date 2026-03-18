import { FieldConfig } from "@/components/universal-form/form.types";
import {
  trafficCommissionerRow,
  UpdateTrafficCommissionerInput,
} from "@/lib/traffic-commissioner/traffic-commissioner.type";
import z from "zod";
import { CommunicationType } from "./AddCommissionerModal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, Loader2, Trash2 } from "lucide-react";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { useEffect, useState } from "react";

const editCommissionerSchema = z.object({
  type: z.string().min(1, "Type is required").max(120, "Type is too long"),
  contactedPerson: z
    .string()
    .min(1, "Contacted person is required")
    .max(120, "Contacted person is too long"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(1000, "Reason is too long"),
  communicationDate: z.string().min(1, "Communication date is required"),
  comments: z.string().optional(),
  attachments: z.any().optional(),
});

type EditCommissionerForm = z.infer<typeof editCommissionerSchema>;

/** Format a date string/Date to YYYY-MM-DD for form defaults */
function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditCommissionerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateTrafficCommissionerInput) => Promise<void> | void;
  communication: trafficCommissionerRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditCommissionerModal({
  open,
  onOpenChange,
  onSubmit,
  communication,
  loading,
}: EditCommissionerModalProps) {
  const fields: FieldConfig<EditCommissionerForm>[] = [
    {
      name: "type",
      label: "Communication Type",
      type: "select",
      required: true,
      options: [
        { label: "Email", value: CommunicationType.Email },
        { label: "Phone Call", value: CommunicationType.PhoneCall },
        { label: "Letter", value: CommunicationType.Letter },
      ],
    },
    {
      name: "contactedPerson",
      label: "Contacted Person",
      type: "text",
      required: true,
      placeholder: "Enter name of contacted person",
    },
    {
      name: "reason",
      label: "Reason for Contact",
      type: "textarea",
      required: true,
      placeholder: "Enter reason for contacting the traffic commissioner",
    },
    {
      name: "communicationDate",
      label: "Date of Communication",
      type: "date",
      required: true,
    },
    {
      name: "comments",
      label: "Additional Comments",
      type: "textarea",
      placeholder: "Enter any additional comments (optional)",
    },
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
  }, [open, communication?._id]);

  const toggleRemoveAttachment = (attachmentId: string) => {
    setRemoveAttachmentIds((prev) => {
      if (prev.includes(attachmentId)) {
        return prev.filter((id) => id !== attachmentId);
      }
      return [...prev, attachmentId];
    });
  };

  const renderAttachmentRemoveSection = () => {
    if (!communication) return null;

    if (!communication.attachments?.length) {
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
          {communication.attachments.map((attachment) => {
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

  const handleSubmit = async (data: EditCommissionerForm) => {
    const attachmentFiles = data.attachments
      ? Array.from(data.attachments as FileList)
      : undefined;

    const payload: UpdateTrafficCommissionerInput = {
      type: data.type,
      contactedPerson: data.contactedPerson,
      reason: data.reason,
      communicationDate: new Date(data.communicationDate).toISOString(),
      comments: data.comments,
      ...(attachmentFiles?.length && { attachments: attachmentFiles }),
      ...(removeAttachmentIds.length && { removeAttachmentIds }),
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Edit Traffic Commissioner Communication</DialogTitle>

        {loading || !communication ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : communication ? (
          <UniversalForm<EditCommissionerForm>
            title="Traffic Commissioner Details"
            fields={fields}
            schema={editCommissionerSchema}
            defaultValues={{
              type: communication.type,
              contactedPerson: communication.contactedPerson,
              reason: communication.reason,
              communicationDate: toDateInput(communication.communicationDate),
              comments: communication.comments || "",
              attachments: undefined,
            }}
            onSubmit={handleSubmit}
            submitText="Update Communication"
            setOpen={onOpenChange}
            renderAfterField={(fieldName) =>
              fieldName === "attachments"
                ? renderAttachmentRemoveSection()
                : null
            }
          />
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            <p className="text-muted-foreground">
              No traffic commissioner communication data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
