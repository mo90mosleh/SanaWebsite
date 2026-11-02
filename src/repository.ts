import { seed, migratePresentation, type State } from "./domain";
const KEY = "sana-demo-v1";
export function read(): State {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  const s = JSON.parse(raw);
  if (s.version !== 1) throw Error("نسخه داده محلی پشتیبانی نمی‌شود");
  const migrated = migratePresentation(s);
  if (JSON.stringify(migrated) !== raw)
    localStorage.setItem(KEY, JSON.stringify(migrated));
  return migrated;
}
export function save(s: State) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("sana-change"));
}
export function reset() {
  save(seed());
}
