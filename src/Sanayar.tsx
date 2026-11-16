import {useEffect,useRef,useState,type FormEvent} from 'react';
import {X,Send,RotateCcw} from 'lucide-react';
import type {Item} from './domain';
import {assetPath} from './assets';
import {answerQuestion,type Answer} from './sanayar-knowledge';
import './sanayar.css';
import {askSanayar} from './sanayar-api';
const welcome:Answer={text:'سلام، به سانا خوش آمدید. من سانایار، راهنمای محصولات و خدمات سانا هستم. در زمینه دستگاه‌ها، مصرفی‌های آزمایشگاهی و استفاده از سایت، چگونه می‌توانم راهنمایی‌تان کنم؟',links:[]};
function Avatar(){return <img className="sanayar-avatar" src={assetPath('/sanayar.png')} alt="" width="78" height="78"/>}
export function Sanayar({items}:{items:Item[]}){
 const [open,setOpen]=useState(false),[input,setInput]=useState(''),[pending,setPending]=useState(false);
 const active=useRef<AbortController|null>(null);
 useEffect(()=>()=>active.current?.abort(),[]);
 const [messages,setMessages]=useState<(Answer&{user?:boolean})[]>([welcome]);
 const launcher=useRef<HTMLButtonElement>(null),field=useRef<HTMLInputElement>(null),feed=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(open)field.current?.focus()},[open]);
 useEffect(()=>{if(open&&feed.current)feed.current.scrollTop=feed.current.scrollHeight},[open,messages]);
 function close(){setOpen(false);launcher.current?.focus()}
 async function ask(q:string){
  if(!q.trim()||active.current)return;
  const controller=new AbortController();active.current=controller;setPending(true);
  const history=messages.slice(1);setMessages(m=>[...m,{text:q.trim(),links:[],user:true}]);setInput('');
  const timeout=setTimeout(()=>controller.abort('timeout'),25000);
  try { const reply=await askSanayar(q.trim(),history,controller.signal);if(active.current===controller)setMessages(m=>[...m,reply]); }
  catch { if(active.current===controller){const fallback=answerQuestion(q,items);setMessages(m=>[...m,{...fallback,text:'در حال حاضر، پاسخ راهنمای سایت نمایش داده می‌شود.\n\n'+fallback.text}]);} }
  finally {clearTimeout(timeout);if(active.current===controller){active.current=null;setPending(false);field.current?.focus();}}
 }
 function resetChat(){const request=active.current;active.current=null;request?.abort();setPending(false);setMessages([welcome]);setInput('');field.current?.focus()}
 function submit(e:FormEvent){e.preventDefault();ask(input)}
 const href=(h:string)=>h.startsWith('/')?assetPath(h):h;
 return <div className="sanayar" dir="rtl"><button ref={launcher} className="sanayar-launcher" aria-label="گفت‌وگو با سانایار" aria-expanded={open} aria-controls="sanayar-panel" aria-describedby="sanayar-description" onClick={()=>open?close():setOpen(true)}><Avatar/></button><div className="sanayar-tooltip" id="sanayar-description" role="tooltip"><strong>سانایار؛ راهنمای سانا</strong><span>معرفی دستگاه‌ها و مصرفی‌های آزمایشگاهی و راهنمای استفاده از سایت</span></div>
 {open&&<section id="sanayar-panel" className="sanayar-panel" role="dialog" aria-modal="false" aria-labelledby="sanayar-title" onKeyDown={e=>{if(e.key==='Escape')close()}}><header><Avatar/><div><strong id="sanayar-title">سانایار</strong><small>راهنمای تجهیزات و مصرفی‌های آزمایشگاهی</small></div><button aria-label="گفت‌وگوی جدید" onClick={()=>{setMessages([welcome]);setInput('');field.current?.focus()}}><RotateCcw size={17}/></button><button aria-label="بستن سانایار" onClick={close}><X size={20}/></button></header>
 <div className="sanayar-feed" ref={feed} role="log" aria-label="پیام‌های سانایار" aria-live="polite" aria-relevant="additions">{messages.map((m,i)=><article className={'sanayar-message'+(m.user?' is-user':'')} key={i}><small>{m.user?'شما':'سانایار'}</small><p>{m.text}</p>{m.links.length>0&&<nav aria-label="صفحات مرتبط">{m.links.map(l=><a key={l.href} href={href(l.href)} target={l.href.endsWith('.pdf')?'_blank':undefined} rel={l.href.endsWith('.pdf')?'noreferrer':undefined}>{l.label}</a>)}</nav>}</article>)}</div>
 {pending&&<div className="sanayar-pending" role="status">در حال آماده‌سازی پاسخ…</div>}
 <div className="sanayar-suggestions">{['معرفی دستگاه‌ها','راهنمای مصرفی‌ها','ثبت سفارش','خدمات و پشتیبانی'].map(q=><button key={q} onClick={()=>ask(q)}>{q}</button>)}</div>
 <form onSubmit={submit}><input ref={field} value={input} onChange={e=>setInput(e.target.value)} maxLength={500} placeholder="نام دستگاه، مصرفی یا پرسش خود را وارد فرمایید" aria-label="پرسش از سانایار"/><button aria-label="ارسال پرسش" type="submit" disabled={!input.trim()||pending}><Send size={18}/></button></form><footer>پاسخ‌ها بر اساس اطلاعات محصولات و راهنمای سایت</footer></section>}
 </div>
}

