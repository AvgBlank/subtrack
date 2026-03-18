import { test, expect } from "@playwright/test";
import crypto from 'crypto';

test.describe("Recurring Transactions E2E", () => {
  const customEmail = `test-${crypto.randomUUID()}@example.com`;
  const password = "Password123!";

  test.beforeAll(async ({ browser }) => {
    // We register a user just for this specific suite to run isolated
    const page = await browser.newPage();
    await page.goto("/auth/register");
    await page.fill('input[type="text"]', "Recurring E2E User");
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
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await page.waitForURL("**/dashboard");
    await page.goto("/dashboard/recurring");
  });

  test("should create, edit, and delete a recurring subscription", async ({
    page,
  }) => {
    // Create
    await page.getByRole("button", { name: /^Add Recurring$/i }).click();

    // Fill Add Dialog Form
    await page.getByLabel(/name/i).fill("Spotify Subscription");
    await page.getByLabel(/amount/i).fill("10.99");

    // Select dropdowns
    await page.getByRole("combobox", { name: /type/i }).click();
    await page.getByRole("option", { name: /subscription/i }).click();

    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option", { name: /entertainment/i }).click();

    await page.getByRole("combobox", { name: /frequency/i }).click();
    await page.getByRole("option", { name: /monthly/i }).click();

    await page.getByRole("button", { name: /^add$|^update$/i }).click();

    // Navigate to Subscriptions view explicitly (it defaults to BILL, so creating a subscription means we have to switch to see it)
    // The tabs only appear AFTER the first transaction is created
    await page.getByRole("button", { name: /subscriptions/i }).click();

    // Verify created
    const row = page.locator("tr").filter({ hasText: "Spotify Subscription" });
    await expect(row).toBeVisible();
    await expect(row.getByText("₹10.99").first()).toBeVisible();

    // Edit (Assume row actions dropdown)
    await row.getByRole("button", { name: /^Edit Spotify Subscription$/i }).click();

    await page.getByLabel(/amount/i).fill("12.99");
    await page.getByRole("button", { name: /^update$/i }).click();

    await expect(row.getByText("₹12.99").first()).toBeVisible();

    // Delete
    await row.getByRole("button", { name: /^Edit Spotify Subscription$/i }).click();
    await page.getByRole("button", { name: /^Delete$/i }).click();
    
    // Confirm delete dialog
    await page.getByRole("button", { name: /^Yes, delete$/i }).click();

    await expect(page.getByText("Spotify Subscription").first()).not.toBeVisible();
  });

  test("should create, edit, and delete a recurring bill", async ({
    page,
  }) => {
    // Create
    await page.getByRole("button", { name: /^Add Recurring$/i }).click();

    // Fill Add Dialog Form
    await page.getByLabel(/name/i).fill("Electric Bill");
    await page.getByLabel(/amount/i).fill("120.00");

    // Select dropdowns
    await page.getByRole("combobox", { name: /type/i }).click();
    await page.getByRole("option", { name: /^bill$/i }).click();

    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option", { name: /utilities/i }).click();

    await page.getByRole("combobox", { name: /frequency/i }).click();
    await page.getByRole("option", { name: /monthly/i }).click();

    await page.getByRole("button", { name: /^add$|^update$/i }).click();

    // Navigate to Bills view explicitly (it defaults to BILL, but good to be explicit)
    // The tabs only appear AFTER the first transaction is created
    await page.getByRole("button", { name: /^bills/i }).click();

    // Verify created
    const row = page.locator("tr").filter({ hasText: "Electric Bill" });
    await expect(row).toBeVisible();
    await expect(row.getByText("₹120.00").first()).toBeVisible();

    // Edit
    await row.getByRole("button", { name: /^Edit Electric Bill$/i }).click();

    await page.getByLabel(/amount/i).fill("140.00");
    await page.getByRole("button", { name: /^update$/i }).click();

    await expect(row.getByText("₹140.00").first()).toBeVisible();

    // Delete
    await row.getByRole("button", { name: /^Edit Electric Bill$/i }).click();
    await page.getByRole("button", { name: /^Delete$/i }).click();
    
    // Confirm delete dialog
    await page.getByRole("button", { name: /^Yes, delete$/i }).click();

    await expect(page.getByText("Electric Bill").first()).not.toBeVisible();
  });
});
