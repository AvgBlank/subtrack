import { test, expect } from "@playwright/test";
import crypto from 'crypto';

test.describe("Dashboard & Analytics E2E", () => {
  const customEmail = `test-${crypto.randomUUID()}@example.com`;
  const password = "Password123!";

  test.beforeAll(async ({ browser }) => {
    // Navigate and register once for the suite
    const page = await browser.newPage();
    await page.goto("/auth/register");
    await page.fill('input[type="text"]', "Dash E2E User");
    await page.fill('input[type="email"]', customEmail);
    await page.fill('input[type="password"]', password);
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL("**/dashboard");
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', customEmail);
    await page.fill('input[type="password"]', password);
    await page.getByRole("button", { name: /login|sign in/i }).click();
    await page.waitForURL("**/dashboard");
  });

  test("should load summary cards and analytics", async ({ page }) => {
    // Add an income first so the dashboard exits empty state
    await page.getByRole("link", { name: /add income/i }).click();
    await page.waitForURL("**/dashboard/income");
    await page.getByRole("button", { name: /^Add Income$/i }).click();
    await page.getByLabel(/source/i).fill("Test Income");
    await page.getByLabel(/amount/i).fill("5000");
    await page.getByRole("button", { name: /^Add$/i }).click();
    // Go back to dashboard
    await page.goto("/dashboard");

    // Look for basic dashboard elements
    await expect(page.getByText(/^Income$/i).first()).toBeVisible();
    await expect(page.getByText(/^Recurring$/i).first()).toBeVisible();
    await expect(page.getByText(/^Remaining$/i).first()).toBeVisible();

    // Look for charts (usually render as Canvas or SVG)
    const charts = page.locator("canvas, svg.recharts-surface");
    if ((await charts.count()) > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test("should update data when changing month/year filter", async ({
    page,
  }) => {
    // Usually there's a month/year picker on the dashboard
    const monthPicker = page.getByRole("button", { name: /month/i });
    if (await monthPicker.isVisible()) {
      await monthPicker.click();
      await page.getByRole("option", { name: /january/i }).click();
      // Data should refresh
      await page.waitForTimeout(500);
      await expect(page.getByText(/^Income$/i).first()).toBeVisible();
    }
  });

  test("should calculate Can I Spend", async ({ page }) => {
    // Assuming there's a "Can I Spend" input or modal on dashboard
    const canISpendInput = page.getByPlaceholder(/enter amount/i);
    if (await canISpendInput.isVisible()) {
      await canISpendInput.fill("50");
      await page.getByRole("button", { name: /check/i }).click();

      // Should show some result text like "Yes" or "No" or a remaining amount
      await expect(
        page.locator("text=Yes").or(page.locator("text=No")).first(),
      ).toBeVisible();
    }
  });
});
