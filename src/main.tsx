import { CategoryCircles } from "./CategoryCircles";
import { SupplyCatalog } from "./SupplyCatalog";
import { isCatalogItem } from "./catalog-data";
import { poctGroups } from "./kitCategories";
import "./catalog.css";
import {
  CustomersWorkspace,
  ProductsWorkspace,
  ForecastTable,
} from "./AdminWorkspace";
import { MoneyInput } from "./MoneyInput";
import { brands, numeric, recordNearReminders } from "./admin-data";
import "./admin-workspace.css";
import { MobileNavigation } from "./MobileNavigation";
import { TicketsPanel } from "./Tickets";
import { categories, categoryFor } from "./kitCategories";
import { KitArtwork } from "./KitArtwork";
import { DeliveryPicker } from "./DeliveryPicker";
import {
  firstAvailableDelivery,
  formatDeliveryDate,
  deliverySlotLabel,
} from "./delivery";
import { AccountMenu } from "./AccountMenu";
import { Profile } from "./Profile";
import { OrderJourney } from "./OrderJourney";
import { Feedback } from "./Feedback";
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
  Trash2,
  ClipboardList,
  Activity,
  RefreshCw,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { products as devices } from "./devices";
import * as D from "./domain";
import * as repo from "./repository";
import "./style.css";
import "./refinements.css";
import "./mobile.css";
import { PublicSite } from "./PublicSite";
import { Logo, DeviceImage, Empty } from "./ui";
import { Login } from "./Login";
const labels: Record<string, string> = {
  pending: "در انتظار بررسی",
  confirmed: "تأیید شده",
  cancelled: "کنسل شده",
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
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sana-sidebar-collapsed") === "true",
  );
  const [deliveryId, setDeliveryId] = useState("");
  const [deliverySchedule, setDeliverySchedule] = useState(
    firstAvailableDelivery,
  );
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
  const [orderView, setOrderView] = useState("all");
  const [query, setQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [familyFilter,setFamilyFilter] = useState("all");
  const [poctFilter,setPoctFilter] = useState("");
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
    const intent=sessionStorage.getItem('sana-catalog-intent');
    sessionStorage.removeItem('sana-catalog-intent');
    const chosen=state.products.find(p=>p.id===intent), center=state.customers.find(x=>x.id===c);
    if(r==='customer' && chosen && center && D.compatible(chosen,center) && chosen.stock>0){setCart(prev=>({...prev,[chosen.id]:(prev[chosen.id]||0)+1}));go('/customer/cart');}
    else go('/'+r);
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
  const decrease = (id: string) =>
    setCart((previous) => {
      const next = { ...previous };
      if ((next[id] || 0) <= 1) delete next[id];
      else next[id]--;
      return next;
    });
  const filteredProducts = state.products.filter(
    (p) => isCatalogItem(p) &&
      (familyFilter !== "ortanes" || p.family === "laboratory") &&
      (familyFilter !== "poct" || p.family === "poct") &&
      (!poctFilter || poctGroups.find(g=>g.id===poctFilter)?.products.includes(p.id)) &&
      (p.name + " " + p.english + " " + p.code)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!categoryFilter || categoryFor(p).id === categoryFilter) &&
      (!deviceFilter ||
        p.models.includes(deviceFilter) ||
        p.referenceModels?.includes(deviceFilter)),
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
  const delivery =
    customer.addresses?.find((a) => a.id === deliveryId) ||
    customer.addresses?.find((a) => a.isDefault) ||
    customer.addresses?.[0];
  function place() {
    if (
      mutate((s) => {
        D.createOrder(
          s,
          cid,
          cart,
          method,
          checkoutKey,
          delivery?.id,
          deliverySchedule,
        );
      })
    ) {
      setCart({});
      setCheckoutKey(D.uid());
      go("/customer/orders");
      setSelected("");
      setToast(
        method === "credit"
          ? "درخواست برای بررسی فروش ثبت شد"
          : "سفارش ثبت شد؛ نتیجه پرداخت را انتخاب کنید",
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
      confirm("تمام سفارش‌ها و تغییرات پاک و داده‌های اولیه بازگردانده شوند؟")
    ) {
      try {
        repo.reset();
        setRevision((x) => x + 1);
        setStorageError("");
        setCart({});
        setSelected("");
        setCheckoutKey(D.uid());
        setToast("داده‌ها بازنشانی شد");
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
  function OrderCard({ o }: { o: D.Order }) {
    const detail = selected === o.id;
    const historical = o.shipping === "delivered" || o.status === "cancelled";
    return (
      <article className={"order-card order-stage-" + D.orderStage(o)}>
        <div className="order-summary">
          <div>
            <bdi>{o.id}</bdi>
            <p>
              {D.date(o.created)} ·{" "}
              {state.customers.find((c) => c.id === o.customer)?.name}
            </p>
          </div>
          <Badge
            value={
              o.status === "cancelled"
                ? "cancelled"
                : D.orderStage(o) === "review"
                  ? "در حال بررسی"
                  : D.orderStage(o) === "queue"
                    ? "در صف ارسال"
                    : o.shipping === "delivered"
                      ? "تحویل شده"
                      : "ارسال شده"
            }
          />
          <strong>{D.money(o.total)}</strong>
          <button
            className="link"
            onClick={() => setSelected(detail ? "" : o.id)}
          >
            {detail ? "بستن جزئیات" : "جزئیات و پیگیری"}{" "}
            <ChevronLeft size={16} />
          </button>
        </div>
        {!detail && !historical && <OrderJourney order={o} />}
        {detail && (
          <div className="order-detail">
            {!historical && <OrderJourney order={o} />}
            <div className="admin-table-wrap">
              <table className="admin-table order-meta-table">
                <caption>مشخصات سفارش</caption>
                <tbody>
                  <tr>
                    <th scope="row">شماره سفارش</th>
                    <td>
                      <bdi>{o.id}</bdi>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">تاریخ ثبت</th>
                    <td>{D.date(o.created)}</td>
                  </tr>
                  <tr>
                    <th scope="row">روش خرید</th>
                    <td>{labels[o.method]}</td>
                  </tr>
                  <tr>
                    <th scope="row">وضعیت پرداخت</th>
                    <td>
                      <Badge value={o.payment} />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">وضعیت ارسال</th>
                    <td>
                      <Badge value={o.shipping} />
                    </td>
                  </tr>
                  {o.deliverySchedule && (
                    <tr>
                      <th scope="row">زمان تحویل</th>
                      <td>
                        {formatDeliveryDate(o.deliverySchedule.date)}، ساعت{" "}
                        {deliverySlotLabel(o.deliverySchedule.slot)} (به وقت
                        تهران)
                      </td>
                    </tr>
                  )}
                  {o.deliveryAddress && (
                    <>
                      <tr>
                        <th scope="row">نشانی تحویل</th>
                        <td>
                          {o.deliveryAddress.label}:{" "}
                          {D.formatAddress(o.deliveryAddress)}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">گیرنده</th>
                        <td>
                          {o.deliveryAddress.recipient} ·{" "}
                          <bdi>{o.deliveryAddress.phone}</bdi>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table order-items-table">
                <caption>اقلام و مبالغ سفارش</caption>
                <thead>
                  <tr>
                    <th scope="col">محصول</th>
                    <th scope="col">تعداد بسته</th>
                    <th scope="col">قیمت واحد</th>
                    <th scope="col">جمع ردیف</th>
                  </tr>
                </thead>
                <tbody>
                  {o.lines.map((l) => (
                    <tr key={l.product}>
                      <th scope="row">{l.name}</th>
                      <td>{l.qty.toLocaleString("fa-IR")}</td>
                      <td>{D.money(l.price)}</td>
                      <td>{D.money(l.price * l.qty)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={3}>
                      جمع پایه
                    </th>
                    <td>
                      {D.money(
                        o.lines.reduce((a, l) => a + l.price * l.qty, 0),
                      )}
                    </td>
                  </tr>
                  {o.total !== o.lines.reduce((sum,l)=>sum+l.price*l.qty,0) && <tr>
                    <th scope="row" colSpan={3}>تعدیلات ثبت‌شده سفارش</th>
                    <td>{D.money(o.total-o.lines.reduce((sum,l)=>sum+l.price*l.qty,0))}</td>
                  </tr>}
                  <tr>
                    <th scope="row" colSpan={3}>
                      مبلغ نهایی
                    </th>
                    <td>{D.money(o.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
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
                  <strong>نتیجه پرداخت</strong>
                  <div className="actions">
                    <button onClick={() => mutate((s) => D.pay(s, o.id, true))}>
                      پرداخت موفق
                    </button>
                    <button
                      className="secondary"
                      onClick={() => mutate((s) => D.pay(s, o.id, false))}
                    >
                      پرداخت ناموفق
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
                    <option value="cancel">کنسل کردن سفارش</option>
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
              if (c) {
                const target = s.customers.find((x) => x.id === c.id)!;
                Object.assign(target, v);
                const saved = target.addresses?.find((a) => a.isDefault);
                if (saved) saved.address = v.address;
              } else s.customers.push({ ...v, id: D.uid(), devices: [] });
            })
          ) {
            setToast("اطلاعات مرکز ذخیره شد");
            if (!c) e.currentTarget.reset();
          }
        }}
      >
        <h3>{c ? "ویرایش " + c.name : "ایجاد مرکز"}</h3>
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
            موبایل
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
                  throw Error("قلم تحویل اولیه با مدل انتخابی سازگار نیست");
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
              سریال دستگاه
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
                family: String(f.get('family')) as 'poct'|'laboratory',
                categoryId: String(f.get('categoryId')),
                packLabel: String(f.get('packLabel')),
                code: String(f.get("code")),
                price: numeric(f.get("price")),
              };
              if (value.price < 1 || value.price > 1000000000)
                throw Error("قیمت معتبر نیست");
              if (!brands(s).includes(value.brand))
                throw Error("برند معتبر نیست");
              if (
                value.code &&
                s.products.some(
                  (x) =>
                    x.id !== p?.id &&
                    x.brand === value.brand &&
                    x.code === value.code,
                )
              )
                throw Error("کد محصول و برند تکراری است");
              if (p)
                Object.assign(
                  s.products.find((x) => x.id === p.id)!,
                  value,
                );
              else
                s.products.push({
                  ...value,
                  stock: 0,
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
            <select required name="brand" defaultValue={p?.brand || "Wondfo"}>
              {brands(state).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          <label>خانواده محصول<select name="family" defaultValue={p?.family || 'poct'}><option value="poct">کیت دستگاه POCT</option><option value="laboratory">مصرفی عمومی آزمایشگاه</option></select></label>
          <label>دسته‌بندی<select name="categoryId" defaultValue={p?.categoryId || 'poct'}>{categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
          <label>بسته‌بندی<input name="packLabel" defaultValue={p?.packLabel || ''} placeholder="مثلاً ۷۲ عدد در بسته"/></label>
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
            <MoneyInput name="price" defaultValue={p?.price ?? 2000000} />
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
            قیمت: {D.money(p.price)} ·{" "}
            {p.verified ? "قابل سفارش" : "در انتظار تأیید؛ غیرقابل سفارش"}
          </p>
        )}
        <button className="secondary">ذخیره محصول</button>
      </form>
    );
  }
  function KitCard({ p, compact = false }: { p: D.Item; compact?: boolean }) {
    return (
      <article className="card supply" key={p.id}>
        <div className="row">
          <span className="brand-label">
            {p.brand}
            {p.brand === "Wondfo" ? " / Finecare" : p.brand === "Ortanes" ? " / اورتانیس" : " / CBC"}
          </span>
          <Badge
            value={
              p.verified
                ? "قابل سفارش آزمایشی"
                : p.models.length
                  ? "معرفی‌شده سازنده"
                  : "نیازمند تأیید"
            }
          />
        </div>
        <div className="kit-photo kit-illustration">
          <KitArtwork product={p} />
          <small>تصویر گرافیکی</small>
        </div>
        <h2>{p.name}</h2>
        <p>
          <bdi>
            {p.english} {p.code && "· " + p.code}
          </bdi>
        </p>
        {!compact && (
          <>
            <p className="muted">
              {p.family==='laboratory' ? 'مصرفی عمومی آزمایشگاه؛ بدون نیاز به دستگاه' : p.models.length ? (
                <>
                  <bdi>{p.models.join(" / ")}</bdi>
                </>
              ) : (
                "سازگاری مستند نشده؛ قابل فروش نیست"
              )}
            </p>
            <details className="product-evidence">
              <summary>جزئیات بسته و منبع</summary>{" "}
              <small>
                {p.sourceLabel || 'معرفی‌شده در منوی سازنده؛ تأیید عرضه نهایی با فروش'}
              </small>
              <small>
                {p.packLabel || ('تعداد تست در بسته: '+(p.tests ?? 'نیازمند تأیید'))} · واحد سفارش: {p.unit || 'بسته'}
              </small>
              {p.source && <a
                className="source"
                href={assetPath(p.source)}
                target="_blank"
                rel="noreferrer"
              >
                منبع: کاتالوگ سازنده، صفحه {p.sourcePage ?? "نامشخص"} ↗
              </a>}
            </details>
          </>
        )}
        {p.demoPrice && <small className="catalog-demo-badge">قیمت و موجودی نمایشی</small>}
        <p className="product-unit-note">{p.packLabel}</p>
        <div className="price-block">
          <span>
            قیمت <strong>{D.money(p.price)}</strong>
          </span>
        </div>
        {(cart[p.id] || 0) > 0 && (
          <div className="selected-total" aria-live="polite">
            <span>جمع {(cart[p.id] || 0).toLocaleString("fa-IR")} بسته</span>
            <strong>
              {D.money(p.price * cart[p.id])}
            </strong>
          </div>
        )}
        {(cart[p.id] || 0) > 0 ? (
          <div
            className="product-quantity"
            aria-label={"تعداد انتخابی " + p.english}
          >
            <button
              aria-label={
                ((cart[p.id] || 0) === 1 ? "حذف " : "کاهش ") + p.english
              }
              onClick={() => decrease(p.id)}
            >
              {(cart[p.id] || 0) === 1 ? (
                <Trash2 size={18} />
              ) : (
                <Minus size={18} />
              )}
            </button>
            <output aria-label={"تعداد بسته " + p.english}>
              {(cart[p.id] || 0).toLocaleString("fa-IR")}
              <small>بسته</small>
            </output>
            <button
              aria-label={"افزایش " + p.english}
              disabled={(cart[p.id] || 0) >= p.stock}
              onClick={() => add(p)}
            >
              <Plus size={18} />
            </button>
          </div>
        ) : (
          <button
            disabled={!D.compatible(p, customer) || p.stock === 0}
            onClick={() => add(p)}
          >
            <Plus size={17} />
            افزودن به سبد
          </button>
        )}
        {!compact && (
          <div className="stock">
            موجودی: <strong>{p.stock.toLocaleString("fa-IR")}</strong> بسته
          </div>
        )}
      </article>
    );
  }
  function ReplenishmentCards() {
    const items = state.products
      .filter((p) => D.compatible(p, customer) && p.stock > 0)
      .map((p, index) => ({
        p,
        index,
        forecast: D.forecast(state, customer, p.id),
      }))
      .sort(
        (a, b) =>
          (a.forecast ? 0 : 1) - (b.forecast ? 0 : 1) ||
          (a.forecast && b.forecast
            ? a.forecast.due.localeCompare(b.forecast.due)
            : a.index - b.index),
      )
      .slice(0, 3);
    return (
      <section className="card replenishment" aria-label="پیشنهاد تأمین مجدد">
        <div className="section-title">
          <div>
            <span className="eyebrow">آماده برای روزهای پیش رو</span>
            <h2>پیشنهاد تأمین مجدد</h2>
            {items.some(({ forecast }) => !forecast) && (
              <p className="muted">پیشنهاد متناسب با دستگاه شما</p>
            )}
          </div>
        </div>
        <div className="grid cards">
          {items.map(({ p, forecast }) => (
            <div className="replenishment-item" key={p.id}>
              {forecast ? (
                <p className="replenishment-date">
                  {forecast.near ? "نزدیک به موعد" : "موعد برآوردی"} ·{" "}
                  {D.date(forecast.due)}
                </p>
              ) : (
                <div className="replenishment-date" aria-hidden="true" />
              )}
              {KitCard({ p, compact: true })}
            </div>
          ))}
        </div>
        {!items.length && (
          <Empty>کیت سازگار و موجود برای پیشنهاد نداریم.</Empty>
        )}
        <p className="muted">
          موعد تأمین براساس سابقه تحویل برآورد می‌شود؛ موجودی واقعی مرکز را
          اندازه‌گیری نمی‌کند.
        </p>
        <div className="replenishment-actions">
          <button
            className="secondary"
            onClick={() => go("/customer/supplies")}
          >
            مشاهده سایر کیت‌ها <ArrowLeft size={18} />
          </button>
          <button disabled={!count} onClick={() => go("/customer/cart")}>
            نهایی‌سازی سفارش <ShoppingBag size={18} />
          </button>
        </div>
      </section>
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
          {admin && (
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
          )}
          <div className={admin ? "two-col" : "dashboard-orders"}>
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
              {admin ? (
                orders
                  .slice(0, 3)
                  .map((o) => (
                    <React.Fragment key={o.id}>
                      {OrderCard({ o })}
                    </React.Fragment>
                  ))
              ) : (
                <>
                  <div className="table-scroll" tabIndex={0}>
                    <table className="recent-orders-table">
                      <caption className="sr-only">آخرین سفارش‌های شما</caption>
                      <thead>
                        <tr>
                          <th>شماره سفارش</th>
                          <th>تاریخ</th>
                          <th>مبلغ</th>
                          <th>وضعیت</th>
                          <th>پیگیری</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id}>
                            <td>
                              <bdi>{o.id}</bdi>
                            </td>
                            <td>{D.date(o.created)}</td>
                            <td>{D.money(o.total)}</td>
                            <td>
                              <Badge value={o.status} />
                            </td>
                            <td>
                              <button
                                className="link"
                                onClick={() =>
                                  setSelected(selected === o.id ? "" : o.id)
                                }
                              >
                                جزئیات و پیگیری
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selected &&
                    orders.find((o) => o.id === selected) &&
                    OrderCard({ o: orders.find((o) => o.id === selected)! })}
                </>
              )}
              {!orders.length && <Empty>هنوز سفارشی ندارید.</Empty>}
            </section>
            {admin && (
              <section className="card soft">
                {admin ? (
                  <>
                    <span className="eyebrow">پیگیری مالی</span>
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
                    <p>تأیید خرید شرایطی به معنی وصول چک نیست.</p>
                    <button
                      className="link"
                      onClick={() => go("/admin/orders")}
                    >
                      بررسی و پیگیری سفارش‌ها <ArrowLeft size={15} />
                    </button>
                  </>
                ) : null}
              </section>
            )}
          </div>
          {admin ? (
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
              <ForecastTable state={state} />
              <p className="muted">
                این برآورد موجودی یا مصرف واقعی مرکز را اندازه‌گیری نمی‌کند.
              </p>
            </section>
          ) : (
            ReplenishmentCards()
          )}
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
                      setFamilyFilter('poct');setCategoryFilter('');setPoctFilter('');
                      go("/customer/supplies");
                    }}
                  >
                    مشاهده مصرفی‌های مرتبط <ArrowLeft size={16} />
                  </button>
                </article>
              );
            })}
          </div>
          {ReplenishmentCards()}
        </>
      );
    if (tab === "supplies")
      return (
        <>
          <h1>کیت‌ها و مواد مصرفی</h1>
          <p className="muted">کیت‌های دستگاه و مصرفی‌های عمومی آزمایشگاه اورتانیس</p>
          <div className="catalog-family-tabs" role="group" aria-label="نوع مصرفی">{[['all','همه مصرفی‌ها'],['poct','کیت‌های POCT'],['ortanes','مصرفی آزمایشگاه · اورتانیس']].map(([id,label])=><button key={id} aria-pressed={familyFilter===id} className={familyFilter===id?'selected':''} onClick={()=>{setFamilyFilter(id);setCategoryFilter('');setPoctFilter('');setDeviceFilter('');setSupplyLimit(6)}}>{label}</button>)}</div>
          <CategoryCircles family={familyFilter} value={categoryFilter} onChange={id=>{setCategoryFilter(id);setPoctFilter('');setSupplyLimit(6)}}/>
          {(familyFilter==='poct'||categoryFilter==='poct')&&<div className="catalog-scope"><label>گروه تست<select aria-label="گروه تست POCT" value={poctFilter} onChange={e=>{setPoctFilter(e.target.value);setSupplyLimit(6)}}><option value="">همه گروه‌ها</option>{poctGroups.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label></div>}
          <div className="filters supplies-filters">
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
            <label className="device-filter">
              <span>دستگاه</span>
              <select
                aria-label="فیلتر دستگاه"
                value={deviceFilter}
                onChange={(e) => {
                  setDeviceFilter(e.target.value);
                  setSupplyLimit(6);
                }}
              >
                <option value="">همه مصرفی‌ها و دستگاه‌ها</option>
                {customer.devices.map((d) => (
                  <option key={d.id}>{d.model}</option>
                ))}
              </select>
            </label>
            <label className="category-filter">
              <span>دسته‌بندی</span>
              <select
                aria-label="دسته‌بندی کیت‌ها"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSupplyLimit(6);
                }}
              >
                <option value="">همه دسته‌ها</option>
                {categories
                  .filter((c) =>
                    state.products.some((p) => isCatalogItem(p) && categoryFor(p).id === c.id && (familyFilter!=='ortanes'||p.family==='laboratory') && (familyFilter!=='poct'||p.family==='poct')),
                  )
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </label>
            <button
              className="secondary supplies-cart-link"
              onClick={() => go("/customer/cart")}
            >
              سبد خرید ({count})
            </button>
          </div>

          <p className="muted" aria-live="polite">
            {filteredProducts.length.toLocaleString("fa-IR")} محصول
          </p>
          <section aria-label="فهرست کیت‌ها">
            <div className="grid cards">
              {filteredProducts.slice(0, supplyLimit).map((p) => (
                <React.Fragment key={p.id}>{KitCard({ p })}</React.Fragment>
              ))}
            </div>
          </section>
          {filteredProducts.length > supplyLimit && (
            <button
              className="secondary full"
              onClick={() => setSupplyLimit((n) => n + 6)}
            >
              نمایش محصولات بیشتر
            </button>
          )}
          {!filteredProducts.length && <Empty>محصولی پیدا نشد.</Empty>}
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
                <div className="table-scroll" tabIndex={0}>
                  <table className="cart-table">
                    <caption>اقلام سبد خرید — قیمت‌ها به تومان</caption>
                    <thead>
                      <tr>
                        <th>محصول</th>
                        <th>تعداد بسته</th>
                        <th>قیمت واحد</th>
                        <th>جمع ردیف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(cart)
                        .filter(([, q]) => q > 0)
                        .map(([id, q]) => {
                          const p = state.products.find((p) => p.id === id)!;
                          const unit =
                            method === "online"
                              ? D.onlinePrice(p.price)
                              : p.price;
                          return (
                            <tr key={id}>
                              <th scope="row">
                                {p.name}
                                <small>
                                  <bdi>{p.english}</bdi>
                                </small>
                              </th>
                              <td>
                                <div className="quantity">
                                  <button
                                    aria-label={
                                      (q === 1 ? "حذف " : "کاهش ") + p.english
                                    }
                                    onClick={() => decrease(id)}
                                  >
                                    {q === 1 ? (
                                      <Trash2 size={18} />
                                    ) : (
                                      <Minus size={18} />
                                    )}
                                  </button>
                                  <span>{q.toLocaleString("fa-IR")}</span>
                                  <button
                                    aria-label={"افزایش " + p.english}
                                    disabled={q >= p.stock}
                                    onClick={() => add(p)}
                                  >
                                    <Plus size={18} />
                                  </button>
                                </div>
                              </td>
                              <td data-label="قیمت واحد">{D.money(unit)}</td>
                              <td data-label="جمع ردیف">
                                <strong>{D.money(unit * q)}</strong>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={3}>
                          جمع{" "}
                          {method === "online" ? "پرداخت آنلاین" : "چک سه‌ماهه"}
                        </th>
                        <td>
                          <strong>
                            {D.money(
                              method === "online" ? D.onlinePrice(base) : base,
                            )}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <section className="checkout-address">
                  <h3>نشانی تحویل</h3>
                  {customer.addresses?.length ? (
                    <>
                      <label>
                        انتخاب از آدرس‌های من
                        <select
                          value={delivery?.id || ""}
                          onChange={(e) => setDeliveryId(e.target.value)}
                        >
                          {customer.addresses.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label} — {a.city}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p>
                        {delivery
                          ? D.formatAddress(delivery)
                          : customer.address}
                      </p>
                      <small>
                        {delivery?.recipient} · <bdi>{delivery?.phone}</bdi>
                      </small>
                    </>
                  ) : (
                    <p>برای ادامه، یک نشانی تحویل ثبت کنید.</p>
                  )}
                  <a className="source" href="#/customer/profile">
                    ویرایش یا افزودن آدرس
                  </a>
                </section>
              </div>
              <div className="card">
                <DeliveryPicker
                  value={deliverySchedule}
                  onChange={setDeliverySchedule}
                />
                <h2>روش خرید</h2>
                <label
                  className={"method " + (method === "online" ? "chosen" : "")}
                >
                  <input
                    type="radio"
                    checked={method === "online"}
                    onChange={() => setMethod("online")}
                  />
                  پرداخت آنلاین
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

                <div className="line">
                  <strong>مبلغ نهایی</strong>
                  <strong>
                    {D.money(method === "online" ? D.onlinePrice(base) : base)}
                  </strong>
                </div>
                <p className="muted">
                  {method === "credit"
                    ? "ثبت درخواست به معنی پرداخت یا تأیید نهایی نیست."
                    : "پس از ثبت سفارش، نتیجه پرداخت را انتخاب کنید."}
                </p>
                <button className="full" onClick={place} disabled={!delivery}>
                  {method === "online"
                    ? "ثبت سفارش و پرداخت"
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
          <div className="order-tabs" role="group" aria-label="نمای سفارش‌ها">
            {[
              ["all", "همه سفارش‌ها"],
              ["active", "سفارش‌های جاری"],
              ["history", "سوابق سفارش‌ها"],
            ].map(([v, label]) => (
              <button
                key={v}
                className={orderView === v ? "selected" : ""}
                aria-pressed={orderView === v}
                onClick={() => setOrderView(v)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="filters">
            <select
              aria-label="فیلتر سفارش"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            >
              <option value="">همه سفارش‌ها</option>
              <option value="review">در حال بررسی</option>
              <option value="queue">در صف ارسال</option>
              <option value="sent">ارسال شده</option>
              <option value="cancelled">کنسل شده</option>
            </select>
          </div>
          <div className="orders-table-heading">
            <span>شماره و تاریخ سفارش</span>
            <span>وضعیت</span>
            <span>مبلغ سفارش</span>
            <span>پیگیری</span>
          </div>
          {orders
            .filter(
              (o) =>
                (!query ||
                  (query === "cancelled"
                    ? o.status === query
                    : D.orderStage(o) === query)) &&
                (orderView === "all" ||
                  (orderView === "history"
                    ? o.shipping === "delivered" || o.status === "cancelled"
                    : !(
                        o.shipping === "delivered" || o.status === "cancelled"
                      ))),
            )
            .map((o) => (
              <React.Fragment key={o.id}>{OrderCard({ o })}</React.Fragment>
            ))}
          {!orders.filter(
            (o) =>
              (!query ||
                (query === "cancelled"
                  ? o.status === query
                  : D.orderStage(o) === query)) &&
              (orderView === "all" ||
                (orderView === "history"
                  ? o.shipping === "delivered" || o.status === "cancelled"
                  : !(o.shipping === "delivered" || o.status === "cancelled"))),
          ).length && <Empty>سفارشی در این بخش نیست.</Empty>}
        </>
      );
    if (tab === "tickets")
      return (
        <TicketsPanel
          state={state}
          customer={customer}
          admin={admin}
          mutate={mutate}
          notify={setToast}
        />
      );
    if (tab === "profile")
      return (
        <Profile
          customer={customer}
          onProfile={(v) => {
            const ok = mutate((s) => D.saveCustomerProfile(s, cid, v));
            if (ok) setToast("اطلاعات مرکز ذخیره شد");
            return ok;
          }}
          onAddress={(a) => {
            const ok = mutate((s) => D.saveAddress(s, cid, a));
            if (ok) setToast("آدرس ذخیره شد");
            return ok;
          }}
          onDelete={(id) => mutate((s) => D.deleteAddress(s, cid, id))}
        />
      );
    if (tab === "customers" && admin)
      return (
        <CustomersWorkspace
          state={state}
          mutate={mutate}
          editor={(c) => CustomerEditor({ c })}
          devices={(c) => DeviceAdmin({ c })}
        />
      );
    if (tab === "products" && admin)
      return (
        <ProductsWorkspace
          state={state}
          mutate={mutate}
          editor={(p) => ProductEditor({ p })}
        />
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
          <ForecastTable state={state} />
          <button
            className="secondary"
            onClick={() => {
              if (mutate(recordNearReminders))
                setToast("یادآورهای نزدیک به موعد، بدون تکرار ثبت شدند");
            }}
          >
            ثبت رویداد یادآور نزدیک به موعد
          </button>
        </>
      );
    if (tab === "logs" && admin)
      return (
        <>
          <h1 dir="ltr" className="right">
            SERVICELOGS
          </h1>
          <p className="notice">
            تلاش مجدد تنها نتیجه همین رویداد را تغییر می‌دهد و سفارش جدید
            نمی‌سازد.
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
                    مقصد: <bdi>{l.destination.replace(/^demo:\/\//, "")}</bdi>
                  </p>
                  <p>
                    {D.date(l.time)} ·{" "}
                    {new Date(l.time).toLocaleTimeString("fa-IR")}
                  </p>
                  <p>
                    {l.error
                      ? l.error.includes("نمایشی") ||
                        l.error.includes("شبیه‌سازی")
                        ? "پاسخی از مقصد دریافت نشد"
                        : l.error
                      : "بدون خطا"}
                  </p>
                  <div className="actions">
                    <button
                      onClick={() => mutate((s) => D.runLog(s, l.id, true))}
                    >
                      تلاش موفق
                    </button>
                    <button
                      className="secondary"
                      onClick={() => mutate((s) => D.runLog(s, l.id, false))}
                    >
                      تلاش ناموفق
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
        <div className={"app-shell" + (collapsed ? " sidebar-collapsed" : "")}>
          <aside className="sidebar">
            <button
              className="sidebar-toggle"
              aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
              aria-expanded={!collapsed}
              onClick={() => {
                setCollapsed((v) => !v);
                localStorage.setItem(
                  "sana-sidebar-collapsed",
                  String(!collapsed),
                );
              }}
            >
              {collapsed ? (
                <PanelRightOpen size={19} />
              ) : (
                <PanelRightClose size={19} />
              )}
            </button>
            <a href="#/" className="panel-brand">
              <Logo />
              <span>{admin ? "پنل مدیریت" : "پنل مشتریان"}</span>
            </a>
            <div className="center-name">
              <span className="avatar">
                {admin ? (
                  "س"
                ) : (
                  <img
                    src={assetPath(customer.avatar || "/profile/boghrat.svg")}
                    alt={"نشان " + customer.name}
                  />
                )}
              </span>
              <div>
                <strong>{admin ? "مدیریت سانا" : customer.name}</strong>
                <small>
                  {admin ? "مدیریت مراکز و سفارش‌ها" : "مرکز آزمایشگاهی"}
                </small>
              </div>
            </div>
            <nav>
              {navItems.map(([key, label, I]) => {
                const Icon = I as typeof Package;
                return (
                  <a
                    key={String(key)}
                    aria-label={String(label)}
                    title={String(label)}
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
                {admin && (
                  <button
                    className="link role-switch"
                    onClick={() => login("customer")}
                  >
                    نمای مشتری <ArrowUpLeft size={16} />
                  </button>
                )}
                <AccountMenu
                  role={role}
                  cartCount={count}
                  customer={customer}
                  onLogout={() => {
                    setRole("");
                    sessionStorage.removeItem("sana-role");
                    go("/login");
                  }}
                />
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
            <main className={"panel-main panel-page-" + tab} key={revision}>
              {PanelContent()}
            </main>
            <footer className="panel-footer">
              <span>سانا؛ همراه آزمایشگاه شما</span>
              <button className="link" onClick={reset}>
                بازنشانی داده‌ها
              </button>
            </footer>
          </div>
          <MobileNavigation
            admin={admin}
            tab={tab}
            path={path}
            items={navItems.map(([key, label, Icon]) => ({
              key: String(key),
              label: String(label),
              Icon: Icon as typeof Package,
            }))}
            count={count}
            total={method === "online" ? D.onlinePrice(base) : base}
          />
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
                ["/supplies/ortanes", "مصرفی آزمایشگاه"],
                ["/supplies/poct", "کیت‌های POCT"],
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
            <AccountMenu
              role={role}
              cartCount={count}
              customer={customer}
              onLogout={() => {
                setRole("");
                sessionStorage.removeItem("sana-role");
                go("/login");
              }}
            />
          </header>
          {panel || path === "/login" ? (
            <Login state={state} login={login} setToast={setToast} />
          ) : (
            path.startsWith('/supplies') ? <SupplyCatalog key={path} products={state.products} family={path.endsWith('/ortanes')?'ortanes':path.endsWith('/poct')?'poct':'all'} onChoose={p=>{if(role==='customer'){if(D.compatible(p,customer)&&p.stock>0){add(p);go('/customer/cart')}else {setFamilyFilter(p.family==='laboratory'?'ortanes':'poct');go('/customer/supplies')}}else{sessionStorage.setItem('sana-catalog-intent',p.id);go('/login')}}}/> : <PublicSite path={path} />
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
              <span>سانا؛ همراه آزمایشگاه شما</span>
              <button className="link" onClick={reset}>
                بازنشانی داده‌ها
              </button>
            </div>
          </footer>
        </>
      )}
      <Feedback />
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
