"use client";

import { registerSchema } from "@/components/universal-form/form.schema";
import UniversalForm from "@/components/universal-form/UniversalForm";
import React from "react";
import { registerFields } from "./testFormsFIeld";
import z from "zod";


type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const handleRegister = (data: RegisterFormData) => {
    console.log("Form submitted:", data);
    // ekhane API call korte paro
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <UniversalForm<RegisterFormData>
        title="Register"
        fields={registerFields}
        schema={registerSchema}
        onSubmit={handleRegister}
        submitText="Register"
      />
    </div>
  );
}
