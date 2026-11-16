export type ImportKind = "customers" | "products" | "inventory";
export const importColumns: Record<ImportKind, string[]> = {
  customers: ["نام مرکز", "مسئول مرکز", "موبایل", "نشانی", "فعال"],
  products: [
    "نام فارسی",
    "نام انگلیسی",
    "برند",
    "کد کاتالوگی",
    "قیمت پایه (تومان)",
    "نشانی منبع سازنده",
  ],
  inventory: ["کد کاتالوگی", "برند", "تغییر موجودی"],
};
