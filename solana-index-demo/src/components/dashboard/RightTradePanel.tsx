"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const cn = (...cls: Array<string | false | null | undefined>) =>
  cls.filter(Boolean).join(" ");

// 既存の買いフォームを再利用（前回作った BuyPanel）
const BuyPanel = dynamic(() => import("./Modal/BuyPanel"), { ssr: false });
// 売りフォームは買いを流用して後述の差分だけ切替でもOK
const SellPanel = dynamic(() => import("./Modal//SellPanel"), { ssr: false });

type Side = "buy" | "sell";

export default function RightTradePanel({
  indexPrice,
}: {
  indexPrice: number | null;
}) {
  const [side, setSide] = useState<Side>("buy");

  return (
    <aside className="w-full lg:w-[420px] xl:w-[480px] shrink-0 lg:sticky lg:top-20 self-start">
      {/* Side tabs (Buy / Sell) */}
      <div className="rounded-2xl border border-base-300 bg-base-200/50 p-2 mb-3 flex">
        {(["buy", "sell"] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              "flex-1 py-2 rounded-xl text-sm font-semibold transition",
              side === s
                ? s === "buy"
                  ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/40"
                  : "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
                : "text-base-content/60 hover:bg-base-300/40"
            )}
          >
            {s === "buy" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div>
        {side === "buy" ? (
          <BuyPanel indexPrice={indexPrice} />
        ) : (
          <SellPanel indexPrice={indexPrice} />
        )}
      </div>
    </aside>
  );
}
