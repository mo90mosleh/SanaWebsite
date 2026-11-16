import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.pdf':'application/pdf'};
const server=createServer(async(req,res)=>{
 if(req.url==='/api/sanayar/chat'){
  let raw='';for await(const chunk of req)raw+=chunk;const body=JSON.parse(raw);assert.equal(body.stream,true);assert.ok(Buffer.byteLength(raw)<16000);
  if(body.question==='خطا'){res.writeHead(429,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'provider_quota'}));return;}
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store'});
  const send=e=>res.write('data: '+JSON.stringify(e)+'\n\n');send({type:'meta',mode:'gemini'});
  const chunks=['شروع پاسخ زنده.\n','این بخش دوم پاسخ است.\n'.repeat(12),'این بخش سوم پاسخ است.\n'.repeat(20),'پایان پاسخ.'];
  let n=0;send({type:'delta',text:chunks[n++]});
  const timer=setInterval(()=>{if(n<chunks.length){send({type:'delta',text:chunks[n++]});}else{send({type:'done',links:[{label:'مشخصات BHA3000',href:'#/devices/bha3000'},{label:'کاتالوگ BHA3000',href:'/product-assets/getein/catalogs/GETEIN-BHA3000-Catalog.pdf'}]});clearInterval(timer);res.end()}},400);
  res.on('close',()=>clearInterval(timer));return;
 }
 try{const path=new URL(req.url,'http://local').pathname;const p=resolve('dist','.'+path+(path==='/'?'index.html':''));const bytes=await readFile(p);res.writeHead(200,{'Content-Type':types[extname(p)]||'application/octet-stream'});res.end(bytes)}catch{res.writeHead(404);res.end()}
});
await new Promise(r=>server.listen(8792,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{await mkdir('test-results',{recursive:true});for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8792/#/supplies/poct');
 const launcher=page.getByRole('button',{name:'گفت‌وگو با سانایار'});await launcher.click();const field=page.getByRole('textbox',{name:'پرسش از سانایار'});await field.fill('تست زنده');await field.press('Enter');
 await page.getByText('شروع پاسخ زنده.',{exact:false}).waitFor();assert.equal(await page.locator('.sanayar-message small').count(),0);assert.ok(await page.getByRole('button',{name:'توقف پاسخ'}).isVisible());assert.ok(!(await page.getByRole('button',{name:'معرفی دستگاه‌ها',exact:true}).isEnabled()));
 const scroll=await page.locator('.sanayar-feed').evaluate(el=>el.scrollTop);const windowScroll=await page.evaluate(()=>window.scrollY);
 await page.getByText('این بخش سوم پاسخ است.',{exact:false}).waitFor();assert.ok(Math.abs(await page.locator('.sanayar-feed').evaluate(el=>el.scrollTop)-scroll)<3,'stream must not jump to the end');assert.equal(await page.evaluate(()=>window.scrollY),windowScroll);
 await page.getByRole('link',{name:'مشخصات BHA3000',exact:true}).waitFor();await page.getByRole('link',{name:'مشخصات BHA3000',exact:true}).click();assert.ok(page.url().endsWith('#/devices/bha3000'));assert.equal(await page.getByRole('dialog',{name:'سانایار',exact:true}).count(),0);
 await launcher.click();await page.getByRole('button',{name:'گفت‌وگوی جدید'}).click();await field.fill('درخواست کند');await field.press('Enter');await page.getByRole('button',{name:'توقف پاسخ'}).waitFor();await page.getByRole('button',{name:'گفت‌وگوی جدید'}).click();await field.fill('پاسخ جدید');await field.press('Enter');await page.getByRole('link',{name:'مشخصات BHA3000',exact:true}).waitFor();assert.equal(await page.locator('.sanayar-message.is-user').count(),1,'reset cancels old response');
 await page.getByRole('button',{name:'گفت‌وگوی جدید'}).click();await page.getByRole('button',{name:'راهنمای مصرفی‌ها',exact:true}).click();await page.getByRole('button',{name:'توقف پاسخ'}).click();await page.getByText('پاسخ متوقف شد.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'گفت‌وگوی جدید'}).click();await field.fill('خطا');await field.press('Enter');await page.locator('.sanayar-notice').waitFor();assert.match(await page.locator('.sanayar-notice').innerText(),/سهمیه/);
 await page.screenshot({path:`test-results/sanayar-stream-${width}.png`});assert.equal(errors.length,0,errors.join('\n'));console.log(`PASS ${width}: labels removed, incremental text, stable scroll, working links, reset cancellation, stop, disabled suggestions, explicit quota fallback`);await page.close();
 }}finally{await browser.close();server.close()}
