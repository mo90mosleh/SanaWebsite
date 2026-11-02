import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  ChevronDown,
  ClipboardList,
  Settings,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import type { Customer } from "./domain";
export function AccountMenu({
  role,
  customer,
  onLogout,
  cartCount = 0,
}: {
  role: string;
  customer: Customer;
  onLogout: () => void;
  cartCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const click = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const close = () => setOpen(false);
    window.addEventListener("pointerdown", click);
    window.addEventListener("hashchange", close);
    return () => {
      window.removeEventListener("pointerdown", click);
      window.removeEventListener("hashchange", close);
    };
  }, []);
  if (!role)
    return (
      <a className="button small-button" href="#/login">
        <UserRound size={17} />
        ورود
      </a>
    );
  const prefix = role === "admin" ? "/admin" : "/customer";
  return (
    <div className="account-actions">
      {role === "customer" && (
        <a
          className="header-cart"
          href="#/customer/cart"
          aria-label={
            "سبد خرید، " + cartCount.toLocaleString("fa-IR") + " بسته"
          }
        >
          <ShoppingCart size={22} />
          <span aria-live="polite">{cartCount.toLocaleString("fa-IR")}</span>
        </a>
      )}
      <div
        className="account-menu"
        ref={root}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            trigger.current?.focus();
          }
        }}
      >
        <button
          ref={trigger}
          className="account-trigger"
          aria-expanded={open}
          aria-controls="account-links"
          onClick={() => setOpen((v) => !v)}
        >
          <UserRound size={17} />
          <span>{role === "admin" ? "مدیریت سانا" : customer.manager}</span>
          <ChevronDown size={14} />
        </button>
        {open && (
          <nav
            id="account-links"
            className="account-dropdown"
            aria-label="منوی حساب کاربری"
            onClick={() => setOpen(false)}
          >
            <strong>{role === "admin" ? "مدیریت سانا" : customer.name}</strong>
            <a href={"#" + prefix + "/dashboard"}>
              <LayoutDashboard size={16} />
              داشبورد
            </a>
            <a href={"#" + prefix + "/orders"}>
              <ClipboardList size={16} />
              سوابق سفارش‌ها
            </a>
            {role === "customer" && (
              <>
                <a href="#/customer/profile">
                  <Settings size={16} />
                  اطلاعات حساب
                </a>
                <a
                  href="#/customer/profile"
                  onClick={() =>
                    setTimeout(
                      () =>
                        document
                          .getElementById("addresses")
                          ?.scrollIntoView({ behavior: "smooth" }),
                      100,
                    )
                  }
                >
                  <MapPin size={16} />
                  آدرس‌های من
                </a>
              </>
            )}
            <button
              className="link"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <LogOut size={16} />
              خروج از حساب
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
