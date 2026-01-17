import { z } from "zod";

// Environment Variables Schema
const envSchema = z.object({
  NODE_ENV: z.string().prefault("development"),
  PORT: z.coerce.number().int().prefault(8080),
  APP_ORIGIN: z.url().prefault("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().min(1),
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

export const {
  NODE_ENV,
  PORT,
  APP_ORIGIN,
  DATABASE_URL,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,

  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = data;
