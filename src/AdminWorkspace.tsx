import { Fragment, useState, type ReactNode } from "react";
import * as D from "./domain";
import { adjustStock, latestPurchase } from "./admin-data";
import { ExcelImport } from "./ExcelImport";
type Shared = { state: D.State; mutate: (fn: (s: D.State) => void) => boolean };
export function CustomersWorkspace({
  state,
  mutate,
  editor,
  devices,
}: {
  editor: (c?: D.Customer) => ReactNode;
  devices: (c: D.Customer) => ReactNode;
} & Shared) {
  const [opened, setOpened] = useState(""),
    [query, setQuery] = useState("");
  const list = state.customers.filter((c) =>
    [c.name, c.manager, c.mobile, ...c.devices.map((d) => d.model)]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <h1>مشتریان و دستگاه‌ها</h1>
      <div className="admin-toolbar">
        <label>
          جست‌وجوی مشتری
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="نام مرکز، مسئول، موبایل یا دستگاه"
          />
        </label>
        <span>{list.length.toLocaleString("fa-IR")} مشتری</span>
      </div>
      <details className="card admin-create">
        <summary>افزودن مشتری</summary>
        {editor()}
      </details>
      <ExcelImport kind="customers" state={state} mutate={mutate} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <caption>
            فهرست مشتریان؛ برای تعریف دستگاه‌ها جزئیات مشتری را باز کنید.
          </caption>
          <thead>
            <tr>
              {[
                "نام مرکز",
                "مسئول مرکز",
                "موبایل",
                "دستگاه‌ها",
                "آخرین خرید",
                "وضعیت",
                "جزئیات",
              ].map((x) => (
                <th key={x} scope="col">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const last = latestPurchase(state, c.id);
              return (
                <Fragment key={c.id}>
                  <tr>
                    <th scope="row">{c.name}</th>
                    <td>{c.manager}</td>
                    <td>
                      <bdi>{c.mobile}</bdi>
                    </td>
                    <td>
                      {[...new Set(c.devices.map((d) => d.model))].join("، ") ||
                        "بدون دستگاه"}
                      <small className="cell-note">
                        {c.devices.length.toLocaleString("fa-IR")} دستگاه
                      </small>
                    </td>
                    <td>{last ? D.date(last) : "بدون خرید ثبت‌شده"}</td>
                    <td>{c.active ? "فعال" : "غیرفعال"}</td>
                    <td>
                      <button
                        className="secondary"
                        type="button"
                        aria-expanded={opened === c.id}
                        aria-controls={`customer-${c.id}`}
                        onClick={() => setOpened(opened === c.id ? "" : c.id)}
                      >
                        {opened === c.id ? "بستن" : "مشاهده و ویرایش"}
                      </button>
                    </td>
                  </tr>
                  {opened === c.id && (
                    <tr>
                      <td colSpan={7}>
                        <section
                          id={`customer-${c.id}`}
                          className="customer-detail"
                          aria-label={`جزئیات ${c.name}`}
                        >
                          {editor(c)}
                          {devices(c)}
                        </section>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {!list.length && (
              <tr>
                <td colSpan={7}>مشتری مطابق جست‌وجو پیدا نشد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function ForecastTable({ state }: { state: D.State }) {
  const rows = state.customers
    .flatMap<{
      c: D.Customer;
      p: D.Item | null;
      f: ReturnType<typeof D.forecast>;
    }>((c) => {
      const relevant = state.products.filter(
        (p) =>
          p.verified &&
          (c.devices.some((d) => d.initial.some((l) => l.product === p.id)) ||
            state.orders.some(
              (o) =>
                o.customer === c.id && o.lines.some((l) => l.product === p.id),
            )),
      );
      return relevant.length
        ? relevant.map((p) => ({ c, p, f: D.forecast(state, c, p.id) }))
        : [{ c, p: null, f: null }];
    })
    .sort((a, b) => (a.f?.due || "9999").localeCompare(b.f?.due || "9999"));
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <caption>یادآورهای همه مشتریان به ترتیب موعد تأمین</caption>
        <thead>
          <tr>
            {[
              "مشتری",
              "محصول",
              "موعد تأمین",
              "وضعیت",
              "اطمینان",
              "تعداد تحویل",
              "فاصله بعدی",
            ].map((x) => (
              <th key={x} scope="col">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, p, f }) => (
            <tr key={`${c.id}-${p?.id || "none"}`}>
              <th scope="row">{c.name}</th>
              <td>{p?.name || "بدون سابقه محصول"}</td>
              <td>{f ? D.date(f.due) : "—"}</td>
              <td>
                {f
                  ? f.near
                    ? "نزدیک به موعد"
                    : "برآورد موجود"
                  : "داده کافی نیست"}
              </td>
              <td>{f?.confidence || "—"}</td>
              <td>{f ? f.count.toLocaleString("fa-IR") : "—"}</td>
              <td>{f ? `${f.days.toLocaleString("fa-IR")} روز` : "—"}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={7}>هنوز مشتری ثبت نشده است.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function InventoryAdjustment({
  product,
  mutate,
}: {
  product: D.Item;
  mutate: Shared["mutate"];
}) {
  return (
    <div
      className="inventory-adjustment"
      role="group"
      aria-label={`موجودی ${product.name}`}
    >
      <button
        type="button"
        className="secondary"
        aria-label={`کاهش موجودی ${product.name}`}
        disabled={product.stock <= 0}
        onClick={() => mutate((s) => adjustStock(s, product.id, -1))}
      >
        −
      </button>
      <output aria-live="polite" aria-label={`تعداد موجودی ${product.name}`}>
        {product.stock.toLocaleString("fa-IR")}
      </output>
      <button
        type="button"
        className="secondary"
        aria-label={`افزایش موجودی ${product.name}`}
        disabled={product.stock >= 10000}
        onClick={() => mutate((s) => adjustStock(s, product.id, 1))}
      >
        +
      </button>
    </div>
  );
}

export function ProductsWorkspace({
  state,
  mutate,
  editor,
}: { editor: (p?: D.Item) => ReactNode } & Shared) {
  const [view, setView] = useState<"products" | "inventory">("products"),
    [opened, setOpened] = useState(""),
    [query, setQuery] = useState("");
  const list = state.products.filter((p) =>
    [p.name, p.english, p.code, p.brand]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <h1>محصولات و موجودی</h1>
      <div className="workspace-tabs" role="tablist" aria-label="بخش مدیریت">
        <button
          id="products-tab"
          role="tab"
          aria-selected={view === "products"}
          aria-controls="products-panel"
          onClick={() => {
            setView("products");
            setQuery("");
          }}
        >
          محصولات
        </button>
        <button
          id="inventory-tab"
          role="tab"
          aria-selected={view === "inventory"}
          aria-controls="inventory-panel"
          onClick={() => {
            setView("inventory");
            setQuery("");
          }}
        >
          موجودی
        </button>
      </div>
      <section
        id={`${view}-panel`}
        role="tabpanel"
        aria-labelledby={`${view}-tab`}
      >
        <div className="admin-toolbar">
          <h2>{view === "products" ? "فهرست محصولات" : "موجودی انبار"}</h2>
          <label>
            جست‌وجوی محصول
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام، کد یا برند"
            />
          </label>
        </div>
        {view === "products" ? (
          <>
            <p className="notice">
              اقلام جدید ابتدا غیرقابل سفارش هستند. افزودن محصول به‌تنهایی
              سازگاری آن را تأیید نمی‌کند؛ موجودی از بخش مستقل موجودی مدیریت
              می‌شود.
            </p>
            <details className="card admin-create">
              <summary>افزودن محصول معرفی‌شده (غیرقابل سفارش)</summary>
              {editor()}
            </details>
            <ExcelImport
              key="products"
              kind="products"
              state={state}
              mutate={mutate}
            />
            <div className="admin-table-wrap">
              <table className="admin-table">
                <caption>محصولات، قیمت و مشخصات</caption>
                <thead>
                  <tr>
                    {[
                      "محصول",
                      "کد",
                      "برند",
                      "قیمت پایه",
                      "وضعیت عرضه",
                      "ویرایش",
                    ].map((x) => (
                      <th key={x} scope="col">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <Fragment key={p.id}>
                      <tr>
                        <th scope="row">
                          {p.name}
                          <small className="cell-note" dir="ltr">
                            {p.english}
                          </small>
                        </th>
                        <td>
                          <bdi>{p.code || "—"}</bdi>
                        </td>
                        <td>{p.brand}</td>
                        <td>{D.money(p.price)}</td>
                        <td>{p.verified ? "قابل سفارش" : "نیازمند تأیید"}</td>
                        <td>
                          <button
                            type="button"
                            className="secondary"
                            aria-expanded={opened === p.id}
                            aria-controls={`product-${p.id}`}
                            onClick={() =>
                              setOpened(opened === p.id ? "" : p.id)
                            }
                          >
                            {opened === p.id ? "بستن" : "ویرایش محصول"}
                          </button>
                        </td>
                      </tr>
                      {opened === p.id && (
                        <tr>
                          <td colSpan={6}>
                            <div id={`product-${p.id}`}>{editor(p)}</div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                  {!list.length && (
                    <tr>
                      <td colSpan={6}>محصولی پیدا نشد.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <p>
              مقدار فعلی و تغییرات بر حسب بسته هستند. کاهش به زیر صفر مجاز نیست.
            </p>
            <ExcelImport
              key="inventory"
              kind="inventory"
              state={state}
              mutate={mutate}
            />
            <div className="admin-table-wrap">
              <table className="admin-table">
                <caption>موجودی محصولات و اصلاح دستی</caption>
                <thead>
                  <tr>
                    {["محصول", "کد", "برند", "موجودی فعلی (بسته)"].map((x) => (
                      <th key={x} scope="col">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id}>
                      <th scope="row">{p.name}</th>
                      <td>
                        <bdi>{p.code || "—"}</bdi>
                      </td>
                      <td>{p.brand}</td>
                      <td>
                        <InventoryAdjustment product={p} mutate={mutate} />
                      </td>
                    </tr>
                  ))}
                  {!list.length && (
                    <tr>
                      <td colSpan={4}>محصولی پیدا نشد.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}
