import fs from 'node:fs';
import {join,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
const manifest={};
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())walk(path);else{const bytes=fs.readFileSync(path);manifest['/'+relative('dist',path).split(sep).join('/')]={hash:createHash('sha256').update(bytes).digest('hex').slice(0,32),size:bytes.length};}}}
walk('dist');fs.mkdirSync('.sanayar-build',{recursive:true});fs.writeFileSync('.sanayar-build/manifest.json',JSON.stringify(manifest));console.log(JSON.stringify(manifest));
