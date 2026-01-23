import { FieldConfig } from "@/components/universal-form/form.types";

export const registerFields: FieldConfig[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "example@mail.com",
  },
  {
    name: "dateOfBirth",
    label: "Date of Birth",
    type: "date",
    placeholder: "Select your date of birth",
  },
  {
    name: "uploadPhoto",
    label: "Upload Photo",
    type: "file",
    placeholder: "Upload your photo",
  },
  {
    name: "uploadFile",
    label: "Upload File",
    type: "file",
    placeholder: "Upload your file",
  },
  { name: "age", label: "Age", type: "number", placeholder: "Your age" },
  {
    name: "gender",
    label: "Gender",
    type: "radio",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
    ],
  },
  { name: "terms", label: "Accept Terms & Conditions", type: "checkbox" },
];
