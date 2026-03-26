import { test, expect } from "@playwright/test";
import crypto from "crypto";

test.describe("Savings Goals E2E", () => {
  test.beforeEach(async ({ page }) => {
    const freshEmail = `test-${crypto.randomUUID()}@example.com`;
    await page.goto("/auth/register");
    await page.fill('input[type="text"]', "Savings E2E User");
    await page.fill('input[type="email"]', freshEmail);
    await page.fill('input[type="password"]', "Password123!");
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL("**/dashboard");
    await page.goto("/dashboard/savings");
  });

  test("should create, edit, and delete a savings goal", async ({ page }) => {
    // Create
    await page.getByRole("button", { name: /^Add Goal$/i }).click();

    await page.getByLabel(/name/i).fill("Vacation Fund");
    await page.getByLabel(/target amount/i).fill("5000");
    await page.getByLabel(/current amount/i).fill("1000");

    // Select date for next year (using fill on native date input)
    await page.getByLabel(/target date/i).fill("2026-12-31");

    await page.getByRole("button", { name: /^create$|^update$/i }).click();

    // Verify created
    const card = page
      .locator("div")
      .filter({ hasText: "Vacation Fund" })
      .first();
    await expect(card).toBeVisible();

    // Edit
    await card.getByRole("button", { name: /^Edit$/i }).click();

    await page.getByLabel(/current amount/i).fill("2000");
    await page.getByRole("button", { name: /^update$/i }).click();

    await expect(card.getByText("₹2,000.00")).toBeVisible();

    // Delete
    await card.getByRole("button", { name: /^Delete$/i }).click();

    // Confirm delete in the dialog
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /^Delete$/i })
      .click();

    await expect(
      page.getByRole("heading", { name: "Vacation Fund" }),
    ).not.toBeVisible();
  });
});
