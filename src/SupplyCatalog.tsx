import {useState} from 'react';
import type {Item} from './domain';
import {money} from './domain';
import {CategoryCircles} from './CategoryCircles';
import {categoryFor,poctGroups} from './kitCategories';
import {isCatalogItem} from './catalog-data';
import {KitArtwork} from './KitArtwork';
import {OrtanesLogo} from './OrtanesLogo';
export function SupplyCatalog({products,family='all',onChoose}:{products:Item[];family?:string;onChoose:(p:Item)=>void}){
 const [category,setCategory]=useState(''),[query,setQuery]=useState(''),[sub,setSub]=useState(''),[limit,setLimit]=useState(12);
 const visible=products.filter(p=>isCatalogItem(p)&&(family!=='ortanes'||p.family==='laboratory')&&(family!=='poct'||p.family==='poct')&&(!category||categoryFor(p).id===category)&&(!sub||poctGroups.find(g=>g.id===sub)?.products.includes(p.id))&&(p.name+' '+p.english+' '+p.code).toLowerCase().includes(query.toLowerCase().trim()));
 return <main className="public-main supply-catalog">
  <header className="catalog-intro"><div><span className="eyebrow">تأمین روزمره آزمایشگاه</span><h1>{family==='ortanes'?'مصرفی‌های آزمایشگاه اورتانیس':family==='poct'?'کیت‌های POCT':'کیت و مصرفی آزمایشگاه'}</h1><p>از کیت دستگاه تا ظروف و ملزومات روزمره؛ انتخاب بر اساس نیاز شما.</p></div><OrtanesLogo/></header>
  <nav className="catalog-family-tabs" aria-label="خانواده مصرفی‌ها">{[['all','همه مصرفی‌ها','/supplies'],['poct','کیت‌های POCT','/supplies/poct'],['ortanes','مصرفی آزمایشگاه · اورتانیس','/supplies/ortanes']].map(([id,label,path])=><a key={id} className={family===id?'selected':''} aria-current={family===id?'page':undefined} href={'#'+path}>{label}</a>)}</nav>
  <CategoryCircles family={family} value={category} onChange={id=>{setCategory(id);setSub('');setLimit(12)}}/>
  <div className="catalog-tools"><label>جست‌وجوی محصول<input aria-label="جست‌وجوی مصرفی‌ها" placeholder="نام محصول، تست یا کد…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(12)}}/></label>{(family==='poct'||category==='poct')&&<label>گروه تست<select aria-label="گروه تست POCT" value={sub} onChange={e=>{setSub(e.target.value);setLimit(12)}}><option value="">همه گروه‌ها</option>{poctGroups.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label>}<span aria-live="polite">{visible.length.toLocaleString('fa-IR')} محصول</span></div>
  <p className="catalog-demo-note">نسخه نمایشی · قیمت و موجودی نمونه هستند. تصویرها گرافیکی‌اند؛ بسته‌بندی نهایی هنگام تأیید سفارش مشخص می‌شود.</p>
  <section className="catalog-grid" aria-label="محصولات مصرفی">{visible.slice(0,limit).map(p=><article className="card supply" key={p.id}><div className="row"><span className="brand-label">{p.brand==='Ortanes'?'اورتانیس · Ortanes':'Wondfo / Finecare'}</span><small>{categoryFor(p).label}</small></div><div className="kit-photo kit-illustration"><KitArtwork product={p}/><small>تصویر گرافیکی</small></div><h2>{p.name}</h2>{p.family==='poct'&&<p><bdi>{p.english}</bdi></p>}<p className="catalog-pack">{p.packLabel}</p><p className="muted">{p.family==='laboratory'?'مصرفی عمومی آزمایشگاه؛ بدون نیاز به ثبت دستگاه':p.models.length?p.models.join(' / '):'تأیید سازگاری دستگاه پیش از سفارش'}</p><div className="price-block"><span>قیمت نمایشی <strong>{money(p.price)}</strong></span></div><button onClick={()=>onChoose(p)}>{p.verified?'انتخاب و سفارش':'مشاهده در پنل مشتری'}</button></article>)}</section>
  {!visible.length&&<p role="status" className="empty">در این دسته محصولی با عبارت شما پیدا نشد.</p>}{visible.length>limit&&<button className="secondary full" onClick={()=>setLimit(n=>n+12)}>نمایش محصولات بیشتر</button>}
 </main>
}
