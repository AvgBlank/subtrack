import { z } from "zod";

export const typeEnum = z.enum(["BILL", "SUBSCRIPTION"]);
export const frequencyEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

export const createRecurringSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: typeEnum,
  category: z.string().min(1, "Category is required"),
  frequency: frequencyEnum,
  startDate: z.coerce.date().refine((date) => date <= new Date(), {
    message: "Start date cannot be in the future",
  }),
});

export const updateRecurringSchema = createRecurringSchema.partial();

export const toggleRecurringSchema = z.object({
  isActive: z.boolean(),
});

export type CreateRecurringSchema = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringSchema = z.infer<typeof updateRecurringSchema>;
export type ToggleRecurringSchema = z.infer<typeof toggleRecurringSchema>;
export type RecurringType = z.infer<typeof typeEnum>;
export type RecurringFrequency = z.infer<typeof frequencyEnum>;
