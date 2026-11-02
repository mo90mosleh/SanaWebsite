import type { Page } from "@playwright/test";
export async function switchToAdmin(page: Page) {
  await page.locator(".logout-header").click();
  await page.getByRole("button", { name: "ورود مدیر", exact: true }).click();
}
