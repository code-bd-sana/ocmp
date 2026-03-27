"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, Trash2 } from "lucide-react";
import {
  OcrsPlanRow,
  UpdateOcrsPlanInput,
} from "@/lib/ocrs-plan/ocrs-plan.types";

/** Zod schema for edit OCRS plan form */
const editOcrsPlanSchema = z.object({
  roadWorthinessScore: z.string().optional(),
  overallTrafficScore: z.string().optional(),
  actionRequired: z.string().optional(),
  attachments: z.any().optional(),
});

type EditOcrsPlanForm = z.infer<typeof editOcrsPlanSchema>;

interface EditOcrsPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: UpdateOcrsPlanInput) => Promise<void> | void;
  ocrsPlan: OcrsPlanRow;
}

export default function EditOcrsPlanModal({
  open,
  onOpenChange,
  onSubmit,
  ocrsPlan,
}: EditOcrsPlanModalProps) {
  const fields: FieldConfig<EditOcrsPlanForm>[] = [
    {
      name: "roadWorthinessScore",
      label: "Road Worthiness Score",
      type: "text",
      placeholder: "Enter road worthiness score",
    },
    {
      name: "overallTrafficScore",
      label: "Overall Traffic Score",
      type: "text",
      placeholder: "Enter overall traffic score",
    },
    {
      name: "actionRequired",
      label: "Action Required",
      type: "textarea",
      placeholder: "Enter action required details",
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
  }, [open, ocrsPlan._id]);

  const toggleRemoveAttachment = (attachmentId: string) => {
    setRemoveAttachmentIds((prev) => {
      if (prev.includes(attachmentId)) {
        return prev.filter((id) => id !== attachmentId);
      }
      return [...prev, attachmentId];
    });
  };

  const renderAttachmentRemoveSection = () => {
    if (!ocrsPlan.attachments?.length) {
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
          {ocrsPlan.attachments.map((attachment) => {
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

  const defaultValues: EditOcrsPlanForm = {
    roadWorthinessScore: ocrsPlan.roadWorthinessScore || "",
    overallTrafficScore: ocrsPlan.overallTrafficScore || "",
    actionRequired: ocrsPlan.actionRequired || "",
    attachments: undefined,
  };

  const handleFormSubmit = async (data: EditOcrsPlanForm) => {
    const attachmentFiles = data.attachments
      ? Array.from(data.attachments as FileList)
      : undefined;

    await onSubmit(ocrsPlan._id, {
      roadWorthinessScore: data.roadWorthinessScore,
      overallTrafficScore: data.overallTrafficScore,
      actionRequired: data.actionRequired,
      ...(attachmentFiles?.length && { attachments: attachmentFiles }),
      ...(removeAttachmentIds.length && { removeAttachmentIds }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Edit OCRS Plan</DialogTitle>
        <UniversalForm<EditOcrsPlanForm>
          title=""
          schema={editOcrsPlanSchema}
          fields={fields}
          defaultValues={defaultValues}
          onSubmit={handleFormSubmit}
          submitText="Update OCRS Plan"
          setOpen={onOpenChange}
          renderAfterField={(fieldName) =>
            fieldName === "attachments" ? renderAttachmentRemoveSection() : null
          }
        />
      </DialogContent>
    </Dialog>
  );
}
