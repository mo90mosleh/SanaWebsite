import {test} from 'node:test';
import assert from 'node:assert/strict';
import {answerQuestion} from '../src/sanayar-knowledge';
import {seed} from '../src/domain';
const items=seed().products;
test('models normalize Persian digits and comparisons keep both catalogs',()=>{const a=answerQuestion('مقایسه BHA۳۰۰۰ و FS-205',items);assert.equal(a.links.length,4);assert.match(a.text,/BHA3000/);assert.match(a.text,/FS-205/)});
test('prices and missing facts are never invented',()=>{assert.match(answerQuestion('قیمت BHA3000',items).text,/استعلام/);assert.match(answerQuestion('روز خوش',items).text,/نیافتم/);assert.match(answerQuestion('تفسیر نتیجه آزمایش',items).text,/پزشک/)});
test('laboratory products and test groups are searchable',()=>{assert.match(answerQuestion('سرسمپلر',items).text,/سرسمپلر/);assert.match(answerQuestion('کیت تیروئید',items).text,/TSH|T3|T4/);assert.match(answerQuestion('کیت CRP',items).text,/CRP/)});
test('unverified compatibility and archived products are protected',()=>{const p={...items[0],id:'x',name:'کیت XYZ',english:'XYZ',verified:false,models:['FS-205']};assert.match(answerQuestion('XYZ',[p]).text,/نیازمند تأیید/);assert.doesNotMatch(answerQuestion('XYZ',[{...p,archived:true}]).text,/کیت XYZ/)});
