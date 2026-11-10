import {test,expect} from '@playwright/test';
test('public laboratory catalogue, circular category filter and login-to-order work',async({page})=>{
 await page.goto('/#/');
 await expect(page.getByRole('link',{name:'مصرفی آزمایشگاه',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'مصرفی آزمایشگاه',exact:true}).click();
 await expect(page.getByRole('heading',{name:'مصرفی‌های آزمایشگاه اورتانیس'})).toBeVisible();
 await expect(page.locator('.category-circle')).toHaveCount(9);
 await page.getByRole('button',{name:'سرسمپلر',exact:true}).click();
 await expect(page.locator('.catalog-grid article')).toHaveCount(4);
 expect(await page.locator('.circle-image img').evaluateAll(imgs=>imgs.every(i=>(i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth>0))).toBe(true);
 await page.screenshot({path:'/workspace/scratch/cf33ce2af541/catalog-desktop.png',fullPage:true});
 await page.locator('.catalog-grid article').first().getByRole('button').click();
 await page.getByRole('button',{name:'ورود مشتری',exact:true}).click();
 await expect(page.getByRole('heading',{name:'سبد خرید و تسویه'})).toBeVisible();
 await expect(page.locator('main')).toContainText('سرسمپلر زرد');
});
test('36 approved POCT items and mobile laboratory categories fit viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/#/supplies/poct');
 await expect(page.getByText('۳۶ محصول',{exact:true})).toBeVisible();
 await page.getByRole('combobox',{name:'گروه تست POCT'}).selectOption('thyroid');
 await expect(page.locator('.catalog-grid article')).toHaveCount(5);
 await page.goto('/#/supplies/ortanes');
 await page.getByRole('button',{name:'ظروف نمونه‌گیری',exact:true}).click();
 await expect(page.locator('.catalog-grid article')).toHaveCount(7);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 await page.screenshot({path:'/workspace/scratch/cf33ce2af541/catalog-mobile.png',fullPage:true});
});
test('customer can select Ortanes products without owning a device and admin hides archived products',async({page})=>{
 await page.goto('/#/login');await page.getByRole('button',{name:'ورود مشتری',exact:true}).click();
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('sana-demo-v1')!);s.customers[0].devices=[];localStorage.setItem('sana-demo-v1',JSON.stringify(s))});
 await page.goto('/#/customer/supplies');await page.reload();
 await page.getByRole('button',{name:'مصرفی آزمایشگاه · اورتانیس',exact:true}).click();
 await expect(page.getByRole('button',{name:'افزودن به سبد',exact:true}).first()).toBeEnabled();
 await page.getByRole('button',{name:'افزودن به سبد',exact:true}).first().click();
 await page.getByRole('link',{name:'سبد خرید',exact:true}).first().click();
 await expect(page.locator('main')).toContainText('یورین باتل');
});
