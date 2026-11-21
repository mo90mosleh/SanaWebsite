import type {Product} from './devices';
import {readAttribution} from './lead-attribution';
export type ConsultationFields={name:string;mobile:string;organization:string};
export function normalizeLeadMobile(value:string){return value.replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[\s()-]/g,'').replace(/^(?:\+98|0098|98)(9\d{9})$/,'0$1')}
export function validateConsultation(f:ConsultationFields){return f.name.trim().length<3||f.name.length>100?'نام و نام خانوادگی را کامل وارد کنید.':!/^09\d{9}$/.test(normalizeLeadMobile(f.mobile))?'شماره موبایل معتبر وارد کنید.':f.organization.trim().length<2||f.organization.length>100?'نام آزمایشگاه یا مرکز را وارد کنید.':''}
// Same public lead endpoint and payload contract as ortanes-leb-gift.
export const consultationEndpoint='https://n8n.alecasgari.com/webhook/83591aad-47e3-475b-99a9-2f3d6d408e00';
export async function sendConsultation(fields:ConsultationFields,product:Product,signal:AbortSignal,honeypot=''){
 const utm=readAttribution(),name=fields.name.trim(),organization=fields.organization.trim();
 const response=await fetch(consultationEndpoint,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},signal:AbortSignal.any([signal,AbortSignal.timeout(60000)]),body:JSON.stringify({name,mobile:normalizeLeadMobile(fields.mobile),organization,productModel:product.model,manufacturer:product.manufacturer,productCategory:product.category,landingPage:'/devices/'+product.id,utm,honeypot,fullName:name,labName:organization,product:product.model,company:product.manufacturer,pageUrl:location.origin+location.pathname+location.hash,campaign:utm.utm_campaign||'',source:utm.utm_source||'',medium:utm.utm_medium||'',content:utm.utm_content||'',term:utm.utm_term||'',time:new Date().toISOString()})});
 if(!response.ok)throw new Error('ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.');
}
