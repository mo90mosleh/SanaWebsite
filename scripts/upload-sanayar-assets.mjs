import {readFile} from 'node:fs/promises';
import {extname} from 'node:path';
if(process.stdin.isTTY)process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');console.log('Ready for asset session on hidden stdin');
let input='';const line=await new Promise(resolve=>process.stdin.on('data',chunk=>{input+=chunk;try{JSON.parse(input.trim());process.stdin.pause();resolve(input.trim())}catch{}}));
if(process.stdin.isTTY)process.stdin.setRawMode(false);
const session=JSON.parse(line),manifest=JSON.parse(await readFile('.sanayar-build/manifest.json','utf8'));
const byHash=Object.fromEntries(Object.entries(manifest).map(([p,m])=>[m.hash,p]));
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.pdf':'application/pdf','.webp':'image/webp','.webmanifest':'application/manifest+json'};
let jwt=session.jwt;
for(const bucket of session.buckets){const form=new FormData();for(const hash of bucket){const p=byHash[hash];const bytes=await readFile('dist'+p);form.append(hash,new Blob([bytes.toString('base64')],{type:types[extname(p)]||'application/octet-stream'}),hash)}const r=await fetch('https://api.cloudflare.com/client/v4/accounts/842ed53f45e3ddc090d60c0c4060cdf0/workers/assets/upload?base64=true',{method:'POST',headers:{Authorization:'Bearer '+session.jwt},body:form});const d=await r.json();if(!r.ok||!d.success)throw Error(JSON.stringify({status:r.status,errors:d.errors}));if(d.result?.jwt)jwt=d.result.jwt;}
console.log(JSON.stringify({success:true,jwt}));process.exit(0);
