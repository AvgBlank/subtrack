import { test, expect } from "@playwright/test";
import crypto from 'crypto';

test.describe("One-Time Transactions E2E", () => {
  test.beforeEach(async ({ page }) => {
    const freshEmail = `test-${crypto.randomUUID()}@example.com`;
    await page.goto("/auth/register");
    await page.fill('input[type="text"]', "OT E2E User");
    await page.fill('input[type="email"]', freshEmail);
    await page.fill('input[type="password"]', "Password123!");
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL("**/dashboard");
    await page.goto("/dashboard/one-time");
  });

  test("should create, edit, and delete a one-time transaction", async ({
    page,
  }) => {
    // Create
    await page.getByRole("button", { name: /^Add Expense$/i }).click();

    await page.getByLabel(/name/i).fill("Groceries Target");
    await page.getByLabel(/amount/i).fill("120");

    // Category dropdown
    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option", { name: /food/i }).click();

    await page.getByRole("button", { name: /^add$|^update$/i }).click();

    // Verify created
    const row = page.locator("tr").filter({ hasText: "Groceries Target" });
    await expect(row).toBeVisible();

    // Edit
    await row.getByRole("button", { name: /^Edit Groceries Target$/i }).click();

    await page.getByLabel(/amount/i).fill("150");
    await page.getByRole("button", { name: /^update$/i }).click();

    await expect(row.getByText("₹150.00")).toBeVisible();

    // Delete
    await row.getByRole("button", { name: /^Edit Groceries Target$/i }).click();
    await page.getByRole("button", { name: /^Delete$/i }).click();
    await page.getByRole("button", { name: /^Yes, delete$/i }).click();

    await expect(page.getByText("Groceries Target").first()).not.toBeVisible();
  });
});
