import { test, expect } from "@playwright/test";
import crypto from 'crypto';

test.describe("Data Export E2E", () => {
  test.beforeEach(async ({ page }) => {
    const freshEmail = `test-${crypto.randomUUID()}@example.com`;
    await page.goto("/auth/register");
    await page.fill('input[type="text"]', "Export E2E User");
    await page.fill('input[type="email"]', freshEmail);
    await page.fill('input[type="password"]', "Password123!");
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL("**/dashboard");

    // Create some data so export doesn't fail with 400 No Data
    await page.goto("/dashboard/income");
    await page.getByRole("button", { name: /^Add Income$/i }).click();
    await page.getByLabel(/source/i).fill("Test Income");
    await page.getByLabel(/amount/i).fill("500");
    await page.getByRole("button", { name: /^add$|^update$/i }).click();
    await expect(page.getByText("Test Income")).toBeVisible();

    await page.goto("/dashboard/exports");
  });

  test("should export CSV data successfully", async ({ page }) => {
    // Select type
    await page.getByRole("radio", { name: /^Income$/i }).click();

    // Select format
    await page.getByRole("radio", { name: /^CSV$/i }).click();

    // Wait for the download event
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /^Export Data$/i }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("should export full XLSX data successfully", async ({ page }) => {
    await page.getByRole("radio", { name: /^Full Export$/i }).click();
    await page.getByRole("radio", { name: /excel/i }).click();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /^Export Data$/i }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(".xlsx");
  });
});
