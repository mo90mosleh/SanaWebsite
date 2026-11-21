import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Check } from "lucide-react";
import * as D from "./domain";
import { assetPath } from "./assets";
import {AddressEditor,newSavedAddress} from './AddressEditor';
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
    setEditing(newSavedAddress(customer));
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
          <AddressEditor value={editing} onChange={setEditing} isExisting={customer.addresses?.some(a=>a.id===editing.id)} onSave={a=>{if(onAddress(a))setEditing(null)}} onCancel={()=>setEditing(null)}/>
        )}
      </section>
    </>
  );
}

