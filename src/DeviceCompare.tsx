import {useEffect,useRef,useState} from 'react';
import {X,Columns3} from 'lucide-react';
import {products,type Product} from './devices';
function specRows(p:Product):[string,string][]{
 return p.specs.flatMap(([key,value]):[string,string][]=>{
  if(key==='تفکیک / پارامترها'){const [parts,parameters]=value.split(' / ');return [['تفکیک گلبول سفید',parts],['پارامترها',parameters]]}
  const k=key.replace(/ \(.*?\)/g,'');
  return [[k==='ظرفیت اعلام‌شده'?'سرعت تست':k==='فناوری تفکیک'||k==='فناوری WBC'?'فناوری شمارش گلبول سفید':k,value]];
 });
}
export function DeviceCompare({model}:{model:Product}){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState([model.id]);
 const trigger=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDialogElement>(null);
 const family=products.filter(p=>p.category===model.category),chosen=family.filter(p=>selected.includes(p.id));
 useEffect(()=>{setSelected([model.id]);setOpen(false)},[model.id]);
 useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close()},[open]);
 function close(){setOpen(false);trigger.current?.focus()}
 const keys=[...new Set(chosen.flatMap(p=>specRows(p).map(([key])=>key)))];
 return <><button type="button" className="compare-trigger" ref={trigger} onClick={()=>setOpen(true)}><Columns3 size={19} aria-hidden="true"/>مقایسه دستگاه‌های {model.category}</button><dialog ref={dialog} className="device-compare" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}}><header><h2>مقایسه دستگاه‌های {model.category}</h2><button type="button" aria-label="بستن مقایسه" onClick={close}><X size={22}/></button></header><p>تا سه دستگاه از همین خانواده را انتخاب کنید.</p><div className="compare-options">{family.map(p=><label key={p.id}><input type="checkbox" checked={selected.includes(p.id)} disabled={!selected.includes(p.id)&&selected.length>=3} onChange={e=>setSelected(prev=>e.target.checked?[...prev,p.id]:prev.filter(id=>id!==p.id))}/><bdi>{p.name}</bdi></label>)}</div>{chosen.length<2?<p role="status">حداقل دو دستگاه را برای مقایسه انتخاب کنید.</p>:<div className="compare-scroll" tabIndex={0} aria-label="جدول مقایسه دستگاه‌ها"><table><thead><tr><th scope="col">ویژگی</th>{chosen.map(p=><th scope="col" key={p.id}><bdi>{p.name}</bdi></th>)}</tr></thead><tbody><tr><th scope="row">معرفی</th>{chosen.map(p=><td key={p.id}>{p.description}</td>)}</tr>{keys.map(key=><tr key={key}><th scope="row">{key}</th>{chosen.map(p=><td key={p.id}>{specRows(p).find(([k])=>k===key)?.[1]||'در کاتالوگ این مدل درج نشده'}</td>)}</tr>)}</tbody></table></div>}</dialog></>
}
