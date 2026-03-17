"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreateOcrsPlanInput } from "@/lib/ocrs-plan/ocrs-plan.types";

/** Zod schema for add OCRS plan form */
const addOcrsPlanSchema = z.object({
  roadWorthinessScore: z.string().optional(),
  overallTrafficScore: z.string().optional(),
  actionRequired: z.string().optional(),
});

type AddOcrsPlanForm = z.infer<typeof addOcrsPlanSchema>;

interface AddOcrsPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateOcrsPlanInput) => Promise<void> | void;
  standAloneId: string;
}

export default function AddOcrsPlanModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddOcrsPlanModalProps) {
  const fields: FieldConfig<AddOcrsPlanForm>[] = [
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

  const handleFormSubmit = async (data: AddOcrsPlanForm) => {
    await onSubmit({
      ...data,
      standAloneId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Add OCRS Plan</DialogTitle>
        <UniversalForm<AddOcrsPlanForm>
          title=""
          schema={addOcrsPlanSchema}
          fields={fields}
          onSubmit={handleFormSubmit}
          submitText="Add OCRS Plan"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
