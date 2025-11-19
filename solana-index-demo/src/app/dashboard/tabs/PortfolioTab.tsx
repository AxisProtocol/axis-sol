"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ModernCard, ModernButton } from "../../../components/common";
import { AlertCircle, Share2, Image as ImageIcon } from "lucide-react";
import { useIndexPrice } from "../../../hooks/useIndexPrice";

// ====== Config / Utils ======
const DEBUG = false;
const dlog = (...a: any[]) => DEBUG && console.log("[PortfolioTab]", ...a);

// プラス / マイナス用のベース画像パス（public/ 配下）
const SHARE_BASE_POSITIVE = "/Axis_win.png";
const SHARE_BASE_NEGATIVE = "/Axis_lose.png";

const pickClose = (row: (string | number)[]) => Number(row[2]);
const pickTsMs = (row: (string | number)[]) =>
  typeof row[0] === "string" ? Date.parse(row[0]) : (row[0] as number);

const pct = (cur: number, base: number) =>
  !base ? 0 : ((cur - base) / base) * 100;

function nearestBar(
  e: (string | number)[][],
  whenMs: number
): (string | number)[] | null {
  if (!e?.length) return null;
  let bi = -1;
  let bd = 1e99;
  for (let i = 0; i < e.length; i++) {
    const t = pickTsMs(e[i]);
    const d = Math.abs(t - whenMs);
    if (d < bd) {
      bd = d;
      bi = i;
    }
  }
  return bi >= 0 ? e[bi] : null;
}

// ページ全体の背景
const BackgroundLayer = () => (
  <div
    className="fixed inset-0 z-0 pointer-events-none"
    style={{
      backgroundImage: "url('/portfolio.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      opacity: 0.15,
    }}
  />
);

// ====== Props ======
interface Props {
  initialLatestEntry: any;
  echartsData: (string | number)[][] | null;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

// ====== Component ======
export default function PortfolioTab({ echartsData }: Props) {
  const { data: indexPriceData } = useIndexPrice();
  const [showContent, setShowContent] = useState(false);

  // ---- Index Performance (1d / 7d / 30d) ----
  const indexPerformance = useMemo(() => {
    if (!echartsData?.length) {
      return {
        hasData: false,
        lastPrice: null as number | null,
        change1d: null as number | null,
        change7d: null as number | null,
        change30d: null as number | null,
      };
    }

    const lastBar = echartsData[echartsData.length - 1]!;
    const lastTs = pickTsMs(lastBar);
    const lastPrice = pickClose(lastBar);

    const diffDays = (d: number) => {
      const targetTs = lastTs - d * 86400000;
      const bar = nearestBar(echartsData, targetTs);
      if (!bar) return null;
      const basePrice = pickClose(bar);
      return pct(lastPrice, basePrice);
    };

    const change1d = diffDays(1);
    const change7d = diffDays(7);
    const change30d = diffDays(30);

    dlog("Index performance", {
      lastPrice,
      change1d,
      change7d,
      change30d,
    });

    return {
      hasData: true,
      lastPrice,
      change1d,
      change7d,
      change30d,
    };
  }, [echartsData]);

  // ---- Share Image (canvas) ----
  const shareCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [shareGenerating, setShareGenerating] = useState(false);

  const generateShareImage = async () => {
    if (!indexPerformance.hasData || indexPerformance.change30d == null) {
      alert("Index performance data is not ready yet.");
      return;
    }

    const canvas = shareCanvasRef.current;
    if (!canvas) return;

    setShareGenerating(true);

    try {
      const perf = indexPerformance.change30d;
      const sign = perf >= 0 ? "+" : "-";
      const color = perf >= 0 ? "#B1FF9B" : "#D43538";
      const absVal = Math.abs(perf);
      const text = `${sign}${absVal.toFixed(2)}%`; // 小数点第2位まで

      // プラス / マイナスでベース画像を切り替え
      const baseSrc = perf >= 0 ? SHARE_BASE_POSITIVE : SHARE_BASE_NEGATIVE;

      const img = new Image();
      img.src = baseSrc;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
      });

      const w = img.width;
      const h = img.height;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context not available");

      // 背景画像
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // ====== テキストレイアウト ======
      // 右側に寄せて、カメに被らないよう marginRight を小さく
      const marginRight = 80;
      const centerY = h * 0.55; // 画像のやや下寄り

      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      // 1. ラベル: "Your last 30d return"
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font =
        'italic 700 60px "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const labelY = centerY - 140;
      ctx.fillText("Your last 30d return", w - marginRight, labelY);

      // 2. 大きな % 表示
      ctx.fillStyle = color;
      ctx.font =
        'italic 900 150px "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const bigY = centerY;
      ctx.fillText(text, w - marginRight, bigY);

      // 3. 日付レンジ (italic)
      const now = new Date();
      const end = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
      );
      const start = new Date(end);
      start.setMonth(start.getMonth() - 1);

