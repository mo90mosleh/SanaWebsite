import { useEffect, useState, useRef, type ReactNode } from "react";
import { Menu, X, ChevronDown, ArrowUpLeft, Phone } from "lucide-react";
import { AccountMenu } from "./AccountMenu";
import { Logo } from "./ui";
import type { Customer } from "./domain";
import "./public-site.css";
export function PublicShell({
  path,
  role,
  customer,
  cartCount,
  onLogout,
  children,
  onReset,
}: {
  path: string;
  role: string;
  customer: Customer;
  cartCount: number;
  onLogout: () => void;
  onReset: () => void;
  children: ReactNode;
}) {
  const header = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState(false);
  const [devices, setDevices] = useState(false);
  const pathname = path.split("?")[0];
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) {
        setMenu(false);
        setDevices(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  useEffect(() => {
    setMenu(false);
    setDevices(false);
  }, [path]);
  return (
    <div className="sana-site">
      <header
        className="public-header sana-header"
        ref={header}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setMenu(false);
            setDevices(false);
            if (menu) trigger.current?.focus();
          }
        }}
      >
        <a href="#/" className="public-brand" aria-label="سانا؛ صفحه اصلی">
          <Logo />
        </a>
        <button
          className="sana-menu-toggle"
          ref={trigger}
          aria-label={menu ? "بستن منوی اصلی" : "باز کردن منوی اصلی"}
          aria-expanded={menu}
          aria-controls="public-navigation"
          onClick={() => setMenu((v) => !v)}
        >
          {menu ? <X /> : <Menu />}
        </button>
        <nav
          id="public-navigation"
          className={menu ? "is-open" : ""}
          aria-label="ناوبری اصلی"
        >
          <a href="#/" aria-current={pathname === "/" ? "page" : undefined}>
            صفحه اصلی
          </a>
          <div className="sana-nav-group">
            <a
              href="#/devices"
              aria-current={
                pathname.startsWith("/devices") ? "page" : undefined
              }
            >
              دستگاه‌ها
            </a>
            <button
              aria-label="دسته‌های دستگاه"
              aria-expanded={devices}
              aria-controls="device-navigation"
              onClick={() => setDevices((v) => !v)}
            >
              <ChevronDown size={15} />
            </button>
            {devices && (
              <div className="sana-submenu" id="device-navigation">
                <a href="#/devices?category=CBC">دستگاه‌های CBC</a>
                <a href="#/devices?category=POCT">دستگاه‌های POCT</a>
              </div>
            )}
          </div>
          <a
            href="#/consumables"
            aria-current={pathname === "/consumables" ? "page" : undefined}
          >
            مواد مصرفی
          </a>
          <a
            href="#/services"
            aria-current={pathname === "/services" ? "page" : undefined}
          >
            خدمات و پشتیبانی
          </a>
          <a
            href="#/contact"
            aria-current={pathname === "/contact" ? "page" : undefined}
          >
            تماس با ما
          </a>
        </nav>
        <AccountMenu
          role={role}
          customer={customer}
          cartCount={cartCount}
          onLogout={onLogout}
        />
      </header>
      {children}
      <footer className="public-footer sana-footer">
        <div>
          <a href="#/" aria-label="سانا؛ صفحه اصلی">
            <Logo />
          </a>
          <p>سانا، همراه آزمایشگاه شما</p>
          <small>تجهیزات تشخیص پزشکی و تأمین مصرفی آزمایشگاه</small>
        </div>
        <div>
          <h2>محصولات و خدمات</h2>
          <a href="#/devices?category=CBC">دستگاه‌های CBC</a>
          <a href="#/devices?category=POCT">دستگاه‌های POCT</a>
          <a href="#/consumables">مواد مصرفی آزمایشگاهی</a>
          <a href="#/services">خدمات و پشتیبانی</a>
        </div>
        <div>
          <h2>با سانا در ارتباط باشید</h2>
          <a href="tel:+982633107">
            <Phone size={17} />
            <bdi>۰۲۶ ۳۳۱۰۷</bdi>
          </a>
          <p>البرز، شهرک صنعتی بهارستان، فاز سه، نبش بهار دوم</p>
          <a href="#/contact">
            اطلاعات تماس <ArrowUpLeft size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>سانا؛ همراه آزمایشگاه شما</span>
          <button className="link" onClick={onReset}>
            بازنشانی داده‌ها
          </button>
        </div>
      </footer>
    </div>
  );
}
