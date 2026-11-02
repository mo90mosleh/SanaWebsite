import year1404 from "./data/holidays/1404.json";
import year1405 from "./data/holidays/1405.json";
import year1406 from "./data/holidays/1406.json";
export type Holiday = {
  date: string;
  title: string;
  type: "public" | "religious";
};
export const HOLIDAY_API =
  "https://cdn.jsdelivr.net/npm/@avan-persian/holidays@latest/data/";
const years = new Map<number, ReadonlyMap<string, Holiday>>();
const online = new Set<number>();
const requests = new Map<number, Promise<HolidayResult>>();
export type HolidayResult = {
  available: boolean;
  source: "online" | "local" | "unavailable";
};
const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export function holidayDateKey(date: string) {
  const parts = formatter.formatToParts(new Date(date + "T12:00:00Z"));
  return ["year", "month", "day"]
    .map((type) =>
      parts
        .find((p) => p.type === type)!
        .value.padStart(type === "year" ? 4 : 2, "0"),
    )
    .join("-");
}
export function parseHolidayYear(
  data: unknown,
  year: number,
): ReadonlyMap<string, Holiday> {
  if (!Array.isArray(data) || data.length < 20 || data.length > 100)
    throw Error("تقویم تعطیلات معتبر نیست");
  const result = new Map<string, Holiday>();
  for (const item of data) {
    if (
      !item ||
      typeof item.date !== "string" ||
      !new RegExp(`^${year}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$`).test(
        item.date,
      ) ||
      typeof item.title !== "string" ||
      !item.title.trim() ||
      item.title.length > 500 ||
      !["public", "religious"].includes(item.type) ||
      result.has(item.date)
    )
      throw Error("تقویم تعطیلات معتبر نیست");
    const month = Number(item.date.slice(5, 7)),
      day = Number(item.date.slice(8));
    if (month > 6 && day > 30) throw Error("روز تعطیل معتبر نیست");
    result.set(item.date, {
      date: item.date,
      title: item.title,
      type: item.type,
    });
  }
  for (const day of [
    "01-01",
    "01-02",
    "01-03",
    "01-04",
    "01-12",
    "01-13",
    "03-14",
    "03-15",
    "11-22",
    "12-29",
  ])
    if (!result.has(`${year}-${day}`)) throw Error("داده تعطیلات ناقص است");
  return result;
}
for (const [year, data] of [
  [1404, year1404],
  [1405, year1405],
  [1406, year1406],
] as const)
  years.set(year, parseHolidayYear(data, year));
export function holidayForDate(date: string) {
  const key = holidayDateKey(date);
  return years.get(Number(key.slice(0, 4)))?.get(key);
}
export const holidayYearAvailable = (year: number) => years.has(year);
export function loadHolidayYear(
  year: number,
  retry = false,
): Promise<HolidayResult> {
  if (!retry && requests.has(year)) return requests.get(year)!;
  const request = (async (): Promise<HolidayResult> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${HOLIDAY_API}${year}.json`, {
        signal: controller.signal,
        credentials: "omit",
        cache: "no-store",
      });
      if (!response.ok) throw Error("تقویم در دسترس نیست");
      const data = parseHolidayYear(await response.json(), year);
      years.set(year, data);
      online.add(year);
    } catch {
      /* Keep the complete bundled calendar when the network or response fails. */
    } finally {
      clearTimeout(timeout);
    }
    return {
      available: years.has(year),
      source: online.has(year)
        ? "online"
        : years.has(year)
          ? "local"
          : "unavailable",
    };
  })();
  requests.set(year, request);
  return request;
}
