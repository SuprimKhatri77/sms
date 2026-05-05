import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  NEXT_PUBLIC_API_URL: z.url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fieldErros = z.treeifyError(parsed.error).properties;
  console.error("Invalid environment variables");
  console.error("field errors: ", fieldErros);
  process.exit(1);
}

export const env = parsed.data;
