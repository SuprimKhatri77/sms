import z from "zod";

// primaryHeadId is only ever set on a root group. effectivePrimaryHead* is
// the head that actually applies: a root's own, or the one a sub-group
// inherits from its root.
const accountGroupSchema = z.object({
  id: z.uuid(),
  parentId: z.uuid().nullable(),
  primaryHeadId: z.uuid().nullable(),
  name: z.string(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.string(),
  effectivePrimaryHeadId: z.uuid().nullable(),
  effectivePrimaryHeadName: z.string().nullable(),
});

export type AccountGroup = z.infer<typeof accountGroupSchema>;

export const getAccountGroupsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(accountGroupSchema),
});

export type GetAccountGroupsResponse = z.infer<
  typeof getAccountGroupsResponseSchema
>;

// Empty strings mean "not set"; the backend stores them as NULL. A sub-group
// (parentId set) can't carry its own primary head.
export const accountGroupInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100),
    code: z.string().trim().max(20, "Code cannot exceed 20 characters"),
    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters"),
    parentId: z.uuid().or(z.literal("")),
    primaryHeadId: z.uuid().or(z.literal("")),
  })
  .refine((v) => v.parentId === "" || v.primaryHeadId === "", {
    path: ["primaryHeadId"],
    message: "Sub-groups inherit the primary head from their parent group",
  });

export type AccountGroupInput = z.infer<typeof accountGroupInputSchema>;

export const createAccountGroupResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: accountGroupSchema.omit({
    effectivePrimaryHeadId: true,
    effectivePrimaryHeadName: true,
  }),
});

export type CreateAccountGroupResponse = z.infer<
  typeof createAccountGroupResponseSchema
>;

export const updateAccountGroupResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type UpdateAccountGroupResponse = z.infer<
  typeof updateAccountGroupResponseSchema
>;

export const deleteAccountGroupResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type DeleteAccountGroupResponse = z.infer<
  typeof deleteAccountGroupResponseSchema
>;
