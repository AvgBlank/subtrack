import { z } from "zod";

export const createIncomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.coerce.date(),
});

export const createIncomeFormSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const toggleIncomeSchema = z.object({
  isActive: z.boolean(),
});

export type CreateIncomeSchema = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeSchema = z.infer<typeof updateIncomeSchema>;
export type ToggleIncomeSchema = z.infer<typeof toggleIncomeSchema>;
