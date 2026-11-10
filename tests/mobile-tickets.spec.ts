import { test, expect } from "@playwright/test";
import { switchToAdmin } from "./helpers";

test("ticket device selection, numbered history, expandable replies and two-way status survive reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page
    .getByRole("navigation", { name: "ناوبری موبایل" })
    .getByRole("link", { name: "پشتیبانی", exact: true })
    .click();
  await expect(page.locator(".ticket-conversation")).toHaveCount(0);
  await page.getByRole("button", { name: "تیکت جدید", exact: true }).click();
  const devices = page.getByLabel("دستگاه خریداری‌شده", { exact: true });
  await expect(devices.locator("option")).toHaveCount(3);
  await expect(devices).not.toContainText("FS-205");
  await devices.selectOption("d2");
  await page.getByLabel("موضوع", { exact: true }).fill("بررسی دستگاه BHA3000");
  await page
    .getByLabel("پیام شما")
    .fill("لطفاً برای کنترل کیفیت راهنمایی کنید.");
  await page.getByRole("button", { name: "ارسال تیکت", exact: true }).click();
  const row = page
    .locator(".ticket-table tbody tr")
    .filter({ hasText: "بررسی دستگاه BHA3000" });
  await expect(row).toContainText("SANA-T-1002");
  await expect(row).toContainText("BHA3000");
  await expect(row.locator("time")).toHaveAttribute("datetime", /T/);
  await expect(row.locator(".ticket-status")).toHaveText("در حال بررسی");
  await expect(page.locator(".ticket-conversation")).toContainText(
    "DEMO-BHA3000-002",
  );
  await page.reload();
  await expect(page.locator(".ticket-conversation")).toHaveCount(0);
  await page
    .getByRole("button", { name: "مشاهده تیکت SANA-T-1002", exact: true })
    .click();
  await expect(page.getByLabel("پیام‌های تیکت")).toContainText("کنترل کیفیت");
  await switchToAdmin(page);
  await page.goto("/#/admin/tickets");
  await page
    .getByRole("button", { name: "مشاهده تیکت SANA-T-1002", exact: true })
    .click();
  await page
    .getByLabel("پاسخ", { exact: true })
    .fill("پاسخ تیم پشتیبانی برای دستگاه انتخاب‌شده");
  await page.getByRole("button", { name: "ثبت پاسخ", exact: true }).click();
  await expect(page.locator(".ticket-conversation .ticket-status")).toHaveText(
    "پاسخ داده شده",
  );
  await page.getByRole("button", { name: "نمای مشتری", exact: true }).click();
  await page.goto("/#/customer/tickets");
  await page
    .getByRole("button", { name: "مشاهده تیکت SANA-T-1002", exact: true })
    .click();
  await expect(page.getByLabel("پیام‌های تیکت")).toContainText(
    "پاسخ تیم پشتیبانی",
  );
  await page.getByLabel("پاسخ", { exact: true }).fill("اطلاعات تکمیلی مشتری");
  await page.getByRole("button", { name: "ثبت پاسخ", exact: true }).click();
  await expect(page.locator(".ticket-conversation .ticket-status")).toHaveText(
    "در حال بررسی",
  );
  await expect(page.locator(".ticket-conversation")).toContainText(
    "SANA-T-1002",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("mobile navigation, drawer focus, catalog columns and cart shortcut work across phone and tablet sizes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  const bottom = page.getByRole("navigation", {
    name: "ناوبری موبایل",
    exact: true,
  });
  await expect(bottom).toBeVisible();
  await expect(page.locator(".sidebar")).toBeHidden();
  await page
    .getByRole("button", { name: "باز کردن منوی پنل", exact: true })
    .click();
  const drawer = page.getByRole("dialog", { name: "منوی پنل", exact: true });
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "باز کردن منوی پنل", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "باز کردن منوی پنل", exact: true })
    .click();
  await drawer
    .getByRole("link", { name: "دستگاه‌های من", exact: true })
    .click();
  await expect(drawer).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "دستگاه‌های من", exact: true }),
  ).toBeVisible();
  await bottom.getByRole("link", { name: "مصرفی‌ها", exact: true }).click();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(bottom).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "viewport " + width,
    ).toBe(true);
    const cards = page.locator("article.supply");
    const a = await cards.nth(0).boundingBox(),
      b = await cards.nth(1).boundingBox();
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .first()
    .click();
  await expect(page.locator(".mobile-cart-summary")).toBeVisible();
  await page.locator(".mobile-cart-summary").click();
  await expect(
    page.getByRole("heading", { name: "سبد خرید و تسویه", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".cart-table")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(bottom).toBeHidden();
  await expect(page.locator(".sidebar")).toBeVisible();
});
