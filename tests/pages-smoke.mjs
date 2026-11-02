import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const root = resolve("dist");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".png": "image/png",
  ".pdf": "application/pdf",
};
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const file = resolve(
    root,
    "." +
      pathname.replace(/^\/SanaWebsite/, "") +
      (pathname.endsWith("/") ? "index.html" : ""),
  );
  if (!pathname.startsWith("/SanaWebsite/") || !file.startsWith(root + "/")) {
    res.writeHead(404).end();
    return;
  }
  try {
    const data = await readFile(file);
    res
      .writeHead(200, {
        "content-type": types[extname(file)] || "application/octet-stream",
      })
      .end(data);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  const url = `http://127.0.0.1:${port}/SanaWebsite/`;
  await page.goto(url);
  await page.locator(".hero-visual img").waitFor();
  assert.equal(
    await page
      .locator(".hero-visual img")
      .evaluate((e) => e.complete && e.naturalWidth > 0),
    true,
  );
  await page.evaluate(() => document.fonts.ready);
  assert.equal(
    await page.evaluate(() => document.fonts.check("14px Vazirmatn")),
    true,
  );
  await page.goto(url + "#/devices/bha3000");
  const link = page.getByRole("link", { name: "دریافت کاتالوگ" });
  assert.match(
    await link.getAttribute("href"),
    /^\/SanaWebsite\/product-assets\//,
  );
  const pdf = await page.request.get(
    new URL(await link.getAttribute("href"), url).href,
  );
  assert.equal(pdf.status(), 200);
  assert.equal((await pdf.body()).subarray(0, 4).toString(), "%PDF");
  await page.goto(url + "#/login");
  await page
    .getByRole("button", { name: "ورود آزمایشی مشتری", exact: true })
    .click();
  await page.goto(url + "#/customer/supplies");
  await page.getByLabel("جست‌وجوی محصول").fill("W201");
  await page
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .click();
  await page.goto(url + "#/customer/cart");
  await page.getByRole("button", { name: "ثبت سفارش و پرداخت نمایشی" }).click();
  await page.getByRole("button", { name: "جزئیات و پیگیری" }).first().click();
  await page.getByRole("button", { name: "شبیه‌سازی پرداخت موفق" }).click();
  await page.reload();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("sana-demo-v1")).orders[0].payment,
    ),
    "paid",
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.deepEqual(errors, []);
  await page.getByRole("button", { name: "بازخورد", exact: true }).click();
  await page
    .getByRole("button", { name: "انتخاب بخش و افزودن یادداشت" })
    .click();
  await page
    .getByRole("heading", { name: "سفارش‌های من", exact: true })
    .click();
  await page.getByLabel("تغییر پیشنهادی").fill("بازخورد آزمایشی نسخه Pages");
  await page
    .getByRole("button", { name: "ذخیره یادداشت", exact: true })
    .click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("sana-feedback-v1"))[0].page,
    ),
    "/customer/orders",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Pages production subpath passed: images, fonts, PDF, customer checkout/payment, reload, mobile RTL; no failed HTTP requests or JavaScript errors.",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
