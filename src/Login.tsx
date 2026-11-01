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
          src="/product-assets/wondfo/images/fs-205.webp"
          alt="دستگاه Finecare FS-205"
        />
      </div>
      <div className="card login-card">
        <span className="logo" role="img" aria-label="سانا" />
        <h2>{mode === "reset" ? "بازیابی رمز عبور" : "به سانا خوش آمدید"}</h2>
        <p>این محیط صرفاً دموی ارائه است.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErr("");
            const f = new FormData(e.currentTarget);
            const c = state.customers.find(
              (c) => c.mobile === mobile && c.active,
            );
            if (!c) {
              setErr(
                "حساب فعال با این شماره در دمو پیدا نشد. از ورود آزمایشی استفاده کنید.",
              );
              return;
            }
            if (mode === "password") {
              if (f.get("password") !== "demo") {
                setErr("رمز ثابت دمو demo است؛ رمز واقعی وارد نکنید.");
                return;
              }
              login("customer", c.id);
            } else if (stage === 0) setStage(1);
            else if (f.get("otp") !== "123456")
              setErr("کد نمایشی صحیح 123456 است");
            else if (mode === "reset") {
              if (String(f.get("newPassword")).length < 6) {
                setErr("حداقل شش کاراکتر نمایشی وارد کنید");
                return;
              }
              setStage(0);
              setMode("password");
              setToast(
                "بازیابی شبیه‌سازی شد؛ رمز واردشده ذخیره نشد. رمز ثابت دمو: demo",
              );
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
              placeholder="09000000001"
            />
          </label>
          {mode === "password" ? (
            <label>
              رمز نمایشی
              <input
                name="password"
                type="password"
                required
                placeholder="demo"
                autoComplete="off"
              />
            </label>
          ) : (
            stage === 1 && (
              <>
                <p className="notice">
                  ارسال پیامک شبیه‌سازی شد. کد دمو: <bdi>123456</bdi>
                </p>
                <label>
                  کد یک‌بارمصرف نمایشی
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
                    رمز جدید نمایشی (ذخیره نمی‌شود)
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
                ? "دریافت کد نمایشی"
                : mode === "reset"
                  ? "بازنشانی نمایشی رمز"
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
          <span>بدون وارد کردن اطلاعات، دمو را تجربه کنید</span>
          <button className="secondary" onClick={() => login("customer")}>
            ورود آزمایشی مشتری
          </button>
          <button className="secondary" onClick={() => login("admin")}>
            ورود آزمایشی ادمین
          </button>
        </div>
        <small>
          شماره‌ها فرضی‌اند. این ورود، احراز هویت امن نسخه نهایی نیست.
        </small>
      </div>
    </main>
  );
}
