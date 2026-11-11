import { products as devices } from './devices';
import type { Item } from './domain';
import { categories, categoryFor, poctGroups } from './kitCategories';
export type Answer = { text: string; links: { label: string; href: string }[] };
export const normalize=(s:string)=>s.toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[^\p{L}\p{N}]/gu,'');
const link=(label:string,href:string)=>({label,href});
const contact=link('ارتباط با سانا','#/contact');
const supplies=[link('کیت‌های POCT','#/supplies/poct'),link('مصرفی آزمایشگاه','#/supplies/ortanes')];
const stop=new Set(['سلام','لطفا','برای','درباره','اطلاعات','قیمت','مصرفی','کیت','دستگاه','مدل','دارید','میخواهم','میخوام','چیست','چیه','میشه','بگو','است','را','رو','چه','این','با','از','به','و','های','ها','تست','مقایسه','مشخصات','فنی']);
export function answerQuestion(question:string,items:Item[]):Answer{
 const q=normalize(question);
 if(!q)return {text:'لطفاً پرسش خود را وارد فرمایید.',links:[]};
 if(/تفسیر|نتیجهآزمایش|درمان|دوز|تشخیصبیماری/.test(q))return {text:'سانایار در زمینه محصولات و خدمات سانا راهنمایی می‌کند. تفسیر نتایج آزمایش و تصمیم‌های تشخیصی یا درمانی باید توسط پزشک یا مسئول فنی آزمایشگاه انجام شود.',links:[contact]};
 if(/قیمت|موجودی|تخفیف|اقساط|شرایطفروش/.test(q))return {text:'برای استعلام قیمت و موجودی قطعی و شرایط فروش، لطفاً با واحد فروش سانا در ارتباط باشید. قیمت‌ها و موجودی‌های نسخه نمایشی مبنای پیشنهاد قطعی فروش نیستند.',links:[contact,...supplies]};
 const selected=devices.filter(p=>q.includes(normalize(p.model))||q.includes(normalize(p.id)));
 const wantsConsumables=/مصرفی|کیت|معرف|سازگاری/.test(q);
 if(selected.length&&!wantsConsumables){
  return {text:selected.map(p=>[p.name,p.description,'مشخصات فنی',...p.specs.map(([k,v])=>`${k}: ${v}`),'ویژگی‌ها: '+p.highlights.join('؛ '),...p.advantages.map(a=>`${a.title}: ${a.text}`),'کاربردها',...p.applications.map(a=>`${a.title}: ${a.text}`),'روند کار: '+p.workflow.join('؛ '),...p.faqs.map(f=>`${f.q}\n${f.a}`)].join('\n\n')).join('\n\n────────\n\n'),links:selected.flatMap(p=>[link('مشخصات '+p.model,'#/devices/'+p.id),link('کاتالوگ '+p.model,p.catalog)])};
 }
 const tokens=question.replace(/‌/g,' ').split(/[\s،؟?]+/).map(normalize).filter(t=>t.length>1&&!stop.has(t));
 const group=poctGroups.find(g=>q.includes(normalize(g.label)));
 const category=categories.find(c=>c.id!=='other'&&c.id!=='poct'&&c.label.split(/\s+و\s+/).map(normalize).some(t=>t.length>2&&q.includes(t)));
 const matches=items.filter(p=>!p.archived).map(p=>({p,score:tokens.reduce((n,t)=>n+((`${p.name} ${p.english} ${p.code}`.split(/[\s،()–—-]+/).map(normalize).includes(t)||(/[a-z]/.test(t)&&t.length>=3&&normalize(p.english+' '+p.code).includes(t)))?1:0),0)+(group?.products.includes(p.id)?3:0)+(category&&categoryFor(p).id===category.id?3:0)+(selected.some(d=>p.models.includes(d.model))&&wantsConsumables?3:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.p);
 if(matches.length)return {text:matches.slice(0,5).map(p=>[p.name+(p.english&&p.english!=='Ortanes'?` (${p.english})`:''),'برند: '+p.brand,p.code?'کد محصول: '+p.code:'',p.packLabel?'بسته‌بندی: '+p.packLabel:'',p.tests?'تعداد تست ثبت‌شده: '+p.tests:'',p.family==='laboratory'?'مصرفی عمومی آزمایشگاه؛ بدون نیاز به ثبت دستگاه':p.verified&&p.models.length?'مدل‌های سازگار ثبت‌شده: '+p.models.join('، '):'سازگاری دستگاه پیش از سفارش نیازمند تأیید است.'].filter(Boolean).join('\n')).join('\n\n')+(matches.length>5?`\n\n${matches.length.toLocaleString('fa-IR')} قلم مرتبط یافت شد. برای سایر اقلام، فهرست مصرفی‌ها را باز کنید.`:'')+'\n\nاطلاعات از فهرست محصولات سایت استخراج شده است.',links:supplies};
 if(wantsConsumables||/اورتانیس|ortanes/.test(q))return {text:'مصرفی‌های سایت شامل کیت‌های POCT و مصرفی‌های عمومی آزمایشگاه اورتانیس است. می‌توانید نام آزمایش، نام محصول، کد مصرفی یا مدل دستگاه را وارد فرمایید. برای اقلامی که سازگاری تأییدشده ندارند، تأیید واحد فروش پیش از سفارش ضروری است.',links:supplies};
 if(/دستگاه|cbc|poct|سلکانتر|مقایسه/.test(q))return {text:'دستگاه‌های معرفی‌شده در سایت:\n\n'+devices.map(p=>`${p.model} — ${p.category}، ${p.manufacturer}\n${p.headline}`).join('\n\n')+'\n\nبرای دریافت مشخصات و کاتالوگ یا مقایسه، نام یک یا چند مدل را وارد فرمایید.',links:devices.map(p=>link(p.model,'#/devices/'+p.id))};
 if(/سفارش|خرید|سبد|پرداخت|ارسال|تحویل/.test(q))return {text:'برای ثبت سفارش، وارد حساب مشتری شوید و اقلام مورد نیاز را از بخش کیت‌ها و مواد مصرفی به سبد خرید اضافه فرمایید. سپس نشانی و زمان تحویل را انتخاب و مراحل ثبت سفارش را تکمیل کنید. وضعیت سفارش در بخش سفارش‌های من قابل پیگیری است.',links:[link('ورود به حساب','#/login'),link('مصرفی‌ها','#/customer/supplies'),link('سفارش‌های من','#/customer/orders')]};
 if(/ورود|حساب|ثبتنام|رمز/.test(q))return {text:'از صفحه ورود به حساب مشتری دسترسی پیدا کنید. در صورت نداشتن دسترسی یا مشکل ورود، با سانا تماس بگیرید.',links:[link('ورود به حساب','#/login'),contact]};
 if(/خدمات|پشتیبان|تعمیر|ضمانت|گارانتی|آموزش|نصب|تیکت/.test(q))return {text:'خدمات سانا در صفحه خدمات و پشتیبانی معرفی شده است. درخواست مربوط به دستگاه را می‌توانید از بخش تیکت‌های پشتیبانی حساب مشتری پیگیری کنید. شرایط قطعی نصب، ضمانت و خدمات هر مدل را از واحد مربوط دریافت فرمایید.',links:[link('خدمات و پشتیبانی','#/services'),link('تیکت‌های پشتیبانی','#/customer/tickets'),contact]};
 if(/تماس|تلفن|آدرس|ارتباط/.test(q))return {text:'اطلاعات تماس و نشانی سانا در صفحه تماس با ما در دسترس است.',links:[contact]};
 return {text:'برای این پرسش، پاسخ تأییدشده‌ای در اطلاعات فعلی نیافتم. لطفاً نام دستگاه، آزمایش یا مصرفی را مشخص فرمایید. همچنین می‌توانم درباره ورود، سفارش و خدمات سایت راهنمایی کنم.',links:[link('دستگاه‌ها','#/devices'),...supplies,contact]};
}
