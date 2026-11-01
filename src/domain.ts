import { deliverDemo } from "./adapters";
export type Item = {
  id: string;
  name: string;
  english: string;
  brand: string;
  code: string;
  models: string[];
  referenceModels?: string[];
  price: number;
  stock: number;
  verified: boolean;
  source: string;
  sourcePage?: number;
  tests: number | null;
  image: string;
};
export type Device = {
  id: string;
  model: string;
  serial: string;
  delivered: string;
  initial: { product: string; qty: number }[];
};
export type Customer = {
  id: string;
  name: string;
  manager: string;
  mobile: string;
  address: string;
  active: boolean;
  devices: Device[];
};
export type Line = {
  product: string;
  name: string;
  qty: number;
  price: number;
};
export type Order = {
  id: string;
  key: string;
  customer: string;
  created: string;
  lines: Line[];
  method: "online" | "credit";
  total: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  payment: "unpaid" | "failed" | "paid";
  shipping: "waiting" | "preparing" | "sent" | "delivered";
  deliveredAt?: string;
  note: string;
};
export type Log = {
  id: string;
  type: string;
  related: string;
  time: string;
  attempts: number;
  status: "pending" | "success" | "failed";
  error: string;
  destination: string;
};
export type Ticket = {
  id: string;
  customer: string;
  title: string;
  messages: { text: string; by: string; time: string }[];
};
export type State = {
  version: 1;
  products: Item[];
  customers: Customer[];
  orders: Order[];
  logs: Log[];
  tickets: Ticket[];
};
export const money = (n: number) =>
  new Intl.NumberFormat("fa-IR").format(n) + " تومان";
