/** Demo boundary. No fetch, webhook, SMS or payment SDK is used here. */
export function deliverDemo(success: boolean) {
  return {
    status: success ? ("success" as const) : ("failed" as const),
    error: success ? "" : "عدم پاسخ مقصد نمایشی؛ هیچ درخواست شبکه‌ای ارسال نشد",
  };
}
