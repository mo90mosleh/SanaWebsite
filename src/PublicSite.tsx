import { HeroSlider } from "./HeroSlider";
import { assetPath } from "./assets";
import {
  ArrowLeft,
  ArrowUpLeft,
  ChevronLeft,
  Phone,
  Check,
  Activity,
  ShieldCheck,
  Handshake,
  BookOpen,
  PackageCheck,
  Headset,
} from "lucide-react";
import { products as devices } from "./devices";
import { Logo, DeviceImage, Empty, BrandLogo } from "./ui";
export function PublicSite({ path }: { path: string }) {
  const model = devices.find((d) => path === "/devices/" + d.id);
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
          <DeviceImage model={model} />
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
  if (path === "/services")
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
  if (path === "/contact")
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
            <small>
              منبع: اطلاعات تماس مخزن لندینگ قبلی؛ پیش از انتشار نهایی تأیید
              شود.
            </small>
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
  if (path !== "/" && path !== "/devices")
    return (
      <main className="public-main">
        <Empty>
          صفحه پیدا نشد. <a href="#/">بازگشت به خانه</a>
        </Empty>
      </main>
    );
  return (
    <main>
      {path === "/" && (
        <>
          <section className="hero public-main">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="dot" /> همراه تجهیزات آزمایشگاهی شما
              </span>
              <h1>
                دقت در انتخاب،
                <br />
                <span>آرامش در ادامه.</span>
              </h1>
              <p>
                از انتخاب دستگاه تا تأمین کیت و مواد مصرفی؛
                <br />
                سانا در مسیر روزمره آزمایشگاه کنار شماست.
              </p>
              <div className="actions">
                <a className="button" href="#/devices">
                  آشنایی با دستگاه‌ها <ArrowLeft size={18} />
                </a>
                <a className="text-button" href="#/login">
                  ورود به پنل مشتریان <ArrowUpLeft size={18} />
                </a>
              </div>
              <div className="hero-note">
                <span className="small-icon">
                  <ShieldCheck size={20} />
                </span>
                <span>
                  مشخصات مستند، انتخاب آگاهانه
                  <br />
                  <small>هماتولوژی CBC و تشخیص سریع POCT</small>
                </span>
              </div>
            </div>
            <HeroSlider />
          </section>
          <div className="trust-strip">
            <span>
              <Handshake size={22} />
              همراهی از انتخاب تا تأمین
            </span>
            <span>
              <BookOpen size={22} /> کاتالوگ اختصاصی هر مدل
            </span>
            <span>
              <PackageCheck size={22} /> سفارش و پیگیری یکپارچه
            </span>
            <span>
              <Headset size={22} /> پشتیبانی در پنل مشتریان
            </span>
          </div>
        </>
      )}
      <section className="public-main devices-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">تجهیزات سانا</span>
            <h2 className="section-heading">برای نیازهای متفاوت آزمایشگاه</h2>
          </div>
          <span className="muted">دو خانواده، پنج انتخاب</span>
        </div>
        {(["CBC", "POCT"] as const).map((category) => (
          <section
            className={
              "device-family brand-" +
              (category === "CBC" ? "getein" : "wondfo")
            }
            key={category}
            aria-label={
              category === "CBC" ? "دستگاه‌های CBC" : "دستگاه‌های POCT"
            }
          >
            <div className="family-heading">
              <div>
                <span>{category === "CBC" ? "هماتولوژی" : "تشخیص سریع"}</span>
                <h3>
                  <bdi>{category}</bdi>
                </h3>
              </div>
              <BrandLogo brand={category === "CBC" ? "Getein" : "Wondfo"} />
            </div>
            <div className="device-grid">
              {devices
                .filter((d) => d.category === category)
                .map((d) => (
                  <a
                    className="device-tile"
                    href={"#/devices/" + d.id}
                    key={d.id}
                  >
                    <div className="row">
                      <BrandLogo brand={d.manufacturer} />
                      <ArrowUpLeft size={19} />
                    </div>
                    <DeviceImage model={d} />
                    <h3>
                      <bdi>{d.model}</bdi>
                    </h3>
                    <p>{d.highlights[0]}</p>
                    <span className="tile-link">
                      مشخصات و کاتالوگ <ArrowLeft size={15} />
                    </span>
                  </a>
                ))}
            </div>
          </section>
        ))}
      </section>
      {path === "/" && (
        <section className="portal-banner public-main">
          <div>
            <span className="eyebrow">پنل مشتریان سانا</span>
            <h2>سفارش بعدی، چند قدم ساده‌تر.</h2>
            <p>
              مصرفی‌های مرتبط را پیدا کنید، روش خرید را انتخاب کنید
              <br />و وضعیت سفارش را از همان‌جا دنبال کنید.
            </p>
            <a className="button" href="#/login">
              تجربه پنل مشتریان <ArrowLeft size={17} />
            </a>
          </div>
          <div className="steps">
            {[
              ["۱", "دستگاه شما", "انتخاب مصرفی مرتبط"],
              ["۲", "خرید به روش شما", "آنلاین یا چک سه‌ماهه"],
              ["۳", "پیگیری تا تحویل", "وضعیت روشن، در هر مرحله"],
            ].map(([n, t, b]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{b}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
