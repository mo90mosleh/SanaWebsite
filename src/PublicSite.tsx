import { OrtanesLogo } from "./OrtanesLogo";
import { useState } from "react";
import type { Item } from "./domain";
import { categories, categoryFor } from "./kitCategories";
import { HeroSlider } from "./HeroSlider";
import { assetPath } from "./assets";
import {
  ArrowLeft,
  ArrowUpLeft,
  ChevronLeft,
  Phone,
  Handshake,
  BookOpen,
  Headset,
} from "lucide-react";
import { products as devices } from "./devices";
import { DeviceImage, Empty, BrandLogo } from "./ui";
export function PublicSite({ path, items }: { path: string; items: Item[] }) {
  const pathname = path.split("?")[0];
  const model = devices.find((d) => pathname === "/devices/" + d.id);
  if (model)
    return (
      <main className="public-main">
        <a className="back" href="#/devices">
          دستگاه‌ها <ChevronLeft size={15} /> {model.model}
        </a>
        <section
          className={"product-hero brand-" + model.manufacturer.toLowerCase()}
        >
          <div>
            <BrandLogo brand={model.manufacturer} />
            <span className="eyebrow">
              <bdi>
                {model.manufacturer} · {model.category}
              </bdi>
            </span>
            <h1>
              <bdi>{model.name}</bdi>
            </h1>
            <h2>{model.headline}</h2>
            <p>
              {model.description.replace(
                "واردشده و قابل ارائه برای خرید در ایران.",
                "",
              )}
            </p>
            <a
              className="button"
              href={assetPath(model.catalog)}
              target="_blank"
              rel="noreferrer"
            >
              دریافت کاتالوگ <ArrowUpLeft size={18} />
            </a>
            <a className="button secondary" href="#/contact">
              گفت‌وگو با سانا
            </a>
          </div>
          <DeviceImage model={model} priority />
        </section>
        {model.id === "bha5000" && (
          <p className="notice">
            مشخصات زیر مربوط به کاتالوگ ارائه‌شده با نمایشگر ۱۰٫۴ اینچ و حافظه
            ۱۰٬۰۰۰ نتیجه است. نسخه وب‌سایت سازنده متفاوت است؛ پیکربندی نهایی
            باید تأیید شود. تصویر فعلی از سازنده است و تصویر دامپزشکی کاتالوگ
            استفاده نشده.
          </p>
        )}
        <section className="card">
          <h2>مشخصات مستند دستگاه</h2>
          {model.specs.map(([k, v]) => (
            <div className="line" key={k}>
              <span>{k}</span>
              <span>{v}</span>
            </div>
          ))}
          <a className="source" href={assetPath(model.catalog)}>
            منبع: کاتالوگ اختصاصی همین مدل
          </a>
        </section>
        <div className="grid three">
          {model.advantages.map((a) => (
            <div className="card" key={a.title}>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
        <section className="card">
          <h2>پرسش‌های رایج</h2>
          {model.faqs
            .filter((f) => !f.q.includes("خرید"))
            .map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
        </section>
      </main>
    );
  if (pathname === "/services")
    return (
      <main className="public-main prose">
        <span className="eyebrow">خدمات و پشتیبانی</span>
        <h1>بعد از انتخاب هم، کنار شما هستیم.</h1>
        <p className="lead">
          یک مسیر مشخص برای پرسش‌های فنی، سفارش مصرفی و پیگیری خدمات دستگاه.
        </p>
        <div className="grid three">
          {[
            [
              "راهنمای انتخاب",
              "کاتالوگ مدل‌ها را ببینید و پیکربندی پیشنهادی را با کارشناس بررسی کنید.",
            ],
            [
              "پشتیبانی دستگاه",
              "مدل و سریال دستگاه را در تیکت بنویسید تا موضوع قابل پیگیری باشد.",
            ],
            [
              "تأمین کیت و مصرفی",
              "کد دقیق کیت و سازگاری نسخه دستگاه، پیش از عرضه واقعی تأیید می‌شود.",
            ],
          ].map(([a, b]) => (
            <div className="card" key={a}>
              <h2>{a}</h2>
              <p>{b}</p>
            </div>
          ))}
        </div>
        <a className="button" href="#/login">
          ورود و ثبت تیکت <ArrowLeft size={18} />
        </a>
        <p>جزئیات ضمانت، زمان پاسخ و خدمات قراردادی نیازمند تأیید سانا است.</p>
      </main>
    );
  if (pathname === "/contact")
    return (
      <main className="public-main prose">
        <span className="eyebrow">تماس با ما</span>
        <h1>گفت‌وگو را شروع کنیم.</h1>
        <div className="two-col">
          <div className="card">
            <Phone size={28} />
            <h2>تماس با کارشناسان سانا</h2>
            <a className="big-phone" href="tel:+982633107">
              <bdi>۰۲۶ ۳۳۱۰۷</bdi>
            </a>
            <p>البرز، شهرک صنعتی بهارستان، فاز سه، نبش بهار دوم</p>
          </div>
          <div className="card soft">
            <h2>مشتری سانا هستید؟</h2>
            <p>
              برای پیگیری سفارش و پرسش‌های مربوط به دستگاه، از پنل مشتری تیکت
              ثبت کنید.
            </p>
            <a className="button" href="#/login">
              ورود مشتریان <ArrowLeft size={18} />
            </a>
          </div>
        </div>
      </main>
    );
  if (pathname === "/consumables") return <Consumables items={items} />;
  if (pathname !== "/" && pathname !== "/devices")
    return (
      <main className="public-main">
        <Empty>
          صفحه پیدا نشد. <a href="#/">بازگشت به خانه</a>
        </Empty>
      </main>
    );
  if (pathname === "/")
    return (
      <main className="sana-home">
        <HeroSlider />
        <ProductCategories />
        <div className="sana-assurance">
          {[
            [Handshake, "همراهی از انتخاب تا تأمین"],
            [BookOpen, "کاتالوگ اختصاصی هر مدل"],
            [Headset, "پشتیبانی دستگاه‌های شما"],
          ].map(([Icon, text]) => {
            const I = Icon as typeof Handshake;
            return (
              <span key={String(text)}>
                <I size={22} />
                {String(text)}
              </span>
            );
          })}
        </div>
      </main>
    );
  const category = new URLSearchParams(path.split("?")[1] || "").get(
    "category",
  );
  return (
    <main className="public-main sana-catalog">
      <div className="sana-page-heading">
        <span className="sana-overline">تجهیزات سانا</span>
        <h1>دستگاه‌های آزمایشگاهی</h1>
        <p>کاتالوگ و مشخصات هر دستگاه را بررسی کنید.</p>
      </div>
      <nav className="sana-category-tabs" aria-label="دسته‌بندی دستگاه‌ها">
        {[
          ["", "همه دستگاه‌ها"],
          ["CBC", "دستگاه‌های CBC"],
          ["POCT", "دستگاه‌های POCT"],
        ].map(([value, label]) => (
          <a
            href={"#/devices" + (value ? "?category=" + value : "")}
            aria-current={(category || "") === value ? "page" : undefined}
            key={value}
          >
            {label}
          </a>
        ))}
      </nav>
      {(["CBC", "POCT"] as const)
        .filter(
          (c) =>
            !category || !["CBC", "POCT"].includes(category) || c === category,
        )
        .map((c) => (
          <section
            className={
              "device-family brand-" + (c === "CBC" ? "getein" : "wondfo")
            }
            aria-label={"دستگاه‌های " + c}
            key={c}
          >
            <div className="family-heading">
              <h2>
                <bdi>{c}</bdi>
              </h2>
              <BrandLogo brand={c === "CBC" ? "Getein" : "Wondfo"} />
            </div>
            <div className="device-grid">
              {devices
                .filter((d) => d.category === c)
                .map((d) => (
                  <a
                    className="device-tile"
                    key={d.id}
                    href={"#/devices/" + d.id}
                  >
                    <div className="row">
                      <BrandLogo brand={d.manufacturer} />
                      <ArrowUpLeft size={18} />
                    </div>
                    <DeviceImage model={d} />
                    <h3>
                      <bdi>{d.model}</bdi>
                    </h3>
                    <p>{d.headline}</p>
                    <span className="tile-link">
                      مشخصات و کاتالوگ
                      <ArrowLeft size={18} />
                    </span>
                  </a>
                ))}
            </div>
          </section>
        ))}
    </main>
  );
}
function ProductCategories() {
  return (
    <section
      className="sana-product-categories"
      aria-label="خانواده محصولات سانا"
    >
      <a className="sana-category-card" href="#/devices?category=CBC">
        <div>
          <BrandLogo brand="Getein" />
          <h2>دستگاه‌های CBC</h2>
          <p>آنالایزرهای هماتولوژی</p>
          <span className="sana-card-arrow">
            <ArrowLeft size={20} />
          </span>
        </div>
        <DeviceImage model={devices.find((p) => p.id === "bha5100")!} />
      </a>
      <a className="sana-category-card" href="#/devices?category=POCT">
        <div>
          <BrandLogo brand="Wondfo" />
          <h2>دستگاه‌های POCT</h2>
          <p>تجهیزات تشخیص سریع</p>
          <span className="sana-card-arrow">
            <ArrowLeft size={20} />
          </span>
        </div>
        <DeviceImage model={devices.find((p) => p.id === "fs-205")!} />
      </a>
      <a
        className="sana-category-card sana-category-consumables"
        href="#/consumables"
      >
        <div>
          <OrtanesLogo />
          <h2>مواد مصرفی آزمایشگاهی</h2>
          <p>کیت‌ها و ملزومات آزمایشگاه</p>
          <span className="sana-card-arrow">
            <ArrowLeft size={20} />
          </span>
        </div>
        <figure>
          <img
            src={assetPath(
              "/product-assets/wondfo/images/finecare-cassette.png",
            )}
            alt="تصویر واقعی کیت CRP از Wondfo"
            loading="lazy"
            decoding="async"
          />
          <figcaption>نمونه کیت موجود Wondfo</figcaption>
        </figure>
      </a>
    </section>
  );
}
function Consumables({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const filtered = items.filter(
    (p) =>
      !p.archived &&
      (!category || categoryFor(p).id === category) &&
      (p.name + " " + p.english + " " + p.code)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main className="public-main sana-consumables">
      <div className="sana-page-heading">
        <span className="sana-overline">کیت‌ها و مواد مصرفی</span>
        <h1>مواد مصرفی آزمایشگاهی</h1>
        <p>انتخاب محصول براساس آزمون و دستگاه؛ سفارش از حساب آزمایشگاه شما.</p>
      </div>
      <nav className="sana-category-tabs" aria-label="کاتالوگ‌های مواد مصرفی">
        <a href="#/supplies/ortanes">مصرفی آزمایشگاه</a>
        <a href="#/supplies/poct">کیت‌های POCT</a>
      </nav>
      <div className="sana-consumable-toolbar">
        <label>
          جست‌وجوی کیت
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="نام آزمون یا کد محصول"
          />
        </label>
        <label>
          دسته‌بندی
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">همه دسته‌ها</option>
            {categories
              .filter((c) => items.some((p) => categoryFor(p).id === c.id))
              .map((c) => (
                <option value={c.id} key={c.id}>
                  {c.label}
                </option>
              ))}
          </select>
        </label>
      </div>
      <p className="muted" aria-live="polite">
        {filtered.length.toLocaleString("fa-IR")} محصول
      </p>
      <div className="sana-consumable-grid">
        {filtered.map((p) => (
          <article className="card" key={p.id}>
            <span className="sana-overline">{p.brand}</span>
            <h2>{p.name}</h2>
            <p>
              <bdi>
                {p.english} · {p.code}
              </bdi>
            </p>
            <p className="muted">
              {p.models.length ? p.models.join(" / ") : "سازگاری نیازمند تأیید"}
            </p>
            <a
              className="source"
              href={assetPath(p.source)}
              target="_blank"
              rel="noreferrer"
            >
              کاتالوگ سازنده
              <ArrowUpLeft size={15} />
            </a>
            <a className="button secondary" href="#/customer/supplies">
              مشاهده در پنل سفارش
              <ArrowLeft size={17} />
            </a>
          </article>
        ))}
      </div>
      {!filtered.length && <Empty>محصولی پیدا نشد.</Empty>}
    </main>
  );
}
