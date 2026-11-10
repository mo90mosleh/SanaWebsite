import { test, expect } from "@playwright/test";

test("dashboard recommendations, live totals, header counter and both delete controls stay in sync", async ({
  page,
}) => {
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await expect(page.locator("main .stats")).toHaveCount(0);
  await expect(
    page.getByText("یک انتخاب به‌صرفه", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".recent-orders-table tbody tr")).toHaveCount(4);
  const recommendations = page.getByRole("region", {
    name: "پیشنهاد تأمین مجدد",
    exact: true,
  });
  await expect(recommendations.locator("article.supply")).toHaveCount(3);
  await expect(page.locator(".header-cart")).toHaveText("۰");
  await expect(
    recommendations.getByRole("button", {
      name: "نهایی‌سازی سفارش",
      exact: true,
    }),
  ).toBeDisabled();
  const crp = recommendations.locator("article.supply").filter({
    has: page.getByRole("heading", {
      name: "کیت پروتئین واکنشی C",
      exact: true,
    }),
  });
  await crp.getByRole("button", { name: "افزودن به سبد", exact: true }).click();
  await crp.getByRole("button", { name: "افزایش CRP", exact: true }).click();
  await expect(crp.locator(".selected-total")).toContainText("۴٬۸۰۰٬۰۰۰ تومان");
  await expect(crp.locator(".selected-total")).toContainText("۴٬۸۰۰٬۰۰۰ تومان");
  await expect(page.locator(".header-cart")).toHaveText("۲");
  await recommendations
    .getByRole("button", { name: "مشاهده سایر کیت‌ها", exact: true })
    .click();
  await page.getByLabel("جست‌وجوی محصول").fill("W201");
  await expect(
    page.getByLabel("تعداد بسته CRP", { exact: true }),
  ).toContainText("۲");
  await page.getByRole("button", { name: "کاهش CRP", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "حذف CRP", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "حذف CRP", exact: true }).click();
  await expect(page.locator(".header-cart")).toHaveText("۰");
  await page
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .click();
  await page.locator(".header-cart").click();
  const row = page.locator(".cart-table tbody tr");
  await expect(row).toHaveCount(1);
  await expect(row.locator("td").nth(1)).toHaveText("۲٬۴۰۰٬۰۰۰ تومان");
  await page.getByRole("button", { name: "افزایش CRP", exact: true }).click();
  await expect(row.locator("td").nth(2)).toHaveText("۴٬۸۰۰٬۰۰۰ تومان");
  await page
    .getByRole("radio", { name: "چک سه‌ماهه؛ نیازمند تأیید فروش", exact: true })
    .check();
  await expect(row.locator("td").nth(1)).toHaveText("۲٬۴۰۰٬۰۰۰ تومان");
  await expect(row.locator("td").nth(2)).toHaveText("۴٬۸۰۰٬۰۰۰ تومان");
  await expect(page.locator(".cart-table tfoot")).toContainText(
    "۴٬۸۰۰٬۰۰۰ تومان",
  );
  await page.getByRole("button", { name: "کاهش CRP", exact: true }).click();
  await page.getByRole("button", { name: "حذف CRP", exact: true }).click();
  await expect(
    page.getByText("سبد خرید شما خالی است.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".header-cart")).toHaveText("۰");
});

test("catalog categories combine with search and device filter; non-orderable items stay disabled", async ({
  page,
}) => {
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page.goto("/#/customer/supplies");
  await page.getByRole("group", { name: "نوع مصرفی" }).getByRole("button", { name: "کیت‌های POCT", exact: true }).click();
  await page.getByLabel("گروه تست POCT").selectOption("thyroid");
  await expect(page.locator("article.supply")).toHaveCount(5);
  await expect(
    page.getByRole("region", { name: "فهرست کیت‌ها", exact: true }),
  ).toBeVisible();
  await page.getByLabel("جست‌وجوی محصول").fill("W220");
  await expect(page.locator("article.supply")).toHaveCount(1);
  await expect(page.locator("article.supply")).toContainText("TSH");
  await page.getByLabel("فیلتر دستگاه").selectOption("BHA3000");
  await expect(
    page.getByText("محصولی پیدا نشد.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("جست‌وجوی محصول").fill("");
  await page.getByLabel("فیلتر دستگاه").selectOption("");
  await page.getByLabel("گروه تست POCT").selectOption("fertility");
  await page.getByLabel("جست‌وجوی محصول").fill("testosterone");
  await expect(page.locator("article.supply")).toHaveCount(1);
  for (const button of await page
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .all())
    await expect(button).toBeDisabled();
});

test("mobile populated cart and dashboard remain readable without page overflow; home/account icons exist", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  const recommendations = page.getByRole("region", {
    name: "پیشنهاد تأمین مجدد",
    exact: true,
  });
  await recommendations
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .first()
    .click();
  await recommendations
    .getByRole("button", { name: "نهایی‌سازی سفارش", exact: true })
    .click();
  await expect(page.locator(".cart-table")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".cart-table")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(14);
  await page.goto("/#/");
  await expect(page.locator(".sana-assurance > span svg")).toHaveCount(3);
  await expect(page.locator(".header-cart")).toHaveText("۱");
  await page.getByRole("button", { name: "آرمان بهرامی", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "آدرس‌های من", exact: true }).locator("svg"),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("device replenishment matches dashboard cards with one shared suggestion caption and keeps cart selection", async ({
  page,
}) => {
  await page.goto("/#/login");
  await expect(
    page.getByLabel("شماره موبایل مسئول مرکز", { exact: true }),
  ).toHaveAttribute("placeholder", "09123456789");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  const recommendations = page.getByRole("region", {
    name: "پیشنهاد تأمین مجدد",
    exact: true,
  });
  await expect(
    recommendations.getByText("پیشنهاد متناسب با دستگاه شما", { exact: true }),
  ).toHaveCount(1);
  const titles = await recommendations
    .locator("article.supply h2")
    .allTextContents();
  await page.goto("/#/customer/devices");
  await expect(recommendations.locator("article.supply h2")).toHaveText(titles);
  await expect(
    recommendations.getByText("پیشنهاد متناسب با دستگاه شما", { exact: true }),
  ).toHaveCount(1);
  await recommendations
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .first()
    .click();
  await recommendations
    .getByRole("button", { name: "نهایی‌سازی سفارش", exact: true })
    .click();
  await expect(page.locator(".cart-table tbody tr")).toHaveCount(1);
});
