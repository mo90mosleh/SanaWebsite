import { test, expect } from "@playwright/test";

test("three product categories lead to real catalogs and the guest cart returns to checkout after login", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".sana-product-categories > a")).toHaveCount(3);
  await expect(page.locator(".portal-banner")).toHaveCount(0);
  await page
    .getByRole("link", { name: "سبد خرید؛ ورود به حساب", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/customer\/cart$/);
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "سبد خرید و تسویه", exact: true }),
  ).toBeVisible();
  await page.goto("/#/");
  await page
    .locator('.sana-category-card[href="#/devices?category=CBC"]')
    .click();
  await expect(page.locator(".device-tile")).toHaveCount(3);
  await page
    .locator(".sana-category-tabs")
    .getByRole("link", { name: "دستگاه‌های POCT", exact: true })
    .click();
  await expect(page.locator(".device-tile")).toHaveCount(2);
  await page.goto("/#/consumables");
  await page.getByLabel("جست‌وجوی کیت", { exact: true }).fill("W201");
  await expect(page.locator(".sana-consumable-grid > article")).toHaveCount(1);
  await expect(page.locator(".sana-consumable-grid")).toContainText("CRP");
});

test("all five models, slide links, arrows, pause and reduced motion remain usable", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  const carousel = page.getByLabel("اسلایدر دستگاه‌های سانا");
  await page.clock.runFor(5600);
  await expect(
    carousel.getByRole("button", { name: "نمایش BHA5000", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await carousel
    .getByRole("button", { name: "توقف پخش خودکار اسلایدر", exact: true })
    .click();
  await page.clock.runFor(12000);
  await expect(
    carousel.getByRole("button", { name: "نمایش BHA5000", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  for (const [id, model] of [
    ["bha5100", "BHA5100"],
    ["bha5000", "BHA5000"],
    ["bha3000", "BHA3000"],
    ["fs-205", "FS-205"],
    ["fs-114", "FS-114"],
  ]) {
    await carousel
      .getByRole("button", { name: "نمایش " + model, exact: true })
      .click();
    await expect(carousel.locator("h1")).toHaveText(model);
    await expect(carousel.locator(".hero-slide")).toHaveAttribute(
      "href",
      "#/devices/" + id,
    );
    await expect(
      carousel.getByRole("link", { name: "مشاهده محصول", exact: true }),
    ).toHaveAttribute("href", "#/devices/" + id);
  }
  await carousel
    .getByRole("button", { name: "دستگاه بعدی", exact: true })
    .click();
  await expect(carousel.locator("h1")).toHaveText("BHA5100");
  await carousel
    .getByRole("button", { name: "دستگاه قبلی", exact: true })
    .click();
  await expect(carousel.locator("h1")).toHaveText("FS-114");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(carousel.locator(".sana-hero-inner")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("public pages fit phones, tablets and desktop and preserve a visible mobile logo and navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/devices",
      "/devices/bha3000",
      "/consumables",
      "/services",
      "/contact",
      "/login",
    ]) {
      await page.goto("/#" + route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}`,
      ).toBe(true);
      await expect(page.locator(".sana-header .logo")).toBeVisible();
    }
    if (width <= 1024) {
      await page
        .getByRole("button", { name: "باز کردن منوی اصلی", exact: true })
        .click();
      await expect(
        page.getByRole("navigation", { name: "ناوبری اصلی", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "باز کردن منوی اصلی", exact: true }),
      ).toBeFocused();
    }
  }
});