      const fmt = (d: Date) =>
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getUTCDate()).padStart(2, "0")}`;

      const dateText = `${fmt(start)} → ${fmt(end)}`;

      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font =
        'italic 500 44px "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const dateY = centerY + 120;
      ctx.fillText(dateText, w - marginRight, dateY);

      const dataUrl = canvas.toDataURL("image/png");
      setShareImageUrl(dataUrl);

      dlog("Share image generated", { dataUrlLen: dataUrl.length, perf });
    } catch (e) {
      console.error("[PortfolioTab] Failed to generate share image", e);
      alert("Failed to generate image. Please try again.");
    } finally {
      setShareGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!shareImageUrl) {
      await generateShareImage();
    }
    const url = shareImageUrl || shareCanvasRef.current?.toDataURL("image/png");
    if (!url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = "axis-cap5-performance.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleShareOnX = async () => {
    if (!indexPerformance.hasData || indexPerformance.change30d == null) {
      alert("Index performance data is not ready yet.");
      return;
    }

    if (!shareImageUrl) {
      await generateShareImage();
    }

    const perf = indexPerformance.change30d;
    const sign = perf >= 0 ? "+" : "-";
    const absVal = Math.abs(perf).toFixed(2);

    const text = `My CaP5 index performance over the last 30 days:\n\n${sign}${absVal}%\n\nPowered by @Axis__Solana @Solana \n\nTry it out here: \nhttps://www.axis-protocol.xyz/dashboard`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 40);
    return () => clearTimeout(t);
  }, []);

  const wrapperClasses = `
    pt-16 relative min-h-screen
    transition-opacity duration-500 ease-in-out
    ${showContent ? "opacity-100" : "opacity-0"}
  `;

  const perfRow = (
    label: string,
    value: number | null,
    big?: boolean
  ) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-base-content/70 text-sm">{label}</span>
      {value == null ? (
        <span className="text-base-content/40 text-sm">—</span>
      ) : (
        <span
          className={`font-semibold ${
            value >= 0 ? "text-success" : "text-error"
          } ${big ? "text-2xl" : "text-lg"}`}
        >
          {value >= 0 ? "+" : ""}
          {value.toFixed(2)}%
        </span>
      )}
    </div>
  );

  return (
    <div
      className={wrapperClasses}
      style={{ fontFamily: "var(--font-serif)" }}
    >
      <BackgroundLayer />

      <div className="relative z-10 space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Devnet 注意書き */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-amber-500">Devnet Mode:</span>{" "}
            <span className="text-base-content/80">
              Simulated performance on Solana Devnet. Not investment advice.
            </span>
          </div>
        </div>

        {/* Index Performance */}
        <ModernCard className="p-6">
          <h2 className="text-2xl font-bold text-base-content mb-4">
            Index Performance (CaP5)
          </h2>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-base-300/40">
              <span className="text-base-content/70 text-sm">Current Value</span>
              <span className="font-semibold text-xl">
                {indexPerformance.lastPrice != null
                  ? indexPerformance.lastPrice.toFixed(2)
                  : "—"}
              </span>
            </div>

            {perfRow("Last 1 day", indexPerformance.change1d)}
            {perfRow("Last 7 days", indexPerformance.change7d)}
            {perfRow("Last 30 days", indexPerformance.change30d, true)}
          </div>
        </ModernCard>

        {/* Share Image & X Share */}
        <ModernCard className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-xl font-bold text-base-content">
              Share your CaP5 performance
            </h3>
          </div>

          <p className="text-sm text-base-content/70">
            Generate a shareable image with CaP5 index performance over the last
            30 days and post it on X.
          </p>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Canvas Preview */}
            <div className="w-full md:w-2/3">
              <div className="border border-base-300/40 rounded-2xl bg-base-200/40 overflow-hidden flex items-center justify-center min-h-[220px]">
                <canvas
                  ref={shareCanvasRef}
                  className="max-w-full h-auto"
                  aria-label="CaP5 performance share image preview"
                />
              </div>
              
            </div>

            {/* Actions */}
            <div className="w-full md:w-1/3 flex flex-col gap-3">
              <ModernButton
                onClick={generateShareImage}
                disabled={!indexPerformance.hasData || shareGenerating}
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                {shareGenerating ? "Generating..." : "Generate image"}
              </ModernButton>

              <ModernButton
                onClick={handleDownloadImage}
                disabled={!indexPerformance.hasData || shareGenerating}
                variant="secondary"
                className="w-full"
              >
                Download PNG
              </ModernButton>

              <ModernButton
                onClick={handleShareOnX}
                disabled={!indexPerformance.hasData || shareGenerating}
                variant="ghost"
                className="w-full flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share on X
              </ModernButton>

              <p className="text-[16px] text-base-content/50 mt-1">
                Due to X API limitations, the tweet composer opens with
                pre-filled text. 
                <br />Please attach the downloaded image manually
                before posting.
              </p>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
