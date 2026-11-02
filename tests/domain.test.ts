import { test } from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  onlinePrice,
  createOrder,
  pay,
  review,
  reorder,
  compatible,
  forecast,
  runLog,
  ship,
} from "../src/domain.ts";
test("online price is exactly 80 percent of integer base", () => {
  assert.equal(onlinePrice(2400000), 1920000);
  assert.equal(onlinePrice(9600000), 7680000);
});
test("creation and successful payment are idempotent; failure never marks paid", () => {
  const s = seed();
  const n = s.orders.length;
  const stock = s.products[0].stock;
  const o = createOrder(s, "c1", { crp: 2 }, "online", "same-key");
  assert.equal(o.total, 3840000);
  assert.equal(createOrder(s, "c1", { crp: 2 }, "online", "same-key").id, o.id);
  assert.equal(s.orders.length, n + 1);
  pay(s, o.id, false);
  assert.equal(o.payment, "failed");
  assert.equal(o.status, "pending");
  assert.equal(s.products[0].stock, stock);
  pay(s, o.id, true);
  pay(s, o.id, true);
  assert.equal(o.payment, "paid");
  assert.equal(s.products[0].stock, stock - 2);
  pay(s, o.id, false);
  assert.equal(o.payment, "paid");
});
test("credit review requires explanation, remains unpaid, and reserves only once", () => {
  const s = seed();
  const o = createOrder(s, "c1", { crp: 2 }, "credit", "credit");
  assert.throws(() => ship(s, o.id, "sent"));
  assert.throws(() => review(s, o.id, true, ""));
  review(s, o.id, true, "تأیید فروش دمو");
  assert.equal(o.status, "confirmed");
  assert.equal(o.payment, "unpaid");
  assert.throws(() => review(s, o.id, true, "تکرار"));
  ship(s, o.id, "delivered");
  assert.ok(o.deliveredAt);
});
test("rejection does not reserve or enter replenishment calculation", () => {
  const s = seed();
  const before = forecast(s, s.customers[0], "crp");
  const stock = s.products[0].stock;
  const o = createOrder(s, "c1", { crp: 2 }, "credit", "reject");
  review(s, o.id, false, "مدارک تکمیل نشده");
  assert.equal(o.status, "rejected");
  assert.equal(s.products[0].stock, stock);
  assert.deepEqual(forecast(s, s.customers[0], "crp"), before);
});
test("compatibility and available stock enforced by service, including inactive account", () => {
  const s = seed();
  assert.equal(
    compatible(
      s.products.find((p) => p.id === "diluent")!,
      s.customers[0],
    ),
    false,
  );
  assert.throws(() => createOrder(s, "c1", { diluent: 1 }, "online", "x"));
  assert.throws(() => createOrder(s, "c1", { crp: 999 }, "online", "x"));
  assert.throws(() => createOrder(s, "c1", { crp: 1.5 }, "online", "x"));
  assert.throws(() => createOrder(s, "c1", {}, "online", "x"));
  s.customers[0].active = false;
  assert.throws(() => createOrder(s, "c1", { crp: 1 }, "online", "x"));
});
test("snapshots survive catalog edits; reorder uses current availability", () => {
  const s = seed();
  const o = createOrder(s, "c1", { crp: 2 }, "online", "snapshot");
  s.products[0].price = 9900000;
  assert.equal(o.lines[0].price, 2400000);
  assert.equal(o.total, 3840000);
  assert.deepEqual(reorder(s, o).cart, { crp: 2 });
  s.products[0].stock = 1;
  assert.deepEqual(reorder(s, o).cart, {});
  assert.equal(reorder(s, o).skipped.length, 1);
});
test("failed payment and undelivered orders excluded; enough/insufficient histories differ", () => {
  const s = seed();
  const before = forecast(s, s.customers[0], "crp");
  assert.ok(before?.near);
  assert.equal(before.days, 30);
  assert.equal(forecast(s, s.customers[1], "tsh"), null);
  const o = createOrder(s, "c1", { crp: 2 }, "online", "failed");
  pay(s, o.id, false);
  assert.deepEqual(forecast(s, s.customers[0], "crp"), before);
  pay(s, o.id, true);
  assert.deepEqual(forecast(s, s.customers[0], "crp"), before);
});
test("log retry changes delivery evidence only, no orders or inventory duplicated", () => {
  const s = seed();
  const orderCount = s.orders.length;
  const quantities = s.products.map((p) => p.stock);
  runLog(s, s.logs[0].id, false);
  runLog(s, s.logs[0].id, true);
  assert.equal(s.logs[0].attempts, 3);
  assert.equal(s.logs[0].status, "success");
  assert.equal(s.orders.length, orderCount);
  assert.deepEqual(
    s.products.map((p) => p.stock),
    quantities,
  );
});
test("discount has no rounding drift for unusual base prices", () => {
  assert.equal(onlinePrice(1001), 800.8);
});
test("Jalali dates accept Persian digits and reject nonexistent dates", async () => {
  const { jalaliToISO } = await import("../src/domain.ts");
  assert.equal(jalaliToISO("۱۴۰۵/۰۸/۱۰").slice(0, 10), "2026-11-01");
  assert.throws(() => jalaliToISO("۱۴۰۵/۰۷/۳۱"));
  assert.throws(() => jalaliToISO("incorrect"));
});
test("pending cancellation blocks payment and review without inventory effects", async () => {
  const { cancelOrder } = await import("../src/domain.ts");
  const s = seed();
  const before = forecast(s, s.customers[0], "crp");
  const stock = s.products[0].stock;
  const o = createOrder(s, "c1", { crp: 1 }, "online", "cancel");
  cancelOrder(s, o.id);
  assert.equal(o.status, "cancelled");
  assert.throws(() => pay(s, o.id, true));
  assert.equal(s.products[0].stock, stock);
  assert.deepEqual(forecast(s, s.customers[0], "crp"), before);
});
test("presentation migration retains custom data and adds defaults only once", async () => {
  const { migratePresentation } = await import("../src/domain.ts");
  const s = seed();
  delete s.presentationRevision;
  s.customers[0].name = "مرکز ویرایش‌شده";
  s.customers[0].manager = "مدیر ویرایش‌شده";
  delete s.customers[0].addresses;
  s.tickets = [
    { id: "custom-ticket", customer: "c1", title: "موجود", messages: [] },
  ];
  s.orders[0].total = 123456;
  s.products[0].price = 987654;
  const migrated = migratePresentation(s);
  assert.equal(migrated.customers[0].name, "مرکز ویرایش‌شده");
  assert.equal(migrated.customers[0].manager, "مدیر ویرایش‌شده");
  assert.equal(migrated.orders[0].total, 123456);
  assert.equal(migrated.products[0].price, 987654);
  assert.ok(migrated.tickets.some((t) => t.id === "custom-ticket"));
  assert.ok(migrated.customers[0].addresses?.length);
  const before = JSON.stringify(migrated);
  migratePresentation(migrated);
  assert.equal(JSON.stringify(migrated), before);
});
test("address selection snapshots delivery details; edits/deletion never change past orders", async () => {
  const { saveAddress, deleteAddress, defaultAddress } =
    await import("../src/domain.ts");
  const s = seed();
  const a = {
    ...defaultAddress(),
    id: "branch-address",
    label: "شعبه دوم",
    city: "کرج",
    province: "البرز",
    address: "نشانی شعبه دوم",
    lat: 35.833,
    lng: 50.991,
    isDefault: false,
  };
  saveAddress(s, "c1", a);
  const order = createOrder(
    s,
    "c1",
    { crp: 1 },
    "credit",
    "with-address",
    a.id,
  );
  assert.equal(order.deliveryAddress?.label, "شعبه دوم");
  saveAddress(s, "c1", { ...a, address: "نشانی ویرایش‌شده", isDefault: true });
  deleteAddress(s, "c1", a.id);
  assert.equal(order.deliveryAddress?.address, "نشانی شعبه دوم");
  assert.equal(order.deliveryAddress?.city, "کرج");
  assert.throws(() =>
    createOrder(s, "c1", { crp: 1 }, "credit", "bad-address", "not-found"),
  );
  assert.throws(() => saveAddress(s, "c1", { ...a, phone: "123" }));
  assert.equal(s.customers[0].addresses?.filter((a) => a.isDefault).length, 1);
});
test("profile validates unique mobile and order journey separates closed orders", async () => {
  const { saveCustomerProfile, orderStage } = await import("../src/domain.ts");
  const s = seed();
  assert.throws(() =>
    saveCustomerProfile(s, "c1", {
      name: "بقراط",
      manager: "الف",
      mobile: s.customers[1].mobile,
    }),
  );
  saveCustomerProfile(s, "c1", {
    name: "بقراط جدید",
    manager: "مدیر جدید",
    mobile: "09000000004",
  });
  assert.equal(s.customers[0].name, "بقراط جدید");
  const o = createOrder(s, "c1", { crp: 1 }, "online", "journey");
  assert.equal(orderStage(o), "review");
  pay(s, o.id, true);
  assert.equal(orderStage(o), "queue");
  ship(s, o.id, "sent");
  assert.equal(orderStage(o), "sent");
  o.status = "cancelled";
  assert.equal(orderStage(o), "closed");
});
