import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://local').pathname;const p=resolve('dist','.'+pathname+(pathname==='/'?'index.html':''));res.writeHead(200,{'Content-Type':types[extname(p)]||'application/octet-stream'});res.end(await readFile(p));}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(8791,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{await mkdir('test-results',{recursive:true});for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});let calls=0;
 await page.route('**/api/sanayar/chat',async route=>{calls++;await route.fulfill({json:{text:'پاسخ آزمایشی مستند',links:[]}})});
 await page.goto('http://127.0.0.1:8791/');const launch=page.getByRole('button',{name:'گفت‌وگو با سانایار'});await launch.waitFor();await launch.hover();assert.equal(await page.getByRole('tooltip').isVisible(),true);assert.equal(await launch.innerText(),'');const box=await launch.boundingBox();assert.ok(box.width<=64);
 await launch.click();const field=page.getByRole('textbox',{name:'پرسش از سانایار'});await field.fill('تفاوت مدل‌ها چیست؟');await field.press('Enter');await page.getByText('پاسخ آزمایشی مستند',{exact:true}).waitFor();assert.equal(calls,1);
 await page.getByRole('button',{name:'گفت‌وگوی جدید'}).click();assert.equal(await page.getByText('پاسخ آزمایشی مستند',{exact:true}).count(),0);
 await page.route('**/api/sanayar/chat',route=>route.fulfill({status:503,json:{error:'not_configured'}}));await field.fill('BHA3000');await field.press('Enter');await page.locator('.sanayar-notice').waitFor();
 await field.press('Escape');await launch.hover();await page.screenshot({path:`test-results/sanayar-floating-${width}.png`});console.log(`PASS ${width}: floating avatar, tooltip, Gemini response, reset and local fallback`);await page.close();
 }}finally{await browser.close();server.close()}
