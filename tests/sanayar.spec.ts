import {test,expect} from '@playwright/test';
for(const width of [390,1440])test(`Sanayar chat, navigation and keyboard at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');
 const launch=page.getByRole('button',{name:'گفت‌وگو با سانایار'});await launch.click();
 const dialog=page.getByRole('dialog',{name:'سانایار',exact:true});await expect(dialog).toBeVisible();
 const field=page.getByRole('textbox',{name:'پرسش از سانایار'});await expect(field).toBeFocused();
 await field.fill('BHA3000');await field.press('Enter');await expect(dialog.getByRole('link',{name:'کاتالوگ BHA3000'})).toBeVisible();
 await field.fill('قیمت BHA3000');await field.press('Enter');await expect(dialog).toContainText('استعلام قیمت');
 await page.getByRole('button',{name:'گفت‌وگوی جدید'}).click();await expect(dialog).not.toContainText('استعلام قیمت');
 const box=await dialog.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);
 await page.screenshot({path:`test-results/sanayar-${width}.png`});
 await field.press('Escape');await expect(dialog).toBeHidden();await expect(launch).toBeFocused();
 await page.goto('/#/supplies/ortanes');await launch.click();await field.fill('سرسمپلر');await field.press('Enter');await expect(dialog).toContainText('سرسمپلر');
});
