import {useEffect,useLayoutEffect,useRef,useState,type FormEvent} from 'react';
import {X,Send,RotateCcw,Square} from 'lucide-react';
import type {Item} from './domain';
import {assetPath} from './assets';
import {answerQuestion,type Answer} from './sanayar-knowledge';
import {askSanayar} from './sanayar-api';
import './sanayar.css';
type Message = Answer & {id:number;user?:boolean;mode?:'gemini'|'guide';notice?:string};
const welcome:Message={id:0,text:'سلام، به سانا خوش آمدید. برای معرفی و مقایسه دستگاه‌ها، انتخاب مصرفی‌های آزمایشگاهی و راهنمای استفاده از سایت، در خدمت شما هستم.',links:[]};
function Avatar(){return <img className="sanayar-avatar" src={assetPath('/sanayar.png')} alt="" width="78" height="78"/>}
function Text({text}:{text:string}){return <>{text.split(/\*\*(.*?)\*\*/gs).map((part,i)=>i%2?<strong key={i}>{part}</strong>:part)}</>}
export function Sanayar({items}:{items:Item[]}){
 const [open,setOpen]=useState(false),[input,setInput]=useState(''),[pending,setPending]=useState(false);
 const [messages,setMessages]=useState<Message[]>([welcome]);
 const [anchor,setAnchor]=useState(0);
 const active=useRef<AbortController|null>(null),sequence=useRef(0),reply=useRef(0);
 const launcher=useRef<HTMLButtonElement>(null),field=useRef<HTMLInputElement>(null),feed=useRef<HTMLDivElement>(null);
 useEffect(()=>()=>{active.current?.abort();active.current=null},[]);
 useEffect(()=>{if(open)field.current?.focus()},[open]);
 // Scroll once when submitting. Streaming never moves the user's reading position.
 useLayoutEffect(()=>{if(open&&feed.current){feed.current.style.setProperty('--sanayar-reply-space',Math.max(140,feed.current.clientHeight-90)+'px');feed.current.scrollTop=feed.current.scrollHeight}},[open,anchor]);
 const update=(id:number,change:Partial<Message>)=>setMessages(previous=>previous.map(m=>m.id===id?{...m,...change}:m));
 function close(){setOpen(false);launcher.current?.focus()}
 function stop(){const controller=active.current;active.current=null;controller?.abort();setPending(false);update(reply.current,{notice:'پاسخ متوقف شد.'});field.current?.focus()}
 function resetChat(){const controller=active.current;active.current=null;controller?.abort();setPending(false);setMessages([welcome]);setInput('');field.current?.focus()}
 async function ask(q:string){
  if(!q.trim()||active.current)return;
  const controller=new AbortController();active.current=controller;setPending(true);
  const userId=++sequence.current,answerId=++sequence.current;reply.current=answerId;
  const history=messages.filter(m=>m.id!==0&&m.text.trim()&&!m.notice);
  setMessages(m=>[...m,{id:userId,text:q.trim(),links:[],user:true},{id:answerId,text:'',links:[]}]);setInput('');setAnchor(userId);
  const timeout=setTimeout(()=>controller.abort('timeout'),65000);
  try{
   const response=await askSanayar(q.trim(),history,controller.signal,progress=>{if(active.current===controller)update(answerId,progress)});
   if(active.current===controller)update(answerId,response);
  }catch(error){
   if(active.current===controller){
    const message=error instanceof Error?error.message:'';
    const notice=message.includes('QUOTA')?'سهمیه پاسخ‌گویی آنلاین موقتاً تکمیل شده؛ پاسخ راهنمای سایت نمایش داده می‌شود.':message.includes('429')?'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید. پاسخ راهنمای سایت نمایش داده می‌شود.':'ارتباط با دستیار کامل نشد؛ پاسخ راهنمای سایت نمایش داده می‌شود.';
    update(answerId,{...answerQuestion(q,items),mode:'guide',notice});
   }
  }finally{clearTimeout(timeout);if(active.current===controller){active.current=null;setPending(false);field.current?.focus()}}
 }
 function submit(e:FormEvent){e.preventDefault();void ask(input)}
 const href=(h:string)=>h.startsWith('/')?assetPath(h):h;
 return <div className="sanayar" dir="rtl">
  <button ref={launcher} className="sanayar-launcher" aria-label="گفت‌وگو با سانایار" aria-expanded={open} aria-controls="sanayar-panel" aria-describedby="sanayar-description" onClick={()=>open?close():setOpen(true)}><Avatar/></button>
  <div className="sanayar-tooltip" id="sanayar-description" role="tooltip"><strong>سانایار؛ راهنمای سانا</strong><span>معرفی دستگاه‌ها و مصرفی‌های آزمایشگاهی و راهنمای استفاده از سایت</span></div>
  {open&&<section id="sanayar-panel" className="sanayar-panel" role="dialog" aria-modal="false" aria-labelledby="sanayar-title" onKeyDown={e=>{if(e.key==='Escape')close()}}>
   <header><Avatar/><div><strong id="sanayar-title">سانایار</strong><small>راهنمای تجهیزات و مصرفی‌های آزمایشگاهی</small></div><button type="button" aria-label="گفت‌وگوی جدید" onClick={resetChat}><RotateCcw size={17}/></button><button type="button" aria-label="بستن سانایار" onClick={close}><X size={20}/></button></header>
   <div className="sanayar-feed" ref={feed} role="log" aria-label="پیام‌های سانایار" aria-live={pending?'off':'polite'} aria-relevant="additions">
    {messages.map(m=><article className={'sanayar-message'+(m.user?' is-user':'')+(pending&&m.id===reply.current?' is-streaming':'')} key={m.id}>
     {m.notice&&<p className="sanayar-notice" role="status">{m.notice}</p>}
     <p><Text text={m.text}/>{pending&&m.id===reply.current&&<span className="sanayar-caret" aria-hidden="true"/>}</p>
     {m.links.length>0&&<nav aria-label="صفحات مرتبط">{m.links.map(l=><a key={l.href} href={href(l.href)} onClick={()=>{if(l.href.startsWith('#/'))close()}} target={l.href.endsWith('.pdf')?'_blank':undefined} rel={l.href.endsWith('.pdf')?'noreferrer':undefined}>{l.label}</a>)}</nav>}
    </article>)}
   </div>
   <div className="sanayar-status" role="status">{pending?'در حال نوشتن پاسخ…':''}</div>
   <div className="sanayar-suggestions">{['معرفی دستگاه‌ها','راهنمای مصرفی‌ها','ثبت سفارش','خدمات و پشتیبانی'].map(q=><button type="button" key={q} disabled={pending} onClick={()=>void ask(q)}>{q}</button>)}</div>
   <form onSubmit={submit}><input ref={field} value={input} onChange={e=>setInput(e.target.value)} maxLength={500} placeholder="نام دستگاه، مصرفی یا پرسش خود را وارد فرمایید" aria-label="پرسش از سانایار"/>{pending?<button type="button" aria-label="توقف پاسخ" onClick={stop}><Square size={16}/></button>:<button aria-label="ارسال پرسش" type="submit" disabled={!input.trim()}><Send size={18}/></button>}</form>
   <footer>پاسخ‌ها بر اساس اطلاعات محصولات و راهنمای سایت</footer>
  </section>}
 </div>
}
