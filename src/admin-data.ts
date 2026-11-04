import * as D from "./domain";
import { importColumns, type ImportKind } from "./import-schema";
export { importColumns, type ImportKind } from "./import-schema";
export function digits(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
}
export function numeric(value: unknown) {
  const raw = digits(value).replace(/[,٬\s]/g, "");
  if (!/^-?\d+$/.test(raw)) throw Error("عدد صحیح معتبر وارد کنید");
  const n = Number(raw);
  if (!Number.isSafeInteger(n)) throw Error("عدد خارج از محدوده است");
  return n;
}
export function mobile(value: unknown) {
  let raw = digits(value)
    .replace(/[\s()-]/g, "")
    .replace(/^(?:\+98|0098)(9\d{9})$/, "0$1");
  if (/^9\d{9}$/.test(raw)) raw = "0" + raw;
  if (!/^09\d{9}$/.test(raw)) throw Error("شماره موبایل معتبر نیست");
  return raw;
}
export function brands(state: D.State) {
  return [
    ...new Set(["Wondfo", "Getein", "Ortanes", ...state.products.map((p) => p.brand)]),
  ];
}
export function adjustStock(state: D.State, productId: string, delta: number) {
  const product = state.products.find((p) => p.id === productId);
  if (!product || !Number.isSafeInteger(delta) || delta === 0)
    throw Error("محصول و مقدار تغییر موجودی معتبر نیست");
  const next = product.stock + delta;
  if (!Number.isSafeInteger(next) || next < 0 || next > 10000)
    throw Error("موجودی نهایی باید بین صفر و ۱۰٬۰۰۰ بسته باشد");
  product.stock = next;
}
export function latestPurchase(state: D.State, customerId: string) {
  return state.orders
    .filter(
      (o) =>
        o.customer === customerId &&
        o.status === "confirmed" &&
        (o.method === "credit" || o.payment === "paid"),
    )
    .map((o) => o.created)
    .sort()
    .at(-1);
}
export function recordNearReminders(state: D.State) {
  for (const c of state.customers)
    for (const p of state.products) {
      if (
        D.forecast(state, c, p.id)?.near &&
        !state.logs.some(
          (l) =>
            l.type === "replenishment.near" && l.related === `${c.id}:${p.id}`,
        )
      )
        D.event(state, "replenishment.near", `${c.id}:${p.id}`);
    }
}
export type ImportPreview = { kind: ImportKind; rows: string[][] };
/** Validate against a copy first; a failed batch never partially changes persisted data. */
export function applyImport(state: D.State, preview: ImportPreview) {
  if (!preview.rows.length || preview.rows.length > 1000)
    throw Error("فایل باید بین ۱ تا ۱۰۰۰ ردیف داده داشته باشد");
  const next = structuredClone(state);
  const columns = importColumns[preview.kind];
  preview.rows.forEach((row, i) => {
    try {
      const text = (index: number, max = 250) => {
        const value = String(row[index] ?? "").trim();
        if (!value || value.length > max)
          throw Error(`${columns[index]} را کامل و معتبر وارد کنید`);
        return value;
      };
      if (preview.kind === "customers") {
        const phone = mobile(row[2]);
        if (next.customers.some((c) => c.mobile === phone))
          throw Error(
            "موبایل تکراری است؛ برای ویرایش از جزئیات مشتری استفاده کنید",
          );
        const active = digits(row[4] || "بله").toLowerCase();
        if (!["بله", "خیر", "true", "false", "1", "0"].includes(active))
          throw Error("فعال باید بله یا خیر باشد");
        next.customers.push({
          id: D.uid(),
          name: text(0, 100),
          manager: text(1, 100),
          mobile: phone,
          address: text(3),
          active: ["بله", "true", "1"].includes(active),
          devices: [],
        });
      } else if (preview.kind === "products") {
        const brand = brands(next).find(
          (b) => b.toLowerCase() === text(2, 50).toLowerCase(),
        );
        if (!brand) throw Error("برند در فهرست برندهای مجاز نیست");
        const code = text(3, 50);
        if (
          next.products.some(
            (p) =>
              p.code.toLowerCase() === code.toLowerCase() && p.brand === brand,
          )
        )
          throw Error("کد محصول و برند تکراری است");
        const price = numeric(row[4]);
        if (price < 1 || price > 1000000000)
          throw Error("قیمت باید بین ۱ و ۱٬۰۰۰٬۰۰۰٬۰۰۰ تومان باشد");
        const source = text(5, 2000);
        if (!/^https?:\/\//i.test(source))
          throw Error("نشانی منبع سازنده معتبر نیست");
        next.products.push({
          id: D.uid(),
          name: text(0, 100),
          english: text(1, 100),
          brand,
          family: brand === 'Ortanes' ? 'laboratory' : 'poct',
          categoryId: brand === 'Ortanes' ? 'collection' : 'poct',
          code,
          price,
          stock: 0,
          models: [],
          tests: null,
          verified: false,
          source,
          image: "",
        });
      } else {
        const code = text(0, 50),
          brand = text(1, 50);
        const matches = next.products.filter(
          (p) =>
            p.code.toLowerCase() === code.toLowerCase() &&
            p.brand.toLowerCase() === brand.toLowerCase(),
        );
        if (matches.length !== 1)
          throw Error("محصول با این کد و برند به‌صورت یکتا پیدا نشد");
        adjustStock(next, matches[0].id, numeric(row[2]));
      }
    } catch (error) {
      throw Error(
        `ردیف ${i + 2}: ${error instanceof Error ? error.message : "داده معتبر نیست"}`,
      );
    }
  });
  state.customers = next.customers;
  state.products = next.products;
}
