import { test, expect } from "@playwright/test";
const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j7f8AAAAASUVORK5CYII=",
  "base64",
);
test("Jalali calendar forbids today/tomorrow, stores chosen date and all three windows, pending sample is visible", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-02T08:00:00Z") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page.goto("/#/customer/orders");
  const sample = page
    .locator("article.order-card")
    .filter({ hasText: "SANA-1004" });
  await expect(sample).toContainText("در حال بررسی");
  await expect(sample.getByRole("list", { name: "مراحل سفارش" })).toBeVisible();
  await expect(
    page.getByRole("option", { name: "رد شده", exact: true }),
  ).toHaveCount(0);
  await page.goto("/#/customer/supplies");
  await page.getByLabel("جست‌وجوی محصول").fill("W201");
  await page
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .click();
  await page.goto("/#/customer/cart");
  await expect(page.locator('button[data-date="2026-11-02"]')).toBeDisabled();
  await expect(page.locator('button[data-date="2026-11-03"]')).toBeDisabled();
  await expect(page.locator('button[data-date="2026-11-04"]')).toBeEnabled();
  await page.locator('button[data-date="2026-11-05"]').click();
  await expect(page.locator('input[name="delivery-slot"]')).toHaveCount(3);
  await page.getByRole("radio", { name: "۱۵ تا ۱۸", exact: true }).check();
  await page
    .getByRole("button", { name: "ثبت سفارش و پرداخت", exact: true })
    .click();
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sana-demo-v1")!),
  );
  expect(s.orders[0].deliverySchedule).toEqual({
    date: "2026-11-05",
    slot: "15-18",
    timeZone: "Asia/Tehran",
  });
  await page.getByRole("button", { name: "جزئیات و پیگیری" }).first().click();
  await expect(page.locator(".order-delivery-time")).toContainText("۱۵ تا ۱۸");
  await page.reload();
  await page.getByRole("button", { name: "جزئیات و پیگیری" }).first().click();
  await expect(page.locator(".order-delivery-time")).toContainText("۱۵ تا ۱۸");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("calendar refreshes minimum across Tehran midnight without reloading the checkout", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-02T20:29:50Z") });
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page.goto("/#/customer/supplies");
  await page.getByLabel("جست‌وجوی محصول").fill("W201");
  await page
    .getByRole("button", { name: "افزودن به سبد", exact: true })
    .click();
  await page.goto("/#/customer/cart");
  await expect(page.locator('button[data-date="2026-11-04"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.clock.runFor(31000);
  await expect(page.locator('button[data-date="2026-11-04"]')).toBeDisabled();
  await expect(page.locator('button[data-date="2026-11-05"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("region", { name: "انتخاب زمان تحویل" }),
  ).toContainText("با تغییر تاریخ روز");
});
test("OpenStreetMap tiles, attribution, city focus and draggable marker are wired correctly", async ({
  page,
}) => {
  const tiles: string[] = [];
  await page.route("https://tile.openstreetmap.org/**", async (r) => {
    tiles.push(r.request().url());
    await r.fulfill({ contentType: "image/png", body: pixel });
  });
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page.goto("/#/customer/profile");
  await page.getByRole("button", { name: "افزودن آدرس", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "OpenStreetMap contributors", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "استان", exact: true })
    .selectOption("فارس");
  await page
    .getByRole("combobox", { name: "شهر", exact: true })
    .selectOption("شیراز");
  const map = page.getByRole("region", {
    name: "نقشه OpenStreetMap، موقعیت شیراز",
  });
  await expect(map).toHaveAttribute("data-lat", "29.5926");
  await expect.poll(() => tiles.length).toBeGreaterThan(0);
  expect(
    tiles.every((u) =>
      /^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(u),
    ),
  ).toBe(true);
  await expect(page.locator(".map-network-error")).toHaveCount(0);
  const pin = map.locator(".leaflet-marker-icon");
  await pin.scrollIntoViewIfNeeded();
  const box = await pin.boundingBox();
  await page.mouse.move(box!.x + 15, box!.y + 15);
  await page.mouse.down();
  await page.mouse.move(box!.x + 65, box!.y + 35, { steps: 10 });
  await page.mouse.up();
  await expect(map).not.toHaveAttribute("data-lng", "52.5836");
});
test("map load failure is explicit and retry can recover without dropping selected coordinates", async ({
  page,
}) => {
  await page.route("https://tile.openstreetmap.org/**", (r) => r.abort());
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page.goto("/#/customer/profile");
  await page.getByRole("button", { name: "افزودن آدرس", exact: true }).click();
  await expect(page.locator(".map-network-error")).toBeVisible();
  const map = page.locator(".leaflet-map");
  const lat = await map.getAttribute("data-lat");
  await page.unroute("https://tile.openstreetmap.org/**");
  await page.route("https://tile.openstreetmap.org/**", (r) =>
    r.fulfill({ contentType: "image/png", body: pixel }),
  );
  await page
    .getByRole("button", { name: "بارگیری دوباره", exact: true })
    .click();
  await expect(page.locator(".map-network-error")).toHaveCount(0);
  await expect(map).toHaveAttribute("data-lat", lat!);
});
test("kit artwork differs and favicon is a transparent vector without raster filters or background", async ({
  page,
  request,
}) => {
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page.goto("/#/customer/supplies");
  const crp = page.getByRole("img", {
      name: "تصویر گرافیکی کیت CRP",
      exact: true,
    }),
    tsh = page.getByRole("img", { name: "تصویر گرافیکی کیت TSH", exact: true });
  await expect(crp).toBeVisible();
  await expect(tsh).toBeVisible();
  expect(await crp.innerHTML()).not.toEqual(await tsh.innerHTML());
  await expect(crp).toContainText("W201");
  await expect(tsh).toContainText("W220");
  await page.goto("/#/devices");
  const brand = page
    .getByRole("img", { name: "لوگوی Getein", exact: true })
    .first();
  await expect(brand).toHaveAttribute("viewBox", "0 0 258 59");
  const icon = await request.get("/favicon.svg");
  const svg = await icon.text();
  expect(svg).toContain("<path");
  expect(svg).not.toContain("<filter");
  expect(svg).not.toContain("<image");
  expect(svg).not.toContain("<rect");
});
