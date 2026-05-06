import { Decimal } from "@prisma/client/runtime/client";

/**
 * Normalizes a transaction amount to its monthly equivalent based on frequency.
 */
export const normalizeToMonthly = (
  amount: Decimal,
  frequency: string,
): number => {
  if (frequency === "DAILY") {
    return amount.mul(365).div(12).toNumber();
  } else if (frequency === "WEEKLY") {
    return amount.mul(52).div(12).toNumber();
  } else if (frequency === "YEARLY") {
    return amount.div(12).toNumber();
  }
  return amount.toNumber();
};
