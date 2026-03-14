import { FieldConfig } from "@/components/universal-form/form.types";
import {
  trafficCommissionerRow,
  UpdateTrafficCommissionerInput,
} from "@/lib/traffic-commissioner/traffic-commissioner.type";
import z from "zod";
import { CommunicationType } from "./AddCommissionerModal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import UniversalForm from "@/components/universal-form/UniversalForm";

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
  attachments: z.array(z.instanceof(File)).optional(),
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
      label: "Attachments",
      type: "file",
      multiple: true,
    },
  ];

  const handleSubmit = async (data: EditCommissionerForm) => {
    const attachmentNames = data.attachments?.map((file) => file.name);
    const payload: UpdateTrafficCommissionerInput = {
      ...data,
      communicationDate: new Date(data.communicationDate).toISOString(),
      attachments: attachmentNames,
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
            }}
            onSubmit={handleSubmit}
            submitText="Update Communication"
            setOpen={onOpenChange}
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
