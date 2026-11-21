import {useEffect,useRef,useState} from 'react';
import {Menu,X,Home,Microscope,Package,FlaskConical,LifeBuoy,Phone,ChevronLeft} from 'lucide-react';
import {Logo} from './ui';
const links=[['/','خانه',Home],['/devices','دستگاه‌ها',Microscope],['/supplies/ortanes','مصرفی آزمایشگاه',Package],['/supplies/poct','کیت‌های POCT',FlaskConical],['/services','خدمات و پشتیبانی',LifeBuoy],['/contact','تماس با ما',Phone]] as const;
export function PublicNavigation({path}:{path:string}){
 const [open,setOpen]=useState(false),[mobile,setMobile]=useState(()=>matchMedia('(max-width:900px)').matches);
 const nav=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDialogElement>(null);
 function close(){dialog.current?.close();setOpen(false)}
 useEffect(close,[path]);
 useEffect(()=>{const m=matchMedia('(max-width:900px)');const change=()=>{close();setMobile(m.matches)};m.addEventListener('change',change);return()=>m.removeEventListener('change',change)},[]);
 useEffect(()=>{
  if(!open)return;
  if(mobile){const previous=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';return()=>{document.documentElement.style.overflow=previous}}
  const outside=(e:PointerEvent)=>{if(!nav.current?.contains(e.target as Node)&&!toggle.current?.contains(e.target as Node))setOpen(false)};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus()}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)};
 },[open,mobile]);
 const entries=(icons=false)=>links.map(([p,n,Icon])=>{const current=p==='/'?path==='/':path.split('?')[0]===p||path.startsWith(p+'/');return <a key={p} href={'#'+p} className={current?'current':''} aria-current={current?'page':undefined} onClick={close}>{icons&&<Icon size={21}/>}<span>{n}</span>{icons&&<ChevronLeft size={17}/>}</a>});
 return <><button ref={toggle} type="button" className="public-menu-toggle" aria-label={open?'بستن منوی اصلی':'نمایش منوی اصلی'} aria-expanded={open} aria-haspopup={mobile?'dialog':undefined} aria-controls={mobile?'public-mobile-navigation':'public-navigation'} onClick={()=>{if(open)close();else{setOpen(true);if(mobile)dialog.current?.showModal()}}}>{open?<X size={22}/>:<Menu size={22}/>}</button><nav ref={nav} id="public-navigation" className={'public-nav'+(open&&!mobile?' is-open':'')} aria-label="ناوبری اصلی">{entries()}</nav><dialog ref={dialog} id="public-mobile-navigation" className="public-mobile-drawer" aria-label="منوی اصلی سانا" onClose={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)close()}}><header><a href="#/" aria-label="صفحه اصلی سانا" onClick={close}><Logo/></a><button type="button" aria-label="بستن منوی اصلی" onClick={close}><X size={22}/></button></header><p>تجهیزات و مصرفی‌های آزمایشگاهی</p><nav aria-label="بخش‌های سایت">{entries(true)}</nav></dialog></>;
}
