import {test,expect} from '@playwright/test';
test('catalog sidebar is compact and search suggestions open the selected result',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/#/supplies/ortanes');
 const sidebar=await page.locator('.catalog-sidebar').boundingBox(),grid=await page.locator('.catalog-grid').boundingBox();
 expect(grid!.y).toBeLessThan(450);expect(sidebar!.x).toBeGreaterThan(grid!.x);
 await expect(page.locator('.catalog-demo-note')).toHaveCount(0);
 await expect(page.locator('.catalog-grid')).not.toContainText('قیمت نمایشی');
 const search=page.getByRole('combobox',{name:'جست‌وجو در سایت'});await search.fill('BHA3000');await search.press('ArrowDown');await search.press('Enter');
 await expect(page).toHaveURL(/devices\/bha3000/);
 await page.getByRole('combobox',{name:'جست‌وجو در سایت'}).fill('سرسمپلر');await page.getByRole('option').first().click();
 await expect(page.locator('.catalog-grid article')).toHaveCount(1);
});
test('CBC comparison supports three devices and POCT remains in its family',async({page})=>{
 await page.goto('/#/devices/bha3000');await page.getByRole('button',{name:'مقایسه دستگاه‌های CBC'}).click();
 await page.getByRole('checkbox',{name:'GETEIN BHA5000'}).check();await page.getByRole('checkbox',{name:'GETEIN BHA5100'}).check();
 await expect(page.locator('.device-compare thead th')).toHaveCount(4);
 await expect(page.locator('.device-compare')).not.toContainText('FS-114');await page.keyboard.press('Escape');
 await expect(page.locator('.device-compare')).not.toBeVisible();
 await page.goto('/#/devices/fs-114');await page.getByRole('button',{name:'مقایسه دستگاه‌های POCT'}).click();await page.getByRole('checkbox',{name:'Finecare FS-205'}).check();await expect(page.locator('.device-compare thead th')).toHaveCount(3);await expect(page.locator('.device-compare')).not.toContainText('BHA3000');
});
test('signed-in supplies links use customer panel and cart toast offers checkout with online only',async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('sana-role','customer');sessionStorage.setItem('sana-customer','c1')});
 await page.goto('/#/supplies/ortanes');await expect(page).toHaveURL(/customer\/supplies/);
 await expect(page.locator('.panel-header')).toBeVisible();await expect(page.locator('.supply')).not.toContainText('قابل سفارش آزمایشی');
 await expect(page.locator('.product-evidence')).toHaveCount(0);
 await page.locator('.supply').first().getByRole('button',{name:/افزودن/}).click();
 await page.getByRole('link',{name:'نهایی کردن سبد خرید'}).click();
 await expect(page.getByRole('heading',{name:'سبد خرید و تسویه'})).toBeVisible();
 await expect(page.getByText('پرداخت آنلاین',{exact:true})).toBeVisible();
 await expect(page.getByText('چک سه‌ماهه؛ نیازمند تأیید فروش')).toHaveCount(0);
});
test('mobile catalog stays within viewport and callouts stop after chat opens',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/#/supplies/ortanes');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await expect(page.locator('.sanayar-callout')).toBeVisible({timeout:12000});
 await page.locator('.sanayar-callout-text').click();await expect(page.locator('#sanayar-panel')).toBeVisible();
 await expect(page.locator('.sanayar-callout')).toHaveCount(0);await page.getByRole('button',{name:'بستن سانایار',exact:true}).click();
 await page.reload();await page.waitForTimeout(7500);await expect(page.locator('.sanayar-callout')).toHaveCount(0);
});
