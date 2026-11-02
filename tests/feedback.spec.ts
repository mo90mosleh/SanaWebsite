import { switchToAdmin } from "./helpers";
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("page annotations persist, select without triggering links, edit, export and delete on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "بازخورد", exact: true }).click();
  await page
    .getByRole("button", { name: "انتخاب بخش و افزودن یادداشت" })
    .click();
  await page.getByRole("link", { name: "ورود", exact: true }).click();
  await expect(page).not.toHaveURL(/#\/login/);
  const editor = page.getByRole("dialog", { name: "نوشتن بازخورد" });
  await expect(editor).toBeVisible();
  await editor
    .getByLabel("تغییر پیشنهادی")
    .fill("دکمه ورود مشتریان بزرگ‌تر شود.");
  await editor
    .getByRole("button", { name: "ذخیره یادداشت", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "دکمه ورود مشتریان بزرگ‌تر شود.",
  );
  await page.getByRole("button", { name: "بستن بازخورد", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: /^بازخورد/ }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "دکمه ورود مشتریان بزرگ‌تر شود.",
  );
  await page.getByRole("button", { name: "ویرایش", exact: true }).click();
  await page
    .getByLabel("تغییر پیشنهادی")
    .fill("ورود مشتریان بزرگ‌تر و خواناتر شود.");
  await page
    .getByRole("button", { name: "ذخیره یادداشت", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: /دریافت بازخوردهای در انتظار بررسی/ })
    .click();
  const file = await download;
  const data = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(data.format).toBe("sana-feedback");
  expect(data.notes).toHaveLength(1);
  expect(data.notes[0]).toMatchObject({
    text: "ورود مشتریان بزرگ‌تر و خواناتر شود.",
    page: "/",
    status: "open",
    viewport: { width: 390, height: 844 },
  });
  expect(data.notes[0].selector).toContain("#root");
  expect(data.notes[0].excerpt).toContain("ورود");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "انجام شد", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("انجام‌شده");
  await expect(
    page.getByRole("button", { name: /دریافت بازخوردهای در انتظار بررسی/ }),
  ).toBeDisabled();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "حذف یادداشت 1", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "هنوز یادداشتی ننوشته‌ای",
  );
});
test("notes retain original page and survive role changes and demo reset; keyboard selection can cancel", async ({
  page,
}) => {
  await page.goto("/#/login");
  await page.getByRole("button", { name: "ورود مشتری", exact: true }).click();
  await page.getByRole("button", { name: "بازخورد", exact: true }).click();
  await page
    .getByRole("button", { name: "انتخاب بخش و افزودن یادداشت" })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "بازخورد", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "بازخورد", exact: true }).click();
  await page
    .getByRole("button", { name: "انتخاب بخش و افزودن یادداشت" })
    .click();
  await page.getByRole("heading", { name: "سلام، به سانا خوش آمدید" }).click();
  await page.getByLabel("تغییر پیشنهادی").fill("متن خوش‌آمد کوتاه شود.");
  await page
    .getByRole("button", { name: "ذخیره یادداشت", exact: true })
    .click();
  await page.getByRole("button", { name: "بستن بازخورد" }).click();
  await switchToAdmin(page);
  await page.getByRole("button", { name: /^بازخورد/ }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "در این صفحه یادداشتی نیست",
  );
  await page.getByLabel("محدوده یادداشت‌ها").selectOption("all");
  await expect(page.getByRole("dialog")).toContainText(
    "متن خوش‌آمد کوتاه شود.",
  );
  await page.getByRole("link", { name: "رفتن به صفحه" }).click();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "بازنشانی داده‌ها", exact: true })
    .click();
  await page.getByRole("button", { name: /^بازخورد/ }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "متن خوش‌آمد کوتاه شود.",
  );
});
test("form selection exports labels, never typed password values", async ({
  page,
}) => {
  await page.goto("/#/login");
  await page.getByLabel("رمز عبور", { exact: true }).fill("private-test-text");
  await page.getByRole("button", { name: "بازخورد", exact: true }).click();
  await page
    .getByRole("button", { name: "انتخاب بخش و افزودن یادداشت" })
    .click();
  await page.getByLabel("رمز عبور", { exact: true }).click();
  await page.getByLabel("تغییر پیشنهادی").fill("عنوان رمز واضح‌تر باشد");
  await page
    .getByRole("button", { name: "ذخیره یادداشت", exact: true })
    .click();
  const stored = await page.evaluate(() =>
    localStorage.getItem("sana-feedback-v1"),
  );
  expect(stored).not.toContain("private-test-text");
  expect(stored).toContain("رمز عبور");
});

test("JSON exports only pending notes from all pages, preserves completed notes and includes reopened ones", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    const note = {
      url: location.href,
      title: document.title,
      selector: "h1",
      tag: "h1",
      excerpt: "عنوان",
      x: 0.5,
      y: 0.5,
      viewport: { width: innerWidth, height: innerHeight },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      "sana-feedback-v1",
      JSON.stringify([
        {
          ...note,
          id: "done-note",
          page: "/",
          text: "انجام شده قبلی",
          status: "done",
        },
        {
          ...note,
          id: "pending-note",
          page: "/customer/cart",
          text: "نیازمند بررسی",
          status: "open",
        },
      ]),
    );
  });
  await page.reload();
  await page.getByRole("button", { name: /^بازخورد/ }).click();
  const exportButton = page.getByRole("button", {
    name: /دریافت بازخوردهای در انتظار بررسی/,
  });
  const download = page.waitForEvent("download");
  await exportButton.click();
  const data = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  );
  expect(data.notes.map((n: { id: string }) => n.id)).toEqual(["pending-note"]);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("sana-feedback-v1")!).length,
    ),
  ).toBe(2);
  await page.getByRole("button", { name: "بازگشایی", exact: true }).click();
  const nextDownload = page.waitForEvent("download");
  await exportButton.click();
  const next = JSON.parse(
    await readFile((await (await nextDownload).path())!, "utf8"),
  );
  expect(next.notes.map((n: { id: string }) => n.id)).toEqual([
    "done-note",
    "pending-note",
  ]);
  expect(next.notes.every((n: { status: string }) => n.status === "open")).toBe(
    true,
  );
});
