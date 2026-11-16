const base='https://sanawebsite.mo90mosleh.workers.dev';
const status=await fetch(base+'/api/sanayar/status');console.log('status',await status.json());
const started=Date.now();const response=await fetch(base+'/api/sanayar/chat',{method:'POST',headers:{'Content-Type':'application/json','Origin':base},body:JSON.stringify({question:'BHA3000 چند پارت است و حجم نمونه آن چقدر است؟',stream:true})});
console.log('chat',response.status,response.headers.get('Content-Type'));
if(!response.ok)throw Error(await response.text());
const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',text='',deltas=0,first=0,complete=false,mode='',links=[];
while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});let index;while((index=buffer.indexOf('\n\n'))!==-1){const raw=buffer.slice(0,index);buffer=buffer.slice(index+2);const data=raw.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');if(!data)continue;const event=JSON.parse(data);if(event.type==='meta')mode=event.mode;if(event.type==='delta'){deltas++;text+=event.text;if(!first)first=Date.now()-started;}if(event.type==='done'){complete=true;links=event.links;}if(event.type==='error')throw Error('stream interrupted');}}
if(mode!=='gemini'||!complete||!text.trim())throw Error('No complete Gemini stream');
console.log(JSON.stringify({mode,deltas,firstTextMs:first,totalMs:Date.now()-started,characters:text.length,text,complete,links}));
for(const link of links){if(link.href.startsWith('/product-assets/')){const r=await fetch(base+link.href,{method:'HEAD'});console.log('catalog',r.status,r.headers.get('Content-Type'));if(!r.ok||!r.headers.get('Content-Type')?.includes('pdf'))throw Error('Catalog link failed');}}
