# Cloudflare Pages — آزمایش انتشار سانا

هدف: لینک پیش‌نمایش مستقل از GitHub Pages، بدون تغییر سایت فعال.

## تنظیمات این مخزن

- Repository: `mo90mosleh/SanaWebsite`
- Production branch: `feat/sana-demo` (شاخهٔ پیش‌فرض فعلی)
- Framework: `React (Vite)` / `Vite`
- Root directory: `/`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: `24.19.0`، مطابق `.nvmrc`؛ در صورت نیاز `NODE_VERSION=24.19.0`
- نام پیشنهادی پروژه Cloudflare: `sana-website-preview` (در صورت آزاد بودن)

**مهم:** `npm run build:pages` فقط مخصوص GitHub Pages است و با `--base=/SanaWebsite/` می‌سازد. Cloudflare با `npm run build` برای مسیر ریشه کار می‌کند. پروژه hash routing دارد و به rewrite اضافه نیاز ندارد.

## اتصال و انتشار

1. به https://dash.cloudflare.com/ بروید و **Workers & Pages > Create application > Pages > Connect to Git** را انتخاب کنید.
2. برنامهٔ رسمی GitHub با نام **Cloudflare Workers & Pages** را تأیید کنید. دسترسی آن را ترجیحاً روی **Only select repositories > SanaWebsite** محدود کنید.
3. مخزن `mo90mosleh/SanaWebsite` را انتخاب کنید و تنظیمات بالا را ثبت کنید.
4. **Save and Deploy** را بزنید؛ فقط بعد از **Success**، نشانی واقعی `*.pages.dev` را از Cloudflare Deployments بردارید.
5. باز شدن صفحهٔ اصلی و مسیر `/#/supplies/ortanes`، تصاویر، فونت‌های فارسی و نمای موبایل را بررسی کنید. برای هر PR یا شاخه نیز Cloudflare می‌تواند preview URL جداگانه بسازد.

## موارد احتیاط

- GitHub Pages، شاخهٔ `gh-pages`، DNS و دامنهٔ فعلی را تغییر ندهید.
- دسترسی واقعی از اینترنت ایران **بدون VPN** را با اینترنت موبایل و ثابت تست کنید. هیچ تضمینی وجود ندارد که `pages.dev` یا IPهای Cloudflare توسط ISP مسدود نباشند.
- localStorage و sessionStorage بین دو دامنه منتقل نمی‌شوند؛ پرداخت، پیامک و حساب‌های موجود در نسخهٔ دمو واقعی نیستند. اطلاعات واقعی مشتری وارد نکنید.
- پروژهٔ Cloudflare باید توسط شخص دارای دسترسی به حساب Cloudflare ساخته شود؛ صرف افزودن این سند، **انتشار** محسوب نمی‌شود.

منابع رسمی:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
