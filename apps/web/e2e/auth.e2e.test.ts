import { test, expect } from "@playwright/test";
import crypto from 'crypto';

test.describe.serial("Authentication Flow", () => {
  const customEmail = `testuser_${crypto.randomUUID()}@example.com`;
  const password = "Password123!";

  test("should register a new user successfully", async ({ page }) => {
    await page.goto("/");

    const signUpLink = page.getByRole("link", { name: /sign up/i });
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
    } else {
      await page.goto("/auth/register");
    }

    await page.waitForURL("**/auth/register");

    await page.fill('input[placeholder="John Doe"]', "Test E2E User");
    await page.fill('input[type="email"]', customEmail);
    // Usually there are two password fields in standard setups, handling if required
    await page.fill('input[type="password"]', password);

    await page.getByRole("button", { name: /create account/i }).click();

    // Verify it redirects to dashboard after successful registration
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  });

  test("should logout and login successfully", async ({ page }) => {
    // Navigate to login
    await page.goto("/auth/login");

    await page.fill('input[type="email"]', customEmail);
    await page.fill('input[type="password"]', password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Verify redirect
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Click profile and logout
    await page.getByRole("button", { name: /Test E2E User/i }).click();
    await page.getByText(/log out/i).click();

    // Verify redirect to landing or login
    await page.waitForTimeout(1000); // Allow react state to clear
    await expect(page).not.toHaveURL(/.*\/dashboard/);
  });

  test("should restrict access to protected routes", async ({ page }) => {
    await page.goto("/dashboard");

    // Unauthenticated user is redirected to /login
    await page.waitForURL("**/auth/login");
    await expect(page).toHaveURL(/.*\/login/);
  });
});
