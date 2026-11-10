import { switchToAdmin } from "./helpers";
import { test, expect } from "@playwright/test";
test("hero auto-slides, pauses, supports manual navigation and manufacturer groups", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  const carousel = page.getByLabel("اسلایدر دستگاه‌های سانا");
  await expect(
    carousel.getByRole("button", { name: "نمایش BHA5100", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await page.clock.runFor(5600);
  await expect(
    carousel.getByRole("button", { name: "نمایش BHA5000", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await carousel
    .getByRole("button", { name: "توقف پخش خودکار اسلایدر" })
    .click();
  await page.clock.runFor(12000);
  await expect(
    carousel.getByRole("button", { name: "نمایش BHA5000", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await carousel
    .getByRole("button", { name: "نمایش BHA5000", exact: true })
    .click();
  await expect(
    carousel.getByRole("link", { name: "مشخصات GETEIN BHA5000", exact: true }),
  ).toBeVisible();
  await page.goto("/#/devices");
  await expect(
    page
      .getByRole("region", { name: "دستگاه‌های CBC" })
      .locator(".device-tile"),
  ).toHaveCount(3);
  await expect(
    page
      .getByRole("region", { name: "دستگاه‌های POCT" })
      .locator(".device-tile"),
  ).toHaveCount(2);
  await expect(page.locator(".device-tile .manufacturer-logo")).toHaveCount(5);
});
test("account dropdown, collapsible customer navigation, kit photos and quantity control", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "ورود", exact: true }).click();
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await expect(page.locator(".center-name strong")).toHaveText(
    "آزمایشگاه بقراط",
  );
  await expect(
    page.getByRole("button", { name: "نمای مدیریت", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".demo-bar")).toHaveCount(0);
  await page.getByRole("button", { name: "جمع کردن منو" }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/sidebar-collapsed/);
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveClass(/sidebar-collapsed/);
  await page.getByRole("button", { name: "باز کردن منو" }).click();
  await page.goto("/");
  await page.getByRole("button", { name: "آرمان بهرامی", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "منوی حساب کاربری" }),
  ).toContainText("سوابق سفارش‌ها");
  await page.getByRole("link", { name: "اطلاعات حساب", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "اطلاعات مرکز", exact: true }),
  ).toBeVisible();
  await page.goto("/#/customer/supplies");
  await page.getByLabel("جست‌وجوی محصول").fill("W201");
  await expect(
    page.getByRole("img", { name: "تصویر گرافیکی کیت CRP", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .click();
  await page.getByRole("button", { name: "افزایش CRP", exact: true }).click();
  await expect(page.getByLabel("تعداد بسته CRP", { exact: true })).toHaveText(
    "۲بسته",
  );
  await page.getByRole("button", { name: "کاهش CRP", exact: true }).click();
  await expect(page.getByLabel("تعداد بسته CRP", { exact: true })).toHaveText(
    "۱بسته",
  );
  await expect(page.locator(".stock")).toContainText("۲۴");
  await switchToAdmin(page);
  await page.goto("/#/admin/customers");
  await page
    .getByRole("row")
    .filter({
      has: page.getByRole("rowheader", {
        name: "آزمایشگاه بقراط",
        exact: true,
      }),
    })
    .getByRole("button", { name: "مشاهده و ویرایش" })
    .click();
  const form = page.locator("main form").filter({
    has: page.getByRole("heading", {
      name: "ویرایش آزمایشگاه بقراط",
      exact: true,
    }),
  });
  await form.getByLabel("نشانی", { exact: true }).fill("نشانی تازه مرکز بقراط");
  await form.getByRole("button", { name: "ذخیره مرکز", exact: true }).click();
  await page.getByRole("button", { name: "نمای مشتری", exact: true }).click();
  await page.goto("/#/customer/profile");
  await expect(page.locator(".saved-addresses")).toContainText(
    "نشانی تازه مرکز بقراط",
  );
});
test("profile edits, saved city/map location, checkout address snapshot and journey/history", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page.goto("/#/customer/profile");
  await page.getByLabel("نام و نام خانوادگی مسئول").fill("مدیر مرکز بقراط");
  await page.getByRole("button", { name: "ذخیره اطلاعات مرکز" }).click();
  await expect(
    page.getByRole("button", { name: "مدیر مرکز بقراط", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "افزودن آدرس", exact: true }).click();
  await page.getByLabel("عنوان آدرس").fill("شعبه اصفهان");
  await page
    .getByRole("combobox", { name: "استان", exact: true })
    .selectOption("اصفهان");
  await page
    .getByRole("combobox", { name: "شهر", exact: true })
    .selectOption("کاشان");
  await expect(
    page.getByRole("region", { name: "نقشه OpenStreetMap، موقعیت کاشان" }),
  ).toBeVisible();
  const map = page.getByRole("region", {
    name: "نقشه OpenStreetMap، موقعیت کاشان",
  });
  const box = await map.boundingBox();
  await map.click({ position: { x: box!.width / 2 + 60, y: box!.height / 2 } });
  await page.getByLabel("نشانی دقیق").fill("خیابان مرکز، نشانی شعبه کاشان");
  await page.getByLabel("کد پستی").fill("1234567890");
  await page.getByRole("button", { name: "ذخیره آدرس", exact: true }).click();
  await expect(page.locator(".saved-addresses")).toContainText("شعبه اصفهان");
  const chosenPoint = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem("sana-demo-v1")!,
    ).customers[0].addresses.find((a: any) => a.label === "شعبه اصفهان"),
  );
  expect(chosenPoint.lng).not.toBe(51.41);
  await page.goto("/#/customer/supplies");
  await page.getByLabel("جست‌وجوی محصول").fill("W201");
  await page
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .click();
  await page.goto("/#/customer/cart");
  await page
    .getByRole("combobox", { name: "انتخاب از آدرس‌های من" })
    .selectOption({ label: "شعبه اصفهان — کاشان" });
  await page
    .getByRole("button", { name: "ثبت سفارش و پرداخت", exact: true })
    .click();
  await expect(
    page
      .locator("article.order-card")
      .first()
      .getByRole("list", { name: "مراحل سفارش" }),
  ).toContainText("در حال بررسی");
  await page.getByRole("button", { name: "جزئیات و پیگیری" }).first().click();
  await page.getByRole("button", { name: "پرداخت موفق", exact: true }).click();
  await expect(
    page
      .locator("article.order-card")
      .first()
      .locator(".order-journey .current"),
  ).toHaveText("در صف ارسال");
  let s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sana-demo-v1")!),
  );
  expect(s.orders[0].deliveryAddress.city).toBe("کاشان");
  expect(s.orders[0].deliveryAddress.lat).toBe(chosenPoint.lat);
  expect(s.orders[0].deliveryAddress.lng).toBe(chosenPoint.lng);
  await page.goto("/#/customer/profile");
  const saved = page
    .locator(".address-card")
    .filter({ hasText: "شعبه اصفهان" });
  await saved.getByRole("button", { name: "ویرایش آدرس" }).click();
  await page.getByLabel("نشانی دقیق").fill("نشانی تازه");
  await page.getByRole("button", { name: "ذخیره آدرس", exact: true }).click();
  s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sana-demo-v1")!),
  );
  expect(s.orders[0].deliveryAddress.address).toBe(
    "خیابان مرکز، نشانی شعبه کاشان",
  );
  await page.goto("/#/customer/orders");
  await page
    .getByRole("button", { name: "سوابق سفارش‌ها", exact: true })
    .click();
  await expect(page.locator(".order-journey")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("existing browser data migrates without losing orders or feedback; favicon is a valid S asset", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const before = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("sana-demo-v1")!);
    delete s.presentationRevision;
    s.customers[0].name = "آزمایشگاه نمونه سپید";
    s.customers[0].manager = "مسئول نمونه الف";
    delete s.customers[0].addresses;
    s.orders[0].total = 424242;
    localStorage.setItem("sana-demo-v1", JSON.stringify(s));
    localStorage.setItem("sana-feedback-v1", "[]");
    return s.orders.length;
  });
  await page.reload();
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sana-demo-v1")!),
  );
  expect(s.customers[0].name).toBe("آزمایشگاه بقراط");
  expect(s.orders).toHaveLength(before);
  expect(s.orders[0].total).toBe(424242);
  expect(s.tickets.some((t: any) => t.id === "TICKET-WELCOME")).toBe(true);
  const href = await page.locator("link[rel=icon]").getAttribute("href");
  const r = await request.get(href!);
  expect(r.status()).toBe(200);
  expect(await r.text()).toContain("<path");
});
