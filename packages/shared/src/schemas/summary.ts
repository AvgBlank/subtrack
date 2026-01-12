import { z } from "zod";

export const recurringSummarySchema = () => {
  const currMonth = new Date().getMonth() + 1;
  const currYear = new Date().getFullYear();

  return z.object({
    month: z.coerce.number().min(1).max(12).prefault(currMonth),
    year: z.coerce.number().min(2000).max(currYear).prefault(currYear),
  });
};

export const canISpendSchema = z.object({
  amount: z.coerce.number().min(0),
});
