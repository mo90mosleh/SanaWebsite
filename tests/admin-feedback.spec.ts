import { test, expect, type Page } from "@playwright/test";
import ExcelJS from "exceljs";
import { importColumns, type ImportKind } from "../src/import-schema";
async function admin(page: Page, path = "/admin/dashboard") {
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مدیر", exact: true }).click();
  await page.goto("/#" + path);
}
async function excel(page: Page, kind: ImportKind, rows: unknown[][]) {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet("data");
  sheet.addRow(importColumns[kind]);
  rows.forEach((row) => sheet.addRow(row));
  await page.locator(".import-panel summary").click();
  await page
    .locator(".import-panel input[type=file]")
    .setInputFiles({
      name: "test.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from(await book.xlsx.writeBuffer()),
    });
}
test("dashboard aggregates all customers and customer table opens only selected details", async ({
  page,
}) => {
  await admin(page);
  const reminders = page.getByRole("table", {
    name: "یادآورهای همه مشتریان به ترتیب موعد تأمین",
  });
  await expect(reminders).toContainText("آزمایشگاه بقراط");
  await expect(reminders.locator("tbody tr")).not.toHaveCount(0);
  await page.goto("/#/admin/customers");
  await expect(
    page.getByRole("columnheader", { name: "آخرین خرید", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "دستگاه‌ها", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".customer-detail")).toHaveCount(0);
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
  await expect(page.getByLabel("جزئیات آزمایشگاه بقراط")).toContainText(
    "دستگاه‌ها و تحویل اولیه",
  );
  await page.getByLabel("جست‌وجوی مشتری").fill("ناشناخته");
  await expect(page.locator("main")).toContainText(
    "مشتری مطابق جست‌وجو پیدا نشد",
  );
});
test("customer Excel preview, commit, persistence and duplicate rejection", async ({
  page,
}) => {
  await admin(page, "/admin/customers");
  await excel(page, "customers", [
    ["مرکز اکسل", "مسئول اکسل", "09123456789", "تهران، نشانی آزمایشی", "بله"],
  ]);
  await expect(page.locator(".import-panel")).toContainText(
    "هنوز ذخیره نشده است",
  );
  await expect(page.locator(".admin-table-wrap").last()).not.toContainText(
    "مرکز اکسل",
  );
  await page.getByRole("button", { name: "تأیید و ثبت مشتریان" }).click();
  await expect(page.locator(".admin-table-wrap").last()).toContainText(
    "مرکز اکسل",
  );
  await page.reload();
  await expect(page.locator(".admin-table-wrap").last()).toContainText(
    "مرکز اکسل",
  );
  await excel(page, "customers", [
    ["تکراری", "مسئول", "09123456789", "تهران", "بله"],
  ]);
  await expect(page.locator(".import-panel [role=alert]")).toContainText(
    "تکراری",
  );
  await expect(
    page.getByRole("button", { name: "تأیید و ثبت مشتریان" }),
  ).toHaveCount(0);
});
test("products collapse, brand dropdown, grouped money and spreadsheet import", async ({
  page,
}) => {
  await admin(page, "/admin/products");
  await expect(page.locator(".admin-create")).not.toHaveAttribute("open", "");
  await page.locator(".admin-create summary").click();
  const form = page.locator(".admin-create form");
  await expect(
    form.getByRole("combobox", { name: "برند", exact: true }),
  ).toBeVisible();
  await expect(form.getByLabel("قیمت پایه (تومان)")).toHaveValue("2٬000٬000");
  await form.getByLabel("قیمت پایه (تومان)").fill("۳۴۵۶۷۸۹");
  await expect(form.getByLabel("قیمت پایه (تومان)")).toHaveValue("3٬456٬789");
  await excel(page, "products", [
    [
      "محصول اکسل",
      "Excel Kit",
      "Wondfo",
      "TEST-EXCEL",
      "2,400,000",
      "https://example.com/catalog",
    ],
  ]);
  await expect(page.locator(".import-panel")).toContainText("۲٬۴۰۰٬۰۰۰");
  await page.getByRole("button", { name: "تأیید و ثبت محصولات" }).click();
  await expect(page.locator(".admin-table-wrap").last()).toContainText(
    "محصول اکسل",
  );
  await expect(page.locator(".admin-table-wrap").last()).toContainText(
    "نیازمند تأیید",
  );
});
test("inventory manual add/remove and Excel adjustments never allow negative stock", async ({
  page,
}) => {
  await admin(page, "/admin/products");
  await page.getByRole("tab", { name: "موجودی", exact: true }).click();
  const row = page
    .getByRole("row")
    .filter({
      has: page.getByRole("rowheader", {
        name: "کیت پروتئین واکنشی C",
        exact: true,
      }),
    });
  await row
    .getByRole("spinbutton", { name: "تعداد بسته", exact: true })
    .fill("3");
  await row.getByRole("button", { name: "اعمال", exact: true }).click();
  await expect(row).toContainText("۲۷");
  await row
    .getByRole("combobox", { name: "عملیات موجودی" })
    .selectOption("remove");
  await row
    .getByRole("spinbutton", { name: "تعداد بسته", exact: true })
    .fill("2");
  await row.getByRole("button", { name: "اعمال", exact: true }).click();
  await expect(row).toContainText("۲۵");
  await excel(page, "inventory", [["W201", "Wondfo", -2]]);
  await page.getByRole("button", { name: "تأیید و ثبت موجودی" }).click();
  await expect(row).toContainText("۲۳");
  await page
    .locator(".import-panel input[type=file]")
    .setInputFiles({
      name: "invalid.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("not a workbook"),
    });
  await expect(page.locator(".import-panel [role=alert]")).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "موجودی", exact: true }).click();
  await expect(
    page
      .getByRole("row")
      .filter({
        has: page.getByRole("rowheader", {
          name: "کیت پروتئین واکنشی C",
          exact: true,
        }),
      }),
  ).toContainText("۲۳");
});
test("order details use bordered metadata and item tables at mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page.goto("/#/customer/orders");
  await page
    .locator(".order-card")
    .first()
    .getByRole("button", { name: "جزئیات و پیگیری" })
    .click();
  await expect(page.getByRole("table", { name: "مشخصات سفارش" })).toBeVisible();
  await expect(
    page.getByRole("table", { name: "اقلام و مبالغ سفارش" }),
  ).toContainText("قیمت واحد");
  await expect(
    page.getByRole("table", { name: "اقلام و مبالغ سفارش" }),
  ).toContainText("مبلغ نهایی");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
