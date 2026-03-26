import { test, expect } from "@playwright/test";
import crypto from "crypto";

test.describe("Income E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Instead of beforeAll, we can just do inline registration for simplicity
    const freshEmail = `test-${crypto.randomUUID()}@example.com`;
    await page.goto("/auth/register");
    await page.fill('input[type="text"]', "Income E2E User");
    await page.fill('input[type="email"]', freshEmail);
    await page.fill('input[type="password"]', "Password123!");
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL("**/dashboard");
    await page.goto("/dashboard/income");
  });

  test("should create, edit, and delete an income source", async ({ page }) => {
    // Create
    await page.getByRole("button", { name: /^Add Income$/i }).click();

    await page.getByLabel(/source/i).fill("Main Job");
    await page.getByLabel(/amount/i).fill("5000");
    // Assume date defaults to today or is auto-filled
    await page.getByRole("button", { name: /^add$|^update$/i }).click();

    // Verify created
    const row = page.locator("tr").filter({ hasText: "Main Job" });
    await expect(row).toBeVisible();
    await expect(row.getByText("₹5,000.00")).toBeVisible();

    // Edit
    await row.getByRole("button", { name: /^Edit Main Job$/i }).click();

    await page.getByLabel(/amount/i).fill("6000");
    await page.getByRole("button", { name: /^update$/i }).click();

    await expect(row.getByText("₹6,000.00")).toBeVisible();

    // Delete
    await row.getByRole("button", { name: /^Edit Main Job$/i }).click();
    await page.getByRole("button", { name: /^Delete$/i }).click();
    await page.getByRole("button", { name: /^Yes, delete$/i }).click();

    await expect(page.getByText("Main Job").first()).not.toBeVisible();
  });
});
