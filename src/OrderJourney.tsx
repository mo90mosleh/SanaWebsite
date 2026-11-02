import { Check, Clock, PackageCheck, Truck } from "lucide-react";
import { orderStage, type Order } from "./domain";
export function OrderJourney({ order }: { order: Order }) {
  const stage = orderStage(order);
  if (stage === "closed") return null;
  const active = ["review", "queue", "sent"].indexOf(stage);
  return (
    <ol className="order-journey" aria-label="مراحل سفارش">
      {[
        ["در حال بررسی", Clock],
        ["در صف ارسال", PackageCheck],
        ["ارسال شده", Truck],
      ].map(([label, I], i) => {
        const Icon = I as typeof Clock;
        return (
          <li
            key={i}
            className={i < active ? "complete" : i === active ? "current" : ""}
            aria-current={i === active ? "step" : undefined}
          >
            <span>{i < active ? <Check size={17} /> : <Icon size={17} />}</span>
            <strong>{String(label)}</strong>
          </li>
        );
      })}
    </ol>
  );
}
