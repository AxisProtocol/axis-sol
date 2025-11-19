// app/dashboard/components/TVChart.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Resolution = '1' | '5' | '15' | '60' | '240' | 'D';

interface TVChartProps {
  initialSymbol?: string;        // e.g. INDEX:FAMC or ETH:USD
  initialResolution?: Resolution;
  initialBars?: number;          // number of candles
  className?: string;
}

const API_BASE = 'https://api.axis-protocol.xyz';

function secondsPerBar(resolution: Resolution): number {
  if (resolution === 'D') return 86400;
  const n = Number(resolution);
  return (Number.isFinite(n) && n > 0 ? n : 1) * 60;
}

export default function TVChart({
  initialSymbol = 'INDEX:FAMC',
  initialResolution = '60',
  initialBars = 1000,
  className = '',
}: TVChartProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);      // 外枠（高さ制御）
  const canvasRef = useRef<HTMLDivElement | null>(null);    // 実チャートDOM
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const baselineRef = useRef<any>(null);
  const lwRef = useRef<any>(null);

  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [resolution, setResolution] = useState<Resolution>(initialResolution);
  const [bars, setBars] = useState<number>(initialBars);
  const [mode, setMode] = useState<'line' | 'candles'>('candles');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);          // series 再作成時に fetch 走らせる

  const queryParams = useMemo(() => ({ symbol, resolution, bars }), [symbol, resolution, bars]);

  // -------- Fullscreen --------
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // -------- 初期化（LW読み込み & チャート作成）--------
  useEffect(() => {
    let disposed = false;

    const ensureLW = async () => {
      const mod = await import('lightweight-charts');
      lwRef.current = mod as any;
      return lwRef.current;
    };

    (async () => {
      const LW = await ensureLW();
      if (!canvasRef.current || disposed) return;

      // 初期サイズは外枠の実サイズに合わせる（内部余白を避ける）
      const getSize = () => {
        const el = canvasRef.current!;
        const r = el.getBoundingClientRect();
        return {
          width: Math.floor(r.width),
          height: Math.floor(r.height),
        };
      };

      const chart = LW.createChart(canvasRef.current, {
        layout: {
          background: { type: 'solid', color: '#0C0F14' },
          textColor: '#D4D7E1',
        },
        grid: {
          vertLines: { color: '#1B2027' },
          horzLines: { color: '#1B2027' },
        },
        rightPriceScale: {
          borderVisible: false,
          // 余白が出ないように下側を薄く
          scaleMargins: { top: 0.08, bottom: 0.02 },
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: true,
        },
        crosshair: {
          mode: 1,
          vertLine: { color: '#7F8DA1', width: 0.5, style: 0, labelBackgroundColor: '#1F6BFF' },
          horzLine: { color: '#7F8DA1', width: 0.5, style: 0, labelBackgroundColor: '#1F6BFF' },
        },
        ...getSize(),
      });

      chartRef.current = chart;

      const addSeries = (t: 'line' | 'candles') => {
        const any = chart as any;
        if (t === 'line') {
          if (typeof any.addLineSeries === 'function') {
            return any.addLineSeries({
              color: '#3B82F6',
              lineWidth: 2,
              priceLineVisible: false,
              lastValueVisible: true,
            });
          }
          if (typeof any.addSeries === 'function' && LW?.LineSeries) {
            return any.addSeries(LW.LineSeries, {
              color: '#3B82F6',
              lineWidth: 2,
              priceLineVisible: false,
              lastValueVisible: true,
            });
          }
        } else {
          if (typeof any.addCandlestickSeries === 'function') {
            return any.addCandlestickSeries({
              upColor: '#22C55E',
              downColor: '#EF4444',
              wickUpColor: '#22C55E',
              wickDownColor: '#EF4444',
              borderUpColor: '#22C55E',
              borderDownColor: '#EF4444',
              priceLineVisible: false,
              lastValueVisible: true,
            });
          }
          if (typeof any.addSeries === 'function' && LW?.CandlestickSeries) {
            return any.addSeries(LW.CandlestickSeries, {
              upColor: '#22C55E',
              downColor: '#EF4444',
              wickUpColor: '#22C55E',
              wickDownColor: '#EF4444',
              borderUpColor: '#22C55E',
              borderDownColor: '#EF4444',
              priceLineVisible: false,
              lastValueVisible: true,
            });
          }
        }
        return null;
      };

      // メインシリーズ
      seriesRef.current = addSeries(mode);

      // Baseline(100)
      try {
        const any = chart as any;
        if (typeof any.addBaselineSeries === 'function') {
          baselineRef.current = any.addBaselineSeries({
            baseValue: { type: 'price', price: 100 },
            topLineColor: 'rgba(255,255,255,0.3)',
            topFillColor1: 'rgba(255,255,255,0.06)',
            topFillColor2: 'rgba(255,255,255,0.02)',
            bottomLineColor: 'rgba(255,255,255,0.25)',
            bottomFillColor1: 'rgba(255,255,255,0.02)',
            bottomFillColor2: 'rgba(255,255,255,0.06)',
            priceLineVisible: true,
            lastValueVisible: false,
          });
        } else if (typeof any.addSeries === 'function' && LW?.BaselineSeries) {
          baselineRef.current = any.addSeries(LW.BaselineSeries, {
            baseValue: { type: 'price', price: 100 },
            topLineColor: 'rgba(255,255,255,0.3)',
            topFillColor1: 'rgba(255,255,255,0.06)',
            topFillColor2: 'rgba(255,255,255,0.02)',
            bottomLineColor: 'rgba(255,255,255,0.25)',
            bottomFillColor1: 'rgba(255,255,255,0.02)',
            bottomFillColor2: 'rgba(255,255,255,0.06)',
            priceLineVisible: true,
            lastValueVisible: false,
          });
        }
      } catch {}

      // リサイズ監視（外枠の実寸にジャスト合わせ）
      const ro = new ResizeObserver(() => {
        if (!canvasRef.current || !chartRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        chartRef.current.applyOptions({ width: Math.floor(r.width), height: Math.floor(r.height) });
        chartRef.current.timeScale().fitContent();
        chartRef.current.timeScale().rightOffset(0);
      });
      ro.observe(canvasRef.current);
      (chart as any)._ro = ro;

      // 初回 fetch
      setRefreshKey((x) => x + 1);
    })();

    return () => {
      disposed = true;
      const chart = chartRef.current;
      const ro: ResizeObserver | undefined = (chart as any)?._ro;
      if (ro) ro.disconnect();
      if (chart && typeof chart.remove === 'function') chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      baselineRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- データ取得 --------
  useEffect(() => {
    const fetchData = async () => {
      if (!seriesRef.current) return;
      try {
        setLoading(true);
        const timeRes = await fetch(`${API_BASE}/tv/time`);
        const nowSec = Number(await timeRes.text());
        const spb = secondsPerBar(resolution);
        const from = Math.max(0, Math.floor(nowSec - bars * spb));
        const qs = new URLSearchParams({ symbol, resolution, from: String(from), to: String(nowSec) });
        const res = await fetch(`${API_BASE}/tv/history?${qs.toString()}`);
        const data = (await res.json()) as {
          s?: string; t?: number[]; c?: number[]; o?: number[]; h?: number[]; l?: number[]; v?: number[];
        };

        if (data.s !== 'ok' || !data.t?.length) {
          seriesRef.current.setData([]);
          if (baselineRef.current) baselineRef.current.setData([]);
          return;
        }

        if (mode === 'line') {
          seriesRef.current.setData(
            data.t.map((t, i) => ({ time: t, value: data.c![i] as number }))
          );
        } else {
          seriesRef.current.setData(
            data.t.map((t, i) => ({
              time: t,
              open: data.o?.[i] ?? data.c![i],
              high: data.h?.[i] ?? data.c![i],
              low:  data.l?.[i] ?? data.c![i],
              close:data.c?.[i] ?? data.c![i],
            }))
          );
        }

        if (baselineRef.current) {
          baselineRef.current.setData(data.t.map((t) => ({ time: t, value: 100 })));
        }

        // ここで毎回フィット＋右端オフセット0 → 下の余白/ズレ感を解消
        chartRef.current?.timeScale().fitContent();
        chartRef.current?.timeScale().rightOffset(0);
      } catch (e) {
        // no-op（UIは静かに）
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [queryParams, mode, refreshKey]);

  // -------- モード変更（シリーズ作り直し）--------
  const changeMode = (next: 'line' | 'candles') => {
    if (!chartRef.current || mode === next) return;
    setMode(next);
    try {
      if (seriesRef.current) chartRef.current.removeSeries(seriesRef.current);
    } catch {}
    const LW = lwRef.current;
    const any = chartRef.current as any;
    let s: any = null;

    if (next === 'line') {
      s = typeof any.addLineSeries === 'function'
        ? any.addLineSeries({ color: '#3B82F6', lineWidth: 2, priceLineVisible: false, lastValueVisible: true })
        : (typeof any.addSeries === 'function' && LW?.LineSeries
          ? any.addSeries(LW.LineSeries, { color: '#3B82F6', lineWidth: 2, priceLineVisible: false, lastValueVisible: true })
          : null);
    } else {
      s = typeof any.addCandlestickSeries === 'function'
        ? any.addCandlestickSeries({
            upColor: '#22C55E', downColor: '#EF4444',
            wickUpColor: '#22C55E', wickDownColor: '#EF4444',
            borderUpColor: '#22C55E', borderDownColor: '#EF4444',
            priceLineVisible: false, lastValueVisible: true,
          })
        : (typeof any.addSeries === 'function' && LW?.CandlestickSeries
          ? any.addSeries(LW.CandlestickSeries, {
              upColor: '#22C55E', downColor: '#EF4444',
              wickUpColor: '#22C55E', wickDownColor: '#EF4444',
              borderUpColor: '#22C55E', borderDownColor: '#EF4444',
              priceLineVisible: false, lastValueVisible: true,
            })
          : null);
    }

    if (!s) return;
    seriesRef.current = s;
    setRefreshKey((x) => x + 1);
  };

  return (
    <div
      ref={wrapRef}
      className={[
        'relative',
        'rounded-2xl border border-white/10 shadow-2xl',
        'bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/70',
        'backdrop-blur supports-[backdrop-filter]:backdrop-blur-md',
        'p-3 md:p-4',
        className,
      ].join(' ')}
    >
      {/* ヘッダー（チャート上に重ねるガラスUI） */}
      <div className="pointer-events-auto absolute left-3 right-3 top-3 z-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 px-3 py-2 rounded-xl border border-white/10 bg-slate-800/40 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="INDEX:FAMC"
                className="h-9 px-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as Resolution)}
                className="h-9 px-2 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="1">1m</option>
                <option value="5">5m</option>
                <option value="15">15m</option>
                <option value="60">1h</option>
                <option value="240">4h</option>
                <option value="D">1D</option>
              </select>
              <input
                type="number"
                min={50}
                max={5000}
                step={50}
                value={bars}
                onChange={(e) => setBars(Math.max(50, Math.min(5000, Number(e.target.value) || 500)))}
                className="h-9 w-24 px-2 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                title="Bars"
              />
            </div>

            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button
                onClick={() => changeMode('line')}
                className={`h-9 px-4 text-sm ${mode === 'line' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/60'}`}
              >
                Line
              </button>
              <button
                onClick={() => changeMode('candles')}
                className={`h-9 px-4 text-sm ${mode === 'candles' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/60'}`}
              >
                Candles
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-blue-300">
                <span className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="h-9 px-3 rounded-lg bg-slate-900/70 border border-white/10 text-slate-200 hover:text-white hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <span className="hidden md:inline text-xs text-slate-400">Data via /tv endpoints</span>
          </div>
        </div>
      </div>

      {/* チャート領域：親の高さに完全追従（余白出ない） */}
      <div
        ref={canvasRef}
        className={[
          'w-full',
          'h-[58vh] md:h-[62vh] max-h-[820px] min-h-[360px]',
          'rounded-xl border border-white/10',
          'bg-[linear-gradient(180deg,rgba(16,22,30,0.9),rgba(12,15,20,0.95))]',
          'overflow-hidden',
        ].join(' ')}
      />

      {/* 下部の薄い情報行（任意） */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Sym: <span className="text-slate-200">{symbol}</span></span>
        <span>Res: <span className="text-slate-200">{resolution}</span> • Bars: <span className="text-slate-200">{bars}</span></span>
      </div>
    </div>
  );
}
