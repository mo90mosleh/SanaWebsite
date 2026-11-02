import type { Page } from "@playwright/test";
export async function logoutFromPanel(page: Page) {
  const shortcut = page.locator(".logout-header");
  if (await shortcut.isVisible()) await shortcut.click();
  else {
    await page.locator(".panel-header .account-trigger").click();
    await page
      .getByRole("button", { name: "خروج از حساب", exact: true })
      .click();
  }
}
export async function switchToAdmin(page: Page) {
  await logoutFromPanel(page);
  await page.getByRole("button", { name: "ورود مدیر", exact: true }).click();
}
