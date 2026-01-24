import { FieldValues, Path } from "react-hook-form";
import { ZodType } from "zod";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "switch"
  | "file"
  | "date";

export interface FieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: FieldType;
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[];
}

export interface UniversalFomrsProps<T extends FieldValues> {
  title: string;
  fields: FieldConfig<T>[];
  schema: ZodType<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void;
  submitText?: string;
  setOpen: (open: boolean) => void;
}
