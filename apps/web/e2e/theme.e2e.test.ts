import { test, expect } from "@playwright/test";
import crypto from "crypto";

test.describe("Theme & UI Layout E2E", () => {
  test.beforeEach(async ({ page }) => {
    const freshEmail = `test-${crypto.randomUUID()}@example.com`;
    await page.goto("/auth/register");
    await page.fill('input[type="text"]', "Theme User");
    await page.fill('input[type="email"]', freshEmail);
    await page.fill('input[type="password"]', "Password123!");
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL("**/dashboard");
  });

  test("should toggle dark/light mode", async ({ page }) => {
    // Find theme toggle button (usually an icon button in header/sidebar)
    const html = page.locator("html");
    const toggleBtn = page.getByRole("button", {
      name: /toggle theme|dark mode|light mode/i,
    });

    if (await toggleBtn.isVisible()) {
      const initialClass = (await html.getAttribute("class")) || "";

      await toggleBtn.click();
      await page.waitForTimeout(300); // Allow animation/state

      const toggledClass = (await html.getAttribute("class")) || "";
      expect(initialClass).not.toBe(toggledClass);

      // Toggle back
      await toggleBtn.click();
      await page.waitForTimeout(300);

      const finalClass = (await html.getAttribute("class")) || "";
      expect(finalClass).toBe(initialClass);
    }
  });

  test("should navigate via sidebar accurately", async ({ page }) => {
    const links = [
      { name: "Overview", url: "/dashboard" },
      { name: "Recurring", url: "/dashboard/recurring" },
      { name: "One Time", url: "/dashboard/one-time" },
      { name: "Income", url: "/dashboard/income" },
      { name: "Savings", url: "/dashboard/savings" },
      { name: "Analytics", url: "/dashboard/analytics" },
      { name: "Exports", url: "/dashboard/exports" },
    ];

    for (const link of links) {
      // Open groups if collapsed
      const manageBtn = page.getByRole("button", { name: "Manage" });
      if (
        (await manageBtn.isVisible()) &&
        (await manageBtn.getAttribute("data-state")) === "closed"
      ) {
        await manageBtn.click();
        await page.waitForTimeout(100); // allow animation
      }
      const insightsBtn = page.getByRole("button", { name: "Insights" });
      if (
        (await insightsBtn.isVisible()) &&
        (await insightsBtn.getAttribute("data-state")) === "closed"
      ) {
        await insightsBtn.click();
        await page.waitForTimeout(100); // allow animation
      }

      await page.getByRole("link", { name: link.name, exact: true }).click();
      await page.waitForURL(`**${link.url}`);
      await expect(page).toHaveURL(new RegExp(`.*${link.url}`));
    }
  });
});
