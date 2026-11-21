import {useState,useEffect,useId,useRef,lazy,Suspense} from 'react';
import {ChevronDown,Search,Check} from 'lucide-react';
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
/** Search is inside the opened picker; only authoritative options can be saved. */
function LocationPicker({label,value,options,allowOther=false,onChange}:{label:string;value:string;options:string[];allowOther?:boolean;onChange:(value:string)=>void}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(0);
 const id=useId(),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),input=useRef<HTMLInputElement>(null);
 const normalize=(s:string)=>s.replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\s\u200c]+/g,'').trim();
 const filtered=options.filter(o=>normalize(o).includes(normalize(query))),entries=[...filtered.map(o=>({value:o,label:o})),...(allowOther?[{value:'other',label:'شهر دیگر'}]:[])];
 function close(focus=false){setOpen(false);setQuery('');if(focus)trigger.current?.focus()}
 function choose(v:string){onChange(v);close(true)}
 useEffect(()=>{if(!open)return;input.current?.focus();const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))close()};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[open]);
 useEffect(()=>{if(open)root.current?.querySelector('[data-active="true"]')?.scrollIntoView({block:'nearest'})},[active,open]);
 return <div className="location-search-field" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))close()}}>
 <label htmlFor={id}>{label}</label><button ref={trigger} id={id} type="button" className="location-picker-trigger" aria-label={label} aria-expanded={open} aria-haspopup="listbox" aria-controls={id+'-options'} onClick={()=>{if(open)close();else{setQuery('');setActive(0);setOpen(true)}}} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);setActive(0)}}}><span>{value==='other'?'شهر دیگر':value||'انتخاب '+label}</span><ChevronDown size={18}/></button>
 {open&&<div className="location-picker-popup"><div className="location-picker-search"><Search size={17}/><input ref={input} type="search" role="combobox" aria-label={'جست‌وجوی '+label} placeholder={'جست‌وجوی '+label+'…'} aria-autocomplete="list" aria-expanded="true" aria-controls={id+'-options'} aria-activedescendant={entries[active]?id+'-option-'+active:undefined} value={query} autoComplete="off" onChange={e=>{setQuery(e.target.value);setActive(0)}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true)}else if(e.key==='ArrowDown'){e.preventDefault();setActive(n=>Math.min(entries.length-1,n+1))}else if(e.key==='ArrowUp'){e.preventDefault();setActive(n=>Math.max(0,n-1))}else if(e.key==='Enter'){e.preventDefault();if(entries[active])choose(entries[active].value)}}}/></div>
 {!filtered.length&&<p role="status" className="location-picker-empty">{label}ی با این نام پیدا نشد.</p>}<div role="listbox" id={id+'-options'} aria-label={'فهرست '+label} className="location-picker-options">{entries.map((o,i)=><button key={o.value} id={id+'-option-'+i} type="button" role="option" tabIndex={-1} aria-selected={value===o.value} data-active={active===i} onPointerMove={()=>setActive(i)} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(o.value)}><span>{o.label}</span>{value===o.value&&<Check size={17}/>}</button>)}</div></div>}
 </div>;
}
