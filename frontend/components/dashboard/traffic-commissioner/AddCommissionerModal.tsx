"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FieldConfig } from "@/components/universal-form/form.types";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { CreateTrafficCommissionerInput } from "@/lib/traffic-commissioner/traffic-commissioner.type";
import z from "zod";

export enum CommunicationType {
  Email = "Email",
  PhoneCall = "Phone Call",
  Letter = "Letter",
}

const addTrafficCommissioner = z.object({
  // also with validation for the fields
  type: z.enum(
    [
      CommunicationType.Email,
      CommunicationType.PhoneCall,
      CommunicationType.Letter,
    ],
    {
      message: "Please select a communication type",
    },
  ),
  contactedPerson: z
    .string()
    .min(2, "Contacted person must be at least 2 characters"),
  reason: z.string().min(2, "Reason must be at least 2 characters"),
  communicationDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),
  comments: z.string().optional(),
  attachments: z.array(z.instanceof(File)).optional(),
});

type AddTrafficCommissionerForm = z.infer<typeof addTrafficCommissioner>;

interface AddCommissionerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTrafficCommissionerInput) => Promise<void> | void;
  standAloneId: string;
}

export default function AddCommissionerModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddCommissionerModalProps) {
  const fields: FieldConfig<AddTrafficCommissionerForm>[] = [
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

  const handleSubmit = async (data: AddTrafficCommissionerForm) => {
    const attachmentNames = data.attachments?.map((file) => file.name);
    const payload: CreateTrafficCommissionerInput = {
      ...data,
      standAloneId,
      attachments: attachmentNames,
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Add Traffic Commissioner Communication</DialogTitle>
        <UniversalForm<AddTrafficCommissionerForm>
          title=""
          schema={addTrafficCommissioner}
          fields={fields}
          onSubmit={handleSubmit}
          submitText="Add Communication"
          setOpen={onOpenChange}
          defaultValues={{
            type: CommunicationType.Email,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
