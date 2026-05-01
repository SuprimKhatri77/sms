import z from "zod";
import { apiErrorSchema, baseAPIResponseSchema, errorResponse } from "./base";
import { meta } from "zod/v4/core";

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(50),
});

export const loginResponse = apiErrorSchema;

export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginResponse = z.infer<typeof loginResponse>;

// user types
export const userSchema = z.object({
  name: z.string(),
  role: z.enum(["user", "admin", "superadmin"]),
  email: z.email(),
  id: z.uuid(),
  imageUrl: z.url().optional(),
  createdAt: z.date(),
});

export const usersListSchema = baseAPIResponseSchema.extend({
  data: z.array(userSchema).optional(),
  meta: z.object({
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type UsersList = z.infer<typeof usersListSchema>;
export type User = z.infer<typeof userSchema>;
