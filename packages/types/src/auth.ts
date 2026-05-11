import z from "zod";
import { apiErrorSchema, baseAPIResponseSchema, errorResponse } from "./base";

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(50),
});

export const userSchema = z.object({
  name: z
    .string()
    .regex(/^[A-Za-z ]+$/, "Full name can only contain letters and spaces")
    .trim(),
  role: z.enum(["admin", "student"]),
  email: z.email(),
  id: z.uuid(),
  imageUrl: z.url().optional(),
  createdAt: z.date(),
});

export const loginResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.object({
      user: userSchema.omit({ createdAt: true }),
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorResponse).optional(),
  }),
]);

export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginResponse = z.infer<typeof loginResponse>;

export const signupInputSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[A-Za-z ]+$/, "Full name can only contain letters and spaces")
      .trim(),

    email: z.email("Please enter a valid email address").trim(),

    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password cannot exceed 50 characters"),

    confirmPassword: z.string({ error: "Please confirm your password" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const signupResponseSchema = z.object({
  message: z.string(),
  success: z.literal(true),
  data: z.object({
    user: userSchema.omit({ createdAt: true }),
  }),
});

export type SignupInput = z.infer<typeof signupInputSchema>;
export type SignupResponse = z.infer<typeof signupResponseSchema>;

export const usersListSchema = baseAPIResponseSchema.extend({
  data: z.array(userSchema).optional(),
  meta: z.object({
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type UsersList = z.infer<typeof usersListSchema>;
export type User = z.infer<typeof userSchema>;

export const jwtUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  role: z.enum(["admin", "student", "superadmin"]),
  email: z.email(),
  imageUrl: z.url().optional(),
});

export type JWTUser = z.infer<typeof jwtUserSchema>;
