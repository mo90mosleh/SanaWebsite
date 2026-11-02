import {
  firstAvailableDelivery,
  validateDelivery,
  type DeliverySchedule,
} from "./delivery";
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
export type SavedAddress = {
  id: string;
  label: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  recipient: string;
  phone: string;
  lat: number;
  lng: number;
  isDefault: boolean;
};
export type Customer = {
  id: string;
  name: string;
  manager: string;
  mobile: string;
  address: string;
  active: boolean;
  devices: Device[];
  addresses?: SavedAddress[];
  avatar?: string;
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
  status: "pending" | "confirmed" | "cancelled";
  payment: "unpaid" | "failed" | "paid";
  shipping: "waiting" | "preparing" | "sent" | "delivered";
  deliveredAt?: string;
  deliveryAddress?: SavedAddress;
  deliverySchedule?: DeliverySchedule;
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
  number?: number;
  createdAt?: string;
  device?: Pick<Device, "id" | "model" | "serial">;
  customer: string;
  title: string;
  messages: { text: string; by: string; time: string }[];
};
export type State = {
  version: 1;
  presentationRevision?: number;
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
      name: "آزمایشگاه بقراط",
      manager: "آرمان بهرامی",
      mobile: "09000000001",
      address: "تهران، نشانی مرکز بقراط",
      avatar: "/profile/boghrat.svg",
      addresses: [defaultAddress()],
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
      address: "نشانی مرکز باران",
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
    note: "",
  }));
  const pending = samplePendingOrder({ products, customers });
  if (pending) orders.unshift(pending);
  return {
    version: 1,
    presentationRevision: 3,
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
    tickets: [sampleTicket()],
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
  addressId?: string,
  schedule?: DeliverySchedule,
) {
  const existing = s.orders.find((o) => o.key === key);
  if (existing) return existing;
  validateDelivery(schedule);
  const c = s.customers.find((c) => c.id === customer);
  if (!c?.active) throw Error("حساب مرکز غیرفعال است");
  const chosen =
    c.addresses?.find((a) => a.id === addressId) ||
    (!addressId
      ? c.addresses?.find((a) => a.isDefault) || c.addresses?.[0]
      : undefined);
  if (addressId && !chosen) throw Error("نشانی تحویل انتخاب‌شده پیدا نشد");
  if (!chosen) throw Error("ابتدا یک نشانی تحویل در آدرس‌های من ثبت کنید");
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
    deliverySchedule: { ...schedule! },
  };
  if (chosen) o.deliveryAddress = { ...chosen };
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
  if (o.method !== "online" || o.status === "cancelled")
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
  o.status = approved ? "confirmed" : "cancelled";
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
  o.note = "سفارش پیش از تأیید نهایی لغو شد.";
  event(s, "order.cancelled", id);
}

