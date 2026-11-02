import { holidayForDate, holidayYearAvailable } from "./holidays";
export const DELIVERY_TIME_ZONE = "Asia/Tehran" as const;
export const DELIVERY_SLOTS = [
  { id: "09-12", label: "۹ تا ۱۲", description: "۹ صبح تا ۱۲ ظهر" },
  { id: "12-15", label: "۱۲ تا ۱۵", description: "۱۲ ظهر تا ۳ بعدازظهر" },
  { id: "15-18", label: "۱۵ تا ۱۸", description: "۳ تا ۶ بعدازظهر" },
] as const;
export type DeliverySlot = (typeof DELIVERY_SLOTS)[number]["id"];
export type DeliverySchedule = {
  date: string;
  slot: DeliverySlot;
  timeZone: typeof DELIVERY_TIME_ZONE;
};
export function todayInTehran(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DELIVERY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((k) => parts.find((p) => p.type === k)!.value)
    .join("-");
}
export function addCalendarDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days, 12)).toISOString().slice(0, 10);
}
export const earliestDeliveryDate = (now = new Date()) =>
  addCalendarDays(todayInTehran(now), 2);
export function firstAvailableDelivery(now = new Date()): DeliverySchedule {
  return {
    date: nextAvailableDeliveryDate(earliestDeliveryDate(now)),
    slot: "09-12",
    timeZone: DELIVERY_TIME_ZONE,
  };
}
export const deliveryWeekday = (date: string) =>
  new Date(date + "T12:00:00Z").getUTCDay();
export const deliverySlotsFor = (date: string) =>
  deliveryWeekday(date) === 4 ? DELIVERY_SLOTS.slice(0, 2) : DELIVERY_SLOTS;
export function deliveryUnavailableReason(date: string): string | undefined {
  if (deliveryWeekday(date) === 5) return "جمعه؛ تحویل نداریم";
  const holiday = holidayForDate(date);
  if (holiday) return "تعطیل رسمی: " + holiday.title;
  if (!holidayYearAvailable(persianParts(date).year))
    return "اطلاعات تعطیلات این سال هنوز در دسترس نیست";
}
export function nextAvailableDeliveryDate(from: string): string {
  let date = from;
  // Unknown years stay pending until their calendar loads; never guess lunar holidays.
  for (let i = 0; i < 370; i++, date = addCalendarDays(date, 1)) {
    if (deliveryWeekday(date) !== 5 && !holidayForDate(date)) return date;
  }
  throw Error("روز مجاز تحویل پیدا نشد");
}
export function validateDelivery(
  schedule: DeliverySchedule | undefined,
  now = new Date(),
) {
  if (!schedule) throw Error("روز و بازه تحویل را انتخاب کنید");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(schedule.date) ||
    addCalendarDays(schedule.date, 0) !== schedule.date
  )
    throw Error("تاریخ تحویل معتبر نیست");
  if (schedule.date < earliestDeliveryDate(now))
    throw Error(
      "تحویل از دو روز بعد از امروز قابل انتخاب است؛ روز تحویل را دوباره انتخاب کنید",
    );
  const unavailable = deliveryUnavailableReason(schedule.date);
  if (unavailable) throw Error(unavailable);
  if (
    !deliverySlotsFor(schedule.date).some((s) => s.id === schedule.slot) ||
    schedule.timeZone !== DELIVERY_TIME_ZONE
  )
    throw Error(
      deliveryWeekday(schedule.date) === 4
        ? "پنج‌شنبه فقط بازه‌های ۹ تا ۱۲ و ۱۲ تا ۱۵ قابل انتخاب‌اند"
        : "بازه ساعت تحویل معتبر نیست",
    );
}
export const formatDeliveryDate = (key: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    timeZone: "UTC",
    dateStyle: "full",
  }).format(new Date(key + "T12:00:00Z"));
export const deliverySlotLabel = (slot: DeliverySlot) =>
  DELIVERY_SLOTS.find((s) => s.id === slot)!.label;
const persianFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
export function persianParts(key: string) {
  const p = persianFormatter.formatToParts(new Date(key + "T12:00:00Z"));
  const value = (type: string) => Number(p.find((p) => p.type === type)!.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}
export function persianMonthStart(year: number, month: number) {
  const start = Date.UTC(year + 621, 2, 15, 12);
  for (let i = 0; i < 380; i++) {
    const key = new Date(start + i * 86400000).toISOString().slice(0, 10);
    const p = persianParts(key);
    if (p.year === year && p.month === month && p.day === 1) return key;
  }
  throw Error("ماه تقویم معتبر نیست");
}
export function persianMonth(year: number, month: number) {
  const first = persianMonthStart(year, month);
  const next = persianMonthStart(
    month === 12 ? year + 1 : year,
    month === 12 ? 1 : month + 1,
  );
  return {
    first,
    days: Math.round(
      (+new Date(next + "T12:00:00Z") - +new Date(first + "T12:00:00Z")) /
        86400000,
    ),
    offset: (new Date(first + "T12:00:00Z").getUTCDay() + 1) % 7,
    label: new Intl.DateTimeFormat("fa-IR", {
      timeZone: "UTC",
      calendar: "persian",
      month: "long",
      year: "numeric",
    }).format(new Date(first + "T12:00:00Z")),
  };
}
export function numericPersianDate(key: string) {
  const p = persianParts(key);
  return [p.year, p.month, p.day]
    .map((v, i) =>
      new Intl.NumberFormat("fa-IR", {
        useGrouping: false,
        minimumIntegerDigits: i ? 2 : 4,
      }).format(v),
    )
    .join("/");
}
