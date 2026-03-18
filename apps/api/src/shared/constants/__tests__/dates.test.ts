import { describe, it, expect } from "bun:test";
import {
  fifteenMinutes,
  twentyFourHours,
  thirtyDays,
  fifteenMinutesFromNow,
  thirtyDaysFromNow,
} from "../dates";

describe("Date Constants and Generators", () => {
  it("should return the correct number of milliseconds for durations", () => {
    // 15 mins = 15 * 60 * 1000 = 900,000
    expect(fifteenMinutes()).toBe(900000);
    // 24 hours = 24 * 60 * 60 * 1000 = 86,400,000
    expect(twentyFourHours()).toBe(86400000);
    // 30 days = 30 * 24 * 60 * 60 * 1000 = 2,592,000,000
    expect(thirtyDays()).toBe(2592000000);
  });

  it("should return a future date for fifteenMinutesFromNow", () => {
    const now = new Date();
    const future = fifteenMinutesFromNow();
    expect(future).toBeInstanceOf(Date);

    const diff = future.getTime() - now.getTime();
    // Allow slight execution delay buffer
    expect(diff).toBeGreaterThan(899000);
    expect(diff).toBeLessThanOrEqual(901000);
  });

  it("should return a future date for thirtyDaysFromNow", () => {
    const now = new Date();
    const future = thirtyDaysFromNow();
    expect(future).toBeInstanceOf(Date);

    const diff = future.getTime() - now.getTime();
    expect(diff).toBeGreaterThan(2591000000);
    expect(diff).toBeLessThanOrEqual(2593000000);
  });
});
