"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { registerSchema } from "@/components/universal-form/form.schema";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { useState } from "react";
import z from "zod";
import { registerFields } from "./testFormsFIeld";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [open, setOpen] = useState(false);

  const handleRegister = (data: RegisterFormData) => {
    console.log("Form submitted:", data);

    // ✅ submit success → dialog close
    setOpen(false);
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="bg-primary rounded px-4 py-2 font-bold text-white">
            Show Form
          </button>
        </DialogTrigger>

        <DialogContent className="max-h-[80vh] overflow-y-scroll rounded-none px-0">
          {/* accessibility only */}
          <DialogTitle className="hidden">Add New Entry</DialogTitle>

          <UniversalForm<RegisterFormData>
            title="Add New Entry"
            fields={registerFields}
            schema={registerSchema}
            onSubmit={handleRegister}
            submitText="Register"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
