import z from "zod";
import { baseAPIResponseSchema } from "./base";

export const coursesList = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),

    data: z.array(
      z.object({ id: z.uuid(), name: z.string(), fee: z.number() }),
    ),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type CoursesList = z.infer<typeof coursesList>;
