import { z } from "zod";

// Environment Variables Schema
const envSchema = z.object({
  NODE_ENV: z.string().prefault("development"),
  PORT: z.coerce.number().int().prefault(8080),
  APP_ORIGIN: z.url().prefault("http://localhost:3000"),
});

// Validate environment variables against the schema
const { success, error, data } = envSchema.safeParse(process.env);
if (!success) {
  console.error(
    "Invalid/Missing environment variables",
    z.flattenError(error).fieldErrors,
  );
  process.exit(1);
}

export const { NODE_ENV, PORT, APP_ORIGIN } = data;
