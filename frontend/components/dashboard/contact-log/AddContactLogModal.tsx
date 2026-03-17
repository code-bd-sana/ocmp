"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreateContactLogInput } from "@/lib/contact-log/contact-log.types";

const addContactLogSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    contactMethod: z.string().optional(),
    person: z
      .string()
      .min(1, "Person is required")
      .max(250, "Person must not exceed 250 characters"),
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(250, "Subject must not exceed 250 characters"),
    outcome: z.string().optional(),
    followUpRequired: z.boolean().default(false),
    followUpDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.followUpRequired) return true;
      return Boolean(data.followUpDate);
    },
    {
      message: "Follow-up date is required when follow-up is marked required",
      path: ["followUpDate"],
    },
  );

type AddContactLogForm = z.infer<typeof addContactLogSchema>;

interface AddContactLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContactLogInput) => Promise<void> | void;
  standAloneId: string;
}

export default function AddContactLogModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddContactLogModalProps) {
  const fields: FieldConfig<AddContactLogForm>[] = [
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
    },
    {
      name: "contactMethod",
      label: "Contact Method",
      type: "text",
      placeholder: "Phone, Email, Meeting...",
    },
    {
      name: "person",
      label: "Person",
      type: "text",
      placeholder: "Enter person name",
      required: true,
    },
    {
      name: "subject",
      label: "Subject",
      type: "text",
      placeholder: "Enter subject",
      required: true,
    },
    {
      name: "outcome",
      label: "Outcome",
      type: "textarea",
      placeholder: "Enter outcome",
    },
    {
      name: "followUpRequired",
      label: "Follow-Up Required",
      type: "checkbox",
    },
    {
      name: "followUpDate",
      label: "Follow-Up Date",
      type: "date",
    },
  ];

  const handleSubmit = async (data: AddContactLogForm) => {
    const payload: CreateContactLogInput = {
      date: data.date,
      person: data.person,
      subject: data.subject,
      standAloneId,
      followUpRequired: data.followUpRequired,
      ...(data.contactMethod && { contactMethod: data.contactMethod }),
      ...(data.outcome && { outcome: data.outcome }),
      ...(data.followUpDate && { followUpDate: data.followUpDate }),
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
          Add New Contact Log
        </DialogTitle>

        <UniversalForm<AddContactLogForm>
          title="Contact Log Details"
          fields={fields}
          schema={addContactLogSchema}
          defaultValues={{
            date: "",
            contactMethod: "",
            person: "",
            subject: "",
            outcome: "",
            followUpRequired: false,
            followUpDate: "",
          }}
          onSubmit={handleSubmit}
          submitText="Create Contact Log"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
