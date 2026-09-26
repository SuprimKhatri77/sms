import z, { number } from "zod";

export const getStudentDiscountsResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      data: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          note: z.string(),
          amount: z.number(),
          percent: z.number(),
          mode: z.enum(["percent", "amount"]),
          createdAt: z.string(),
        }),
      ),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
      code: z.string(),
    }),
  ],
);

export type GetStudentDiscountsResponse = z.infer<
  typeof getStudentDiscountsResponseSchema
>;
