import { useRef, useState } from "react";
import {
  applyImport,
  numeric,
  importColumns,
  type ImportKind,
  type ImportPreview,
} from "./admin-data";
import type { State } from "./domain";
type Props = {
  kind: ImportKind;
  state: State;
  mutate: (fn: (state: State) => void) => boolean;
};
const names = {
  customers: "مشتریان",
  products: "محصولات",
  inventory: "موجودی",
};
export function ExcelImport({ kind, state, mutate }: Props) {
  const [preview, setPreview] = useState<ImportPreview | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function template() {
    setBusy(true);
    setError("");
    try {
      const { default: ExcelJS } = await import("exceljs");
      const book = new ExcelJS.Workbook();
      const sheet = book.addWorksheet(names[kind]);
      sheet.addRow(importColumns[kind]);
      sheet.getRow(1).font = { bold: true };
      sheet.views = [{ rightToLeft: true }];
      sheet.columns.forEach((c) => (c.width = 28));
      const blob = new Blob([await book.xlsx.writeBuffer()], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sana-${kind}-template.xlsx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("ساخت فایل نمونه ممکن نشد.");
    } finally {
      setBusy(false);
    }
  }
  async function load(file?: File) {
    setPreview(null);
    setError("");
    setMessage("");
    if (!file) return;
    setBusy(true);
    try {
      if (
        !file.name.toLowerCase().endsWith(".xlsx") ||
        file.size > 5 * 1024 * 1024
      )
        throw Error(
          "فایل Excel با پسوند xlsx و حجم حداکثر ۵ مگابایت انتخاب کنید.",
        );
      const { default: ExcelJS } = await import("exceljs");
      const book = new ExcelJS.Workbook();
      await book.xlsx.load(await file.arrayBuffer());
      const sheet = book.worksheets[0];
      if (!sheet || sheet.rowCount > 1001 || sheet.columnCount > 30)
        throw Error("فایل باید حداکثر ۱۰۰۰ ردیف و ۳۰ ستون داشته باشد.");
      const columns = importColumns[kind];
      const cell = (row: number, col: number) => {
        const c = sheet.getCell(row, col);
        if (c.type === ExcelJS.ValueType.Formula)
          throw Error(
            `ردیف ${row}: فرمول مجاز نیست؛ مقدار نهایی را وارد کنید.`,
          );
        return c.text.trim();
      };
      const headers = Array.from({ length: sheet.columnCount }, (_, i) =>
        cell(1, i + 1),
      );
      const positions = columns.map((c) => {
        const hits = headers.reduce<number[]>(
          (a, h, i) => (h === c ? [...a, i + 1] : a),
          [],
        );
        if (hits.length !== 1)
          throw Error(
            `ستون «${c}» باید دقیقاً یک بار وجود داشته باشد. از فایل نمونه استفاده کنید.`,
          );
        return hits[0];
      });
      const rows: string[][] = [];
      for (let r = 2; r <= sheet.rowCount; r++) {
        const row = positions.map((c) => cell(r, c));
        if (row.some(Boolean)) rows.push(row);
      }
      const next = { kind, rows };
      applyImport(structuredClone(state), next);
      setPreview(next);
    } catch (e) {
      setError(
        e instanceof Error && /[آ-ی]/.test(e.message)
          ? e.message
          : "فایل اکسل قابل خواندن نیست یا ساختار آن معتبر نیست.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <details className="card import-panel">
      <summary>ورود {names[kind]} از اکسل</summary>
      <p>
        فایل را با ستون‌های نمونه تکمیل کنید. پیش از ثبت، پیش‌نمایش و اعتبارسنجی
        انجام می‌شود؛ فایل روی همین مرورگر پردازش می‌شود.
      </p>
      {kind === "inventory" && (
        <p>
          تغییر مثبت برای افزایش و تغییر منفی برای کاهش موجودی است؛ مثلاً ۵ یا
          ۲-.
        </p>
      )}
      <div className="actions">
        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={template}
        >
          دانلود فایل نمونه اکسل
        </button>
        <label className="excel-file">
          انتخاب فایل اکسل
          <input
            ref={input}
            type="file"
            accept=".xlsx"
            disabled={busy}
            onChange={(e) => load(e.target.files?.[0])}
          />
        </label>
      </div>
      {busy && <p role="status">در حال پردازش فایل…</p>}
      {error && (
        <p role="alert" className="import-error">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {preview && (
        <>
          <p>
            {preview.rows.length.toLocaleString("fa-IR")} ردیف معتبر؛ نمایش
            حداکثر ۱۰ ردیف اول. هنوز ذخیره نشده است.
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {importColumns[kind].map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    {row.map((v, j) => (
                      <td key={j}>
                        {kind === "products" && j === 4
                          ? numeric(v).toLocaleString("fa-IR")
                          : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="actions">
            <button
              type="button"
              onClick={() => {
                setError("");
                let failure = "";
                const ok = mutate((s) => {
                  try {
                    applyImport(s, preview);
                  } catch (e) {
                    failure = e instanceof Error ? e.message : "ثبت انجام نشد";
                    throw e;
                  }
                });
                if (ok) {
                  setMessage(
                    `${preview.rows.length.toLocaleString("fa-IR")} ردیف ثبت شد.`,
                  );
                  setPreview(null);
                } else setError(failure || "ثبت انجام نشد؛ دوباره تلاش کنید.");
              }}
            >
              تأیید و ثبت {names[kind]}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setPreview(null)}
            >
              انصراف
            </button>
          </div>
        </>
      )}
    </details>
  );
}
