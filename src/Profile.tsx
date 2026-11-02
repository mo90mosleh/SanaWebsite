import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Check } from "lucide-react";
import * as D from "./domain";
import { assetPath } from "./assets";
import { provinces } from "./locations";
import { IranMap } from "./IranMap";
export function Profile({
  customer,
  onProfile,
  onAddress,
  onDelete,
}: {
  customer: D.Customer;
  onProfile: (v: Pick<D.Customer, "name" | "manager" | "mobile">) => boolean;
  onAddress: (a: D.SavedAddress) => boolean;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<D.SavedAddress | null>(null);
  function newAddress() {
    setEditing({
      id: D.uid(),
      label: "",
      province: "تهران",
      city: "تهران",
      address: "",
      postalCode: "",
      recipient: customer.manager,
      phone: customer.mobile,
      lat: 35.6892,
      lng: 51.389,
      isDefault: !customer.addresses?.length,
    });
  }
  return (
    <>
      <h1>اطلاعات مرکز</h1>
      <form
        className="card profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onProfile({
            name: String(f.get("name")),
            manager: String(f.get("manager")),
            mobile: String(f.get("mobile")),
          });
        }}
      >
        <div className="profile-identity">
          <img
            src={assetPath(customer.avatar || "/profile/boghrat.svg")}
            alt={"نشان " + customer.name}
          />
          <div>
            <h2>{customer.name}</h2>
            <p>{customer.manager}</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            نام مرکز
            <input
              name="name"
              defaultValue={customer.name}
              required
              maxLength={100}
            />
          </label>
          <label>
            نام و نام خانوادگی مسئول
            <input
              name="manager"
              defaultValue={customer.manager}
              required
              maxLength={100}
            />
          </label>
          <label>
            شماره موبایل مسئول
            <input
              name="mobile"
              dir="ltr"
              defaultValue={customer.mobile}
              pattern="09[0-9]{9}"
              required
            />
          </label>
        </div>
        <button>ذخیره اطلاعات مرکز</button>
      </form>
      <section className="card" id="addresses">
        <div className="section-title">
          <h2>آدرس‌های من</h2>
          <button className="secondary" onClick={newAddress}>
            <Plus size={16} />
            افزودن آدرس
          </button>
        </div>
        {!customer.addresses?.length && <p>هنوز آدرسی ثبت نشده است.</p>}
        <div className="saved-addresses">
          {customer.addresses?.map((a) => (
            <article key={a.id} className="address-card">
              <div className="row">
                <h3>
                  <MapPin size={17} />
                  {a.label}
                </h3>
                {a.isDefault && (
                  <span className="badge confirmed">پیش‌فرض</span>
                )}
              </div>
              <p>{D.formatAddress(a)}</p>
              <small>
                {a.recipient} · <bdi>{a.phone}</bdi>
                {a.postalCode && (
                  <>
                    {" "}
                    · کد پستی <bdi>{a.postalCode}</bdi>
                  </>
                )}
              </small>
              <div className="actions">
                <button className="link" onClick={() => setEditing({ ...a })}>
                  <Pencil size={14} />
                  ویرایش آدرس
                </button>
                <button
                  className="link"
                  onClick={() => {
                    if (
                      confirm(
                        "این آدرس حذف شود؟ سفارش‌های قبلی نشانی خود را حفظ می‌کنند.",
                      )
                    )
                      onDelete(a.id);
                  }}
                >
                  <Trash2 size={14} />
                  حذف آدرس
                </button>
                {!a.isDefault && (
                  <button
                    className="link"
                    onClick={() => onAddress({ ...a, isDefault: true })}
                  >
                    <Check size={14} />
                    پیش‌فرض شود
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        {editing && (
          <form
            className="address-editor"
            onSubmit={(e) => {
              e.preventDefault();
              if (onAddress(editing)) setEditing(null);
            }}
          >
            <h3>
              {customer.addresses?.some((a) => a.id === editing.id)
                ? "ویرایش آدرس"
                : "آدرس جدید"}
            </h3>
            <div className="form-grid">
              <label>
                عنوان آدرس
                <input
                  required
                  value={editing.label}
                  maxLength={60}
                  onChange={(e) =>
                    setEditing({ ...editing, label: e.target.value })
                  }
                  placeholder="مثلاً مرکز اصلی"
                />
              </label>
              <label>
                استان
                <select
                  value={editing.province}
                  onChange={(e) => {
                    const c = provinces[e.target.value][0];
                    setEditing({
                      ...editing,
                      province: e.target.value,
                      city: c.name,
                      lat: c.lat,
                      lng: c.lng,
                    });
                  }}
                >
                  {Object.keys(provinces)
                    .sort((a, b) => a.localeCompare(b, "fa"))
                    .map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                </select>
              </label>
              <label>
                شهر
                <select
                  value={
                    provinces[editing.province].some(
                      (c) => c.name === editing.city,
                    )
                      ? editing.city
                      : "other"
                  }
                  onChange={(e) => {
                    if (e.target.value === "other") {
                      setEditing({ ...editing, city: "" });
                      return;
                    }
                    const c = provinces[editing.province].find(
                      (c) => c.name === e.target.value,
                    )!;
                    setEditing({
                      ...editing,
                      city: c.name,
                      lat: c.lat,
                      lng: c.lng,
                    });
                  }}
                >
                  {provinces[editing.province].map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                  <option value="other">شهر دیگر</option>
                </select>
              </label>
              {!provinces[editing.province].some(
                (c) => c.name === editing.city,
              ) && (
                <label>
                  نام شهر
                  <input
                    required
                    value={editing.city}
                    maxLength={60}
                    onChange={(e) =>
                      setEditing({ ...editing, city: e.target.value })
                    }
                  />
                </label>
              )}
              <label>
                کد پستی
                <input
                  inputMode="numeric"
                  dir="ltr"
                  value={editing.postalCode}
                  pattern="[0-9]{10}"
                  onChange={(e) =>
                    setEditing({ ...editing, postalCode: e.target.value })
                  }
                />
              </label>
              <label>
                نام گیرنده
                <input
                  required
                  value={editing.recipient}
                  maxLength={100}
                  onChange={(e) =>
                    setEditing({ ...editing, recipient: e.target.value })
                  }
                />
              </label>
              <label>
                موبایل گیرنده
                <input
                  dir="ltr"
                  required
                  pattern="09[0-9]{9}"
                  value={editing.phone}
                  onChange={(e) =>
                    setEditing({ ...editing, phone: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              نشانی دقیق
              <textarea
                required
                value={editing.address}
                maxLength={400}
                onChange={(e) =>
                  setEditing({ ...editing, address: e.target.value })
                }
              />
            </label>
            <IranMap
              lat={editing.lat}
              lng={editing.lng}
              city={editing.city || editing.province}
              onChange={(lat, lng) => setEditing({ ...editing, lat, lng })}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={editing.isDefault}
                onChange={(e) =>
                  setEditing({ ...editing, isDefault: e.target.checked })
                }
              />
              آدرس پیش‌فرض باشد
            </label>
            <div className="actions">
              <button type="submit">ذخیره آدرس</button>
              <button
                type="button"
                className="secondary"
                onClick={() => setEditing(null)}
              >
                انصراف
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
