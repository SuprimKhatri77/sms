import z from "zod";
import { baseAPIResponseSchema } from "./base";

export const coursesList = baseAPIResponseSchema.extend({
  data: z
    .array(z.object({ id: z.uuid(), name: z.string(), fee: z.number() }))
    .optional(),
});

export type CoursesList = z.infer<typeof coursesList>;