export const date = (s: string) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(s));
export const onlinePrice = (n: number) => (n * 4) / 5;
export const uid = () => crypto.randomUUID();
const day = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const kitSource = "/product-assets/wondfo/catalogs/fs-114-catalog.pdf";
export function seed(): State {
  const products: Item[] = [
    ["crp", "کیت پروتئین واکنشی C", "CRP", 2400000],
    ["hba1c", "کیت هموگلوبین گلیکوزیله", "HbA1c", 3200000],
    ["tsh", "کیت هورمون محرک تیروئید", "TSH", 2800000],
    ["pct", "کیت پروکلسی‌تونین", "PCT", 4600000],
    ["vitd", "کیت ویتامین دی", "Vitamin D", 3800000],
  ].map(([id, name, english, price]) => ({
    id: String(id),
    name: String(name),
    english: String(english),
    brand: "Wondfo",
    code: (
      {
        crp: "W201",
        hba1c: "W207",
        tsh: "W220",
        pct: "W210",
        vitd: "W241P0002",
      } as Record<string, string>
    )[String(id)],
    models: ["FS-114", "FS-205"],
    price: Number(price),
    stock: 24,
    verified: true,
    source: kitSource,
    sourcePage: 1,
    tests: null,
    image: "/product-assets/wondfo/images/fs-114.webp",
  }));
  const assays = [
    ["ctni", "کیت تروپونین آی", "cTnI", "W203", 4100000],
    ["ntprobnp", "کیت نشانگر قلبی", "NT-proBNP", "W202", 5100000],
    ["ckmb", "کیت نشانگر قلبی", "CK-MB", "W205", 3500000],
    ["t3", "کیت هورمون تیروئید", "T3", "W231", 2600000],
    ["t4", "کیت هورمون تیروئید", "T4", "W232", 2600000],
    ["ddimer", "کیت دی دایمر", "D-Dimer", "W211", 4200000],
    ["ferritin", "کیت فریتین", "Ferritin", "W269P0001", 3100000],
    ["il6", "کیت اینترلوکین شش", "IL-6", "W251P0001", 4900000],
    ["bhcg", "کیت بتا اچ سی جی", "β-HCG", "W225", 2900000],
    ["psa", "کیت آنتی‌ژن اختصاصی پروستات", "PSA", "W209", 3400000],
  ];
  for (const [id, name, english, code, price] of assays)
    products.push({
      id: String(id),
      name: String(name),
      english: String(english),
      code: String(code),
      brand: "Wondfo",
      models: ["FS-114", "FS-205"],
      price: Number(price),
      stock: 12,
      verified: true,
      source: kitSource,
      sourcePage: 1,
      tests: null,
      image: "/product-assets/wondfo/images/fs-114.webp",
    });
  const introduced = [
    ["insulin", "انسولین", "Insulin", "WW04P0001"],
    ["cpeptide", "سی پپتید", "C-Peptide", "WW03P0001"],
    ["mau", "میکروآلبومین ادرار", "One Step MAU", "W206"],
    ["cysc", "سیستاتین سی", "CysC", "W219"],
    ["ngal", "نشانگر ان گال", "NGAL", "W228"],
    ["b2mg", "بتا دو میکروگلوبولین", "β2-MG", "W229"],
    ["ft3", "تی سه آزاد", "fT3", "W200"],
    ["ft4", "تی چهار آزاد", "fT4", "W259"],
    ["lh", "هورمون ال اچ", "LH", "W244"],
    ["fsh", "هورمون اف اس اچ", "FSH", "W245"],
    ["prog", "پروژسترون", "Prog", "W233"],
    ["prl", "پرولاکتین", "PRL", "W246P0001"],
    ["amh", "هورمون آنتی مولرین", "AMH", "W257P0001"],
    ["myo", "میوگلوبین", "Myo", "W204"],
    ["hfabp", "نشانگر قلبی اچ اف ای بی پی", "H-FABP", "W217"],
    ["bnp", "نشانگر بی ان پی", "BNP", "W222"],
    ["hscrp", "سی آر پی با حساسیت بالا", "hsCRP", "W240"],
    ["st2", "نشانگر اس تی دو", "ST2", "W243"],
    ["s100", "نشانگر اس صد بتا", "S100β", "W239"],
    ["aso", "آنتی استرپتولیزین او", "ASO", "W297P0001"],
    ["rf", "فاکتور روماتوئید", "RF", "W262P0001"],
    ["ccp", "آنتی سی سی پی", "Anti-CCP", "WW01P0001"],
    ["ige", "ایمونوگلوبولین ای تام", "Total IgE", "W298P0001"],
    ["cortisol", "کورتیزول", "Cortisol", "W2500"],
    ["b12", "ویتامین ب دوازده", "Vitamin B12", "WX01P0001"],
    ["ifob", "خون مخفی مدفوع", "iFOB", "W279P0001"],
    ["hpylori", "آنتی‌ژن هلیکوباکتر پیلوری", "H. pylori Ag", "W270P0001"],
    ["calprotectin", "کالپروتکتین", "Calprotectin", "WW05P0001"],
    ["afp", "آلفا فتوپروتئین", "AFP", "W208"],
    ["cea", "نشانگر سی ای ای", "CEA", "W226"],
    ["fpsa", "پی اس ای آزاد", "fPSA", "W230"],
    ["ca125", "نشانگر سی ای ۱۲۵", "CA125", "WW14P0001"],
    ["ca153", "نشانگر سی ای ۱۵-۳", "CA15-3", "WW15P0001"],
    ["ca199", "نشانگر سی ای ۱۹-۹", "CA19-9", "WW16P0001"],
  ];
  for (const [id, name, english, code] of introduced)
    products.push({
      id,
      name,
      english,
      code,
      brand: "Wondfo",
      models: ["FS-114", "FS-205"],
      price: 3000000,
      stock: 0,
      verified: false,
      source: kitSource,
      sourcePage: 1,
      tests: null,
      image: "",
    });
  products.push({
    id: "diluent",
    name: "رقیق‌کننده هماتولوژی",
    english: "Hematology diluent",
    brand: "نیازمند تأیید",
    code: "",
    models: [],
    referenceModels: ["BHA3000"],
    price: 1800000,
    stock: 0,
    verified: false,
    source: "/product-assets/getein/catalogs/GETEIN-BHA3000-Catalog.pdf",
    sourcePage: 4,
    tests: null,
    image: "/product-assets/getein/images/bha3000.webp",
  });
  products.push({
    ...products.find((p) => p.id === "diluent")!,
    id: "lyse",
    name: "معرف لایز هماتولوژی",
    english: "Hematology lyse",
    price: 2200000,
  });
  const customers: Customer[] = [
    {
      id: "c1",
      name: "آزمایشگاه نمونه سپید",
      manager: "مسئول نمونه الف",
      mobile: "09000000001",
      address: "نشانی فرضی مرکز — صرفاً برای دمو",
      active: true,
      devices: [
        {
          id: "d1",
          model: "FS-114",
          serial: "DEMO-FS114-001",
          delivered: day(120),
          initial: [{ product: "crp", qty: 4 }],
        },
        {
          id: "d2",
          model: "BHA3000",
          serial: "DEMO-BHA3000-002",
          delivered: day(60),
          initial: [],
        },
      ],
    },
    {
      id: "c2",
      name: "آزمایشگاه نمونه باران",
      manager: "مسئول نمونه ب",
      mobile: "09000000002",
      address: "نشانی فرضی",
      active: true,
      devices: [
        {
          id: "d3",
          model: "FS-205",
          serial: "DEMO-FS205-003",
          delivered: day(5),
          initial: [{ product: "tsh", qty: 2 }],
        },
      ],
    },
  ];
  const orders: Order[] = [90, 60, 30].map((d, i) => ({
    id: "SANA-" + (1001 + i),
    key: "seed-" + i,
    customer: "c1",
    created: day(d),
    lines: [{ product: "crp", name: products[0].name, qty: 4, price: 2400000 }],
    method: "online",
    total: 7680000,
    status: "confirmed",
    payment: "paid",
    shipping: "delivered",
    deliveredAt: day(d),
    note: "سابقه کاملاً فرضی دمو",
  }));
  return {
    version: 1,
    products,
    customers,
    orders,
    logs: [
      {
        id: "EV-DEMO",
        type: "order.created",
        related: orders[0].id,
        time: day(1),
        attempts: 1,
        status: "failed",
        error: "خطای ارتباط شبیه‌سازی‌شده",
        destination: "demo://crm/orders",
      },
    ],
    tickets: [],
  };
}
export function compatible(p: Item, c: Customer) {
  return p.verified && c.devices.some((d) => p.models.includes(d.model));
}
export function event(s: State, type: string, related: string) {
  s.logs.unshift({
    id: uid(),
    type,
    related,
    time: new Date().toISOString(),
    attempts: 0,
    status: "pending",
    error: "",
    destination: "demo://sana-adapter",
  });
}
export function createOrder(
  s: State,
  customer: string,
  cart: Record<string, number>,
  method: Order["method"],
  key: string,
) {
  const existing = s.orders.find((o) => o.key === key);
  if (existing) return existing;
  const c = s.customers.find((c) => c.id === customer);
  if (!c?.active) throw Error("حساب مرکز غیرفعال است");
  const lines = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => {
      const p = s.products.find((p) => p.id === id);
      if (!p || !Number.isInteger(qty) || !compatible(p, c) || qty > p.stock)
        throw Error("قیمت، موجودی یا سازگاری اقلام را بازبینی کنید");
      return { product: id, name: p.name, qty, price: p.price };
    });
  if (!lines.length) throw Error("سبد خرید خالی است");
  const base = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const o: Order = {
    id: "SANA-" + uid().slice(0, 8),
    key,
    customer,
    created: new Date().toISOString(),
    lines,
    method,
    total: method === "online" ? onlinePrice(base) : base,
    status: "pending",
    payment: "unpaid",
    shipping: "waiting",
    note: "",
  };
  s.orders.unshift(o);
  event(s, "order.created", o.id);
  return o;
}
function reserve(s: State, o: Order) {
  for (const l of o.lines) {
    const p = s.products.find((p) => p.id === l.product);
    if (!p || p.stock < l.qty) throw Error("موجودی کافی نیست");
  }
  for (const l of o.lines)
    s.products.find((p) => p.id === l.product)!.stock -= l.qty;
}
export function pay(s: State, id: string, success: boolean) {
  const o = s.orders.find((o) => o.id === id)!;
  if (o.payment === "paid") return;
  if (
    o.method !== "online" ||
    o.status === "cancelled" ||
    o.status === "rejected"
  )
    throw Error("این سفارش قابل پرداخت آنلاین نیست");
  if (success) {
    reserve(s, o);
    o.payment = "paid";
    o.status = "confirmed";
  } else {
    o.payment = "failed";
  }
  event(s, "order.payment", o.id);
}
export function review(s: State, id: string, approved: boolean, note: string) {
  const o = s.orders.find((o) => o.id === id)!;
  if (o.method !== "credit" || o.status !== "pending")
    throw Error("درخواست قبلاً بررسی شده است");
  if (!note.trim()) throw Error("توضیح بررسی الزامی است");
  if (approved) reserve(s, o);
  o.status = approved ? "confirmed" : "rejected";
  o.note = note;
  event(s, "order.status", o.id);
}
export function ship(s: State, id: string, value: Order["shipping"]) {
  const o = s.orders.find((o) => o.id === id)!;
  if (o.status !== "confirmed") throw Error("ابتدا سفارش باید تأیید شود");
  o.shipping = value;
  if (value === "delivered" && !o.deliveredAt)
    o.deliveredAt = new Date().toISOString();
  event(s, "order.shipping", id);
}
export function reorder(s: State, o: Order) {
  const c = s.customers.find((c) => c.id === o.customer)!;
  const cart: Record<string, number> = {};
  const skipped: string[] = [];
  for (const l of o.lines) {
    const p = s.products.find((p) => p.id === l.product);
    if (p && compatible(p, c) && p.stock >= l.qty) cart[p.id] = l.qty;
    else skipped.push(l.name);
  }
  return { cart, skipped };
}
export function forecast(s: State, c: Customer, pid: string) {
  const deliveries = c.devices.flatMap((d) =>
    d.initial
      .filter((l) => l.product === pid)
      .map((l) => ({ time: d.delivered, qty: l.qty })),
  );
  for (const o of s.orders.filter(
    (o) =>
      o.customer === c.id &&
      o.status === "confirmed" &&
      o.shipping === "delivered" &&
      (o.method === "credit" || o.payment === "paid"),
  ))
    for (const l of o.lines.filter((l) => l.product === pid))
      deliveries.push({ time: o.deliveredAt || o.created, qty: l.qty });
  deliveries.sort((a, b) => a.time.localeCompare(b.time));
  if (deliveries.length < 3) return null;
  const elapsed =
    (+new Date(deliveries.at(-1)!.time) - +new Date(deliveries[0].time)) /
    86400000;
  const used = deliveries.slice(0, -1).reduce((a, d) => a + d.qty, 0);
  if (elapsed <= 0 || used <= 0) return null;
  const days = (elapsed / used) * deliveries.at(-1)!.qty;
  const due = new Date(
    +new Date(deliveries.at(-1)!.time) + days * 86400000,
  ).toISOString();
  return {
    due,
    days: Math.round(days),
    count: deliveries.length,
    near: +new Date(due) - Date.now() < 7 * 86400000,
    confidence: deliveries.length >= 4 ? "متوسط" : "کم",
  };
}
export function runLog(s: State, id: string, success: boolean) {
  const l = s.logs.find((l) => l.id === id)!;
  l.attempts++;
  Object.assign(l, deliverDemo(success));
}

