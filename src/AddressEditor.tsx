import {useState,lazy,Suspense} from 'react';
import * as D from './domain';
import {provinces} from './locations';
const IranMap=lazy(()=>import('./IranMap').then(m=>({default:m.IranMap})));
export function newSavedAddress(customer:D.Customer):D.SavedAddress{return {id:D.uid(),label:'',province:'تهران',city:'تهران',address:'',postalCode:'',recipient:customer.manager,phone:customer.mobile,lat:35.6892,lng:51.389,isDefault:!customer.addresses?.length}}
export function AddressEditor({value:editing,onChange:setEditing,onSave,onCancel,isExisting=false}:{value:D.SavedAddress;onChange:(a:D.SavedAddress)=>void;onSave:(a:D.SavedAddress)=>void;onCancel:()=>void;isExisting?:boolean}){return (
          <form
            className="address-editor"
            onSubmit={(e) => {
              e.preventDefault();
              onSave(editing);
            }}
          >
            <h3>
              {isExisting
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
              <LocationPicker
                key="province"
                label="استان"
                value={editing.province}
                options={Object.keys(provinces).sort((a,b)=>a.localeCompare(b,'fa'))}
                onChange={(province)=>{
                  const c=provinces[province][0];
                  setEditing({...editing,province,city:c.name,lat:c.lat,lng:c.lng});
                }}
              />
              <LocationPicker
                key={'city-'+editing.province}
                label="شهر"
                value={provinces[editing.province].some(c=>c.name===editing.city)?editing.city:'other'}
                options={provinces[editing.province].map(c=>c.name)}
                allowOther
                onChange={(city)=>{
                  if(city==='other'){setEditing({...editing,city:''});return;}
                  const c=provinces[editing.province].find(c=>c.name===city)!;
                  setEditing({...editing,city:c.name,lat:c.lat,lng:c.lng});
                }}
              />
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
            <Suspense
              fallback={
                <p className="map-loading" role="status">
                  در حال آماده‌سازی نقشه…
                </p>
              }
            >
              <IranMap
                lat={editing.lat}
                lng={editing.lng}
                city={editing.city || editing.province}
                onChange={(lat, lng) => setEditing({ ...editing, lat, lng })}
              />
            </Suspense>
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
                onClick={onCancel}
              >
                انصراف
              </button>
            </div>
          </form>
);}
/** Search filters the authoritative location list; free text never changes a saved address. */
function LocationPicker({label,value,options,allowOther=false,onChange}:{label:string;value:string;options:string[];allowOther?:boolean;onChange:(value:string)=>void}){
  const [query,setQuery]=useState('');
  const normalize=(s:string)=>s.replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\s\u200c]+/g,'').trim();
  const filtered=options.filter(o=>normalize(o).includes(normalize(query)));
  const id=allowOther?'address-city':'address-province';
  return <div className="location-search-field" style={{display:'grid',gap:8,alignContent:'start'}}>
    <label htmlFor={id}>{label}</label>
    <input type="search" aria-label={'جست‌وجوی '+label} placeholder={'جست‌وجوی '+label+'…'} value={query} autoComplete="off" onChange={e=>setQuery(e.target.value)}/>
    <select id={id} aria-label={label} value={value} onChange={e=>{onChange(e.target.value);setQuery('')}}>
      {!filtered.includes(value)&&value!=='other'&&<option value={value} hidden>{value}</option>}
      {filtered.map(o=><option key={o} value={o}>{o}</option>)}
      {allowOther&&<option value="other">شهر دیگر</option>}
    </select>
    {query&&!filtered.length&&<small role="status">{label}ی با این نام پیدا نشد.{allowOther?' برای ثبت دستی، «شهر دیگر» را انتخاب کنید.':''}</small>}
  </div>;
}
