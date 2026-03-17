"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  ContactLogRow,
  UpdateContactLogInput,
} from "@/lib/contact-log/contact-log.types";

const editContactLogSchema = z
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

type EditContactLogForm = z.infer<typeof editContactLogSchema>;

function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditContactLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateContactLogInput) => Promise<void> | void;
  contactLog: ContactLogRow | null;
  loading: boolean;
}

export default function EditContactLogModal({
  open,
  onOpenChange,
  onSubmit,
  contactLog,
  loading,
}: EditContactLogModalProps) {
  const fields: FieldConfig<EditContactLogForm>[] = [
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

  const handleSubmit = async (data: EditContactLogForm) => {
    const payload: UpdateContactLogInput = {
      date: data.date,
      person: data.person,
      subject: data.subject,
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
          Edit Contact Log
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : contactLog ? (
          <UniversalForm<EditContactLogForm>
            title="Contact Log Details"
            fields={fields}
            schema={editContactLogSchema}
            defaultValues={{
              date: toDateInput(contactLog.date),
              contactMethod: contactLog.contactMethod || "",
              person: contactLog.person || "",
              subject: contactLog.subject || "",
              outcome: contactLog.outcome || "",
              followUpRequired: Boolean(contactLog.followUpRequired),
              followUpDate: toDateInput(contactLog.followUpDate),
            }}
            onSubmit={handleSubmit}
            submitText="Update Contact Log"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No contact-log data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