export function defaultAddress(): SavedAddress {
  return {
    id: "address-boghrat",
    label: "آدرس مرکز",
    province: "تهران",
    city: "تهران",
    address: "تهران، نشانی مرکز بقراط",
    postalCode: "",
    recipient: "آرمان بهرامی",
    phone: "09000000001",
    lat: 35.6892,
    lng: 51.389,
    isDefault: true,
  };
}
export function sampleTicket(): Ticket {
  return {
    id: "TICKET-WELCOME",
    number: 1001,
    createdAt: day(3),
    device: { id: "d1", model: "FS-114", serial: "DEMO-FS114-001" },
    customer: "c1",
    title: "راهنمای راه‌اندازی و کنترل کیفیت دستگاه",
    messages: [
      {
        text: "سلام، برای اجرای کنترل کیفیت روزانه دستگاه Finecare راهنمایی می‌خواهم.",
        by: "مرکز",
        time: day(3),
      },
      {
        text: "سلام، مدل و سریال دستگاه شما بررسی شد. مراحل راه‌اندازی را طبق راهنمای همان مدل و دستورالعمل کیت دنبال کنید. برای بررسی مرحله‌ای، مشخصات مواد کنترل را در همین تیکت ارسال کنید.",
        by: "سانا",
        time: day(2),
      },
    ],
  };
}
/** Add presentation defaults once, preserving all user edits, orders and feedback. */
export function migratePresentation(s: State): State {
  if ((s.presentationRevision ?? 0) < 2) {
    const c = s.customers.find((c) => c.id === "c1");
    if (c) {
      if (c.name === "آزمایشگاه نمونه سپید") c.name = "آزمایشگاه بقراط";
      if (c.manager === "مسئول نمونه الف") c.manager = "آرمان بهرامی";
      if (c.address === "نشانی فرضی مرکز — صرفاً برای دمو")
        c.address = "تهران، نشانی مرکز بقراط";
      if (!c.avatar) c.avatar = "/profile/boghrat.svg";
      if (!c.addresses)
        c.addresses = [
          {
            ...defaultAddress(),
            address: c.address,
            recipient: c.manager,
            phone: c.mobile,
          },
        ];
    }
    if (!s.tickets.some((t) => t.id === "TICKET-WELCOME"))
      s.tickets.push(sampleTicket());
    s.orders.forEach((o) => {
      if (o.note === "سابقه کاملاً فرضی دمو") o.note = "";
    });
    s.presentationRevision = 2;
  }
  for (const o of s.orders) {
    if ((o.status as string) === "rejected") o.status = "cancelled";
  }
  if ((s.presentationRevision ?? 0) < 3) {
    if (
      !s.orders.some(
        (o) => o.key === "seed-review-1004" || o.id === "SANA-1004",
      )
    ) {
      const pending = samplePendingOrder(s);
      if (pending) {
        s.orders.unshift(pending);
        event(s, "order.created", pending.id);
      }
    }
    s.presentationRevision = 3;
  }
  let ticketNumber = Math.max(1000, ...s.tickets.map((t) => t.number || 0));
  for (const ticket of [...s.tickets].reverse()) {
    if (!ticket.number) ticket.number = ++ticketNumber;
    if (!ticket.createdAt && ticket.messages[0])
      ticket.createdAt = ticket.messages[0].time;
  }
  return s;
}
export function orderStage(o: Order): "review" | "queue" | "sent" | "closed" {
  if (o.status === "cancelled") return "closed";
  if (o.status === "pending") return "review";
  return o.shipping === "sent" || o.shipping === "delivered" ? "sent" : "queue";
}
export function saveCustomerProfile(
  s: State,
  id: string,
  value: Pick<Customer, "name" | "manager" | "mobile">,
) {
  if (!value.name.trim() || !value.manager.trim())
    throw Error("نام مرکز و مسئول مرکز الزامی است");
  if (!/^09[0-9]{9}$/.test(value.mobile))
    throw Error("شماره موبایل معتبر نیست");
  if (s.customers.some((c) => c.id !== id && c.mobile === value.mobile))
    throw Error("شماره موبایل تکراری است");
  const c = s.customers.find((c) => c.id === id);
  if (!c) throw Error("مرکز پیدا نشد");
  Object.assign(c, value);
}
export function saveAddress(s: State, cid: string, a: SavedAddress) {
  const c = s.customers.find((c) => c.id === cid);
  if (!c) throw Error("مرکز پیدا نشد");
  if (
    !a.label.trim() ||
    !a.address.trim() ||
    !a.city ||
    !a.province ||
    !a.recipient.trim()
  )
    throw Error("مشخصات نشانی را کامل کنید");
  if (!/^09[0-9]{9}$/.test(a.phone)) throw Error("موبایل گیرنده معتبر نیست");
  if (a.postalCode && !/^[0-9]{10}$/.test(a.postalCode))
    throw Error("کد پستی باید ۱۰ رقم باشد");
  if (
    !Number.isFinite(a.lat) ||
    !Number.isFinite(a.lng) ||
    a.lat < 24 ||
    a.lat > 40 ||
    a.lng < 44 ||
    a.lng > 64
  )
    throw Error("موقعیت معتبر انتخاب کنید");
  const list = c.addresses ?? [];
  const next = list.some((x) => x.id === a.id)
    ? list.map((x) => (x.id === a.id ? { ...a } : x))
    : [...list, { ...a }];
  if (a.isDefault || next.length === 1) {
    next.forEach((x) => (x.isDefault = x.id === a.id));
    c.address = a.address;
  }
  c.addresses = next;
  if (!next.some((x) => x.isDefault)) {
    next[0].isDefault = true;
    c.address = next[0].address;
  }
}
export function deleteAddress(s: State, cid: string, id: string) {
  const c = s.customers.find((c) => c.id === cid)!;
  c.addresses = (c.addresses ?? []).filter((a) => a.id !== id);
  if (c.addresses.length && !c.addresses.some((a) => a.isDefault)) {
    c.addresses[0].isDefault = true;
    c.address = c.addresses[0].address;
  }
}

