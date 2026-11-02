import {
  loadHolidayYear,
  holidayForDate,
  holidayYearAvailable,
  type HolidayResult,
} from "./holidays";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import {
  DELIVERY_SLOTS,
  deliverySlotsFor,
  deliveryUnavailableReason,
  deliveryWeekday,
  nextAvailableDeliveryDate,
  addCalendarDays,
  earliestDeliveryDate,
  formatDeliveryDate,
  numericPersianDate,
  persianMonth,
  persianParts,
  todayInTehran,
  type DeliverySchedule,
} from "./delivery";
export function DeliveryPicker({
  value,
  onChange,
}: {
  value: DeliverySchedule;
  onChange: (schedule: DeliverySchedule) => void;
}) {
  const [minimum, setMinimum] = useState(earliestDeliveryDate);
  const [today, setToday] = useState(todayInTehran);
  const [cursor, setCursor] = useState(() => persianParts(value.date));
  const [notice, setNotice] = useState("");
  const [calendarRevision, setCalendarRevision] = useState(0);
  const [retry, setRetry] = useState(0);
  const [calendarStatus, setCalendarStatus] = useState<HolidayResult>();
  const selectedYear = persianParts(value.date).year;
  useEffect(() => {
    let active = true;
    setCalendarStatus(undefined);
    Promise.all(
      [...new Set([cursor.year, selectedYear])].map(async (year) => ({
        year,
        result: await loadHolidayYear(year, retry > 0),
      })),
    ).then((results) => {
      if (!active) return;
      setCalendarStatus(results.find((r) => r.year === cursor.year)!.result);
      setCalendarRevision((n) => n + 1);
    });
    return () => {
      active = false;
    };
  }, [cursor.year, selectedYear, retry]);
  useEffect(() => {
    const refresh = () => {
      const min = earliestDeliveryDate();
      setMinimum(min);
      setToday(todayInTehran());
      const date = nextAvailableDeliveryDate(
        value.date < min ? min : value.date,
      );
      const slot = deliverySlotsFor(date).some((s) => s.id === value.slot)
        ? value.slot
        : "09-12";
      if (value.date !== date || value.slot !== slot) {
        onChange({ ...value, date, slot });
        setCursor(persianParts(date));
        setNotice(
          value.date < min
            ? "با تغییر تاریخ روز، اولین زمان مجاز تحویل به‌روز شد."
            : "زمان انتخابی با روزهای مجاز تحویل به‌روز شد.",
        );
      }
    };
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [value, onChange, calendarRevision]);
  const month = persianMonth(cursor.year, cursor.month);
  const cells = Array.from(
    { length: Math.ceil((month.offset + month.days) / 7) * 7 },
    (_, i) => {
      const day = i - month.offset + 1;
      return day > 0 && day <= month.days
        ? addCalendarDays(month.first, day - 1)
        : null;
    },
  );
  const prev =
    cursor.month === 1
      ? { year: cursor.year - 1, month: 12 }
      : { year: cursor.year, month: cursor.month - 1 };
  const minParts = persianParts(minimum);
  const previousDisabled =
    prev.year < minParts.year ||
    (prev.year === minParts.year && prev.month < minParts.month);
  return (
    <section className="delivery-picker" aria-label="انتخاب زمان تحویل">
      <div className="section-title">
        <h3>
          <CalendarDays size={18} />
          روز و ساعت تحویل
        </h3>
        <span>به وقت تهران</span>
      </div>
      <p className="delivery-help">
        اولین روز قابل انتخاب:{" "}
        {formatDeliveryDate(nextAvailableDeliveryDate(minimum))}
      </p>
      <div className="jalali-calendar">
        <div className="calendar-heading">
          <button
            type="button"
            className="link"
            aria-label="ماه قبل"
            disabled={previousDisabled}
            onClick={() => setCursor({ ...prev, day: 1 })}
          >
            <ChevronRight size={18} />
          </button>
          <strong aria-live="polite">{month.label}</strong>
          <button
            type="button"
            className="link"
            aria-label="ماه بعد"
            onClick={() =>
              setCursor({
                year: cursor.month === 12 ? cursor.year + 1 : cursor.year,
                month: cursor.month === 12 ? 1 : cursor.month + 1,
                day: 1,
              })
            }
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <table aria-label="تقویم شمسی تحویل">
          <thead>
            <tr>
              {[
                "شنبه",
                "یکشنبه",
                "دوشنبه",
                "سه‌شنبه",
                "چهارشنبه",
                "پنجشنبه",
                "جمعه",
              ].map((d, i) => (
                <th key={d} scope="col" aria-label={d} title={d}>
                  {["ش", "ی", "د", "س", "چ", "پ", "ج"][i]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: cells.length / 7 }, (_, row) => (
              <tr key={row}>
                {cells.slice(row * 7, row * 7 + 7).map((key, col) => (
                  <td key={col}>
                    {key && (
                      <button
                        type="button"
                        disabled={
                          key < minimum || !!deliveryUnavailableReason(key)
                        }
                        title={
                          key < minimum
                            ? "تحویل از دو روز بعد از امروز"
                            : deliveryUnavailableReason(key)
                        }
                        className={
                          (key === value.date ? "selected " : "") +
                          (key === today ? "today " : "") +
                          (deliveryWeekday(key) === 5 || holidayForDate(key)
                            ? "nonworking"
                            : "")
                        }
                        aria-current={key === today ? "date" : undefined}
                        aria-label={
                          "انتخاب روز تحویل " + numericPersianDate(key)
                        }
                        aria-pressed={key === value.date}
                        data-date={key}
                        onClick={() => {
                          onChange({
                            ...value,
                            date: key,
                            slot: deliverySlotsFor(key).some(
                              (s) => s.id === value.slot,
                            )
                              ? value.slot
                              : "09-12",
                          });
                          setNotice("");
                        }}
                      >
                        {persianParts(key).day.toLocaleString("fa-IR")}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="delivery-help">
        جمعه‌ها و تعطیلات رسمی تحویل نداریم. پنج‌شنبه‌ها فقط ۹ تا ۱۲ و ۱۲ تا ۱۵.
      </p>
      {!holidayYearAvailable(cursor.year) && (
        <p className="notice" role="status">
          {calendarStatus
            ? "تقویم تعطیلات این سال در دسترس نیست؛ انتخاب روز تا دریافت تقویم غیرفعال است."
            : "در حال دریافت تعطیلات این سال…"}
          <button
            type="button"
            className="link"
            onClick={() => setRetry((n) => n + 1)}
          >
            تلاش دوباره
          </button>
        </p>
      )}
      {calendarStatus?.source === "local" && (
        <p className="delivery-help">
          تعطیلات براساس نسخه ذخیره‌شده تقویم نمایش داده می‌شود.
        </p>
      )}
      <fieldset
        className="delivery-slots"
        style={{
          gridTemplateColumns: `repeat(${deliverySlotsFor(value.date).length}, minmax(0, 1fr))`,
        }}
      >
        <legend>
          <Clock size={16} />
          بازه ساعت تحویل
        </legend>
        {deliverySlotsFor(value.date).map((slot) => (
          <label
            key={slot.id}
            className={value.slot === slot.id ? "selected" : ""}
            title={slot.description}
          >
            <input
              type="radio"
              name="delivery-slot"
              value={slot.id}
              checked={value.slot === slot.id}
              onChange={() => onChange({ ...value, slot: slot.id })}
            />
            <span>{slot.label}</span>
          </label>
        ))}
      </fieldset>
      <div className="delivery-selection" role="status">
        زمان انتخاب‌شده: {formatDeliveryDate(value.date)}،{" "}
        {DELIVERY_SLOTS.find((s) => s.id === value.slot)!.description}
      </div>
      {notice && <p className="notice">{notice}</p>}
    </section>
  );
}
