import z from "zod";
import { baseAPIResponseSchema } from "./base";

export const imageUploadResponse = baseAPIResponseSchema.extend({
  data: z.object({
    imageUrl: z.url(),
    imagePublicID: z.string(),
  }),
});

export type ImageUploadResponse = z.infer<typeof imageUploadResponse>;
