import type {Item} from './domain';
export const categories = [
{id:'poct',label:'کیت‌های POCT',products:poctIds()},
{id:'collection',label:'ظروف نمونه‌گیری',products:[]},
{id:'tubes',label:'لوله و میکروتیوپ',products:[]},
{id:'tips',label:'سرسمپلر',products:[]},
{id:'cups',label:'کاپ بیوشیمی',products:[]},
{id:'culture',label:'محیط کشت و پتری‌دیش',products:[]},
{id:'microscopy',label:'لام و لامل',products:[]},
{id:'pathology',label:'سیتولوژی و پاتولوژی',products:[]},
{id:'coldchain',label:'نگهداری و حمل',products:[]},
{id:'other',label:'سایر مصرفی‌ها',products:[]},
];
function poctIds(){return ["vitd", "crp", "ifob", "afp", "ca125", "ca199", "ca153", "hpylori", "b12", "ferritin", "testosterone", "hba1c", "cortisol", "bhcg", "estradiol", "amh", "ft4", "ft3", "ctni", "myo", "bnp", "ntprobnp", "ddimer", "ckmb", "hscrp", "cysc", "rf", "calprotectin", "ngal", "prl", "prog", "lh", "fsh", "tsh", "t4", "t3"];}
export const categoryFor=(p:Item|string)=>{
 const id=typeof p==='string'?p:p.id;
 return categories.find(c=>c.id===(typeof p==='string'?undefined:p.categoryId)||c.products.includes(id)) || categories[categories.length-1];
};
export const poctGroups=[
{id:'inflammation',label:'التهاب',products:['crp','hscrp']},
{id:'diabetes',label:'دیابت',products:['hba1c']},
{id:'thyroid',label:'تیروئید',products:['tsh','t3','t4','ft3','ft4']},
{id:'cardiac',label:'قلب و انعقاد',products:['ctni','myo','bnp','ntprobnp','ckmb','ddimer']},
{id:'vitamins',label:'ویتامین و کم‌خونی',products:['vitd','b12','ferritin']},
{id:'fertility',label:'هورمون و باروری',products:['testosterone','estradiol','bhcg','amh','prl','prog','lh','fsh','cortisol']},
{id:'renal',label:'کلیه',products:['cysc','ngal']},
{id:'tumor',label:'نشانگر توموری',products:['afp','ca125','ca199','ca153']},
{id:'gastro',label:'گوارش',products:['ifob','hpylori','calprotectin']},
{id:'rheumatology',label:'روماتولوژی',products:['rf']},
];
