import { z } from "zod";

export const createSavingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.coerce.number().positive("Target amount must be greater than 0"),
  targetDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Target date must be in the future",
  }),
  currentAmount: z.coerce.number().min(0, "Current amount cannot be negative").default(0),
}).refine((data) => data.targetAmount > data.currentAmount, {
  message: "Target amount must be greater than current amount",
  path: ["targetAmount"],
});

export const createSavingsGoalFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  targetDate: z.string().min(1, "Target date is required").refine(
    (dateStr) => new Date(dateStr) > new Date(),
    { message: "Target date must be in the future" }
  ),
  currentAmount: z.number().min(0, "Current amount cannot be negative"),
});

export const updateSavingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  targetAmount: z.coerce.number().positive("Target amount must be greater than 0").optional(),
  targetDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Target date must be in the future",
  }).optional(),
  currentAmount: z.coerce.number().min(0, "Current amount cannot be negative").optional(),
});

export type CreateSavingsGoalSchema = z.infer<typeof createSavingsGoalSchema>;
export type UpdateSavingsGoalSchema = z.infer<typeof updateSavingsGoalSchema>;
