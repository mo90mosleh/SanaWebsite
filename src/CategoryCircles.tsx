import { categories } from './kitCategories';
import { categoryImages } from './generatedCategoryImages';
export function CategoryCircles({value,onChange, family='all'}:{value:string;onChange:(id:string)=>void;family?:string}){
 const list=categories.filter(c=>c.id!=='other' && (family==='ortanes'?c.id!=='poct':family==='poct'?c.id==='poct':true));
 return <nav className="category-circles" aria-label="دسته‌بندی تصویری مصرفی‌ها">
  <button className={'category-circle '+(!value?'selected':'')} aria-pressed={!value} onClick={()=>onChange('')}><span className="circle-image all-categories"><span>همه</span></span><strong>همه محصولات</strong></button>
  {list.map(c=><button key={c.id} className={'category-circle '+(value===c.id?'selected':'')} aria-pressed={value===c.id} onClick={()=>onChange(value===c.id?'':c.id)}><span className="circle-image"><img src={categoryImages[c.id]} alt={'تصویر گرافیکی '+c.label} loading="lazy" width="120" height="120" /></span><strong>{c.label}</strong></button>)}
 </nav>
}
