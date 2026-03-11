import { FieldConfig } from "@/components/universal-form/form.types";
import {
  SelfServiceRow,
  UpdateSelfServiceInput,
} from "@/lib/self-service/self-service.types";
import z from "zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import UniversalForm from "@/components/universal-form/UniversalForm";

const editSelfServiceSchema = z.object({
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

type EditSelfServiceForm = z.infer<typeof editSelfServiceSchema>;

interface EditSelfServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateSelfServiceInput) => Promise<void> | void;
  selfService: SelfServiceRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditSelfServiceModal({
  open,
  onOpenChange,
  onSubmit,
  selfService,
  loading,
}: EditSelfServiceModalProps) {
  const fields: FieldConfig<EditSelfServiceForm>[] = [
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

  const handleSubmit = async (data: EditSelfServiceForm) => {
    const payload: UpdateSelfServiceInput = {
      serviceName: data.serviceName,
      description: data.description || undefined,
      serviceLink: data.serviceLink || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Edit Self Service</DialogTitle>

        {loading || !selfService ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : selfService ? (
          <UniversalForm<EditSelfServiceForm>
            title="Self Service Details"
            fields={fields}
            schema={editSelfServiceSchema}
            defaultValues={{
              serviceName: selfService.serviceName,
              description: selfService.description || "",
              serviceLink:
                selfService.serviceLink && selfService.serviceLink !== "—"
                  ? selfService.serviceLink
                  : "",
            }}
            onSubmit={handleSubmit}
            submitText="Update Service"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            <p className="text-muted-foreground">
              No self service data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
