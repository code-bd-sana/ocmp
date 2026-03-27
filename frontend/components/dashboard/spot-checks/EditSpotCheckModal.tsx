"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, Loader2, Trash2 } from "lucide-react";
import {
  SpotCheckRow,
  UpdateSpotCheckInput,
} from "@/lib/spot-checks/spot-check.types";
import { VehicleAction } from "@/service/vehicle";

/** Zod schema for edit spot-check form */
const editSpotCheckSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  issueDetails: z
    .string()
    .min(2, "Issue details must be at least 2 characters")
    .max(2000, "Issue details is too long"),
  rectificationRequired: z.string().optional(),
  actionTaken: z.string().optional(),
  dateCompleted: z.string().optional(),
  completedBy: z.string().optional(),
  followUpNeeded: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.any().optional(),
});

type EditSpotCheckForm = z.infer<typeof editSpotCheckSchema>;

/** Format a date string/Date to YYYY-MM-DD for form defaults */
function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditSpotCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateSpotCheckInput) => Promise<void> | void;
  spotCheck: SpotCheckRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditSpotCheckModal({
  open,
  onOpenChange,
  onSubmit,
  spotCheck,
  loading,
  standAloneId,
}: EditSpotCheckModalProps) {
  const [vehicleOptions, setVehicleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  // Fetch vehicles when modal opens
  useEffect(() => {
    if (!open) return;
    setVehiclesLoading(true);
    VehicleAction.getVehicles(standAloneId, { showPerPage: 100 })
      .then((res) => {
        if (res.status && res.data?.vehicles) {
          setVehicleOptions(
            res.data.vehicles.map((v) => ({
              label: `${v.vehicleRegId} — ${v.licensePlate}`,
              value: v._id,
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => setVehiclesLoading(false));
  }, [open, standAloneId]);

  const fields: FieldConfig<EditSpotCheckForm>[] = [
    {
      name: "vehicleId",
      label: "Vehicle",
      type: "select",
      options: vehicleOptions,
      required: true,
    },
    {
      name: "issueDetails",
      label: "Issue Details",
      type: "textarea",
      placeholder: "Describe the issue",
      required: true,
    },
    {
      name: "rectificationRequired",
      label: "Rectification Required",
      type: "date",
    },
    {
      name: "actionTaken",
      label: "Action Taken",
      type: "textarea",
      placeholder: "Describe action taken",
    },
    {
      name: "dateCompleted",
      label: "Date Completed",
      type: "date",
    },
    {
      name: "completedBy",
      label: "Completed By",
      type: "text",
      placeholder: "Name of person who completed",
    },
    {
      name: "followUpNeeded",
      label: "Follow-Up Needed",
      type: "text",
      placeholder: "Any follow-up required",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Any additional notes",
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
  }, [open, spotCheck?._id]);

  const toggleRemoveAttachment = (attachmentId: string) => {
    setRemoveAttachmentIds((prev) => {
      if (prev.includes(attachmentId)) {
        return prev.filter((id) => id !== attachmentId);
      }
      return [...prev, attachmentId];
    });
  };

  const renderAttachmentRemoveSection = () => {
    if (!spotCheck) return null;

    if (!spotCheck.attachments?.length) {
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
          {spotCheck.attachments.map((attachment) => {
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

  const handleSubmit = async (data: EditSpotCheckForm) => {
    const attachmentFiles = data.attachments
      ? Array.from(data.attachments as FileList)
      : undefined;

    const payload: UpdateSpotCheckInput = {
      vehicleId: data.vehicleId,
      issueDetails: data.issueDetails,
      ...(data.rectificationRequired && {
        rectificationRequired: data.rectificationRequired,
      }),
      ...(data.actionTaken && { actionTaken: data.actionTaken }),
      ...(data.dateCompleted && { dateCompleted: data.dateCompleted }),
      ...(data.completedBy && { completedBy: data.completedBy }),
      ...(data.followUpNeeded && { followUpNeeded: data.followUpNeeded }),
      ...(data.notes && { notes: data.notes }),
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
          Edit Spot Check
        </DialogTitle>

        {loading || vehiclesLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : spotCheck ? (
          <UniversalForm<EditSpotCheckForm>
            title="Spot Check Details"
            fields={fields}
            schema={editSpotCheckSchema}
            defaultValues={{
              vehicleId: spotCheck.vehicleId || "",
              issueDetails: spotCheck.issueDetails || "",
              rectificationRequired: toDateInput(
                spotCheck.rectificationRequired,
              ),
              actionTaken: spotCheck.actionTaken || "",
              dateCompleted: toDateInput(spotCheck.dateCompleted),
              completedBy: spotCheck.completedBy || "",
              followUpNeeded: spotCheck.followUpNeeded || "",
              notes: spotCheck.notes || "",
              attachments: undefined,
            }}
            onSubmit={handleSubmit}
            submitText="Update Spot Check"
            setOpen={onOpenChange}
            renderAfterField={(fieldName) =>
              fieldName === "attachments"
                ? renderAttachmentRemoveSection()
                : null
            }
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No spot check data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
