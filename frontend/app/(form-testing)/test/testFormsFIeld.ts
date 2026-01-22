import { FieldConfig } from "@/components/universal-form/form.types";

export const registerFields: FieldConfig[] = [
  {
    name: "name",
    label: "Vehicle Registration Number",
    type: "text",
    placeholder: "Enter your reg no",
    required: true,
  },
  {
    name: "date",
    label: "Date Changed",
    type: "date",
    placeholder: "Enter date ",
  },
  {
    name: "tyresize",
    label: "Tyre Size",
    type: "text",
    placeholder: "Enter your size",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "Re-enter password",
  },
  { name: "age", label: "Age", type: "number", placeholder: "Your age" },
];
