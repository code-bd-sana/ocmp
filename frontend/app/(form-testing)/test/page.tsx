"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { registerSchema } from "@/components/universal-form/form.schema";
import UniversalForm from "@/components/universal-form/UniversalForm";
import z from "zod";
import { registerFields } from "./testFormsFIeld";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const handleRegister = (data: RegisterFormData) => {
    console.log("Form submitted:", data);
  };

  // const keyCloak = useKeycloak();
  // console.log(keyCloak, "ami keyclaok");

  return (
    <div className="mx-auto mt-10 max-w-md">
      <AlertDialog>
        <AlertDialogTitle className="hidden"></AlertDialogTitle>
        <AlertDialogTrigger asChild>
          <button className="bg-primary rounded px-4 py-2 font-bold text-white">
            Show Form
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent className="max-h-[80vh] overflow-y-scroll rounded-none px-0">
          <UniversalForm<RegisterFormData>
            title="Add New Entry"
            fields={registerFields}
            schema={registerSchema}
            onSubmit={handleRegister}
            submitText="Register"
          />

          <AlertDialogFooter></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
