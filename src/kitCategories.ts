// Navigation groups adapted from the Finecare FS-114 catalog, page 1.
// These group assays; they do not change ordering eligibility or device compatibility.
export const categories = [
  {
    id: "inflammation",
    label: "التهاب و عفونت",
    products: ["crp", "pct", "il6"],
  },
  {
    id: "diabetes",
    label: "دیابت",
    products: ["hba1c", "insulin", "cpeptide"],
  },
  {
    id: "thyroid",
    label: "عملکرد تیروئید",
    products: ["tsh", "t3", "t4", "ft3", "ft4"],
  },
  {
    id: "cardiac",
    label: "نشانگرهای قلبی",
    products: [
      "ctni",
      "ntprobnp",
      "ckmb",
      "myo",
      "hfabp",
      "bnp",
      "hscrp",
      "st2",
    ],
  },
  { id: "bone", label: "متابولیسم استخوان", products: ["vitd"] },
  { id: "anemia", label: "کم‌خونی", products: ["ferritin", "b12"] },
  { id: "coagulation", label: "نشانگرهای ترومبوز", products: ["ddimer"] },
  {
    id: "fertility",
    label: "هورمون‌های باروری",
    products: ["bhcg", "lh", "fsh", "prog", "prl", "amh"],
  },
  {
    id: "renal",
    label: "عملکرد کلیه",
    products: ["mau", "cysc", "ngal", "b2mg"],
  },
  {
    id: "tumor",
    label: "نشانگرهای توموری",
    products: ["psa", "afp", "cea", "fpsa", "ca125", "ca153", "ca199"],
  },
  { id: "rheumatology", label: "روماتولوژی", products: ["aso", "rf", "ccp"] },
  { id: "allergy", label: "آلرژی", products: ["ige"] },
  {
    id: "gastro",
    label: "گوارش",
    products: ["ifob", "hpylori", "calprotectin"],
  },
  { id: "brain", label: "نشانگرهای آسیب مغزی", products: ["s100"] },
  { id: "hormones", label: "سایر هورمون‌ها", products: ["cortisol"] },
  {
    id: "cbc",
    label: "معرف‌های هماتولوژی (CBC)",
    products: ["diluent", "lyse"],
  },
  { id: "other", label: "سایر کیت‌ها", products: [] },
];
export const categoryFor = (id: string) =>
  categories.find((c) => c.products.includes(id)) ||
  categories[categories.length - 1];
