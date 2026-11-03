import { switchToAdmin, logoutFromPanel } from "./helpers";
import { test, expect, type Page } from "@playwright/test";
const state = async (p: Page) =>
  p.evaluate(() => JSON.parse(localStorage.getItem("sana-demo-v1")!));
const nav = async (p: Page, url: string) => {
  await p.goto("/#" + url);
  await expect(p.locator("main")).toBeVisible();
};
const firstOrder = async (p: Page) => {
  const card = p.locator("main article.order-card").first();
  await expect(card).toBeVisible();
  if (
    await card
      .getByRole("button", { name: "جزئیات و پیگیری", exact: true })
      .isVisible()
  )
    await card
      .getByRole("button", { name: "جزئیات و پیگیری", exact: true })
      .click();
  return card;
};
async function orderAgain(p: Page) {
  await nav(p, "/customer/orders");
  const c = await firstOrder(p);
  await c.getByRole("button", { name: "سفارش مجدد با قیمت فعلی" }).click();
  await expect(
    p.getByRole("heading", { name: "سبد خرید و تسویه" }),
  ).toBeVisible();
}
test("customer/admin order, payment, review, ticket, service retries, persistence and reset", async ({
  page: p,
}) => {
  const external: string[] = [];
  p.on("request", (r) => {
    if (
      !r.url().startsWith(String(test.info().project.use.baseURL)) &&
      !/^https:\/\/cdn\.jsdelivr\.net\/npm\/@avan-persian\/holidays@latest\/data\/\d{4}\.json$/.test(
        r.url(),
      )
    )
      external.push(r.url());
  });
  await p.goto("/#/login");
  await p.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await expect(
    p.getByRole("heading", { name: "سلام، به سانا خوش آمدید" }),
  ).toBeVisible();
  await nav(p, "/customer/devices");
  await expect(p.locator("main")).toContainText("DEMO-FS114-001");
  await p
    .getByRole("button", { name: "مشاهده مصرفی‌های مرتبط" })
    .first()
    .click();
  await p.getByLabel("جست‌وجوی محصول").fill("W201");
  await expect(p.locator("article.supply")).toHaveCount(1);
  await p.getByRole("button", { name: "افزودن به سبد", exact: true }).click();
  await nav(p, "/customer/cart");
  await expect(p.locator("main")).toContainText("۱٬۹۲۰٬۰۰۰ تومان");
  await expect(p.locator("main")).toContainText("۴۸۰٬۰۰۰ تومان");
  await p
    .getByRole("button", { name: "ثبت سفارش و پرداخت", exact: true })
    .click();
  let c = await firstOrder(p);
  await c.getByRole("button", { name: "پرداخت ناموفق", exact: true }).click();
  let s = await state(p);
  expect(s.orders[0].payment).toBe("failed");
  expect(s.orders).toHaveLength(5);
  await p.reload();
  c = await firstOrder(p);
  await c.getByRole("button", { name: "پرداخت موفق", exact: true }).click();
  s = await state(p);
  expect(s.orders[0].payment).toBe("paid");
  expect(s.orders).toHaveLength(5);
  expect(s.products[0].stock).toBe(23);
  await switchToAdmin(p);
  await nav(p, "/admin/orders");
  c = await firstOrder(p);
  await expect(c).toContainText(s.orders[0].id);
  await c.getByLabel("وضعیت ارسال").selectOption("sent");
  await p.getByRole("button", { name: "نمای مشتری", exact: true }).click();
  await nav(p, "/customer/orders");
  c = await firstOrder(p);
  await expect(c).toContainText("ارسال شده");
  await c.getByRole("button", { name: "سفارش مجدد با قیمت فعلی" }).click();
  await p.getByText("چک سه‌ماهه؛ نیازمند تأیید فروش", { exact: true }).click();
  await p
    .getByRole("button", { name: "ثبت درخواست خرید شرایطی", exact: true })
    .click();
  s = await state(p);
  expect(s.orders[0].status).toBe("pending");
  expect(s.orders[0].payment).toBe("unpaid");
  expect(s.orders[0].total).toBe(2400000);
  await switchToAdmin(p);
  await nav(p, "/admin/orders");
  c = await firstOrder(p);
  await c.getByLabel("توضیح بررسی").fill("مدارک دمو تکمیل نشده");
  await c.getByLabel("نتیجه").selectOption("cancel");
  await c.getByRole("button", { name: "ثبت نتیجه بررسی" }).click();
  await p.getByRole("button", { name: "نمای مشتری", exact: true }).click();
  await nav(p, "/customer/orders");
  c = await firstOrder(p);
  await expect(c).toContainText("کنسل شده");
  await expect(c).toContainText("مدارک دمو تکمیل نشده");
  await orderAgain(p);
  await p.getByText("چک سه‌ماهه؛ نیازمند تأیید فروش", { exact: true }).click();
  await p.getByRole("button", { name: "ثبت درخواست خرید شرایطی" }).click();
  await switchToAdmin(p);
  await nav(p, "/admin/orders");
  c = await firstOrder(p);
  await c.getByLabel("توضیح بررسی").fill("تأیید فروش در دمو");
  await c.getByRole("button", { name: "ثبت نتیجه بررسی" }).click();
  expect((await state(p)).orders[0].status).toBe("confirmed");
  expect((await state(p)).orders[0].payment).toBe("unpaid");
  await nav(p, "/admin/products");
  await p
    .getByRole("row")
    .filter({
      has: p.getByRole("rowheader", {
        name: "کیت پروتئین واکنشی C",
        exact: false,
      }),
    })
    .getByRole("button", { name: "ویرایش محصول" })
    .click();
  const form = p.locator("main form").filter({
    has: p.getByRole("heading", {
      name: "کیت پروتئین واکنشی C",
      exact: true,
      includeHidden: true,
    }),
  });
  await form.getByLabel("قیمت پایه (تومان)").fill("3000000");
  await form.getByRole("button", { name: "ذخیره محصول" }).click();
  await p.getByRole("button", { name: "نمای مشتری", exact: true }).click();
  await orderAgain(p);
  await expect(p.locator("main")).toContainText("۳٬۰۰۰٬۰۰۰ تومان");
  expect((await state(p)).orders[0].lines[0].price).toBe(2400000);
  await nav(p, "/customer/tickets");
  await p.getByRole("button", { name: "تیکت جدید", exact: true }).click();
  await p.getByLabel("دستگاه خریداری‌شده", { exact: true }).selectOption("d1");
  await p.getByLabel("موضوع", { exact: true }).fill("پرسش فنی دمو");
  await p
    .getByLabel("پیام شما")
    .fill("برای بررسی سریال نمونه راهنمایی می‌خواهم.");
  await p.getByRole("button", { name: "ارسال تیکت", exact: true }).click();
  await expect(p.locator("main")).toContainText("پرسش فنی دمو");
  await switchToAdmin(p);
  await nav(p, "/admin/tickets");
  await p.getByRole("button", { name: "پرسش فنی دمو", exact: true }).click();
  const ticket = p.locator("main article").filter({
    has: p.getByRole("heading", { name: "پرسش فنی دمو", exact: true }),
  });
  await ticket
    .getByLabel("پاسخ", { exact: true })
    .fill("پاسخ نمایشی کارشناس سانا");
  await ticket.getByRole("button", { name: "ثبت پاسخ", exact: true }).click();
  await nav(p, "/admin/forecast");
  await expect(p.locator("main")).toContainText("داده کافی نیست");
  await expect(p.locator("main")).toContainText("نزدیک به موعد");
  await p
    .getByRole("button", { name: "ثبت رویداد یادآور نزدیک به موعد" })
    .first()
    .click();
  const before = (await state(p)).logs.length;
  await p
    .getByRole("button", { name: "ثبت رویداد یادآور نزدیک به موعد" })
    .first()
    .click();
  expect((await state(p)).logs.length).toBe(before);
  await nav(p, "/admin/logs");
  const log = p.locator("main article").last();
  await log.getByRole("button", { name: "جزئیات", exact: true }).click();
  const orders = (await state(p)).orders.length;
  await log.getByRole("button", { name: "تلاش ناموفق" }).click();
  await log.getByRole("button", { name: "تلاش موفق" }).click();
  expect((await state(p)).orders.length).toBe(orders);
  expect((await state(p)).logs.at(-1).status).toBe("success");
  await p.getByRole("button", { name: "نمای مشتری", exact: true }).click();
  await nav(p, "/customer/tickets");
  await p.getByRole("button", { name: "پرسش فنی دمو", exact: true }).click();
  await expect(p.locator("main")).toContainText("پاسخ نمایشی کارشناس سانا");
  await p.reload();
  await p.getByRole("button", { name: "پرسش فنی دمو", exact: true }).click();
  await expect(p.locator("main")).toContainText("پاسخ نمایشی کارشناس سانا");
  p.once("dialog", (d) => d.accept());
  await p
    .getByRole("button", { name: "بازنشانی داده‌ها", exact: true })
    .click();
  expect((await state(p)).orders.length).toBe(4);
  expect((await state(p)).tickets.length).toBe(1);
  expect(external).toEqual([]);
});
test("OTP, password and recovery demo flows and logout", async ({
  page: p,
}) => {
  await p.goto("/#/login");
  await p.getByLabel("شماره موبایل مسئول مرکز").fill("09000000001");
  await p
    .getByRole("button", { name: "ورود با کد یک‌بارمصرف", exact: true })
    .click();
  await p.getByRole("button", { name: "دریافت کد" }).click();
  await p.getByLabel("کد یک‌بارمصرف").fill("000000");
  await p.getByRole("button", { name: "تأیید کد و ورود" }).click();
  await expect(p.getByRole("alert")).toContainText("123456");
  await p.getByLabel("کد یک‌بارمصرف").fill("123456");
  await p.getByRole("button", { name: "تأیید کد و ورود" }).click();
  await expect(p.locator(".sidebar")).toBeVisible();
  await logoutFromPanel(p);
  await p.getByLabel("شماره موبایل مسئول مرکز").fill("09000000001");
  await p.getByRole("button", { name: "فراموشی رمز", exact: true }).click();
  await p.getByRole("button", { name: "دریافت کد" }).click();
  await p.getByLabel("کد یک‌بارمصرف").fill("123456");
  await p.getByLabel("رمز جدید").fill("not-real");
  await p.getByRole("button", { name: "تأیید رمز جدید", exact: true }).click();
  await p.getByLabel("رمز عبور", { exact: true }).fill("demo");
  await p.getByRole("button", { name: "ورود به پنل", exact: true }).click();
  await expect(p.locator(".sidebar")).toBeVisible();
  expect(JSON.stringify(await state(p))).not.toContain("not-real");
});
test("public and panel pages render RTL without viewport overflow on mobile and desktop", async ({
  page: p,
}) => {
  const errors: string[] = [];
  p.on("pageerror", (e) => errors.push(e.message));
  for (const width of [390, 1440]) {
    await p.setViewportSize({ width, height: 960 });
    for (const route of [
      "/",
      "/devices",
      "/devices/fs-114",
      "/devices/fs-205",
      "/devices/bha3000",
      "/devices/bha5000",
      "/devices/bha5100",
      "/services",
      "/contact",
      "/login",
    ]) {
      await nav(p, route);
      expect(await p.locator("html").getAttribute("dir")).toBe("rtl");
      expect(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route + " width " + width,
      ).toBe(true);
    }
    await p.getByRole("button", { name: "ورود مشتری", exact: true }).click();
    for (const route of [
      "/customer",
      "/customer/devices",
      "/customer/supplies",
      "/customer/cart",
      "/customer/orders",
      "/customer/tickets",
      "/customer/profile",
    ]) {
      await nav(p, route);
      expect(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route + " width " + width,
      ).toBe(true);
    }
    await switchToAdmin(p);
    for (const route of [
      "/admin",
      "/admin/customers",
      "/admin/products",
      "/admin/forecast",
      "/admin/logs",
    ]) {
      await nav(p, route);
      expect(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route + " width " + width,
      ).toBe(true);
    }
    await logoutFromPanel(p);
  }
  expect(errors).toEqual([]);
});
test("admin creates and disables a customer, assigns a device and initial kits, and changes stock", async ({
  page: p,
}) => {
  await p.goto("/#/login");
  await p.getByRole("button", { name: "ورود مدیر", exact: true }).click();
  await nav(p, "/admin/customers");
  await p.locator(".admin-create summary").click();
  const create = p.locator("main form").filter({
    has: p.getByRole("heading", { name: "ایجاد مرکز", exact: true }),
  });
  await create.getByLabel("نام مرکز", { exact: true }).fill("مرکز آزمایشی سوم");
  await create.getByLabel("مسئول مرکز", { exact: true }).fill("مسئول فرضی ج");
  await create.getByLabel("موبایل").fill("09000000003");
  await create.getByLabel("نشانی", { exact: true }).fill("نشانی کاملاً فرضی");
  await create.getByRole("button", { name: "ذخیره مرکز", exact: true }).click();
  await p
    .getByRole("row")
    .filter({
      has: p.getByRole("rowheader", { name: "مرکز آزمایشی سوم", exact: true }),
    })
    .getByRole("button", { name: "مشاهده و ویرایش" })
    .click();
  const d = p.locator("main .card").filter({
    has: p.getByRole("heading", {
      name: "دستگاه‌ها و تحویل اولیه — مرکز آزمایشی سوم",
      exact: true,
    }),
  });
  await d
    .getByRole("combobox", { name: "مدل", exact: true })
    .selectOption("FS-205");
  await d.getByLabel("سریال دستگاه").fill("DEMO-THIRD-001");
  await d.getByLabel("تاریخ تحویل شمسی").fill("۱۴۰۵/۰۸/۰۱");
  await d.getByLabel("قلم اولیه").selectOption("crp");
  await d.getByLabel("تعداد بسته").fill("2");
  await d.getByRole("button", { name: "تخصیص دستگاه و ثبت تحویل" }).click();
  let s = await state(p);
  const third = s.customers.find((c: any) => c.mobile === "09000000003");
  expect(third.devices[0].initial).toEqual([{ product: "crp", qty: 2 }]);
  expect(third.devices[0].delivered.slice(0, 10)).toBe("2026-10-23");
  const edit = p.locator("main form").filter({
    has: p.getByRole("heading", {
      name: "ویرایش مرکز آزمایشی سوم",
      exact: true,
    }),
  });
  await edit.getByLabel("حساب فعال باشد").uncheck();
  await edit.getByRole("button", { name: "ذخیره مرکز", exact: true }).click();
  expect(
    (await state(p)).customers.find((c: any) => c.id === third.id).active,
  ).toBe(false);
  await nav(p, "/admin/products");
  await p.getByRole("tab", { name: "موجودی", exact: true }).click();
  const stockRow = p.getByRole("row").filter({
    has: p.getByRole("rowheader", {
      name: "کیت پروتئین واکنشی C",
      exact: true,
    }),
  });
  const quantity = (await state(p)).products.find(
    (x: any) => x.id === "crp",
  ).stock;
  for (let i = 0; i < quantity; i++)
    await stockRow
      .getByRole("button", {
        name: "کاهش موجودی کیت پروتئین واکنشی C",
        exact: true,
      })
      .click();
  await expect(
    stockRow.getByRole("button", {
      name: "کاهش موجودی کیت پروتئین واکنشی C",
      exact: true,
    }),
  ).toBeDisabled();
  await p.getByRole("button", { name: "نمای مشتری", exact: true }).click();
  await nav(p, "/customer/supplies");
  await p.getByLabel("جست‌وجوی محصول").fill("W201");
  await expect(
    p.getByRole("button", { name: "افزودن به سبد", exact: true }),
  ).toBeDisabled();
});
test("catalogs and local font/assets are served successfully", async ({
  request,
}) => {
  for (const file of [
    "/product-assets/wondfo/catalogs/fs-114-catalog.pdf",
    "/product-assets/wondfo/catalogs/fs-205-catalog.pdf",
    "/product-assets/getein/catalogs/GETEIN-BHA3000-Catalog.pdf",
    "/product-assets/getein/catalogs/GETEIN-BHA5000-Catalog.pdf",
    "/product-assets/getein/catalogs/GETEIN-BHA5100-Catalog.pdf",
  ]) {
    const r = await request.get(file);
    expect(r.status()).toBe(200);
    expect((await r.body()).subarray(0, 4).toString()).toBe("%PDF");
  }
  for (const file of [
    "/fonts/Vazirmatn-Regular.woff2",
    "/product-assets/branding/sana-logo.png",
  ]) {
    const r = await request.get(file);
    expect(r.status()).toBe(200);
    expect((await r.body()).length).toBeGreaterThan(1000);
  }
});
