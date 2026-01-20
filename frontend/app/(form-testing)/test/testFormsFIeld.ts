import { FieldConfig } from "@/components/universal-form/form.types";

export const registerFields:FieldConfig[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  { name: "email", label: "Email", type: "email", placeholder: "example@mail.com" },
  { name: "password", label: "Password", type: "password", placeholder: "Enter password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Re-enter password" },
  { name: "age", label: "Age", type: "number", placeholder: "Your age" },
  { 
    name: "gender", 
    label: "Gender", 
    type: "radio", 
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
    ] 
  },
  { name: "terms", label: "Accept Terms & Conditions", type: "checkbox" },
];
