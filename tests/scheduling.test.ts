import { test } from "node:test";
import assert from "node:assert/strict";
import {
  todayInTehran,
  earliestDeliveryDate,
  firstAvailableDelivery,
  validateDelivery,
  DELIVERY_SLOTS,
  persianMonth,
  persianParts,
  type DeliverySchedule,
} from "../src/delivery.ts";
import {
  seed,
  createOrder,
  review,
  migratePresentation,
} from "../src/domain.ts";
test("minimum is two calendar days after the Tehran day, including local midnight", () => {
  const before = new Date("2026-11-02T20:29:59Z"),
    after = new Date("2026-11-02T20:30:00Z");
  assert.equal(todayInTehran(before), "2026-11-02");
  assert.equal(earliestDeliveryDate(before), "2026-11-04");
  assert.equal(todayInTehran(after), "2026-11-03");
  assert.equal(earliestDeliveryDate(after), "2026-11-05");
  const chosen = {
    date: "2026-11-04",
    slot: "09-12",
    timeZone: "Asia/Tehran",
  } as const;
  assert.doesNotThrow(() => validateDelivery(chosen, before));
  assert.throws(() => validateDelivery(chosen, after));
});
test("calendar handles Gregorian year rollover and Persian leap month/Nowruz", () => {
  assert.equal(
    earliestDeliveryDate(new Date("2026-12-31T10:00:00Z")),
    "2027-01-02",
  );
  assert.equal(persianMonth(1403, 12).days, 30);
  assert.equal(persianMonth(1404, 12).days, 29);
  assert.deepEqual(persianParts("2027-03-21"), {
    year: 1406,
    month: 1,
    day: 1,
  });
});
test("service rejects missing/past/invalid dates and accepts only the three delivery windows", () => {
  const now = new Date("2026-11-02T12:00:00Z");
  assert.throws(() => validateDelivery(undefined, now));
  for (const date of ["2026-11-02", "2026-11-03", "2026-02-31", "invalid"])
    assert.throws(() =>
      validateDelivery({ date, slot: "09-12", timeZone: "Asia/Tehran" }, now),
    );
  for (const { id } of DELIVERY_SLOTS)
    assert.doesNotThrow(() =>
      validateDelivery(
        { date: "2026-11-04", slot: id, timeZone: "Asia/Tehran" },
        now,
      ),
    );
  assert.throws(() =>
    validateDelivery(
      {
        date: "2026-11-04",
        slot: "18-21",
        timeZone: "Asia/Tehran",
      } as unknown as DeliverySchedule,
      now,
    ),
  );
  assert.throws(() =>
    createOrder(seed(), "c1", { crp: 1 }, "credit", "missing-schedule"),
  );
});
test("order snapshots delivery time and retry does not replace schedule or create another order", () => {
  const s = seed(),
    schedule = firstAvailableDelivery();
  schedule.slot = "15-18";
  const o = createOrder(
    s,
    "c1",
    { crp: 1 },
    "credit",
    "delivery-retry",
    undefined,
    schedule,
  );
  const count = s.orders.length;
  const date = o.deliverySchedule!.date;
  schedule.date = "2000-01-01";
  schedule.slot = "09-12";
  assert.equal(o.deliverySchedule!.date, date);
  assert.equal(o.deliverySchedule!.slot, "15-18");
  assert.equal(
    createOrder(
      s,
      "c1",
      { crp: 1 },
      "credit",
      "delivery-retry",
      undefined,
      schedule,
    ).id,
    o.id,
  );
  assert.equal(s.orders.length, count);
});
test("legacy rejected orders become cancelled, a pending sample is added once and sales cancellation remains unpaid", () => {
  const s = seed();
  s.presentationRevision = 2;
  s.orders = s.orders.filter((o) => o.id !== "SANA-1004");
  (s.orders[0] as { status: string }).status = "rejected";
  const historicalTotal = s.orders[0].total;
  const migrated = migratePresentation(s);
  assert.equal(
    migrated.orders.find((o) => o.id === "SANA-1001")!.status,
    "cancelled",
  );
  assert.equal(
    migrated.orders.find((o) => o.id === "SANA-1001")!.total,
    historicalTotal,
  );
  assert.equal(migrated.orders.filter((o) => o.id === "SANA-1004").length, 1);
  review(migrated, "SANA-1004", false, "کنسل توسط فروش");
  assert.equal(migrated.orders[0].status, "cancelled");
  assert.equal(migrated.orders[0].payment, "unpaid");
  migratePresentation(migrated);
  assert.equal(migrated.orders.filter((o) => o.id === "SANA-1004").length, 1);
  assert.equal(migrated.orders[0].status, "cancelled");
});

test("Fridays and solar/lunar public holidays are rejected, Thursday has only two slots", () => {
  const now = new Date("2026-11-02T08:00:00Z");
  for (const slot of ["09-12", "12-15", "15-18"] as const)
    assert.throws(
      () =>
        validateDelivery(
          { date: "2026-11-06", slot, timeZone: "Asia/Tehran" },
          now,
        ),
      /جمعه/,
    );
  for (const slot of ["09-12", "12-15"] as const)
    assert.doesNotThrow(() =>
      validateDelivery(
        { date: "2026-11-05", slot, timeZone: "Asia/Tehran" },
        now,
      ),
    );
  assert.throws(
    () =>
      validateDelivery(
        { date: "2026-11-05", slot: "15-18", timeZone: "Asia/Tehran" },
        now,
      ),
    /پنج‌شنبه/,
  );
  // 2 Dey 1405: a midweek religious holiday from the published-year dataset.
  assert.throws(
    () =>
      validateDelivery(
        { date: "2026-12-23", slot: "09-12", timeZone: "Asia/Tehran" },
        now,
      ),
    /تعطیل رسمی/,
  );
  assert.throws(
    () =>
      validateDelivery(
        { date: "2027-03-21", slot: "09-12", timeZone: "Asia/Tehran" },
        now,
      ),
    /تعطیل رسمی/,
  );
  assert.equal(
    firstAvailableDelivery(new Date("2026-11-04T08:00:00Z")).date,
    "2026-11-07",
  );
  assert.equal(
    firstAvailableDelivery(new Date("2027-03-20T08:00:00Z")).date,
    "2027-03-25",
  );
  assert.throws(
    () =>
      createOrder(
        seed(),
        "c1",
        { crp: 1 },
        "online",
        "friday-order",
        undefined,
        { date: "2026-11-06", slot: "09-12", timeZone: "Asia/Tehran" },
      ),
    /جمعه/,
  );
});
