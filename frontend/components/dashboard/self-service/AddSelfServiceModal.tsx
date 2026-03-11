"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FieldConfig } from "@/components/universal-form/form.types";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { CreateSelfServiceInput } from "@/lib/self-service/self-service.types";
import z from "zod";

const addSelfServiceSchema = z.object({
  serviceName: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name must be at most 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  serviceLink: z
    .union([z.string().url("Service link must be a valid URL"), z.literal("")])
    .optional(),
});

type AddSelfServiceForm = z.infer<typeof addSelfServiceSchema>;

interface AddSelfServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSelfServiceInput) => Promise<void> | void;
  standAloneId: string;
}

export default function AddSelfServiceModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddSelfServiceModalProps) {
  const fields: FieldConfig<AddSelfServiceForm>[] = [
    {
      name: "serviceName",
      label: "Service Name",
      type: "text",
      required: true,
      placeholder: "Enter service name",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter description (optional)",
    },
    {
      name: "serviceLink",
      label: "Service Link",
      type: "text",
      placeholder: "https://example.com",
    },
  ];

  const handleSubmit = async (data: AddSelfServiceForm) => {
    const payload: CreateSelfServiceInput = {
      serviceName: data.serviceName,
      description: data.description || undefined,
      serviceLink: data.serviceLink || undefined,
      standAloneId,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Add Self Service</DialogTitle>
        <UniversalForm<AddSelfServiceForm>
          title=""
          schema={addSelfServiceSchema}
          fields={fields}
          onSubmit={handleSubmit}
          submitText="Add Service"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
