import {useEffect,useRef,useState} from 'react';
import {Menu,X} from 'lucide-react';
export function PublicNavigation({path}:{path:string}){
 const [open,setOpen]=useState(false);
 const nav=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null);
 useEffect(()=>setOpen(false),[path]);
 useEffect(()=>{
  if(!open)return;
  const close=(e:PointerEvent)=>{if(!nav.current?.contains(e.target as Node)&&!toggle.current?.contains(e.target as Node))setOpen(false)};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus()}};
  document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape)};
 },[open]);
 return <><button ref={toggle} type="button" className="public-menu-toggle" aria-label={open?'بستن منوی اصلی':'نمایش منوی اصلی'} aria-expanded={open} aria-controls="public-navigation" onClick={()=>setOpen(v=>!v)}>{open?<X size={22}/>:<Menu size={22}/>}</button><nav ref={nav} id="public-navigation" className={'public-nav'+(open?' is-open':'')} aria-label="ناوبری اصلی">{[
 ['/','خانه'],['/devices','دستگاه‌ها'],['/supplies/ortanes','مصرفی آزمایشگاه'],['/supplies/poct','کیت‌های POCT'],['/services','خدمات و پشتیبانی'],['/contact','تماس با ما']
 ].map(([p,n])=>{const current=p==='/'?path==='/':path.split('?')[0]===p||path.startsWith(p+'/');return <a key={p} href={'#'+p} className={current?'current':''} aria-current={current?'page':undefined} onClick={()=>setOpen(false)}>{n}</a>})}</nav></>;
}
