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
  | "date";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[]; // for select, radio -- react select
}

export interface UniversalFomrsProps<T> {
  title: string;
  fields: FieldConfig[];
  schema: ZodType<T, any, any>; // chat-gpt
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void;
  submitText?: string;
}
