import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(3, "Name must contain at least 3 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string("Password must a string")
    .min(6, "Password must contain at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

export const loginSchema = z.object({
  email: z.string("Email must be a string"),
  password: z.string("Password must be a string"),
});

export const oAuthSchema = z.object({
  code: z.string("Code must be a string"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
