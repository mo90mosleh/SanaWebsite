import {useEffect,useId,useState,type ReactNode} from 'react';
import {SlidersHorizontal,ChevronDown} from 'lucide-react';
export function CatalogFilters({children,activeCount=0}:{children:ReactNode;activeCount?:number}){
 const id=useId(),[mobile,setMobile]=useState(()=>matchMedia('(max-width:900px)').matches),[expanded,setExpanded]=useState(false);
 useEffect(()=>{const media=matchMedia('(max-width:900px)');const update=()=>{setMobile(media.matches);setExpanded(false)};media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 return <aside className="catalog-sidebar" aria-label="دسته‌بندی و فیلتر محصولات"><h2 className="catalog-menu-title">فیلترها</h2><button type="button" className="catalog-filter-toggle" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(v=>!v)}><SlidersHorizontal size={19}/><span>فیلترها</span>{activeCount>0&&<b>{activeCount.toLocaleString('fa-IR')} فعال</b>}<small>{expanded?'بستن':'نمایش'}</small><ChevronDown size={18}/></button><div id={id} className="catalog-filter-body" hidden={mobile&&!expanded}>{children}</div></aside>
}
