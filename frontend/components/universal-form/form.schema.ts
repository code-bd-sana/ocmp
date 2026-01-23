import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),

  email: z.string().email("Invalid email address"),

  dateOfBirth: z
    .date()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),

  uploadPhoto: z
    .any()
    .refine((file) => file instanceof File, "Please upload a valid photo")
    .optional(),

  uploadFile: z
    .any()
    .refine((file) => file instanceof File, "Please upload a valid file")
    .optional(),

  age: z
    .string({ invalid_type_error: "Age must be a number" })
    .min(0, "Age cannot be negative")
    .max(150, "Age seems too high"),

  gender: z.enum(["male", "female", "other"]).optional(),

  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});
