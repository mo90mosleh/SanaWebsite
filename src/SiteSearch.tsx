import {useEffect,useRef,useState} from 'react';
import {Search,X} from 'lucide-react';
import type {Item} from './domain';
import {products as devices} from './devices';
import {isCatalogItem} from './catalog-data';
export const normalizeSearch=(s:string)=>s.toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f]/g,' ').replace(/\s+/g,' ').trim();
export function SiteSearch({products,onProduct}:{products:Item[];onProduct:(p:Item)=>void}){
 const [query,setQuery]=useState(''),[active,setActive]=useState(-1),[expanded,setExpanded]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 const q=normalizeSearch(query);
 const entries=[...devices.map(d=>({id:'device-'+d.id,title:d.name,detail:'دستگاه '+d.category,text:[d.name,d.model,d.description,d.headline,...d.highlights,...d.specs.flat()].join(' '),href:'#/devices/'+d.id})),...products.filter(isCatalogItem).map(p=>({id:p.id,title:p.name,detail:p.english+' · '+(p.brand||''),text:[p.name,p.english,p.code,p.brand,...p.models,p.packLabel].join(' '),product:p})),...[
  {id:'services',title:'خدمات و پشتیبانی',detail:'راهنمای خدمات سانا',text:'خدمات پشتیبانی ضمانت گارانتی تعمیر دستگاه',href:'#/services'},
  {id:'contact',title:'تماس با ما',detail:'ارتباط با کارشناسان سانا',text:'تماس آدرس تلفن سانا',href:'#/contact'}]];
 const results=q?entries.filter(e=>q.split(' ').every(part=>normalizeSearch(e.text).includes(part))).slice(0,8):[];
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setExpanded(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 function choose(i:number){const e=results[i];if(!e)return;if('product' in e)onProduct(e.product!);else if('href' in e)location.hash=e.href!.slice(1);setQuery('');setExpanded(false);setActive(-1)}
 return <div className="site-search" ref={root}><label><Search size={18}/><input role="combobox" aria-label="جست‌وجو در سایت" aria-autocomplete="list" aria-expanded={expanded&&!!q} aria-controls="site-search-results" aria-activedescendant={active>=0?'site-result-'+active:undefined} placeholder="جست‌وجوی دستگاه یا محصول…" value={query} onFocus={()=>setExpanded(true)} onChange={e=>{setQuery(e.target.value);setExpanded(true);setActive(-1)}} onKeyDown={e=>{if(e.key==='Escape'){setExpanded(false);setActive(-1)}if(e.key==='ArrowDown'){e.preventDefault();setExpanded(true);setActive(n=>Math.min(n+1,results.length-1))}if(e.key==='ArrowUp'){e.preventDefault();setActive(n=>Math.max(0,n-1))}if(e.key==='Enter'&&results.length){e.preventDefault();choose(Math.max(0,active))}}}/>{query&&<button type="button" aria-label="پاک کردن جست‌وجو" onClick={()=>{setQuery('');setActive(-1)}}><X size={16}/></button>}</label>{expanded&&q&&<div id="site-search-results" role="listbox" aria-label="نتایج پیشنهادی">{results.length?results.map((e,i)=><button role="option" aria-selected={active===i} id={'site-result-'+i} key={e.id} onClick={()=>choose(i)}><strong>{e.title}</strong><small>{e.detail}</small></button>):<p role="status">نتیجه‌ای پیدا نشد؛ نام یا کد دیگری را وارد کنید.</p>}</div>}</div>
}
