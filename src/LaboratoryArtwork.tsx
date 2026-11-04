import type {Item} from './domain';
export function LaboratoryArtwork({product:p}:{product:Item}){
 const cat=p.categoryId||'collection';
 const palette:Record<string,string>={collection:'#c85b61',tubes:'#6973b1',tips:'#2989a1',cups:'#3c9a98',culture:'#559675',microscopy:'#5387a4',pathology:'#a475ab',coldchain:'#4e9fc2'};
 const color=palette[cat]||'#4e9390';
 const clear={fill:'#e3f2f5',fillOpacity:.7,stroke:color,strokeWidth:2};
 const tube=(x:number,y:number,cap:string,small=false)=><g transform={`translate(${x} ${y}) scale(${small?.7:1})`}><path d="M0 0h34v90a17 17 0 0 1-34 0Z" {...clear}/><rect x="-3" y="-12" width="40" height="18" rx="4" fill={cap}/><path d="M7 22v58" stroke="white" strokeWidth="4"/><path d="M22 25h8m-8 15h8m-8 15h8" stroke={color} opacity=".4"/></g>;
 const jar=(x:number,y:number,cap:string,scale=1)=><g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M0 12h64l7 88q0 12-12 12H5q-12 0-12-12Z" {...clear}/><rect x="-8" y="0" width="80" height="22" rx="6" fill={cap}/><rect x="7" y="40" width="45" height="38" rx="4" fill="white" fillOpacity=".8"/><path d="M15 52h26m-26 9h20" stroke={color} opacity=".3"/></g>;
 const cultureTube=/لوله|براث|Broth|TSB|TSI|BHI|KIA|استوارت|OF|اسکولین|MR|پپتون|کری بلر/.test(p.name);
 return <svg className="laboratory-artwork" viewBox="0 0 340 190" role="img" aria-label={'تصویر گرافیکی '+p.name}><title>{p.name}</title><rect width="340" height="190" rx="12" fill="#f1f7f6"/><circle cx="270" cy="45" r="75" fill={color} opacity=".07"/><ellipse cx="170" cy="162" rx="108" ry="10" fill={color} opacity=".10"/>
 {cat==='collection'&&<>{jar(175,35,/غیر استریل/.test(p.name)?'#e3b43b':color)}{jar(78,59,'#e0b442',.8)}</>}
 {cat==='tubes'&&<>{tube(98,38,color)}{tube(155,48,'#b45265')}{tube(210,68,'#5b9e91',true)}</>}
 {cat==='tips'&&<g><path d="M65 107 111 85h150l-28 22v46H65Z" {...clear}/><path d="M65 107h168v18H65Z" fill={color} opacity=".35"/>{[0,1,2,3,4,5].map(n=><path key={n} d={`M${85+n*25} 54h16l-5 51h-6Z`} fill={p.name.includes('زرد')?'#e4bf3d':'#6ba7c2'} stroke={color}/>)}</g>}
 {cat==='cups'&&<>{[0,1,2].map(n=><g key={n} transform={`translate(${78+n*65} ${55+n*10})`}><path d="M0 0h48l-6 74H6Z" {...clear}/><ellipse cx="24" cy="0" rx="24" ry="8" {...clear}/><path d="M12 12v45" stroke="white" strokeWidth="4"/></g>)}</>}
 {cat==='culture'&&(cultureTube?<>{tube(112,42,color)}{tube(180,50,'#bc5861')}<path d="M115 120h28v15q-14 15-28 0Zm68 0h28v15q-14 15-28 0Z" fill="#b66a4b" opacity=".5"/></>:<>{[0,1].map(n=><g key={n} transform={`translate(${78+n*75} ${77-n*24})`}><path d="M0 0v26c0 36 140 36 140 0V0" {...clear}/><ellipse cx="70" cy="4" rx="70" ry="28" fill={n?'#c27666':'#d7ba6a'} opacity=".85" stroke={color} strokeWidth="2"/><ellipse cx="70" cy="0" rx="70" ry="28" fill="white" opacity=".12"/>{/خانه|قسمت/.test(p.name)&&<path d="M70-28v56M0 0h140" stroke="white" strokeWidth="2"/>}</g>)}</>)}
 {cat==='microscopy'&&<g transform="translate(74 48)"><path d="m0 44 130-25 53 51-131 26Z" {...clear}/><path d="m0 35 130-25 53 51-131 26Z" {...clear}/><path d="m0 26 130-25 53 51-131 26Z" {...clear}/><path d="m0 26 25-5 53 51-26 5Z" fill="white"/><path d="m116 10 44-8 28 29-44 8Z" fill="#d7f1f3" stroke={color}/></g>}
 {cat==='pathology'&&<g><path d="m70 85 128-19 49 36-128 20Z" fill="#cae5df" stroke={color}/><path d="M70 85v32l49 34 128-19v-30l-128 20Z" fill="#aed4cc" stroke={color}/>{[0,1,2,3,4].map(n=><path key={n} d={`m${96+n*21} ${84-n*3} 29 20`} stroke={color} strokeWidth="4" opacity=".6"/>)}{jar(240,40,color,.55)}<path d="m65 53 115-30" stroke={color} strokeWidth="4"/></g>}
 {cat==='coldchain'&&<g transform="translate(83 38)"><rect x="0" y="20" width="115" height="100" rx="18" fill="#89c8dd" stroke={color} strokeWidth="2"/><rect x="58" y="0" width="115" height="100" rx="18" fill="#b5e1ec" stroke={color} strokeWidth="2"/><path d="M115 25v45M93 48h44m-38-16 32 32m0-32-32 32" stroke="white" strokeWidth="4"/></g>}
 </svg>
}
