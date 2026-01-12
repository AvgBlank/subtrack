import { z } from "zod";

export const createOneTimeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
});

export const createOneTimeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
});

export const updateOneTimeSchema = createOneTimeSchema.partial();

export type CreateOneTimeSchema = z.infer<typeof createOneTimeSchema>;
export type UpdateOneTimeSchema = z.infer<typeof updateOneTimeSchema>;
