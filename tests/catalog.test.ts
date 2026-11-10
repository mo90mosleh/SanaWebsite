import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed,compatible,createOrder,pay,migratePresentation} from '../src/domain.ts';
import {poctList,isCatalogItem} from '../src/catalog-data.ts';
import {categoryFor} from '../src/kitCategories.ts';
import {firstAvailableDelivery} from '../src/delivery.ts';
test('current POCT catalogue is exactly the 36 worksheet items; removed items cannot be bought',()=>{
 const s=seed();const active=s.products.filter(p=>isCatalogItem(p)&&p.family==='poct');
 assert.equal(active.length,36);assert.deepEqual(new Set(active.map(p=>p.id)),new Set(poctList.map(p=>p[0])));
 for(const id of ['pct','il6','psa','insulin']){const p=s.products.find(p=>p.id===id);assert.ok(p?.archived);assert.equal(compatible(p,s.customers[0]),false)}
 assert.equal(new Set(s.products.map(p=>p.id)).size,s.products.length);
});
test('laboratory products use Ortanes and are purchasable without a device; POCT retains compatibility checks',()=>{
 const s=seed(),c=s.customers[0];c.devices=[];const lab=s.products.find(p=>p.family==='laboratory')!;
 assert.equal(lab.brand,'Ortanes');assert.ok(compatible(lab,c));assert.equal(compatible(s.products.find(p=>p.id==='crp'),c),false);
 const o=createOrder(s,c.id,{[lab.id]:2},'online','lab-no-device',undefined,firstAvailableDelivery());
 assert.equal(o.total,lab.price*2);const before=lab.stock;pay(s,o.id,true);assert.equal(lab.stock,before-2);
});
test('all PDF catalogue rows have an explicit family, category, source and graphic path',()=>{
 const s=seed(),lab=s.products.filter(p=>p.family==='laboratory');assert.equal(lab.length,171);
 assert.equal(lab.filter(p=>p.sourcePage===1).length,75);assert.equal(lab.filter(p=>p.sourcePage===2).length,96);
 assert.ok(lab.every(p=>categoryFor(p).id!=='other'&&p.sourceLabel&&p.packLabel&&p.demoPrice));
 assert.ok(!lab.some(p=>/BHA|BABIO|پروکلسی/.test(p.name)));
});
test('migration preserves orders, stock, edited prices, customers and archived historical products without duplicates',()=>{
 const s=seed();delete s.catalogRevision;const crp=s.products.find(p=>p.id==='crp')!;crp.price=5555000;crp.stock=7;
 const orders=structuredClone(s.orders), customers=structuredClone(s.customers);
 const old=s.products.find(p=>p.id==='pct')!;old.archived=false;
 const first=migratePresentation(s);assert.equal(first.products.find(p=>p.id==='crp')!.price,5555000);assert.equal(first.products.find(p=>p.id==='crp')!.stock,7);
 assert.deepEqual(first.orders,orders);assert.deepEqual(first.customers,customers);assert.ok(first.products.find(p=>p.id==='pct')!.archived);
 const snapshot=JSON.stringify(first);assert.equal(JSON.stringify(migratePresentation(first)),snapshot);
 assert.equal(new Set(first.products.map(p=>p.id)).size,first.products.length);
});
