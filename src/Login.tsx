import { assetPath } from "./assets";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import * as D from "./domain";
export function Login({
  state,
  login,
  setToast,
}: {
  state: D.State;
  login: (role: string, c?: string) => void;
  setToast: (message: string) => void;
}) {
  const [mode, setMode] = useState("password");
  const [stage, setStage] = useState(0);
  const [mobile, setMobile] = useState("");
  const [err, setErr] = useState("");
  return (
    <main className="login-page">
      <div className="login-story">
        <span className="eyebrow">فضای اختصاصی مشتریان سانا</span>
        <h1>
          آزمایشگاه شما،
          <br />
          همراهی ما.
        </h1>
        <p>
          از انتخاب کیت سازگار تا پیگیری سفارش؛ همه در یک فضای ساده و یکپارچه.
        </p>
        <img
          src={assetPath("/product-assets/wondfo/images/fs-205.webp")}
          alt="دستگاه Finecare FS-205"
        />
      </div>
      <div className="card login-card">
        <span className="logo" role="img" aria-label="سانا" />
        <h2>{mode === "reset" ? "بازیابی رمز عبور" : "به سانا خوش آمدید"}</h2>
        <p>برای ادامه، وارد حساب خود شوید.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErr("");
            const f = new FormData(e.currentTarget);
            const c = state.customers.find(
              (c) => c.mobile === mobile && c.active,
            );
            if (!c) {
              setErr("حساب فعالی با این شماره پیدا نشد.");
              return;
            }
            if (mode === "password") {
              if (f.get("password") !== "demo") {
                setErr("رمز ورود صحیح نیست.");
                return;
              }
              login("customer", c.id);
            } else if (stage === 0) setStage(1);
            else if (f.get("otp") !== "123456") setErr("کد صحیح 123456 است");
            else if (mode === "reset") {
              if (String(f.get("newPassword")).length < 6) {
                setErr("حداقل شش کاراکتر وارد کنید");
                return;
              }
              setStage(0);
              setMode("password");
              setToast("مسیر بازیابی تکمیل شد.");
            } else login("customer", c.id);
          }}
        >
          <label>
            شماره موبایل مسئول مرکز
            <input
              required
              dir="ltr"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              pattern="09[0-9]{9}"
              placeholder="09123456789"
            />
          </label>
          {mode === "password" ? (
            <label>
              رمز عبور
              <input
                name="password"
                type="password"
                required
                placeholder="رمز عبور"
                autoComplete="off"
              />
            </label>
          ) : (
            stage === 1 && (
              <>
                <p className="notice">
                  کد ورود: <bdi>123456</bdi>
                </p>
                <label>
                  کد یک‌بارمصرف
                  <input
                    required
                    name="otp"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    dir="ltr"
                  />
                </label>
                {mode === "reset" && (
                  <label>
                    رمز جدید
                    <input
                      name="newPassword"
                      type="password"
                      minLength={6}
                      required
                      autoComplete="off"
                    />
                  </label>
                )}
              </>
            )
          )}
          {err && (
            <p role="alert" className="error">
              {err}
            </p>
          )}
          <button className="full">
            {mode === "password"
              ? "ورود به پنل"
              : stage === 0
                ? "دریافت کد"
                : mode === "reset"
                  ? "تأیید رمز جدید"
                  : "تأیید کد و ورود"}
            <ArrowLeft size={18} />
          </button>
        </form>
        <div className="row">
          <button
            className="link"
            onClick={() => {
              setMode(mode === "otp" ? "password" : "otp");
              setStage(0);
              setErr("");
            }}
          >
            {mode === "otp" ? "ورود با رمز عبور" : "ورود با کد یک‌بارمصرف"}
          </button>
          <button
            className="link"
            onClick={() => {
              setMode("reset");
              setStage(0);
            }}
          >
            فراموشی رمز
          </button>
        </div>
        <div className="demo-logins">
          <span>ورود آزمایشی برای دمو</span>
          <small className="demo-login-note">دسترسی موقت برای بررسی نسخه نمایشی</small>
          <button className="secondary" onClick={() => login("customer")}>
            ورود مشتری
          </button>
          <button className="secondary" onClick={() => login("admin")}>
            ورود مدیر
          </button>
        </div>
        <small></small>
      </div>
    </main>
  );
}
