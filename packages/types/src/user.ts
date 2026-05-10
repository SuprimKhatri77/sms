import z from "zod";
import { baseAPIResponseSchema } from "./base";

// create user schema for admin/users
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must have atleast 2 characters")
    .max(50, "Name must be within 50 characters")
    .regex(/^[A-Za-z ]+$/, "Name can only contain letters and spaces")
    .trim(),
  email: z.email().trim(),
  password: z
    .string()
    .min(8, "Password must have atleast 8 characters")
    .max(50, "Password must be >= 50 characters"),
  role: z.enum(["admin", "student"]),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must have atleast 2 characters")
    .max(50, "Name must be within 50 characters")
    .regex(/^[A-Za-z ]+$/, "Name can only contain letters and spaces")
    .trim(),
  email: z.email().trim(),
  role: z.enum(["admin", "student"]),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
