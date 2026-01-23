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

  return (
    <div className='max-w-md mx-auto mt-10'>
      <AlertDialog>
        <AlertDialogTitle className='hidden'></AlertDialogTitle>
        <AlertDialogTrigger asChild>
          <button className='bg-primary  text-white font-bold py-2 px-4 rounded'>
            Show Form
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent className='px-0 overflow-y-scroll max-h-[80vh] rounded-none'>
          <UniversalForm<RegisterFormData>
            title='Add New Entry'
            fields={registerFields}
            schema={registerSchema}
            onSubmit={handleRegister}
            submitText='Register'
          />

          <AlertDialogFooter></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

//             <AlertDialogAction>Continue</AlertDialogAction>
