"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UpdateOcrsPlanInput } from "@/lib/ocrs-plan/ocrs-plan.types";
import { OcrsPlanTableRow } from "./OcrsPlanTable";

/** Zod schema for edit OCRS plan form */
const editOcrsPlanSchema = z.object({
  roadWorthinessScore: z.string().optional(),
  overallTrafficScore: z.string().optional(),
  actionRequired: z.string().optional(),
});

type EditOcrsPlanForm = z.infer<typeof editOcrsPlanSchema>;

interface EditOcrsPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: UpdateOcrsPlanInput) => Promise<void> | void;
  ocrsPlan: OcrsPlanTableRow;
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
  ];

  const defaultValues: EditOcrsPlanForm = {
    roadWorthinessScore:
      ocrsPlan.roadWorthinessScore !== "—" ? ocrsPlan.roadWorthinessScore : "",
    overallTrafficScore:
      ocrsPlan.overallTrafficScore !== "—" ? ocrsPlan.overallTrafficScore : "",
    actionRequired:
      ocrsPlan.actionRequired !== "—" ? ocrsPlan.actionRequired : "",
  };

  const handleFormSubmit = async (data: EditOcrsPlanForm) => {
    await onSubmit(ocrsPlan._id, data);
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
        />
      </DialogContent>
    </Dialog>
  );
}
