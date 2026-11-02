import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, LifeBuoy, Plus, Send, X } from "lucide-react";
import * as D from "./domain";
import { Empty } from "./ui";
import "./tickets.css";
export function TicketsPanel({
  state,
  customer,
  admin,
  mutate,
  notify,
}: {
  state: D.State;
  customer: D.Customer;
  admin: boolean;
  mutate: (fn: (state: D.State) => void) => boolean;
  notify: (text: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const conversation = useRef<HTMLElement>(null);
  const tickets = state.tickets.filter(
    (t) => admin || t.customer === customer.id,
  );
  const current = tickets.find((t) => t.id === selected);
  useEffect(() => {
    if (current) conversation.current?.focus();
  }, [selected]);
  const status = (ticket: D.Ticket) => (
    <span className={"ticket-status " + D.ticketStatus(ticket)}>
      {D.ticketStatus(ticket) === "answered" ? "پاسخ داده شده" : "در حال بررسی"}
    </span>
  );
  return (
    <div className="tickets-page">
      <div className="section-title ticket-page-heading">
        <div>
          <span className="eyebrow">
            <LifeBuoy size={17} />
            پشتیبانی سانا
          </span>
          <h1>{admin ? "تیکت‌های مراکز" : "پشتیبانی دستگاه‌های من"}</h1>
        </div>
        {!admin && (
          <button
            onClick={() => setCompose((v) => !v)}
            aria-expanded={compose}
            aria-controls="ticket-compose"
          >
            <Plus size={18} />
            تیکت جدید
          </button>
        )}
      </div>
      {!admin && compose && (
        <form
          id="ticket-compose"
          className="card ticket-compose"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const f = new FormData(form);
            let id = "";
            if (
              mutate((s) => {
                id = D.createTicket(
                  s,
                  customer.id,
                  String(f.get("device")),
                  String(f.get("title")),
                  String(f.get("text")),
                ).id;
              })
            ) {
              form.reset();
              setCompose(false);
              setSelected(id);
              notify("تیکت ثبت شد؛ پاسخ را از همین صفحه پیگیری کنید");
            }
          }}
        >
          <div className="section-title">
            <h2>ثبت تیکت جدید</h2>
            <button
              type="button"
              className="link"
              aria-label="بستن فرم تیکت"
              onClick={() => setCompose(false)}
            >
              <X size={20} />
            </button>
          </div>
          <label>
            دستگاه خریداری‌شده
            <select
              name="device"
              aria-label="دستگاه خریداری‌شده"
              required
              defaultValue=""
              autoFocus
            >
              <option value="" disabled>
                انتخاب دستگاه و سریال
              </option>
              {customer.devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.model} · {d.serial}
                </option>
              ))}
            </select>
          </label>
          {!customer.devices.length && (
            <p className="notice">
              دستگاهی در حساب شما ثبت نشده است؛ برای ثبت دستگاه با سانا تماس
              بگیرید.
            </p>
          )}
          <label>
            موضوع
            <input
              name="title"
              required
              maxLength={100}
              placeholder="موضوع درخواست شما"
            />
          </label>
          <label>
            پیام شما
            <textarea
              name="text"
              required
              maxLength={2000}
              rows={4}
              placeholder="مشکل دستگاه و اقداماتی که انجام داده‌اید را بنویسید…"
            />
          </label>
          <button disabled={!customer.devices.length}>
            <Send size={17} />
            ارسال تیکت
          </button>
        </form>
      )}
      <section className="card ticket-history" aria-label="سوابق تیکت‌ها">
        <div className="section-title">
          <h2>سوابق تیکت‌ها</h2>
          <span className="muted">
            {tickets.length.toLocaleString("fa-IR")} تیکت
          </span>
        </div>
        {!tickets.length ? (
          <Empty>هنوز تیکتی ثبت نشده است.</Empty>
        ) : (
          <div className="table-scroll">
            <table className="ticket-table" aria-label="جدول سوابق تیکت‌ها">
              <thead>
                <tr>
                  <th>شماره تیکت</th>
                  <th>تاریخ ثبت</th>
                  <th>عنوان</th>
                  <th>دستگاه</th>
                  {admin && <th>مرکز</th>}
                  <th>وضعیت</th>
                  <th>گفت‌وگو</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={selected === ticket.id ? "selected" : ""}
                  >
                    <th scope="row" className="ticket-number">
                      <bdi>{D.ticketReference(ticket)}</bdi>
                    </th>
                    <td className="ticket-created">
                      {ticket.createdAt ? (
                        <time dateTime={ticket.createdAt}>
                          {new Intl.DateTimeFormat("fa-IR", {
                            dateStyle: "medium",
                            timeZone: "Asia/Tehran",
                          }).format(new Date(ticket.createdAt))}
                        </time>
                      ) : (
                        "تاریخ ثبت نامشخص"
                      )}
                    </td>
                    <td className="ticket-title">
                      <button
                        className="link"
                        onClick={() => setSelected(ticket.id)}
                      >
                        {ticket.title}
                      </button>
                    </td>
                    <td className="ticket-device">
                      {ticket.device ? (
                        <>
                          <bdi>{ticket.device.model}</bdi>
                          <small>
                            <bdi>{ticket.device.serial}</bdi>
                          </small>
                        </>
                      ) : (
                        "دستگاه ثبت نشده"
                      )}
                    </td>
                    {admin && (
                      <td className="ticket-customer">
                        {
                          state.customers.find((c) => c.id === ticket.customer)
                            ?.name
                        }
                      </td>
                    )}
                    <td className="ticket-state">{status(ticket)}</td>
                    <td className="ticket-action">
                      <button
                        className="link"
                        aria-label={"مشاهده تیکت " + D.ticketReference(ticket)}
                        onClick={() =>
                          setSelected(selected === ticket.id ? null : ticket.id)
                        }
                        aria-expanded={selected === ticket.id}
                      >
                        مشاهده
                        <ChevronLeft size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {current && (
        <article
          className="card ticket-conversation"
          ref={conversation}
          tabIndex={-1}
          aria-label={"گفت‌وگوی تیکت " + D.ticketReference(current)}
        >
          <button
            className="link ticket-back"
            onClick={() => setSelected(null)}
          >
            <ArrowRight size={18} />
            بازگشت به سوابق
          </button>
          <div className="section-title">
            <div>
              <small>
                <bdi>{D.ticketReference(current)}</bdi>
              </small>
              <h2>{current.title}</h2>
            </div>
            {status(current)}
          </div>
          {current.device && (
            <p className="ticket-device-summary">
              دستگاه: <bdi>{current.device.model}</bdi> · سریال{" "}
              <bdi>{current.device.serial}</bdi>
            </p>
          )}
          <div className="ticket-messages" aria-label="پیام‌های تیکت">
            {current.messages.map((message, i) => (
              <div
                className={"message " + (message.by === "سانا" ? "reply" : "")}
                key={i}
              >
                <div className="message-meta">
                  <strong>
                    {message.by === "سانا" ? "پشتیبانی سانا" : "پیام مرکز"}
                  </strong>
                  <time dateTime={message.time}>
                    {new Intl.DateTimeFormat("fa-IR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Tehran",
                    }).format(new Date(message.time))}
                  </time>
                </div>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <form
            className="ticket-reply"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const text = String(new FormData(form).get("reply"));
              if (
                mutate((s) =>
                  D.replyToTicket(
                    s,
                    current.id,
                    admin ? "admin" : "customer",
                    customer.id,
                    text,
                  ),
                )
              ) {
                form.reset();
                notify("پاسخ ثبت شد");
              }
            }}
          >
            <label>
              پاسخ
              <textarea
                name="reply"
                required
                maxLength={2000}
                rows={3}
                placeholder="پاسخ یا اطلاعات تکمیلی…"
              />
            </label>
            <button>
              <Send size={17} />
              ثبت پاسخ
            </button>
          </form>
        </article>
      )}
    </div>
  );
}