/** Parse a Jalali calendar date without an external calendar dependency. */
export function jalaliToISO(raw: string) {
  const normalized = raw
    .replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
  const parts = normalized.split(/[\/\-]/).map(Number);
  if (parts.length !== 3)
    throw Error("تاریخ شمسی را مانند ۱۴۰۵/۰۸/۱۰ وارد کنید");
  const [year, month, day] = parts;
  if (
    year < 1300 ||
    year > 1500 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  )
    throw Error("تاریخ شمسی معتبر نیست");
  const fmt = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
  const start = Date.UTC(year + 621, 2, 15);
  for (let i = 0; i < 380; i++) {
    const t = new Date(start + i * 86400000);
    const p = fmt.formatToParts(t);
    const n = (k: string) => Number(p.find((p) => p.type === k)?.value);
    if (n("year") === year && n("month") === month && n("day") === day)
      return t.toISOString();
  }
  throw Error("این روز در تقویم شمسی وجود ندارد");
}

export function cancelOrder(s: State, id: string) {
  const o = s.orders.find((o) => o.id === id);
  if (!o || o.status !== "pending")
    throw Error("فقط سفارش در انتظار بررسی قابل لغو است");
  o.status = "cancelled";
  o.note = "لغو در محیط نمایشی؛ هیچ پرداخت یا رزرو قطعی انجام نشده بود";
  event(s, "order.cancelled", id);
}
