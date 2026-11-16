import { useEffect, useRef, useState } from "react";
import { digits } from "./admin-data";
export function MoneyInput({
  name,
  defaultValue = 0,
}: {
  name: string;
  defaultValue?: number;
}) {
  const [raw, setRaw] = useState(String(defaultValue));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const form = ref.current?.form;
    const reset = () => {
      setRaw(String(defaultValue));
      ref.current?.setCustomValidity("");
    };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue]);
  const valid =
    /^\d+$/.test(raw) && Number(raw) >= 1 && Number(raw) <= 1000000000;
  return (
    <>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        dir="ltr"
        required
        aria-label="قیمت پایه (تومان)"
        value={raw.replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}
        onChange={(event) => {
          const value = digits(event.target.value).replace(/[,٬\s]/g, "");
          if (/^\d*$/.test(value) && value.length <= 10) {
            setRaw(value);
            event.target.setCustomValidity(
              value && Number(value) >= 1 && Number(value) <= 1000000000
                ? ""
                : "مبلغ را بین ۱ و ۱٬۰۰۰٬۰۰۰٬۰۰۰ تومان وارد کنید",
            );
          }
        }}
      />
      <input type="hidden" name={name} value={valid ? raw : ""} />
    </>
  );
}
