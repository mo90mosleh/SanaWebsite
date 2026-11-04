import type { Item, State } from './domain';
export const CATALOG_REVISION = 1;
export const poctList = [["vitd", "ویتامین D", "Vitamin D"], ["crp", "پروتئین واکنشی C", "CRP"], ["ifob", "خون مخفی مدفوع", "FOB"], ["afp", "آلفا فتوپروتئین", "AFP"], ["ca125", "نشانگر توموری CA125", "CA125"], ["ca199", "نشانگر توموری CA19-9", "CA19-9"], ["ca153", "نشانگر توموری CA15-3", "CA15-3"], ["hpylori", "آنتی‌ژن هلیکوباکتر پیلوری", "H. pylori"], ["b12", "ویتامین B12", "Vitamin B12"], ["ferritin", "فریتین", "Ferritin"], ["testosterone", "تستوسترون", "Testosterone"], ["hba1c", "هموگلوبین گلیکوزیله", "HbA1c"], ["cortisol", "کورتیزول", "Cortisol"], ["bhcg", "بتا اچ سی جی", "β-HCG"], ["estradiol", "استرادیول", "Estradiol"], ["amh", "هورمون آنتی مولرین", "AMH"], ["ft4", "تی چهار آزاد", "fT4"], ["ft3", "تی سه آزاد", "fT3"], ["ctni", "تروپونین آی", "cTnI"], ["myo", "میوگلوبین", "Myoglobin"], ["bnp", "نشانگر بی ان پی", "BNP"], ["ntprobnp", "ان تی پرو بی ان پی", "NT-proBNP"], ["ddimer", "دی دایمر", "D-Dimer"], ["ckmb", "سی کی ام بی", "CK-MB"], ["hscrp", "سی آر پی با حساسیت بالا", "hsCRP"], ["cysc", "سیستاتین سی", "CysC"], ["rf", "فاکتور روماتوئید", "RF"], ["calprotectin", "کالپروتکتین", "Calprotectin"], ["ngal", "نشانگر ان گال", "NGAL"], ["prl", "پرولاکتین", "Prolactin"], ["prog", "پروژسترون", "Progesterone"], ["lh", "هورمون ال اچ", "LH"], ["fsh", "هورمون اف اس اچ", "FSH"], ["tsh", "هورمون محرک تیروئید", "TSH"], ["t4", "هورمون تی چهار", "T4"], ["t3", "هورمون تی سه", "T3"]] as const;
export const ortanesRows = [
  {
    "name": "یورین باتل ۶۰ استریل (درب قرمز–نارنجی)",
    "category": "collection",
    "pack": "800 عدد در کارتن",
    "sourceRow": 1,
    "cartonCount": 800
  },
  {
    "name": "یورین باتل ۶۰ غیر استریل (درب زرد–سبز)",
    "category": "collection",
    "pack": "1100 عدد در کارتن",
    "sourceRow": 2,
    "cartonCount": 1100
  },
  {
    "name": "یورین باتل ۸۰ غیر استریل (درب زرد–سبز)",
    "category": "collection",
    "pack": "800 عدد در کارتن",
    "sourceRow": 3,
    "cartonCount": 800
  },
  {
    "name": "یورین باتل ۸۰ استریل (درب قرمز–نارنجی)",
    "category": "collection",
    "pack": "600 عدد در کارتن",
    "sourceRow": 4,
    "cartonCount": 600
  },
  {
    "name": "قوطی استول",
    "category": "collection",
    "pack": "1500 عدد در کارتن",
    "sourceRow": 5,
    "cartonCount": 1500
  },
  {
    "name": "ظرف ادرار ۲۴ ساعته",
    "category": "collection",
    "pack": "35 عدد در کارتن",
    "sourceRow": 6,
    "cartonCount": 35
  },
  {
    "name": "ظرف ادرار ۲۴ ساعته ضخیم",
    "category": "collection",
    "pack": "35 عدد در کارتن",
    "sourceRow": 7,
    "cartonCount": 35
  },
  {
    "name": "لوله آزمایش ۱۲×۷۵ شفاف",
    "category": "tubes",
    "pack": "6000 عدد در کارتن",
    "sourceRow": 8,
    "cartonCount": 6000
  },
  {
    "name": "لوله آزمایش ۱۳×۷۵ شفاف",
    "category": "tubes",
    "pack": "5000 عدد در کارتن",
    "sourceRow": 9,
    "cartonCount": 5000
  },
  {
    "name": "لوله آزمایش ۱۲×۷۵ مشکی",
    "category": "tubes",
    "pack": "6000 عدد در کارتن",
    "sourceRow": 10,
    "cartonCount": 6000
  },
  {
    "name": "لوله آزمایش ۱۶×۱۰۰ شفاف",
    "category": "tubes",
    "pack": "2000 عدد در کارتن",
    "sourceRow": 11,
    "cartonCount": 2000
  },
  {
    "name": "لوله آزمایش ۱۲×۱۰۰ شفاف",
    "category": "tubes",
    "pack": "3500 عدد در کارتن",
    "sourceRow": 12,
    "cartonCount": 3500
  },
  {
    "name": "لوله آزمایش ۱۳×۱۰۰ شفاف",
    "category": "tubes",
    "pack": "3500 عدد در کارتن",
    "sourceRow": 13,
    "cartonCount": 3500
  },
  {
    "name": "لوله خونگیری CBC غیر وکیوم سبز",
    "category": "tubes",
    "pack": "3000 عدد در کارتن",
    "sourceRow": 14,
    "cartonCount": 3000
  },
  {
    "name": "لوله آزمایش ۱۲×۷۵ مات",
    "category": "tubes",
    "pack": "6000 عدد در کارتن",
    "sourceRow": 15,
    "cartonCount": 6000
  },
  {
    "name": "لوله آزمایش ۱۳×۷۵ مات",
    "category": "tubes",
    "pack": "5000 عدد در کارتن",
    "sourceRow": 16,
    "cartonCount": 5000
  },
  {
    "name": "لوله آزمایش ۱۶×۱۰۰ مات",
    "category": "tubes",
    "pack": "2000 عدد در کارتن",
    "sourceRow": 17,
    "cartonCount": 2000
  },
  {
    "name": "لوله آزمایش ۱۲×۱۰۰ مات",
    "category": "tubes",
    "pack": "3500 عدد در کارتن",
    "sourceRow": 18,
    "cartonCount": 3500
  },
  {
    "name": "لوله آزمایش ۱۳×۱۰۰ مات",
    "category": "tubes",
    "pack": null,
    "sourceRow": 19,
    "cartonCount": null
  },
  {
    "name": "سرسمپلر زرد",
    "category": "tips",
    "pack": "۴۰ بسته در کارتن",
    "sourceRow": 20
  },
  {
    "name": "سرسمپلر آبی شفاف نچرال",
    "category": "tips",
    "pack": "۲۵ بسته در کارتن",
    "sourceRow": 21
  },
  {
    "name": "سرسمپلر آبی",
    "category": "tips",
    "pack": "۲۵ بسته در کارتن",
    "sourceRow": 22
  },
  {
    "name": "سرسمپلر کریستالی (۰٫۱–۱۰)",
    "category": "tips",
    "pack": "۴۰ بسته در کارتن",
    "sourceRow": 23
  },
  {
    "name": "کاپ هیتاچی ماکرو",
    "category": "cups",
    "pack": "۸۰۰۰ عدد در کارتن",
    "sourceRow": 24
  },
  {
    "name": "کاپ هیتاچی میکرو",
    "category": "cups",
    "pack": null,
    "sourceRow": 25
  },
  {
    "name": "کاپ BT",
    "category": "cups",
    "pack": "۱۴۰۰۰ عدد در کارتن",
    "sourceRow": 26
  },
  {
    "name": "کاپ سلکترا",
    "category": "cups",
    "pack": "۱۶۰۰۰ عدد در کارتن",
    "sourceRow": 27
  },
  {
    "name": "کاپ سلکترا جدید",
    "category": "cups",
    "pack": null,
    "sourceRow": 28
  },
  {
    "name": "کاپ دوجداره دم زنبوری",
    "category": "cups",
    "pack": null,
    "sourceRow": 29
  },
  {
    "name": "کاپ RA1000 چهارپر",
    "category": "cups",
    "pack": null,
    "sourceRow": 30
  },
  {
    "name": "کاپ آلفا کلاسیک (۶)",
    "category": "cups",
    "pack": null,
    "sourceRow": 31
  },
  {
    "name": "پتری دیش ۶ سانت",
    "category": "culture",
    "pack": "۱۴۸۴ عدد در کارتن",
    "sourceRow": 32
  },
  {
    "name": "پتری دیش ۸ سانت",
    "category": "culture",
    "pack": "۷۷۰ عدد در کارتن",
    "sourceRow": 33
  },
  {
    "name": "پتری دیش ۸ سانت سه‌خانه",
    "category": "culture",
    "pack": "۷۷۰ عدد در کارتن",
    "sourceRow": 34
  },
  {
    "name": "پتری دیش ۸ سانت دوخانه",
    "category": "culture",
    "pack": "۷۷۰ عدد در کارتن",
    "sourceRow": 35
  },
  {
    "name": "پتری دیش ۱۰ سانت",
    "category": "culture",
    "pack": "۵۰۰ عدد در کارتن",
    "sourceRow": 36
  },
  {
    "name": "لیکوئید بیس با براش",
    "category": "pathology",
    "pack": "۲۴ عدد در بسته",
    "sourceRow": 37
  },
  {
    "name": "لیکوئید بیس",
    "category": "pathology",
    "pack": null,
    "sourceRow": 38
  },
  {
    "name": "براش",
    "category": "pathology",
    "pack": null,
    "sourceRow": 39
  },
  {
    "name": "لام وارداتی 7102",
    "category": "microscopy",
    "pack": "۷۲ عدد در بسته",
    "sourceRow": 40
  },
  {
    "name": "لام HUIDA 7105",
    "category": "microscopy",
    "pack": "۷۲ عدد در بسته",
    "sourceRow": 41
  },
  {
    "name": "لامل وارداتی ۱۸×۱۸",
    "category": "microscopy",
    "pack": "۵۰ بسته در کارتن",
    "sourceRow": 42
  },
  {
    "name": "لامل HUIDA ۲۴×۵۰",
    "category": "microscopy",
    "pack": "۴۰ بسته در کارتن",
    "sourceRow": 43
  },
  {
    "name": "محیط کشت خون اطفال ۳۰",
    "category": "culture",
    "pack": "۲۴ عدد در کارتن",
    "sourceRow": 44
  },
  {
    "name": "محیط کشت خون بزرگسال ۱۰۰",
    "category": "culture",
    "pack": "۲۴ عدد در کارتن",
    "sourceRow": 45
  },
  {
    "name": "محیط کشت خون بزرگسال ۵۰",
    "category": "culture",
    "pack": "۲۴ عدد در کارتن",
    "sourceRow": 46
  },
  {
    "name": "محیط کشت خون بزرگسال ۳۰",
    "category": "culture",
    "pack": "۲۴ عدد در کارتن",
    "sourceRow": 47
  },
  {
    "name": "محیط کشت خون نوزاد ۲۰",
    "category": "culture",
    "pack": "۲۴ عدد در کارتن",
    "sourceRow": 48
  },
  {
    "name": "محیط کشت خون دیفازیک ۱۰۰",
    "category": "culture",
    "pack": "۲۴ عدد در کارتن",
    "sourceRow": 49
  },
  {
    "name": "محیط کشت خون دیفازیک ۵۰",
    "category": "culture",
    "pack": "۲۴ عدد در کارتن",
    "sourceRow": 50
  },
  {
    "name": "محیط کشت خون دیفازیک نوزاد ۲۰",
    "category": "culture",
    "pack": "۲۴ عدد در کارتن",
    "sourceRow": 51
  },
  {
    "name": "محیط کشت خون دیفازیک بزرگسال ۳۰",
    "category": "culture",
    "pack": "۲۴ عدد در کارتن",
    "sourceRow": 52
  },
  {
    "name": "لوله لخته غیر وکیوم 6ML",
    "category": "tubes",
    "pack": "۱۰۰ عدد در بسته",
    "sourceRow": 53
  },
  {
    "name": "لوله ژل‌دار غیر وکیوم ۱۳×۱۰۰",
    "category": "tubes",
    "pack": "۱۰۰ عدد در بسته",
    "sourceRow": 54
  },
  {
    "name": "درب لوله گاما قارچی",
    "category": "tubes",
    "pack": "۴۰ بسته در کارتن",
    "sourceRow": 55
  },
  {
    "name": "درب لوله ۱۶×۱۰۰ قارچی",
    "category": "tubes",
    "pack": "۴۰ بسته در کارتن",
    "sourceRow": 56
  },
  {
    "name": "درب لوله دوپله ۱۲×۷۵",
    "category": "tubes",
    "pack": "۴۰ بسته در کارتن",
    "sourceRow": 57
  },
  {
    "name": "درب لوله دوپله ۱۳×۷۵",
    "category": "tubes",
    "pack": "۴۰ بسته در کارتن",
    "sourceRow": 58
  },
  {
    "name": "درب لوله ۱۲×۷۵ طرح وکیوم",
    "category": "tubes",
    "pack": "۱۲۰۰۰ عدد در کارتن",
    "sourceRow": 59
  },
  {
    "name": "میکروتیوپ ۰٫۲",
    "category": "tubes",
    "pack": "۵۲ بسته در کارتن",
    "sourceRow": 60
  },
  {
    "name": "میکروتیوپ ۰٫۵",
    "category": "tubes",
    "pack": "۵۲ بسته در کارتن",
    "sourceRow": 61
  },
  {
    "name": "میکروتیوپ ۱٫۵",
    "category": "tubes",
    "pack": "۲۴ بسته در کارتن",
    "sourceRow": 62
  },
  {
    "name": "میکروتیوپ ۲",
    "category": "tubes",
    "pack": "۱۸ بسته در کارتن",
    "sourceRow": 63
  },
  {
    "name": "کرایوتیوپ ۱٫۸–۵ ml",
    "category": "tubes",
    "pack": null,
    "sourceRow": 64
  },
  {
    "name": "اپلیکاتور",
    "category": "pathology",
    "pack": null,
    "sourceRow": 65
  },
  {
    "name": "کاست تک‌تستی",
    "category": "pathology",
    "pack": null,
    "sourceRow": 66
  },
  {
    "name": "کاست سه‌تستی",
    "category": "pathology",
    "pack": null,
    "sourceRow": 67
  },
  {
    "name": "لوله فالکون ۱۰",
    "category": "tubes",
    "pack": null,
    "sourceRow": 68
  },
  {
    "name": "لوله فالکون ۱۵",
    "category": "tubes",
    "pack": null,
    "sourceRow": 69
  },
  {
    "name": "لوله فالکون ۵۰ معمولی",
    "category": "tubes",
    "pack": null,
    "sourceRow": 70
  },
  {
    "name": "لوله فالکون ۵۰ پایه‌دار",
    "category": "tubes",
    "pack": null,
    "sourceRow": 71
  },
  {
    "name": "تیشوتک درب لولایی",
    "category": "pathology",
    "pack": null,
    "sourceRow": 72
  },
  {
    "name": "تیشوتک درب به‌هم‌پیوسته",
    "category": "pathology",
    "pack": null,
    "sourceRow": 73
  },
  {
    "name": "تیشوتک بدون درب",
    "category": "pathology",
    "pack": null,
    "sourceRow": 74
  },
  {
    "name": "یخ ژله‌ای",
    "category": "coldchain",
    "pack": null,
    "sourceRow": 75
  },
  {
    "name": "محیط کشت مکانکی آگار cm 8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 1,
    "rawPrice": "54000"
  },
  {
    "name": "محیط کشت OFبا پایه گلوکز",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 2,
    "rawPrice": "43300"
  },
  {
    "name": "محیط کشت TSI",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 3,
    "rawPrice": "29500"
  },
  {
    "name": "محیط کشت مکانکی آگار ( cm 10چهار خانه)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 4,
    "rawPrice": "95000"
  },
  {
    "name": "محیط کشت OFبا پایه الکتوز",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 5,
    "rawPrice": "70000"
  },
  {
    "name": "محیط کشت انتقالی استوارت",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 6,
    "rawPrice": "127000"
  },
  {
    "name": "محیط کشت سابارو دکستروز آگار cm6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 7,
    "rawPrice": "134000"
  },
  {
    "name": "محیط کشت OFبا پایه مالتوز",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 8,
    "rawPrice": "66300"
  },
  {
    "name": "محیط کشت انتقالی کری بلر همراه با سوآپ (التور)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 9,
    "rawPrice": "49000"
  },
  {
    "name": "محیط کشت سوربیتول مکانکی cm 6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 10,
    "rawPrice": "100000"
  },
  {
    "name": "محیط کشت cm6 SS Agar",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 11,
    "rawPrice": "38700"
  },
  {
    "name": "محیط کشت دو خانه بالد EMB",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 12,
    "rawPrice": "50200"
  },
  {
    "name": "محیط کشت دو قسمتی سوربیتولXLDcm 8 /",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 13,
    "rawPrice": "75000"
  },
  {
    "name": "محیط کشت SS cm8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 14,
    "rawPrice": "46700"
  },
  {
    "name": "محیط کشت SIM",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 15,
    "rawPrice": "43700"
  },
  {
    "name": "محیط کشت سیمون سیترات (لوله )cc 10",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 16,
    "rawPrice": "42300"
  },
  {
    "name": "محیط کشت TCBS cm 8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 17,
    "rawPrice": "45600"
  },
  {
    "name": "محیط کشت نمک 6.5درصد 3×8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 18,
    "rawPrice": "43700"
  },
  {
    "name": "محیط کشت سیمون سیترات (لوله )cm 16",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 19,
    "rawPrice": "38000"
  },
  {
    "name": "محیط کشت TSA cm6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 20,
    "rawPrice": "59000"
  },
  {
    "name": "محیط کشت دو قسمتی بایل /نمک 6.5درصد cm 8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 21,
    "rawPrice": "65000"
  },
  {
    "name": "محیط کشت شکلات آگار cm 10",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 22,
    "rawPrice": "79000"
  },
  {
    "name": "محیط کشت TSB",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 23,
    "rawPrice": "65100"
  },
  {
    "name": "محیط کشت سلنیت F",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 24,
    "rawPrice": "46000"
  },
  {
    "name": "محیط کشت شکلات آگار ( cm 10چهار خانه)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 25,
    "rawPrice": "95000"
  },
  {
    "name": "محیط کشت XLDآگار cm 6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 26,
    "rawPrice": "46000"
  },
  {
    "name": "محیط کشت سه قسمتی شکلات /مکانکیcm 10 B.A /",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 27,
    "rawPrice": "76660"
  },
  {
    "name": "محیط کشت شکلات آگار cm 6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 28,
    "rawPrice": "37500"
  },
  {
    "name": "محیط کشت اورنیتین دکربوکسیالز براث",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 29,
    "rawPrice": "65000"
  },
  {
    "name": "محیط کشت سه قسمتی شکلات /مکانکیcm 8 B.A /",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 30,
    "rawPrice": "66600"
  },
  {
    "name": "محیط کشت شکلات آگار سه خانه 8سانت",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 31,
    "rawPrice": "59300"
  },
  {
    "name": "محیط کشت اوره اگار",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 32,
    "rawPrice": "46700"
  },
  {
    "name": "محیط کشت سه قسمتی هکتون /مکانکیcm 8 XLD/",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 33,
    "rawPrice": "58200"
  },
  {
    "name": "محیط کشت شکلات آگار 8سانت",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 34,
    "rawPrice": "52500"
  },
  {
    "name": "محیط کشت آرژنین دهیدروالز براث",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 35,
    "rawPrice": "-"
  },
  {
    "name": "محیط کشت (TSIلوله )16×160",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 36,
    "rawPrice": "-"
  },
  {
    "name": "محیط کشت الکتوز براث به همراه دورهام )cc)10",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 37,
    "rawPrice": "-"
  },
  {
    "name": "محیط کشت آماده VTM",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 38,
    "rawPrice": "54900"
  },
  {
    "name": "محیط کشت 3قسمتی مکانکی XLD/ SS /",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 39,
    "rawPrice": "61700"
  },
  {
    "name": "محیط کشت لایزین آیرون آگار لوله ای LIA",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 40,
    "rawPrice": "42300"
  },
  {
    "name": "محیط کشت آماده مالونات براث",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 41,
    "rawPrice": "44500"
  },
  {
    "name": "محیط کشت 3قسمتی بایل/بالد آگار/نمک",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 42,
    "rawPrice": "65100"
  },
  {
    "name": "محیط کشت لایزین دکربوکسیالز براث",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 43,
    "rawPrice": "46700"
  },
  {
    "name": "محیط کشت ژالتیناز (لوله ای)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 44,
    "rawPrice": "-"
  },
  {
    "name": "محیط کشت 8سانت 3خانه XLD",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 45,
    "rawPrice": "52500"
  },
  {
    "name": "محیط کشت مولر هینتون آگار 10سانت",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 46,
    "rawPrice": "62000"
  },
  {
    "name": "محیط کشت پپتون واتر قلیائی",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 47,
    "rawPrice": "-"
  },
  {
    "name": "محیط کشت سانتی XLD8cm",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 48,
    "rawPrice": "46700"
  },
  {
    "name": "محیط کشت مولر هینتون آگار خوندار ( cm 10مولر بالد)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 49,
    "rawPrice": "79300"
  },
  {
    "name": "محیط کشت بایل اسکولین اگار لوله ای",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 50,
    "rawPrice": "56000"
  },
  {
    "name": "محیط کشت Agar Dnase cm 6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 51,
    "rawPrice": "51300"
  },
  {
    "name": "محیط کشت مولر هینتون براث",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 52,
    "rawPrice": "-"
  },
  {
    "name": "محیط کشت بایل اسکولین آگار cm 6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 53,
    "rawPrice": "45000"
  },
  {
    "name": "محیط کشت ( BHIلوله ای)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 54,
    "rawPrice": "47900"
  },
  {
    "name": "محیط کشت نوترینت آگار cm 8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 55,
    "rawPrice": "46700"
  },
  {
    "name": "محیط کشت بالد آگار (لوله ای)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 56,
    "rawPrice": "55000"
  },
  {
    "name": "محیط کشت + BHIگلیسرول",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 57,
    "rawPrice": "133000"
  },
  {
    "name": "محیط کشت نوترینت براث",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 58,
    "rawPrice": "77800"
  },
  {
    "name": "محیط کشت بالد آگار 6سانتی",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 59,
    "rawPrice": "32900"
  },
  {
    "name": "محیط کشتEMB 8cm",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 60,
    "rawPrice": "44400"
  },
  {
    "name": "محیط کشتDNAse cm 8 Agar",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 61,
    "rawPrice": "51700"
  },
  {
    "name": "محیط کشت بالد آگار 8سانت",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 62,
    "rawPrice": "44400"
  },
  {
    "name": "محیط کشت EMBآگار cm 6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 63,
    "rawPrice": "31800"
  },
  {
    "name": "محیط کشت TSAلوله 10سانت",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 64,
    "rawPrice": "126400"
  },
  {
    "name": "محیط کشت بالد آگار 8سه خانه BA",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 65,
    "rawPrice": "54800"
  },
  {
    "name": "محیط کشت EMBسه خانه 8سانت",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 66,
    "rawPrice": "49000"
  },
  {
    "name": "محیط کشت تایو گلیکوالت (لوله 16×160درپیچ دار)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 67,
    "rawPrice": "255500"
  },
  {
    "name": "محیط کشت بالد آگار cm 10",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 68,
    "rawPrice": "68600"
  },
  {
    "name": "محیط کشت EMB /BAبالد آگار 8سانتی دوخانه",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 69,
    "rawPrice": "50200"
  },
  {
    "name": "محیط کشت سیتریمید آگار cm 8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 70,
    "rawPrice": "-"
  },
  {
    "name": "محیط کشت بالد آگار ( cm 10چهار خانه)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 71,
    "rawPrice": "83500"
  },
  {
    "name": "محیط کشت EMBآگار cm 10",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 72,
    "rawPrice": "65100"
  },
  {
    "name": "محیط کشت لایزین آیرون آگار 10سانت",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 73,
    "rawPrice": "42200"
  },
  {
    "name": "محیط کشت بالد آگار ( cm 10سه خانه)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 74,
    "rawPrice": "64800"
  },
  {
    "name": "محیط کشت EMBآگار ( cm 10چهار خانه)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 75,
    "rawPrice": "96000"
  },
  {
    "name": "محیط کشت GN Brothبراث",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 76,
    "rawPrice": "48000"
  },
  {
    "name": "محیط کشت بالد آگار ( cm 8دو خانه)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 77,
    "rawPrice": "54800"
  },
  {
    "name": "محیط کشت EMBآگار ( cm 10سه خانه)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 78,
    "rawPrice": "59000"
  },
  {
    "name": "محیط کشت مانیتول سالت آگار لوله ای MSA Salt Agar Mannitol",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 79,
    "rawPrice": "80000"
  },
  {
    "name": "محیط کشت بالد آگار سه خانه 8سانت",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 80,
    "rawPrice": "54800"
  },
  {
    "name": "محیط کشت لوله KIA",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 81,
    "rawPrice": "43300"
  },
  {
    "name": "محیط کشت مانیتول سالت آگار MSA cm 6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 82,
    "rawPrice": "63000"
  },
  {
    "name": "محیط کشت چهار قسمتی B.A/EMB cm 10",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 83,
    "rawPrice": "84700"
  },
  {
    "name": "محیط کشت HEA cm 6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 84,
    "rawPrice": "45600"
  },
  {
    "name": "محیط کشت مانیتول سالت آگار MSA cm 8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 85,
    "rawPrice": "68800"
  },
  {
    "name": "محیط کشت دو قسمتی مانیتولDnase cm 8 /",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 86,
    "rawPrice": "75000"
  },
  {
    "name": "محیط کشت HEA cm 8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 87,
    "rawPrice": "49000"
  },
  {
    "name": "محیط کشت فنیل آالنین",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 88,
    "rawPrice": "37900"
  },
  {
    "name": "محیط کشت دو قسمتی مکانکیB.A cm 8/",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 89,
    "rawPrice": "64000"
  },
  {
    "name": "محیط کشت ( HEA cm 8سه خانه)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 90,
    "rawPrice": "53000"
  },
  {
    "name": "محیط کشت فنیل آالنین مالونات براث",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 91,
    "rawPrice": "37900"
  },
  {
    "name": "محیط کشت مکانکی آگار ( cm 8سه خانه)",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 92,
    "rawPrice": "61000"
  },
  {
    "name": "محیط کشت لوله MR -VP",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 93,
    "rawPrice": "43000"
  },
  {
    "name": "انواع سوش",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 94,
    "rawPrice": "440000"
  },
  {
    "name": "محیط کشت مکانکی آگار cm 6",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 95,
    "rawPrice": "52800"
  },
  {
    "name": "محیط کشت MYP cm 6-8",
    "category": "culture",
    "sourcePage": 2,
    "sourceRow": 96,
    "rawPrice": "49000"
  }
];
export const isCatalogItem = (p: Item) => !p.archived;
export function buildCatalog(legacy: Item[]): Item[] {
 const approved = poctList.map(([id, name, english], i) => {
  const old=legacy.find(p=>p.id===id);
  return { ...(old || {id, code:'', models:[], price:3000000, stock:0, verified:false, source:'', tests:null, image:''}), name:'کیت '+name, english, brand:'Wondfo', family:'poct' as const, categoryId:'poct', archived:false, sourceLabel:'فهرست سفارش کیت ارسالی — ردیف '+(i+1), sourceRow:i+1, packLabel:'تعداد تست بسته نیازمند تأیید', unit:'بسته', demoPrice:true };
 });
 const lab=ortanesRows.map((r,i):Item=>({id:'ort-'+String(i+1).padStart(3,'0'),name:r.name, english:'Ortanes', brand:'Ortanes', code:'', models:[],price:100000+(i%7)*25000,stock:24,verified:true,source:'',tests:null,image:'',family:'laboratory', categoryId:r.category, packLabel:r.pack || 'بسته‌بندی نیازمند تأیید',unit:'بسته',demoPrice:true,sourceLabel:'فهرست اورتانیس ۱۴۰۵/۰۸/۰۴ — صفحه '+('sourcePage' in r?r.sourcePage:1)+'، ردیف '+r.sourceRow,sourcePage:'sourcePage' in r?r.sourcePage:1,sourceRow:r.sourceRow}));
 const ordered=[...approved].sort((a,b)=>{const rank=(id:string)=>{const i=legacy.findIndex(p=>p.id===id);return i<0?10000:i};return rank(a.id)-rank(b.id)});
 const activeIds=new Set(ordered.map(p=>p.id));
 return [...ordered,...lab,...legacy.filter(p=>!activeIds.has(p.id)&&p.family!=='laboratory').map(p=>({...p,archived:true}))];
}
export function migrateCatalog(s:State):State {
 if ((s.catalogRevision||0)>=CATALOG_REVISION)return s;
 const fresh=buildCatalog(s.products).filter(p=>!p.archived), ids=new Set(fresh.map(p=>p.id));
 s.products=[...fresh.map(p=>{const old=s.products.find(x=>x.id===p.id);return old?{...old, family:p.family,categoryId:p.categoryId,archived:false,sourceLabel:p.sourceLabel,sourceRow:p.sourceRow,packLabel:p.packLabel,unit:p.unit,demoPrice:true}:p}),...s.products.filter(p=>!ids.has(p.id)).map(p=>({...p,archived:true}))];
 s.catalogRevision=CATALOG_REVISION;
 return s;
}
