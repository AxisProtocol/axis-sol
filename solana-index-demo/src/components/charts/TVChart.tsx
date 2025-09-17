'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Resolution = '1' | '5' | '15' | '60' | '240' | 'D';

interface TVChartProps {
  initialSymbol?: string; // e.g. INDEX:FAMC or ETH:USD
  initialResolution?: Resolution;
  initialBars?: number; // number of candles
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
  className,
}: TVChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const lwRef = useRef<any>(null);

  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [resolution, setResolution] = useState<Resolution>(initialResolution);
  const [bars, setBars] = useState<number>(initialBars);
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'line' | 'candles'>('line');
  const [refresh, setRefresh] = useState<number>(0); // bump to trigger fetch when series becomes ready
  const retryRef = useRef<number>(0);

  const queryParams = useMemo(() => ({ symbol, resolution, bars }), [symbol, resolution, bars]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ensureLW = async (): Promise<any> => {
      // Prefer ESM to ensure we have SeriesDefinition exports (v5)
      try {
        const mod = await import('lightweight-charts');
        lwRef.current = mod as any;
        return mod as any;
      } catch (e) {
        // Fallback to global if ESM import fails (shouldn't in modern bundlers)
        if (typeof window !== 'undefined' && (window as any).LightweightCharts) {
          const LW = (window as any).LightweightCharts;
          lwRef.current = LW;
          return LW;
        }
        throw e;
      }
    };

    let disposed = false;
    (async () => {
      const LW = await ensureLW();
      if (!containerRef.current || disposed) return;
      const chart = LW.createChart(containerRef.current, {
        layout: { background: { type: 'solid', color: '#0b0e11' }, textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#1f2326' }, horzLines: { color: '#1f2326' } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false, timeVisible: true, secondsVisible: true },
        crosshair: { mode: 0 },
        width: containerRef.current.clientWidth,
        height: Math.max(320, Math.floor(containerRef.current.clientHeight || 480)),
      });
      chartRef.current = chart;

      const addBuiltInSeries = (type: 'line' | 'candles') => {
        const optsLine = { color: '#1a73e8', lineWidth: 2 } as any;
        const optsCandle = {
          upColor: '#26a69a', downColor: '#ef5350',
          wickUpColor: '#26a69a', wickDownColor: '#ef5350',
          borderUpColor: '#26a69a', borderDownColor: '#ef5350',
        } as any;
        const anyChart = chart as any;
        const isLine = type === 'line';
        const lc = isLine ? 'line' : 'candlestick';
        const uc = isLine ? 'Line' : 'Candlestick';
        // 1) Legacy API
        if (isLine && typeof anyChart.addLineSeries === 'function') {
          console.log('[TVChart] using legacy addLineSeries');
          const s = anyChart.addLineSeries(optsLine);
          return s;
        }
        if (!isLine && typeof anyChart.addCandlestickSeries === 'function') {
          console.log('[TVChart] using legacy addCandlestickSeries');
          const s = anyChart.addCandlestickSeries(optsCandle);
          return s;
        }
        // 2) V5 API with SeriesDefinition constants
        if (typeof anyChart.addSeries === 'function' && lwRef.current) {
          const def = isLine ? lwRef.current.LineSeries : lwRef.current.CandlestickSeries;
          if (def) {
            try {
              console.log('[TVChart] using v5 addSeries(definition)');
              const s = anyChart.addSeries(def, isLine ? optsLine : optsCandle);
              return s;
            } catch (e) {
              console.warn('[TVChart] addSeries(definition) failed', e);
            }
          } else {
            console.warn('[TVChart] SeriesDefinition missing on LW module', { lwKeys: Object.keys(lwRef.current || {}) });
          }
        }
        console.warn('[TVChart] addBuiltInSeries could not create series', { hasAddLine: typeof anyChart.addLineSeries, hasAddCandle: typeof anyChart.addCandlestickSeries, hasAddSeries: typeof anyChart.addSeries, chartKeys: Object.keys(anyChart || {}) });
        return null;
      };

      const makeSeries = () => {
        if (!chartRef.current) return;
        if (seriesRef.current && typeof seriesRef.current.priceScale === 'function') {
          chartRef.current.removeSeries(seriesRef.current);
        }
        if (retryRef.current === 0) {
          console.log('[TVChart] attempting to create series');
        }
        const s = addBuiltInSeries(mode === 'candles' ? 'candles' : 'line');
        if (s) {
          seriesRef.current = s;
          // trigger initial fetch now that series exists
          setRefresh((x) => x + 1);
          retryRef.current = 0;
        } else {
          retryRef.current += 1;
          const attempts = retryRef.current;
          if (attempts <= 20) {
            console.warn('[TVChart] series create failed; retrying in 200ms', { attempts });
            setTimeout(() => {
              if (chartRef.current && !seriesRef.current) makeSeries();
            }, 200);
          } else {
            console.error('[TVChart] series creation failed after max retries');
          }
        }
      };
      makeSeries();

      const ro = new ResizeObserver(() => {
        if (!containerRef.current) return;
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: Math.max(320, Math.floor(containerRef.current.clientHeight || 480)),
        });
      });
      ro.observe(containerRef.current);
      (chart as any)._ro = ro;
    })();

    return () => {
      disposed = true;
      const chart = chartRef.current;
      const ro: ResizeObserver | undefined = (chart as any)?._ro;
      if (ro) ro.disconnect();
      if (chart && typeof chart.remove === 'function') chart.remove();
      seriesRef.current = null;
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const doFetch = async () => {
      if (!seriesRef.current) {
        console.warn('[TVChart] seriesRef not ready; skipping fetch', { symbol, resolution, bars, mode });
        return;
      }
      try {
        setLoading(true);
        const timeUrl = `${API_BASE}/tv/time`;
        console.log('[TVChart] fetching /tv/time', { timeUrl });
        const timeRes = await fetch(timeUrl);
        if (!timeRes.ok) {
          console.error('[TVChart] /tv/time failed', { status: timeRes.status, statusText: timeRes.statusText });
        }
        const nowSec = Number(await timeRes.text());
        if (!Number.isFinite(nowSec)) {
          console.error('[TVChart] invalid nowSec from /tv/time', { nowSec });
        }
        const spb = secondsPerBar(resolution);
        const from = Math.max(0, Math.floor(nowSec - bars * spb));
        const qs = new URLSearchParams({ symbol, resolution, from: String(from), to: String(nowSec) });
        const historyUrl = `${API_BASE}/tv/history?${qs.toString()}`;
        console.log('[TVChart] fetching /tv/history', { historyUrl, symbol, resolution, bars, spb, from, nowSec });
        const res = await fetch(historyUrl);
        if (!res.ok) {
          console.error('[TVChart] /tv/history failed', { status: res.status, statusText: res.statusText });
        }
        const data = await res.json();
        console.log('[TVChart] /tv/history response', { s: data?.s, points: Array.isArray(data?.t) ? data.t.length : null });
        if (data.s !== 'ok') {
          seriesRef.current.setData([]);
          return;
        }
        if (mode === 'line') {
          const series = data.t.map((t: number, i: number) => ({ time: t, value: data.c[i] as number }));
          console.log('[TVChart] setting line data', { count: series.length, sample: series[0] });
          seriesRef.current.setData(series);
        } else {
          const candles = data.t.map((t: number, i: number) => ({
            time: t,
            open: data.o?.[i] ?? data.c[i],
            high: data.h?.[i] ?? data.c[i],
            low:  data.l?.[i] ?? data.c[i],
            close:data.c?.[i] ?? data.c[i],
          }));
          console.log('[TVChart] setting candle data', { count: candles.length, sample: candles[0] });
          seriesRef.current.setData(candles);
        }
        chartRef.current?.timeScale().fitContent();
      } catch (e) {
        console.error('[TVChart] doFetch error', e);
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [queryParams, mode, refresh]);

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between mb-3">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-xs text-white/70">Symbol</label>
          <input
            className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="INDEX:FAMC"
          />
          <label className="text-xs text-white/70 ml-2">Resolution</label>
          <select
            className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
          >
            <option value="1">1</option>
            <option value="5">5</option>
            <option value="15">15</option>
            <option value="60">60</option>
            <option value="240">240</option>
            <option value="D">D</option>
          </select>
          <label className="text-xs text-white/70 ml-2">Type</label>
          <select
            className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
            value={mode}
            onChange={(e) => {
              const next = e.target.value === 'candles' ? 'candles' : 'line';
              setMode(next as 'line' | 'candles');
              // recreate series for new type
              if (chartRef.current) {
                try { chartRef.current.removeSeries(seriesRef.current); } catch {}
                const chartAny = chartRef.current as any;
                let s: any = null;
                // Prefer v5 SeriesDefinition API if available
                if (typeof chartAny.addSeries === 'function' && lwRef.current) {
                  const def = next === 'line' ? lwRef.current.LineSeries : lwRef.current.CandlestickSeries;
                  if (def) {
                    try {
                      console.log('[TVChart] mode change uses v5 addSeries(definition)');
                      s = chartAny.addSeries(def);
                    } catch (err) {
                      console.warn('[TVChart] mode change addSeries(definition) failed', err);
                    }
                  }
                }
                // Try legacy API
                if (!s) {
                  if (next === 'candles' && typeof chartAny.addCandlestickSeries === 'function') {
                    s = chartAny.addCandlestickSeries();
                  } else if (next === 'line' && typeof chartAny.addLineSeries === 'function') {
                    s = chartAny.addLineSeries();
                  }
                }
                // Try v5 addSeries API variants
                if (!s && typeof chartAny.addSeries === 'function') {
                  try { s = chartAny.addSeries(next === 'line' ? 'Line' : 'Candlestick', {}); } catch {}
                  if (!s) { try { s = chartAny.addSeries(next === 'line' ? 'line' : 'candlestick', {}); } catch {} }
                  if (!s) { try { s = chartAny.addSeries({ type: next === 'line' ? 'Line' : 'Candlestick' }); } catch {} }
                }
                if (!s) {
                  console.error('[TVChart] failed to create series on mode change');
                  return;
                }
                if (next === 'line') s.applyOptions({ color: '#1a73e8', lineWidth: 2 });
                if (next === 'candles') s.applyOptions({ upColor: '#26a69a', downColor: '#ef5350', wickUpColor: '#26a69a', wickDownColor: '#ef5350', borderUpColor: '#26a69a', borderDownColor: '#ef5350' });
                seriesRef.current = s;
                console.log('[TVChart] series recreated for mode change', { mode: next });
                // trigger refetch for new series
                setRefresh((x) => x + 1);
              }
            }}
          >
            <option value="line">Line</option>
            <option value="candles">Candles</option>
          </select>
          <label className="text-xs text-white/70 ml-2">Bars</label>
          <input
            type="number"
            min={50}
            max={5000}
            step={50}
            className="px-2 py-1 w-28 rounded bg-white/10 border border-white/20 text-white text-sm"
            value={bars}
            onChange={(e) => setBars(Math.max(50, Math.min(5000, Number(e.target.value) || 500)))}
          />
          {loading && <span className="text-xs text-blue-300">Loading…</span>}
        </div>
        <div className="text-xs text-white/50">Data via /tv endpoints</div>
      </div>
      <div ref={containerRef} className="w-full h-[420px]" />
    </div>
  );
}


