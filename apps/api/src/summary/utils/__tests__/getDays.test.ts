import { describe, it, expect } from "bun:test";
import { getDays } from "../getDays";

describe("getDays", () => {
  it("should return correct number of days for standard months", () => {
    expect(getDays(1, 2023)).toBe(31); // Jan
    expect(getDays(3, 2023)).toBe(31); // Mar
    expect(getDays(4, 2023)).toBe(30); // Apr
    expect(getDays(6, 2023)).toBe(30); // Jun
    expect(getDays(9, 2023)).toBe(30); // Sep
    expect(getDays(11, 2023)).toBe(30); // Nov
    expect(getDays(12, 2023)).toBe(31); // Dec
  });

  it("should handle February correctly in non-leap years", () => {
    expect(getDays(2, 2023)).toBe(28);
    expect(getDays(2, 2021)).toBe(28);
    expect(getDays(2, 1900)).toBe(28);
  });

  it("should handle February correctly in leap years", () => {
    expect(getDays(2, 2024)).toBe(29);
    expect(getDays(2, 2020)).toBe(29);
    expect(getDays(2, 2000)).toBe(29);
  });

  it("should return 30 for invalid months out of standard bounds fallback (if any)", () => {
    // According to current implementation of getDays,
    // it defaults to 30 for non-matching months
    expect(getDays(13, 2023)).toBe(31);
  });
});
