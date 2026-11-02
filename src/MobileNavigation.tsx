import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ClipboardList,
  LifeBuoy,
  UserRound,
  Users,
  ShoppingBag,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./ui";
import { money } from "./domain";
export function MobileNavigation({
  admin,
  tab,
  path,
  items,
  count,
  total,
}: {
  admin: boolean;
  tab: string;
  path: string;
  items: { key: string; label: string; Icon: LucideIcon }[];
  count: number;
  total: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    dialog.current?.close();
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const media = matchMedia("(min-width: 901px)");
    const close = () => {
      if (media.matches) dialog.current?.close();
    };
    media.addEventListener("change", close);
    return () => {
      document.documentElement.style.overflow = previous;
      media.removeEventListener("change", close);
    };
  }, [open]);
  const primary = admin
    ? ([
        ["dashboard", "خانه", LayoutDashboard],
        ["orders", "سفارش‌ها", ClipboardList],
        ["customers", "مراکز", Users],
        ["tickets", "پشتیبانی", LifeBuoy],
      ] as const)
    : ([
        ["dashboard", "خانه", LayoutDashboard],
        ["supplies", "کیت‌ها", Package],
        ["orders", "سفارش‌ها", ClipboardList],
        ["tickets", "پشتیبانی", LifeBuoy],
        ["profile", "حساب من", UserRound],
      ] as const);
  const prefix = admin ? "/admin/" : "/customer/";
  return (
    <>
      <button
        className="mobile-menu-trigger"
        aria-label="باز کردن منوی پنل"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        <Menu size={23} />
      </button>
      <dialog
        ref={dialog}
        className="mobile-drawer"
        aria-label="منوی پنل"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="mobile-drawer-content">
          <div className="mobile-drawer-heading">
            <a href="#/" onClick={() => dialog.current?.close()}>
              <Logo />
            </a>
            <button
              className="link"
              aria-label="بستن منوی پنل"
              onClick={() => dialog.current?.close()}
            >
              <X size={24} />
            </button>
          </div>
          <p>{admin ? "پنل مدیریت سانا" : "آزمایشگاه من"}</p>
          <nav aria-label="همه بخش‌های پنل">
            {items.map(({ key, label, Icon }) => (
              <a
                href={"#" + prefix + key}
                key={key}
                aria-current={tab === key ? "page" : undefined}
                onClick={() => dialog.current?.close()}
              >
                <Icon size={21} />
                <span>{label}</span>
                <ChevronLeft size={16} />
              </a>
            ))}
          </nav>
        </div>
      </dialog>
      {!admin && tab === "supplies" && count > 0 && (
        <a className="mobile-cart-summary" href="#/customer/cart">
          <span>
            <ShoppingBag size={20} />
            {count.toLocaleString("fa-IR")} بسته در سبد
          </span>
          <strong>{money(total)}</strong>
          <span>
            مشاهده سبد
            <ChevronLeft size={17} />
          </span>
        </a>
      )}
      <nav
        className="mobile-bottom-nav"
        aria-label="ناوبری موبایل"
        style={{
          gridTemplateColumns: `repeat(${primary.length}, minmax(0, 1fr))`,
        }}
      >
        {primary.map(([key, label, Icon]) => (
          <a
            href={"#" + prefix + key}
            key={key}
            aria-current={tab === key ? "page" : undefined}
          >
            <span>
              <Icon size={21} strokeWidth={tab === key ? 2.2 : 1.7} />
            </span>
            <small>{label}</small>
          </a>
        ))}
      </nav>
    </>
  );
}
