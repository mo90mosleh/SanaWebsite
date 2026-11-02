import { test } from "node:test";
import assert from "node:assert/strict";
import data1404 from "../src/data/holidays/1404.json";
import {
  parseHolidayYear,
  loadHolidayYear,
  holidayForDate,
  holidayYearAvailable,
} from "../src/holidays.ts";
import { validateDelivery } from "../src/delivery.ts";

test("holiday API validates full yearly data, keeps bundled calendar on failures and never opens an unknown year", async () => {
  const originalFetch = globalThis.fetch;
  try {
    assert.throws(() => parseHolidayYear([], 1404));
    assert.throws(() => parseHolidayYear(data1404, 1405));
    assert.throws(() => parseHolidayYear([...data1404, data1404[0]], 1404));
    assert.throws(() => parseHolidayYear(data1404.slice(1), 1404));
    globalThis.fetch = async () => {
      throw Error("offline");
    };
    assert.deepEqual(await loadHolidayYear(1404, true), {
      available: true,
      source: "local",
    });
    assert.ok(holidayForDate("2025-03-21"));
    assert.deepEqual(await loadHolidayYear(1410, true), {
      available: false,
      source: "unavailable",
    });
    assert.equal(holidayYearAvailable(1410), false);
    assert.throws(
      () =>
        validateDelivery(
          { date: "2031-04-01", slot: "09-12", timeZone: "Asia/Tehran" },
          new Date("2026-11-02T08:00:00Z"),
        ),
      /اطلاعات تعطیلات/,
    );
    globalThis.fetch = async () => new Response("{}", { status: 200 });
    assert.equal((await loadHolidayYear(1404, true)).source, "local");
    globalThis.fetch = async () =>
      new Response(JSON.stringify(data1404), { status: 200 });
    assert.deepEqual(await loadHolidayYear(1404, true), {
      available: true,
      source: "online",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
