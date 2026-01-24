import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),

  email: z.email("Invalid email address"),

  dateOfBirth: z.date().optional(),

  uploadPhoto: z
    .any()
    .refine((file) => file instanceof File, "Please upload a valid photo")
    .optional(),

  uploadFile: z.any().optional(),

  age: z
    .string()
    .min(0, "Age cannot be negative")
    .max(150, "Age seems too high"),

  gender: z.enum(["male", "female", "other"]).optional(),

  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),

  happy: z.string().optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
