import { assetPath } from "./assets";
import React, { useState, useEffect, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowUpLeft,
  LayoutDashboard,
  Microscope,
  Package,
  ShoppingBag,
  LifeBuoy,
  Users,
  Settings,
  LogOut,
  Search,
  Check,
  ChevronLeft,
  Truck,
  ShieldCheck,
  Phone,
  Plus,
  Minus,
  ClipboardList,
  Activity,
  RefreshCw,
} from "lucide-react";
import { products as devices } from "./devices";
import * as D from "./domain";
import * as repo from "./repository";
import "./style.css";
import { PublicSite } from "./PublicSite";
import { Logo, DeviceImage, Empty } from "./ui";
import { Login } from "./Login";
const labels: Record<string, string> = {
  pending: "در انتظار بررسی",
  confirmed: "تأیید شده",
  rejected: "رد شده",
  cancelled: "لغو شده",
  unpaid: "پرداخت نشده",
  failed: "ناموفق",
  paid: "پرداخت شده",
  waiting: "در انتظار ارسال",
  preparing: "در حال آماده‌سازی",
  sent: "ارسال شده",
  delivered: "تحویل شده",
  online: "آنلاین",
  credit: "چک سه‌ماهه",
  success: "موفق",
};
const Badge = ({ value }: { value: string }) => (
  <span className={"badge " + value}>{labels[value] || value}</span>
);
function App() {
  const [state, setState] = useState<D.State>(() => {
    try {
      return repo.read();
    } catch {
      return D.seed();
    }
  });
  const [revision, setRevision] = useState(0);
  const [supplyLimit, setSupplyLimit] = useState(6);
  const [storageError, setStorageError] = useState("");
  const [role, setRole] = useState(sessionStorage.getItem("sana-role") || "");
  const [cid, setCid] = useState(
    sessionStorage.getItem("sana-customer") || "c1",
  );
  const [path, setPath] = useState(location.hash.slice(1) || "/");
  const [toast, setToast] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutKey, setCheckoutKey] = useState(D.uid());
  const [method, setMethod] = useState<D.Order["method"]>("online");
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  useEffect(() => {
    const nav = () => {
      setPath(location.hash.slice(1) || "/");
      setSelected("");
      setQuery("");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", nav);
    const sync = () => {
      try {
        setState(repo.read());
      } catch {
        setStorageError("خواندن داده محلی ممکن نیست؛ بازنشانی را بررسی کنید");
      }
    };
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("sana-change", sync);
    try {
      repo.read();
    } catch {
      setStorageError(
        "داده ذخیره‌شده قابل خواندن نیست. برای شروع دوباره بازنشانی کنید.",
      );
    }
    return () => {
      window.removeEventListener("hashchange", nav);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("sana-change", sync);
    };
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 5500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const mutate = (fn: (s: D.State) => void) => {
    try {
      const s = repo.read();
      fn(s);
      repo.save(s);
      setState(s);
      return true;
    } catch (e) {
      setToast(e instanceof Error ? e.message : "ذخیره داده ممکن نیست");
      return false;
    }
  };
  const go = (p: string) => {
    location.hash = p;
  };
  const login = (r: string, c = "c1") => {
    setRole(r);
    setCid(c);
    sessionStorage.setItem("sana-role", r);
    sessionStorage.setItem("sana-customer", c);
    go("/" + r);
  };
  const customer =
    state.customers.find((c) => c.id === cid) || state.customers[0];
  const admin = path.startsWith("/admin");
  const panel = path.startsWith("/customer") || admin;
  const orders = state.orders.filter((o) => admin || o.customer === cid);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const base = Object.entries(cart).reduce(
    (a, [id, q]) =>
      a + (state.products.find((p) => p.id === id)?.price || 0) * q,
    0,
  );
  const add = (p: D.Item) => {
    if (
      !D.compatible(p, customer) ||
      !customer.active ||
      p.stock <= (cart[p.id] || 0)
    ) {
      setToast("این قلم در حال حاضر قابل افزودن نیست");
      return;
    }
    setCart({ ...cart, [p.id]: (cart[p.id] || 0) + 1 });
    setToast("به سبد خرید اضافه شد");
  };
  function place() {
    if (
      mutate((s) => {
        D.createOrder(s, cid, cart, method, checkoutKey);
      })
    ) {
      setCart({});
      setCheckoutKey(D.uid());
      go("/customer/orders");
      setSelected("");
      setToast(
        method === "credit"
          ? "درخواست برای بررسی فروش ثبت شد"
          : "سفارش ثبت شد؛ نتیجه پرداخت نمایشی را انتخاب کنید",
      );
    }
  }
  const repeat = (o: D.Order) => {
    const { cart, skipped } = D.reorder(state, o);
    setCart(cart);
    setCheckoutKey(D.uid());
    go("/customer/cart");
    setToast(
      skipped.length
        ? "برخی اقلام به دلیل موجودی یا سازگاری حذف شدند: " + skipped.join("، ")
        : "سبد با قیمت و موجودی فعلی آماده شد",
    );
  };
  const reset = () => {
    if (
      confirm(
        "تمام سفارش‌ها و تغییرات دمو پاک و داده‌های نمونه بازگردانده شوند؟",
      )
    ) {
      try {
        repo.reset();
        setRevision((x) => x + 1);
        setStorageError("");
        setCart({});
        setSelected("");
        setCheckoutKey(D.uid());
        setToast("داده‌های دمو بازنشانی شد");
      } catch {
        setStorageError("ذخیره‌سازی مرورگر در دسترس نیست");
      }
    }
  };
  const titleMap: Record<string, string> = {
    dashboard: "نمای کلی",
    devices: "دستگاه‌های من",
    supplies: "کیت‌ها و مواد مصرفی",
    cart: "سبد خرید و تسویه",
    orders: "سفارش‌ها",
    tickets: "پشتیبانی",
    profile: "اطلاعات مرکز",
    customers: "مشتریان و دستگاه‌ها",
    products: "مدیریت محصولات",
    forecast: "زمان تأمین مجدد",
    logs: "SERVICELOGS",
  };
  const tab = path.split("/")[2] || "dashboard";
  const navItems = admin
    ? [
        ["dashboard", "نمای کلی", LayoutDashboard],
        ["orders", "سفارش‌ها", ClipboardList],
        ["customers", "مشتریان", Users],
        ["products", "محصولات و موجودی", Package],
        ["tickets", "تیکت‌های پشتیبانی", LifeBuoy],
        ["forecast", "تأمین مجدد", Activity],
        ["logs", "SERVICELOGS", RefreshCw],
      ]
    : [
        ["dashboard", "نمای کلی", LayoutDashboard],
        ["devices", "دستگاه‌های من", Microscope],
        ["supplies", "کیت‌ها و مواد مصرفی", Package],
        ["cart", "سبد خرید", ShoppingBag],
        ["orders", "سفارش‌های من", ClipboardList],
        ["tickets", "تیکت‌های پشتیبانی", LifeBuoy],
        ["profile", "اطلاعات مرکز", Settings],
      ];
  function Forecast({ c, limit = 99 }: { c: D.Customer; limit?: number }) {
    const relevant = state.products.filter(
      (p) =>
        p.verified &&
        (c.devices.some((d) => d.initial.some((l) => l.product === p.id)) ||
          state.orders.some(
            (o) =>
              o.customer === c.id && o.lines.some((l) => l.product === p.id),
          )),
    );
    if (!relevant.length)
      return <p className="muted">داده کافی برای برآورد وجود ندارد</p>;
    return (
      <>
        {relevant.slice(0, limit).map((p) => {
          const f = D.forecast(state, c, p.id);
          return (
            <div className="forecast-row" key={p.id}>
              <div>
                <strong>{p.name}</strong>
                <p>{c.name}</p>
              </div>
              {f ? (
                <div>
                  <Badge value={f.near ? "نزدیک به موعد" : "برآورد موجود"} />
                  <p>
                    {D.date(f.due)} · اطمینان {f.confidence}
                  </p>
                  <small>
                    {f.count} تحویل؛ فاصله بعدی {f.days} روز، بر پایه مقدار
                    تحویل و میانگین فاصله به ازای بسته
                  </small>
                </div>
              ) : (
                <small>داده کافی برای برآورد وجود ندارد</small>
              )}
            </div>
          );
        })}
      </>
    );
  }
  function OrderCard({ o }: { o: D.Order }) {
    const detail = selected === o.id;
    return (
      <article className="order-card">
        <div className="row wrap">
          <div>
            <bdi>{o.id}</bdi>
            <p>
              {D.date(o.created)} ·{" "}
              {state.customers.find((c) => c.id === o.customer)?.name}
            </p>
          </div>
          <Badge value={o.status} />
          <strong>{D.money(o.total)}</strong>
          <button
            className="link"
            onClick={() => setSelected(detail ? "" : o.id)}
          >
            {detail ? "بستن جزئیات" : "جزئیات و پیگیری"}{" "}
            <ChevronLeft size={16} />
          </button>
        </div>
        {detail && (
          <div className="order-detail">
            <div className="row wrap">
              <span>روش خرید: {labels[o.method]}</span>
              <span>
                پرداخت: <Badge value={o.payment} />
              </span>
              <span>
                ارسال: <Badge value={o.shipping} />
              </span>
            </div>
            {o.lines.map((l) => (
              <div className="line" key={l.product}>
                <span>
                  {l.name} × {l.qty} بسته
                </span>
                <span>{D.money(l.price * l.qty)}</span>
              </div>
            ))}
            <p>
              جمع پایه:{" "}
              {D.money(o.lines.reduce((a, l) => a + l.price * l.qty, 0))} ·
              تخفیف آنلاین: {o.method === "online" ? "۲۰٪" : "ندارد"}
            </p>
            {o.note && <p className="notice">توضیح فروش: {o.note}</p>}
            {o.status === "pending" && (
              <button
                className="link cancel-order"
                onClick={() => {
                  if (confirm("این سفارش در انتظار بررسی لغو شود؟"))
                    mutate((s) => D.cancelOrder(s, o.id));
                }}
              >
                لغو سفارش در انتظار بررسی
              </button>
            )}
            {!admin &&
              o.method === "online" &&
              o.payment !== "paid" &&
              o.status === "pending" && (
                <div className="payment-box">
                  <strong>درگاه نمایشی — هیچ مبلغی جابه‌جا نمی‌شود</strong>
                  <div className="actions">
                    <button onClick={() => mutate((s) => D.pay(s, o.id, true))}>
                      شبیه‌سازی پرداخت موفق
                    </button>
                    <button
                      className="secondary"
                      onClick={() => mutate((s) => D.pay(s, o.id, false))}
                    >
                      شبیه‌سازی پرداخت ناموفق
                    </button>
                  </div>
                  <small>تلاش مجدد روی همین سفارش انجام می‌شود.</small>
                </div>
              )}
            {!admin && (
              <button className="secondary" onClick={() => repeat(o)}>
                سفارش مجدد با قیمت فعلی
              </button>
            )}
            {admin && o.method === "credit" && o.status === "pending" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  mutate((s) =>
                    D.review(
                      s,
                      o.id,
                      f.get("decision") === "approve",
                      String(f.get("note")),
                    ),
                  );
                }}
              >
                <label>
                  توضیح بررسی
                  <input name="note" required maxLength={300} />
                </label>
                <label>
                  نتیجه
                  <select name="decision">
                    <option value="approve">تأیید شرایطی</option>
                    <option value="reject">رد درخواست</option>
                  </select>
                </label>
                <button>ثبت نتیجه بررسی</button>
              </form>
            )}
            {admin && o.status === "confirmed" && (
              <label>
                وضعیت ارسال
                <select
                  value={o.shipping}
                  onChange={(e) =>
                    mutate((s) =>
                      D.ship(s, o.id, e.target.value as D.Order["shipping"]),
                    )
                  }
                >
                  {["waiting", "preparing", "sent", "delivered"].map((x) => (
                    <option key={x} value={x}>
                      {labels[x]}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </article>
    );
  }
  function Tickets() {
    const tickets = state.tickets.filter((t) => admin || t.customer === cid);
    return (
      <>
        <div className="section-title">
          <h2>{admin ? "گفت‌وگو با مراکز" : "همراه شما هستیم"}</h2>
          <span>{tickets.length} تیکت</span>
        </div>
        {!admin && (
          <form
            className="card"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (
                mutate((s) => {
                  s.tickets.unshift({
                    id: D.uid(),
                    customer: cid,
                    title: String(f.get("title")),
                    messages: [
                      {
                        text: String(f.get("text")),
                        by: "مرکز",
                        time: new Date().toISOString(),
                      },
                    ],
                  });
                })
              ) {
                e.currentTarget.reset();
                setToast("تیکت ثبت شد");
              }
            }}
          >
            <h3>تیکت جدید</h3>
            <label>
              موضوع
              <input required name="title" maxLength={100} />
            </label>
            <label>
              پیام شما
              <textarea required name="text" maxLength={2000} />
            </label>
            <button>ارسال تیکت</button>
          </form>
        )}
        {tickets.length === 0 && <Empty>هنوز تیکتی ثبت نشده است.</Empty>}
        {tickets.map((t) => (
          <article className="card" key={t.id}>
            <h3>{t.title}</h3>
            <small>
              {state.customers.find((c) => c.id === t.customer)?.name}
            </small>
            {t.messages.map((m, i) => (
              <div
                key={i}
                className={"message " + (m.by === "سانا" ? "reply" : "")}
              >
                <small>
                  {m.by} · {D.date(m.time)}
                </small>
                <p>{m.text}</p>
              </div>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const text = String(new FormData(e.currentTarget).get("reply"));
                if (
                  mutate((s) =>
                    s.tickets
                      .find((x) => x.id === t.id)!
                      .messages.push({
                        text,
                        by: admin ? "سانا" : "مرکز",
                        time: new Date().toISOString(),
                      }),
                  )
                )
                  e.currentTarget.reset();
              }}
            >
              <label>
                پاسخ
                <textarea name="reply" required maxLength={2000} />
              </label>
              <button className="secondary">ثبت پاسخ</button>
            </form>
          </article>
        ))}
      </>
    );
  }
  function CustomerEditor({ c }: { c?: D.Customer }) {
    return (
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            mutate((s) => {
              const mobile = String(f.get("mobile"));
              if (
                s.customers.some((x) => x.mobile === mobile && x.id !== c?.id)
              )
                throw Error("شماره موبایل تکراری است");
              const v = {
                name: String(f.get("name")),
                manager: String(f.get("manager")),
                mobile,
                address: String(f.get("address")),
                active: f.get("active") === "on",
              };
              if (c)
                Object.assign(
                  s.customers.find((x) => x.id === c.id)!,
                  v,
                );
              else s.customers.push({ ...v, id: D.uid(), devices: [] });
            })
          ) {
            setToast("اطلاعات مرکز ذخیره شد");
            if (!c) e.currentTarget.reset();
          }
        }}
      >
        <h3>{c ? "ویرایش " + c.name : "ایجاد مرکز فرضی"}</h3>
        <div className="form-grid">
          <label>
            نام مرکز
            <input
              name="name"
              defaultValue={c?.name}
              required
              maxLength={100}
            />
          </label>
          <label>
            مسئول مرکز
            <input
              name="manager"
              defaultValue={c?.manager}
              required
              maxLength={100}
            />
          </label>
          <label>
            موبایل نمایشی
            <input
              dir="ltr"
              name="mobile"
              defaultValue={c?.mobile}
              pattern="09[0-9]{9}"
              required
              placeholder="09000000003"
            />
          </label>
          <label>
            نشانی
            <input
              name="address"
              defaultValue={c?.address}
              required
              maxLength={250}
            />
          </label>
        </div>
        <label className="check">
          <input
            type="checkbox"
            name="active"
            defaultChecked={c?.active ?? true}
          />
          حساب فعال باشد
        </label>
        <button>ذخیره مرکز</button>
      </form>
    );
  }
  function DeviceAdmin({ c }: { c: D.Customer }) {
    return (
      <div className="card">
        <h3>دستگاه‌ها و تحویل اولیه — {c.name}</h3>
        {c.devices.map((d) => (
          <div className="line" key={d.id}>
            <div>
              <bdi>
                {d.model} · {d.serial}
              </bdi>
              <p>{D.date(d.delivered)}</p>
              {d.initial.map((l, i) => (
                <small key={i}>
                  {state.products.find((p) => p.id === l.product)?.name}:{" "}
                  {l.qty} بسته{" "}
                </small>
              ))}
            </div>
            <button
              className="link"
              onClick={() => {
                if (confirm("تخصیص این دستگاه حذف شود؟"))
                  mutate((s) => {
                    const x = s.customers.find((x) => x.id === c.id)!;
                    x.devices = x.devices.filter((x) => x.id !== d.id);
                  });
              }}
            >
              حذف تخصیص
            </button>
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (
              mutate((s) => {
                const model = String(f.get("model"));
                const pid = String(f.get("product"));
                const qty = Number(f.get("qty"));
                if (
                  +new Date(D.jalaliToISO(String(f.get("date")))) > Date.now()
                )
                  throw Error("تاریخ تحویل نمی‌تواند در آینده باشد");
                if (
                  pid &&
                  !s.products.find((p) => p.id === pid)?.models.includes(model)
                )
                  throw Error(
                    "قلم تحویل اولیه با مدل انتخابی در دمو سازگار نیست",
                  );
                const serial = String(f.get("serial"));
                if (
                  s.customers.some((c) =>
                    c.devices.some((d) => d.serial === serial),
                  )
                )
                  throw Error("سریال تکراری است");
                s.customers
                  .find((x) => x.id === c.id)!
                  .devices.push({
                    id: D.uid(),
                    model,
                    serial,
                    delivered: D.jalaliToISO(String(f.get("date"))),
                    initial: pid ? [{ product: pid, qty }] : [],
                  });
              })
            ) {
              e.currentTarget.reset();
              setToast("تحویل دستگاه ثبت شد");
            }
          }}
        >
          <div className="form-grid">
            <label>
              مدل
              <select name="model">
                {devices.map((d) => (
                  <option key={d.id}>{d.model}</option>
                ))}
              </select>
            </label>
            <label>
              سریال فرضی
              <input required name="serial" dir="ltr" maxLength={60} />
            </label>
            <label>
              تاریخ تحویل شمسی
              <input
                required
                name="date"
                dir="ltr"
                placeholder="۱۴۰۵/۰۸/۱۰"
                pattern="[0-9۰-۹٠-٩]{4}[/\-][0-9۰-۹٠-٩]{1,2}[/\-][0-9۰-۹٠-٩]{1,2}"
              />
            </label>
            <label>
              قلم اولیه
              <select name="product">
                <option value="">بدون کیت اولیه</option>
                {state.products
                  .filter((p) => p.verified)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              تعداد بسته
              <input
                type="number"
                min="1"
                max="1000"
                step="1"
                name="qty"
                defaultValue="1"
                required
              />
            </label>
          </div>
          <button className="secondary">تخصیص دستگاه و ثبت تحویل</button>
        </form>
      </div>
    );
  }
  function ProductEditor({ p }: { p?: D.Item }) {
    return (
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            mutate((s) => {
              const value = {
                name: String(f.get("name")),
                english: String(f.get("english")),
                brand: String(f.get("brand")),
                code: String(f.get("code")),
                price: Number(f.get("price")),
                stock: Number(f.get("stock")),
              };
              if (p)
                Object.assign(
                  s.products.find((x) => x.id === p.id)!,
                  value,
                );
              else
                s.products.push({
                  ...value,
                  id: D.uid(),
                  models: [],
                  tests: null,
                  verified: false,
                  source: String(f.get("source")),
                  image: "",
                });
            })
          ) {
            setToast("محصول ذخیره شد");
            if (!p) e.currentTarget.reset();
          }
        }}
      >
        <h3>{p ? p.name : "افزودن محصول معرفی‌شده (غیرقابل سفارش)"}</h3>
        <div className="form-grid">
          <label>
            نام فارسی
            <input
              required
              name="name"
              defaultValue={p?.name}
              maxLength={100}
            />
          </label>
          <label>
            نام انگلیسی
            <input
              required
              dir="ltr"
              name="english"
              defaultValue={p?.english}
              maxLength={100}
            />
          </label>
          <label>
            برند
            <input
              required
              name="brand"
              defaultValue={p?.brand}
              maxLength={50}
            />
          </label>
          <label>
            کد کاتالوگی
            <input
              dir="ltr"
              name="code"
              defaultValue={p?.code}
              maxLength={50}
            />
          </label>
          <label>
            قیمت پایه (تومان)
            <input
              required
              name="price"
              type="number"
              min="1"
              step="1"
              max="1000000000"
              defaultValue={p?.price ?? 2000000}
            />
          </label>
          <label>
            موجودی نمایشی (بسته)
            <input
              required
              name="stock"
              type="number"
              min="0"
              step="1"
              max="10000"
              defaultValue={p?.stock ?? 0}
            />
          </label>
          {!p && (
            <label>
              نشانی منبع سازنده
              <input
                type="url"
                name="source"
                required
                placeholder="https://…"
              />
            </label>
          )}
        </div>
        {p && (
          <p>
            آنلاین: {D.money(D.onlinePrice(p.price))} ·{" "}
            {p.verified
              ? "قابل سفارش فقط در دمو"
              : "در انتظار تأیید؛ غیرقابل سفارش"}
          </p>
        )}
        <button className="secondary">ذخیره محصول</button>
      </form>
    );
  }
  function PanelContent() {
    if (!customer.active && !admin)
      return <Empty>حساب شما غیرفعال است. با پشتیبانی تماس بگیرید.</Empty>;
    if (tab === "dashboard")
      return (
        <>
          <div className="welcome">
            <div>
              <span className="eyebrow">
                {admin ? "مدیریت سانا" : "همراه آزمایشگاه شما"}
              </span>
              <h1>
                {admin ? "همه‌چیز، در یک نگاه" : "سلام، به سانا خوش آمدید"}
              </h1>
              <p>
                {admin
                  ? "سفارش‌ها و نیازهای مراکز را از همین‌جا دنبال کنید."
                  : customer.name +
                    "؛ برای روزهای پُرکار آزمایشگاه، کنار شما هستیم."}
              </p>
              <button
                onClick={() =>
                  go(admin ? "/admin/orders" : "/customer/supplies")
                }
              >
                {admin ? "بررسی سفارش‌ها" : "سفارش کیت و مواد مصرفی"}
                <ArrowLeft size={18} />
              </button>
            </div>
            <div className="welcome-art">
              <Microscope size={100} strokeWidth={1} />
              <span>آماده برای فردای آزمایشگاه</span>
            </div>
          </div>
          <div className="stats">
            {[
              [
                admin ? "همه سفارش‌ها" : "سفارش‌های شما",
                orders.length,
                ClipboardList,
              ],
              [
                "در انتظار بررسی",
                orders.filter((o) => o.status === "pending").length,
                Activity,
              ],
              [
                admin ? "مراکز فعال" : "دستگاه‌های شما",
                admin
                  ? state.customers.filter((c) => c.active).length
                  : customer.devices.length,
                Microscope,
              ],
            ].map(([label, n, Icon], i) => {
              const I = Icon as typeof Package;
              return (
                <div className="stat" key={i}>
                  <span className="stat-icon">
                    <I size={22} />
                  </span>
                  <div>
                    <p>{String(label)}</p>
                    <strong>{Number(n).toLocaleString("fa-IR")}</strong>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="two-col">
            <section className="card">
              <div className="section-title">
                <h2>آخرین سفارش‌ها</h2>
                <button
                  className="link"
                  onClick={() =>
                    go(admin ? "/admin/orders" : "/customer/orders")
                  }
                >
                  مشاهده همه <ArrowLeft size={15} />
                </button>
              </div>
              {orders.slice(0, 3).map((o) => (
                <React.Fragment key={o.id}>{OrderCard({ o })}</React.Fragment>
              ))}
              {!orders.length && <Empty>هنوز سفارشی ندارید.</Empty>}
            </section>
            <section className="card soft">
              {admin ? (
                <>
                  <span className="eyebrow">پیگیری مالی دمو</span>
                  <h2>نمای پرداخت‌ها</h2>
                  <div className="line">
                    <span>جمع پرداخت موفق آنلاین</span>
                    <strong>
                      {D.money(
                        orders
                          .filter((o) => o.payment === "paid")
                          .reduce((a, o) => a + o.total, 0),
                      )}
                    </strong>
                  </div>
                  <div className="line">
                    <span>تعداد پرداخت موفق</span>
                    <strong>
                      {orders
                        .filter((o) => o.payment === "paid")
                        .length.toLocaleString("fa-IR")}
                    </strong>
                  </div>
                  <div className="line">
                    <span>پرداخت ناموفق</span>
                    <strong>
                      {orders
                        .filter((o) => o.payment === "failed")
                        .length.toLocaleString("fa-IR")}
                    </strong>
                  </div>
                  <div className="line">
                    <span>پرداخت نشده</span>
                    <strong>
                      {orders
                        .filter((o) => o.payment === "unpaid")
                        .length.toLocaleString("fa-IR")}
                    </strong>
                  </div>
                  <p>
                    تأیید خرید شرایطی به معنی وصول چک نیست. تمام مبالغ نمایشی
                    هستند.
                  </p>
                  <button className="link" onClick={() => go("/admin/orders")}>
                    بررسی و پیگیری سفارش‌ها <ArrowLeft size={15} />
                  </button>
                </>
              ) : (
                <>
                  {" "}
                  <span className="eyebrow">یک انتخاب به‌صرفه</span>
                  <h2>۲۰٪ کمتر، با پرداخت آنلاین</h2>
                  <p>
                    قیمت پایه برای خرید با چک سه‌ماهه است. با پرداخت آنلاین،
                    دقیقاً ۲۰٪ از مبلغ پایه کم می‌شود.
                  </p>
                  <div className="discount-number">
                    ۲۰<span>٪</span>
                  </div>
                  <small>تمام قیمت‌ها و پرداخت‌های این دمو فرضی‌اند.</small>
                </>
              )}
            </section>
          </div>
          <section className="card">
            <div className="section-title">
              <h2>یادآور تأمین مجدد</h2>
              <button
                className="link"
                onClick={() =>
                  go(admin ? "/admin/forecast" : "/customer/devices")
                }
              >
                جزئیات <ArrowLeft size={15} />
              </button>
            </div>
            {Forecast({ c: customer, limit: 3 })}
            <p className="muted">
              این برآورد موجودی یا مصرف واقعی مرکز را اندازه‌گیری نمی‌کند.
            </p>
          </section>
        </>
      );
    if (tab === "devices")
      return (
        <>
          <h1>دستگاه‌های من</h1>
          <p className="muted">از دستگاه خود به کیت‌های مرتبط برسید.</p>
          <div className="grid cards">
            {customer.devices.map((d) => {
              const model = devices.find((x) => x.model === d.model)!;
              return (
                <article className="card device" key={d.id}>
                  <DeviceImage model={model} />
                  <span className="eyebrow">{model.manufacturer}</span>
                  <h2>
                    <bdi>{d.model}</bdi>
                  </h2>
                  <p>
                    سریال: <bdi>{d.serial}</bdi>
                  </p>
                  <p>تحویل: {D.date(d.delivered)}</p>
                  <p>
                    اقلام اولیه:{" "}
                    {d.initial.length
                      ? d.initial
                          .map(
                            (l) =>
                              `${state.products.find((p) => p.id === l.product)?.name}، ${l.qty} بسته`,
                          )
                          .join("؛ ")
                      : "ثبت نشده"}
                  </p>
                  <button
                    className="secondary"
                    onClick={() => {
                      setDeviceFilter(d.model);
                      go("/customer/supplies");
                    }}
                  >
                    مشاهده مصرفی‌های مرتبط <ArrowLeft size={16} />
                  </button>
                </article>
              );
            })}
          </div>
          <section className="card">
            <h2>برآورد تأمین بعدی</h2>
            {Forecast({ c: customer })}
          </section>
        </>
      );
    if (tab === "supplies")
      return (
        <>
          <h1>کیت‌ها و مواد مصرفی</h1>
          <p className="muted">انتخابی متناسب با دستگاه‌های مرکز شما</p>
          <div className="notice">
            منوی سازنده با موجودی واقعی سانا یکسان نیست. سازگاری اقلام قابل
            سفارش فقط برای سناریوی دمو تعریف شده؛ کد دقیق، بسته‌بندی و IFU پیش
            از عرضه واقعی باید تأیید شوند.
          </div>
          <div className="filters">
            <label className="search">
              <Search size={19} />
              <input
                aria-label="جست‌وجوی محصول"
                placeholder="نام کیت، نام انگلیسی یا کد محصول…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSupplyLimit(6);
                }}
              />
            </label>
            <select
              aria-label="فیلتر دستگاه"
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value);
                setSupplyLimit(6);
              }}
            >
              <option value="">همه دستگاه‌های من</option>
              {customer.devices.map((d) => (
                <option key={d.id}>{d.model}</option>
              ))}
            </select>
            <button className="secondary" onClick={() => go("/customer/cart")}>
              سبد خرید ({count})
            </button>
          </div>
          <div className="grid cards">
            {state.products
              .filter(
                (p) =>
                  (p.name + " " + p.english + " " + p.code)
                    .toLowerCase()
                    .includes(query.toLowerCase()) &&
                  (!deviceFilter ||
                    p.models.includes(deviceFilter) ||
                    p.referenceModels?.includes(deviceFilter)),
              )
              .slice(0, supplyLimit)
              .map((p) => (
                <article className="card supply" key={p.id}>
                  <div className="row">
                    <span className="brand-label">
                      {p.brand}
                      {p.brand === "Wondfo" ? " / Finecare" : " / CBC"}
                    </span>
                    <Badge
                      value={
                        p.verified
                          ? "قابل سفارش در دمو"
                          : p.models.length
                            ? "معرفی‌شده سازنده"
                            : "نیازمند تأیید"
                      }
                    />
                  </div>
                  <div className="kit-art">
                    <Package size={52} strokeWidth={1} />
                    <bdi>{p.english}</bdi>
                    <small>تصویر نمادین بسته؛ عکس محصول نیست</small>
                  </div>
                  <h2>{p.name}</h2>
                  <p>
                    <bdi>
                      {p.english} {p.code && "· " + p.code}
                    </bdi>
                  </p>
                  <p className="muted">
                    {p.models.length ? (
                      <>
                        <bdi>{p.models.join(" / ")}</bdi> · تطبیق نمایشی
                      </>
                    ) : (
                      "سازگاری مستند نشده؛ قابل فروش نیست"
                    )}
                  </p>
                  <small>
                    معرفی‌شده در منوی سازنده؛ عرضه واقعی سانا تأیید نشده
                  </small>
                  <small>
                    تعداد تست در بسته: {p.tests ?? "نیازمند تأیید"} · واحد
                    سفارش: بسته
                  </small>
                  <a
                    className="source"
                    href={assetPath(p.source)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    منبع: کاتالوگ سازنده، صفحه {p.sourcePage ?? "نامشخص"} ↗
                  </a>
                  <div className="price-block">
                    <span>
                      پایه، چک سه‌ماهه <strong>{D.money(p.price)}</strong>
                    </span>
                    <span className="online">
                      آنلاین، ۲۰٪ کمتر{" "}
                      <strong>{D.money(D.onlinePrice(p.price))}</strong>
                    </span>
                    <small>
                      صرفه‌جویی: {D.money(p.price - D.onlinePrice(p.price))}
                    </small>
                  </div>
                  <button
                    disabled={!D.compatible(p, customer) || p.stock === 0}
                    onClick={() => add(p)}
                  >
                    <Plus size={17} /> افزودن به سبد
                  </button>
                  <small className="stock">
                    موجودی نمایشی: {p.stock} بسته · قیمت فرضی
                  </small>
                </article>
              ))}
          </div>
          {state.products.filter(
            (p) =>
              (p.name + " " + p.english + " " + p.code)
                .toLowerCase()
                .includes(query.toLowerCase()) &&
              (!deviceFilter ||
                p.models.includes(deviceFilter) ||
                p.referenceModels?.includes(deviceFilter)),
          ).length > supplyLimit && (
            <button
              className="secondary full"
              onClick={() => setSupplyLimit((n) => n + 6)}
            >
              نمایش محصولات بیشتر
            </button>
          )}
          {!state.products.some(
            (p) =>
              (p.name + " " + p.english + " " + p.code)
                .toLowerCase()
                .includes(query.toLowerCase()) &&
              (!deviceFilter ||
                p.models.includes(deviceFilter) ||
                p.referenceModels?.includes(deviceFilter)),
          ) && <Empty>محصولی پیدا نشد.</Empty>}
        </>
      );
    if (tab === "cart")
      return (
        <>
          <h1>سبد خرید و تسویه</h1>
          {!count ? (
            <Empty>
              سبد خرید شما خالی است.{" "}
              <a href="#/customer/supplies">انتخاب کیت</a>
            </Empty>
          ) : (
            <div className="two-col">
              <div className="card">
                {Object.entries(cart).map(([id, q]) => {
                  const p = state.products.find((p) => p.id === id)!;
                  return (
                    <div className="cart-line" key={id}>
                      <Package />
                      <div>
                        <h3>{p.name}</h3>
                        <small>
                          هر بسته {D.money(p.price)} · آنلاین{" "}
                          {D.money(D.onlinePrice(p.price))}
                        </small>
                      </div>
                      <div className="quantity">
                        <button
                          aria-label={"کاهش " + p.english}
                          onClick={() =>
                            setCart({ ...cart, [id]: Math.max(0, q - 1) })
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span>{q} بسته</span>
                        <button
                          aria-label={"افزایش " + p.english}
                          onClick={() => add(p)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <p>نشانی تحویل: {customer.address}</p>
              </div>
              <div className="card">
                <h2>روش خرید</h2>
                <label
                  className={"method " + (method === "online" ? "chosen" : "")}
                >
                  <input
                    type="radio"
                    checked={method === "online"}
                    onChange={() => setMethod("online")}
                  />
                  پرداخت آنلاین <Badge value="۲۰٪ تخفیف" />
                </label>
                <label
                  className={"method " + (method === "credit" ? "chosen" : "")}
                >
                  <input
                    type="radio"
                    checked={method === "credit"}
                    onChange={() => setMethod("credit")}
                  />
                  چک سه‌ماهه؛ نیازمند تأیید فروش
                </label>
                <div className="line">
                  <span>جمع پایه</span>
                  <strong>{D.money(base)}</strong>
                </div>
                <div className="line green">
                  <span>صرفه‌جویی آنلاین</span>
                  <strong>
                    {D.money(
                      method === "online" ? base - D.onlinePrice(base) : 0,
                    )}
                  </strong>
                </div>
                <div className="line">
                  <strong>مبلغ نهایی</strong>
                  <strong>
                    {D.money(method === "online" ? D.onlinePrice(base) : base)}
                  </strong>
                </div>
                <p className="muted">
                  {method === "credit"
                    ? "ثبت درخواست به معنی پرداخت یا تأیید نهایی نیست."
                    : "پس از ثبت سفارش، نتیجه پرداخت نمایشی را انتخاب کنید."}
                </p>
                <button className="full" onClick={place}>
                  {method === "online"
                    ? "ثبت سفارش و پرداخت نمایشی"
                    : "ثبت درخواست خرید شرایطی"}
                  <ArrowLeft size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      );
    if (tab === "orders")
      return (
        <>
          <h1>{admin ? "مدیریت سفارش‌ها" : "سفارش‌های من"}</h1>
          <div className="filters">
            <select
              aria-label="فیلتر سفارش"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            >
              <option value="">همه سفارش‌ها</option>
              <option value="pending">در انتظار بررسی</option>
              <option value="confirmed">تأیید شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </div>
          {orders
            .filter((o) => !query || o.status === query)
            .map((o) => (
              <React.Fragment key={o.id}>{OrderCard({ o })}</React.Fragment>
            ))}
          {!orders.filter((o) => !query || o.status === query).length && (
            <Empty>سفارشی در این بخش نیست.</Empty>
          )}
        </>
      );
    if (tab === "tickets") return Tickets();
    if (tab === "profile")
      return (
        <>
          <h1>اطلاعات مرکز</h1>
          <div className="card">
            <h2>{customer.name}</h2>
            <p>مسئول: {customer.manager}</p>
            <p>
              موبایل: <bdi>{customer.mobile}</bdi>
            </p>
            <p>{customer.address}</p>
            <p className="notice">
              اطلاعات کاملاً فرضی است. تغییر حساب و دستگاه از پنل مدیریت انجام
              می‌شود.
            </p>
          </div>
        </>
      );
    if (tab === "customers" && admin)
      return (
        <>
          <h1>مشتریان و دستگاه‌ها</h1>
          <p className="notice">
            فقط اطلاعات فرضی وارد کنید. رمز عبور واقعی ذخیره نمی‌شود.
          </p>
          {CustomerEditor({})}
          {state.customers.map((c) => (
            <section key={c.id}>
              {CustomerEditor({ c })}
              {DeviceAdmin({ c })}
            </section>
          ))}
        </>
      );
    if (tab === "products" && admin)
      return (
        <>
          <h1>محصولات، قیمت و موجودی نمایشی</h1>
          <p className="notice">
            سفارش ثبت‌شده قیمت و نام زمان ثبت را حفظ می‌کند. اقلام جدید ابتدا
            غیرقابل سفارش هستند؛ تأیید علمی سازگاری و بسته‌بندی در این دمو انجام
            نمی‌شود.
          </p>
          {ProductEditor({})}
          {state.products.map((p) => (
            <details className="card product-editor" key={p.id}>
              <summary>
                <strong>
                  {p.name} <bdi>{p.english}</bdi>
                </strong>
                <span>
                  {D.money(p.price)} · {p.stock} بسته
                </span>
              </summary>
              {ProductEditor({ p })}
            </details>
          ))}
        </>
      );
    if (tab === "forecast" && admin)
      return (
        <>
          <h1>زمان احتمالی خرید بعدی</h1>
          <div className="notice">
            برای حداقل سه تحویل: فاصله اولین تا آخرین تحویل ÷ تعداد بسته‌های
            تحویل‌های قبلی × مقدار آخرین تحویل. سفارش لغوشده، ردشده، پرداخت
            ناموفق یا تحویل‌نشده محاسبه نمی‌شود. برآورد تأمین است؛ سنجش مصرف
            نیست.
          </div>
          {state.customers.map((c) => (
            <section className="card" key={c.id}>
              <h2>{c.name}</h2>
              {Forecast({ c })}
              <button
                className="secondary"
                onClick={() => {
                  mutate((s) => {
                    for (const p of s.products) {
                      if (
                        D.forecast(s, c, p.id)?.near &&
                        !s.logs.some(
                          (l) =>
                            l.type === "replenishment.near" &&
                            l.related === c.id + ":" + p.id,
                        )
                      )
                        D.event(s, "replenishment.near", c.id + ":" + p.id);
                    }
                  });
                  setToast("یادآورهای نزدیک به موعد، بدون تکرار ثبت شدند");
                }}
              >
                ثبت رویداد یادآور نزدیک به موعد
              </button>
            </section>
          ))}
        </>
      );
    if (tab === "logs" && admin)
      return (
        <>
          <h1 dir="ltr" className="right">
            SERVICELOGS
          </h1>
          <p className="notice">
            adapter نمایشی: هیچ درخواست بیرونی ارسال نمی‌شود. تلاش مجدد تنها
            نتیجه همین رویداد را تغییر می‌دهد و سفارش جدید نمی‌سازد.
          </p>
          {state.logs.map((l) => (
            <article className="card" key={l.id}>
              <div className="row wrap">
                <div>
                  <bdi>{l.type}</bdi>
                  <p>
                    <bdi>{l.related}</bdi>
                  </p>
                </div>
                <Badge value={l.status} />
                <span>{l.attempts} تلاش</span>
                <button
                  className="link"
                  onClick={() => setSelected(selected === l.id ? "" : l.id)}
                >
                  جزئیات
                </button>
              </div>
              {selected === l.id && (
                <>
                  <p>
                    شناسه: <bdi>{l.id}</bdi>
                  </p>
                  <p>
                    مقصد: <bdi>{l.destination}</bdi>
                  </p>
                  <p>
                    {D.date(l.time)} ·{" "}
                    {new Date(l.time).toLocaleTimeString("fa-IR")}
                  </p>
                  <p>{l.error || "بدون خطا"}</p>
                  <div className="actions">
                    <button
                      onClick={() => mutate((s) => D.runLog(s, l.id, true))}
                    >
                      تلاش نمایشی موفق
                    </button>
                    <button
                      className="secondary"
                      onClick={() => mutate((s) => D.runLog(s, l.id, false))}
                    >
                      تلاش نمایشی ناموفق
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </>
      );
    return <Empty>این صفحه پیدا نشد.</Empty>;
  }
  return (
    <>
      {storageError && (
        <div className="global-error" role="alert">
          {storageError}
          <button onClick={reset}>بازنشانی داده‌ها</button>
        </div>
      )}
      {panel && role === (admin ? "admin" : "customer") ? (
        <div className="app-shell">
          <aside className="sidebar">
            <a href="#/" className="panel-brand">
              <Logo />
              <span>{admin ? "پنل مدیریت" : "پنل مشتریان"}</span>
            </a>
            <div className="center-name">
              <span className="avatar">{admin ? "س" : "س‌پ"}</span>
              <div>
                <strong>{admin ? "مدیریت سانا" : customer.name}</strong>
                <small>
                  {admin ? "دسترسی نمایشی مدیر" : "مرکز آزمایشگاهی · حساب دمو"}
                </small>
              </div>
            </div>
            <nav>
              {navItems.map(([key, label, I]) => {
                const Icon = I as typeof Package;
                return (
                  <a
                    key={String(key)}
                    className={tab === key ? "active" : ""}
                    href={"#/" + (admin ? "admin" : "customer") + "/" + key}
                  >
                    <Icon size={20} />
                    <span>{String(label)}</span>
                    {key === "cart" && count > 0 && <b>{count}</b>}
                  </a>
                );
              })}
            </nav>
            <div className="sidebar-bottom">
              <p>با سانا در ارتباط باشید</p>
              <a href="tel:+982633107">
                <Phone size={16} />
                <bdi>۰۲۶ ۳۳۱۰۷</bdi>
              </a>
              <button
                className="link"
                onClick={() => {
                  setRole("");
                  sessionStorage.removeItem("sana-role");
                  go("/login");
                }}
              >
                <LogOut size={17} />
                خروج از حساب
              </button>
            </div>
          </aside>
          <div className="workspace">
            <header className="panel-header">
              <div>
                <span className="muted">سانا / </span>
                {titleMap[tab] || "پنل"}
              </div>
              <div className="row">
                <span className="demo-dot">نسخه نمایشی</span>
                <button
                  className="link role-switch"
                  onClick={() => login(admin ? "customer" : "admin")}
                >
                  {admin ? "نمای مشتری" : "نمای مدیریت"}{" "}
                  <ArrowUpLeft size={16} />
                </button>
                <button
                  className="link logout-header"
                  aria-label="خروج از حساب"
                  onClick={() => {
                    setRole("");
                    sessionStorage.removeItem("sana-role");
                    go("/login");
                  }}
                >
                  <LogOut size={17} />
                </button>
                <span className="avatar small">س</span>
              </div>
            </header>
            <div className="demo-bar">
              محیط دمو · اطلاعات، قیمت‌ها و موجودی‌ها فرضی هستند. هیچ پرداخت یا
              پیامک واقعی انجام نمی‌شود.
            </div>
            <main className="panel-main" key={revision}>
              {PanelContent()}
            </main>
            <footer className="panel-footer">
              <span>سانا؛ همراه آزمایشگاه شما</span>
              <button className="link" onClick={reset}>
                بازنشانی داده‌های دمو
              </button>
            </footer>
          </div>
        </div>
      ) : (
        <>
          <header className="public-header">
            <a href="#/" className="public-brand">
              <Logo />
              <span>تجهیزات آزمایشگاهی</span>
            </a>
            <nav aria-label="ناوبری اصلی">
              {[
                ["/", "خانه"],
                ["/devices", "دستگاه‌ها"],
                ["/about", "معرفی سانا"],
                ["/services", "خدمات و پشتیبانی"],
                ["/contact", "تماس با ما"],
              ].map(([p, n]) => (
                <a
                  key={p}
                  className={path === p ? "current" : ""}
                  href={"#" + p}
                >
                  {n}
                </a>
              ))}
            </nav>
            <a className="button small-button" href="#/login">
              ورود مشتریان <ArrowLeft size={16} />
            </a>
          </header>
          {panel || path === "/login" ? (
            <Login state={state} login={login} setToast={setToast} />
          ) : (
            <PublicSite path={path} />
          )}
          <footer className="public-footer">
            <div>
              <Logo />
              <p>همراه تجهیزات و نیازهای روزمره آزمایشگاه</p>
            </div>
            <div>
              <h3>در ارتباط باشیم</h3>
              <a href="tel:+982633107">
                <bdi>۰۲۶ ۳۳۱۰۷</bdi>
              </a>
              <p>البرز، شهرک صنعتی بهارستان، فاز سه، نبش بهار دوم</p>
            </div>
            <div className="enamad">محل نمایش نماد اعتماد</div>
            <div className="footer-bottom">
              <span>سانا · نسخه نمایشی برای بررسی ایده</span>
              <button className="link" onClick={reset}>
                بازنشانی داده‌های دمو
              </button>
            </div>
          </footer>
        </>
      )}
      {toast && (
        <div role="status" className="toast">
          <Check size={18} />
          {toast}
          <button aria-label="بستن پیام" onClick={() => setToast("")}>
            ×
          </button>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
