import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../src/domain.ts';
import {emptySupplyFilters,matchesSupplyFilters,priceDigits,sortedSupplies} from '../src/SupplyFilters.tsx';
import {normalizeLeadMobile,validateConsultation,sendConsultation,consultationEndpoint} from '../src/consultation.ts';
import {products} from '../src/devices.ts';
test('brand, stock and inclusive price filters combine; sorting preserves original data',()=>{
 const products=seed().products;
 const f={...emptySupplyFilters,brand:'Ortanes',inStock:true,min:'125000',max:'175000'};
 const result=products.filter(p=>matchesSupplyFilters(p,f));assert.ok(result.length>0);
 assert.ok(result.every(p=>p.brand==='Ortanes'&&p.stock>0&&p.price>=125000&&p.price<=175000));
 const before=result.map(p=>p.id),sorted=sortedSupplies(result,'price-desc');
 assert.deepEqual(result.map(p=>p.id),before);assert.ok(sorted.every((p,i)=>!i||p.price<=sorted[i-1].price));
 assert.equal(priceDigits('۱٬۲۵۰٬۰۰۰'),'1250000');
});
test('consultation validation normalizes Persian and international mobile numbers',()=>{
 assert.equal(normalizeLeadMobile('+98 912 345 6789'),'09123456789');
 assert.equal(normalizeLeadMobile('۰۹۱۲۳۴۵۶۷۸۹'),'09123456789');
 assert.equal(validateConsultation({name:'کاربر آزمایشی',organization:'مرکز آزمایشی',mobile:'۰۹۱۲۳۴۵۶۷۸۹'}),'');
 assert.ok(validateConsultation({name:'x',organization:'مرکز',mobile:'09123456789'}));
 assert.ok(validateConsultation({name:'کاربر آزمایشی',organization:'مرکز',mobile:'123'}));
});
test('consultation reuses landing payload and reports success only on acknowledged requests (mocked)',async()=>{
 const original=globalThis.fetch,locationDescriptor=Object.getOwnPropertyDescriptor(globalThis,'location');
 let body:Record<string,unknown>={};
 Object.defineProperty(globalThis,'location',{configurable:true,value:{origin:'https://mo90mosleh.github.io',pathname:'/SanaWebsite/',hash:'#/devices/fs-114'}});
 try{
  globalThis.fetch=async(url,options)=>{assert.equal(url,consultationEndpoint);assert.equal(options?.method,'POST');assert.equal(options?.mode,'cors');assert.equal(options?.credentials,'omit');body=JSON.parse(String(options?.body));return new Response('{}',{status:200})};
  await sendConsultation({name:'کاربر آزمایشی',organization:'مرکز آزمایشی',mobile:'۰۹۱۲۳۴۵۶۷۸۹'},products.find(p=>p.id==='fs-114')!,new AbortController().signal);
  assert.equal(body.product,'FS-114');assert.equal(body.productModel,'FS-114');assert.equal(body.company,'Wondfo');assert.equal(body.mobile,'09123456789');assert.equal(body.labName,'مرکز آزمایشی');
  globalThis.fetch=async()=>new Response('',{status:503});
  await assert.rejects(()=>sendConsultation({name:'کاربر آزمایشی',organization:'مرکز آزمایشی',mobile:'09123456789'},products[0],new AbortController().signal));
 }finally{globalThis.fetch=original;if(locationDescriptor)Object.defineProperty(globalThis,'location',locationDescriptor);else Reflect.deleteProperty(globalThis,'location')}
});
