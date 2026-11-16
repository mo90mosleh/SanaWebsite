import {build} from 'esbuild';
import {resolve} from 'node:path';
import {dirname,extname} from 'node:path';
import {existsSync,readFileSync} from 'node:fs';
const root=process.cwd();
await build({absWorkingDir:root,tsconfigRaw:{compilerOptions:{target:'ES2022'}},entryPoints:['worker/sanayar.mjs'],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:resolve('.sanayar-build/worker.mjs'),minify:true,plugins:[{name:'local-source',setup(b){b.onResolve({filter:/.*/},args=>{let path=resolve(args.importer?dirname(args.importer):root,args.path);for(const suffix of ['','.ts','.mjs','.json'])if(existsSync(path+suffix))return {path:path+suffix,namespace:'local-source'};throw Error('Missing source: '+args.path)});b.onLoad({filter:/.*/,namespace:'local-source'},args=>({contents:readFileSync(args.path,'utf8'),loader:extname(args.path)==='.json'?'json':extname(args.path)==='.ts'?'ts':'js'}))}}]});
