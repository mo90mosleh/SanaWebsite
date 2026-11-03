import { test } from "node:test";
import assert from "node:assert/strict";
import { seed, money } from "../src/domain.ts";
import {
  applyImport,
  adjustStock,
  latestPurchase,
  mobile,
  numeric,
  recordNearReminders,
} from "../src/admin-data.ts";
test("customer Excel rows normalize digits and preserve existing customers/devices", () => {
  const s = seed(),
    existing = structuredClone(s.customers);
  applyImport(s, {
    kind: "customers",
    rows: [["مرکز تازه", "مسئول تازه", "۹۱۲۳۴۵۶۷۸۹", "نشانی مرکز", "بله"]],
  });
  assert.equal(s.customers.at(-1)?.mobile, "09123456789");
  assert.equal(s.customers.at(-1)?.active, true);
  assert.deepEqual(s.customers.slice(0, -1), existing);
  assert.equal(mobile("+989123456789"), "09123456789");
});
test("duplicate/invalid customer row rejects the entire batch without partial writes", () => {
  const s = seed(),
    before = structuredClone(s);
  assert.throws(
    () =>
      applyImport(s, {
        kind: "customers",
        rows: [
          ["مرکز تازه", "مسئول", "09123456789", "نشانی", "بله"],
          ["تکراری", "مسئول", "09123456789", "نشانی", "بله"],
        ],
      }),
    /ردیف 3/,
  );
  assert.deepEqual(s, before);
});
test("product import accepts formatted money and never implies verified compatibility", () => {
  const s = seed();
  applyImport(s, {
    kind: "products",
    rows: [
      [
        "محصول آزمایشی",
        "Test",
        "wondfo",
        "TEST-001",
        "۲٬۴۰۰٬۰۰۰",
        "https://example.com/catalog",
      ],
    ],
  });
  const p = s.products.at(-1)!;
  assert.equal(p.price, 2400000);
  assert.equal(p.verified, false);
  assert.equal(p.stock, 0);
  assert.deepEqual(p.models, []);
  assert.equal(p.brand, "Wondfo");
});
test("unknown brand or duplicate manufacturer code cannot create products", () => {
  const s = seed(),
    p = s.products[0];
  assert.throws(
    () =>
      applyImport(s, {
        kind: "products",
        rows: [
          ["آزمایش", "Test", "other", "NEW", "100", "https://example.com"],
        ],
      }),
    /برند/,
  );
  assert.throws(
    () =>
      applyImport(s, {
        kind: "products",
        rows: [
          ["آزمایش", "Test", p.brand, p.code, "100", "https://example.com"],
        ],
      }),
    /تکراری/,
  );
});
test("stock supports increments, decrements and transactional Excel batches", () => {
  const s = seed(),
    p = s.products[0],
    start = p.stock;
  adjustStock(s, p.id, 3);
  assert.equal(p.stock, start + 3);
  adjustStock(s, p.id, -2);
  assert.equal(p.stock, start + 1);
  applyImport(s, {
    kind: "inventory",
    rows: [
      [p.code, p.brand, "۵"],
      [p.code, p.brand, "-۲"],
    ],
  });
  assert.equal(s.products[0].stock, start + 4);
  const before = structuredClone(s);
  assert.throws(
    () =>
      applyImport(s, {
        kind: "inventory",
        rows: [
          [p.code, p.brand, "1"],
          [p.code, p.brand, "-10000"],
        ],
      }),
    /ردیف 3/,
  );
  assert.deepEqual(s, before);
});
test("invalid stock adjustments and malformed numeric inputs are rejected", () => {
  const s = seed(),
    p = s.products[0];
  for (const delta of [0, NaN, 1.5, Infinity, 10001, -10000])
    assert.throws(() => adjustStock(s, p.id, delta));
  for (const value of ["", "1.2", "1e5", "abc"])
    assert.throws(() => numeric(value));
  assert.equal(numeric("١٬٢٣٤"), 1234);
  assert.match(money(2400000), /۲٬۴۰۰٬۰۰۰/);
});
test("latest purchase ignores pending, failed and cancelled orders", () => {
  const s = seed(),
    c = s.customers[0];
  const latest = latestPurchase(s, c.id);
  const copy = structuredClone(s.orders[0]);
  copy.customer = c.id;
  copy.created = "2099-01-01T00:00:00Z";
  copy.status = "pending";
  s.orders.push(copy);
  assert.equal(latestPurchase(s, c.id), latest);
  copy.status = "confirmed";
  copy.method = "online";
  copy.payment = "failed";
  assert.equal(latestPurchase(s, c.id), latest);
  copy.payment = "paid";
  assert.equal(latestPurchase(s, c.id), copy.created);
});
test("aggregate reminders are idempotent across all customers", () => {
  const s = seed();
  recordNearReminders(s);
  const count = s.logs.length;
  recordNearReminders(s);
  assert.equal(s.logs.length, count);
});