export function formatAddress(a: SavedAddress) {
  const region = a.province === a.city ? a.city : a.province + "، " + a.city;
  return a.address.startsWith(a.province) || a.address.startsWith(a.city)
    ? a.address
    : region + "، " + a.address;
}

export function samplePendingOrder(
  s: Pick<State, "products" | "customers">,
): Order | null {
  const c = s.customers.find((c) => c.id === "c1");
  if (!c) return null;
  const product = s.products.find(
    (p) => p.verified && compatible(p, c) && p.stock > 0,
  );
  if (!product) return null;
  const address = c.addresses?.find((a) => a.isDefault) || c.addresses?.[0];
  return {
    id: "SANA-1004",
    key: "seed-review-1004",
    customer: c.id,
    created: new Date().toISOString(),
    lines: [
      { product: product.id, name: product.name, qty: 1, price: product.price },
    ],
    method: "credit",
    total: product.price,
    status: "pending",
    payment: "unpaid",
    shipping: "waiting",
    note: "در انتظار بررسی فروش",
    deliveryAddress: address ? { ...address } : undefined,
    deliverySchedule: firstAvailableDelivery(),
  };
}

export const ticketReference = (ticket: Ticket) =>
  `SANA-T-${ticket.number ?? ticket.id}`;
export const ticketStatus = (ticket: Ticket) =>
  ticket.messages.at(-1)?.by === "سانا" ? "answered" : "pending";
export function createTicket(
  s: State,
  cid: string,
  deviceId: string,
  title: string,
  text: string,
) {
  const customer = s.customers.find((c) => c.id === cid);
  if (!customer?.active) throw Error("حساب مشتری فعال نیست");
  const device = customer.devices.find((d) => d.id === deviceId);
  if (!device) throw Error("یکی از دستگاه‌های خریداری‌شده خود را انتخاب کنید");
  title = title.trim();
  text = text.trim();
  if (!title || title.length > 100 || !text || text.length > 2000)
    throw Error("عنوان و متن معتبر وارد کنید");
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: uid(),
    number: Math.max(1000, ...s.tickets.map((t) => t.number || 0)) + 1,
    createdAt: now,
    customer: cid,
    title,
    device: { id: device.id, model: device.model, serial: device.serial },
    messages: [{ text, by: "مرکز", time: now }],
  };
  s.tickets.unshift(ticket);
  return ticket;
}
export function replyToTicket(
  s: State,
  id: string,
  role: "admin" | "customer",
  cid: string,
  text: string,
) {
  const ticket = s.tickets.find((t) => t.id === id);
  if (
    !ticket ||
    (role === "customer" &&
      (ticket.customer !== cid ||
        !s.customers.find((c) => c.id === cid)?.active))
  )
    throw Error("این تیکت در دسترس نیست");
  text = text.trim();
  if (!text || text.length > 2000) throw Error("متن پاسخ معتبر وارد کنید");
  ticket.messages.push({
    text,
    by: role === "admin" ? "سانا" : "مرکز",
    time: new Date().toISOString(),
  });
}
