'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Resolution = '1' | '5' | '15' | '60' | '240' | 'D';

interface TVChartProps {
  initialSymbol?: string; // e.g. INDEX:FAMC or ETH:USD
  initialResolution?: Resolution;
  initialBars?: number; // number of candles
  className?: string;
}

const API_BASE = 'https://api.axis-protocol.xyz/api';

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

  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [resolution, setResolution] = useState<Resolution>(initialResolution);
  const [bars, setBars] = useState<number>(initialBars);
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'line' | 'candles'>('line');

  const queryParams = useMemo(() => ({ symbol, resolution, bars }), [symbol, resolution, bars]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ensureLW = async (): Promise<any> => {
      if (typeof window !== 'undefined' && (window as any).LightweightCharts) {
        return (window as any).LightweightCharts;
      }
      // Fallback: use ESM API directly
      const mod = await import('lightweight-charts');
      // Create a minimal shim so downstream code can use LW-like API shape
      return { createChart: mod.createChart } as any;
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
        // 1) Legacy API
        if (type === 'line' && typeof anyChart.addLineSeries === 'function') {
          const s = anyChart.addLineSeries(optsLine);
          return s;
        }
        if (type === 'candles' && typeof anyChart.addCandlestickSeries === 'function') {
          const s = anyChart.addCandlestickSeries(optsCandle);
          return s;
        }
        // 2) V5 variants
        if (typeof anyChart.addSeries === 'function') {
          try {
            const s = anyChart.addSeries(type === 'line' ? 'Line' : 'Candlestick', type === 'line' ? optsLine : optsCandle);
            return s;
          } catch {}
          try {
            const s = anyChart.addSeries(type === 'line' ? 'line' : 'candlestick', type === 'line' ? optsLine : optsCandle);
            return s;
          } catch {}
          try {
            const s = anyChart.addSeries({ type: type === 'line' ? 'Line' : 'Candlestick', options: type === 'line' ? optsLine : optsCandle });
            return s;
          } catch {}
          try {
            const s = anyChart.addSeries({ type: type === 'line' ? 'Line' : 'Candlestick', ... (type === 'line' ? optsLine : optsCandle) });
            return s;
          } catch {}
        }
        return null;
      };

      const makeSeries = () => {
        if (!chartRef.current) return;
        if (seriesRef.current && typeof seriesRef.current.priceScale === 'function') {
          chartRef.current.removeSeries(seriesRef.current);
        }
        const s = addBuiltInSeries(mode === 'candles' ? 'candles' : 'line');
        seriesRef.current = s;
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
      if (!seriesRef.current) return;
      try {
        setLoading(true);
        const timeRes = await fetch(`${API_BASE}/tv/time`);
        const nowSec = Number(await timeRes.text());
        const spb = secondsPerBar(resolution);
        const from = Math.max(0, Math.floor(nowSec - bars * spb));
        const qs = new URLSearchParams({ symbol, resolution, from: String(from), to: String(nowSec) });
        const res = await fetch(`${API_BASE}/tv/history?` + qs.toString());
        const data = await res.json();
        if (data.s !== 'ok') {
          seriesRef.current.setData([]);
          return;
        }
        if (mode === 'line') {
          const series = data.t.map((t: number, i: number) => ({ time: t, value: data.c[i] as number }));
          seriesRef.current.setData(series);
        } else {
          const candles = data.t.map((t: number, i: number) => ({
            time: t,
            open: data.o?.[i] ?? data.c[i],
            high: data.h?.[i] ?? data.c[i],
            low:  data.l?.[i] ?? data.c[i],
            close:data.c?.[i] ?? data.c[i],
          }));
          seriesRef.current.setData(candles);
        }
        chartRef.current?.timeScale().fitContent();
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [queryParams, mode]);

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
                const s = next === 'candles' ? (chartRef.current as any).addCandlestickSeries() : (chartRef.current as any).addLineSeries();
                if (next === 'line') s.applyOptions({ color: '#1a73e8', lineWidth: 2 });
                if (next === 'candles') s.applyOptions({ upColor: '#26a69a', downColor: '#ef5350', wickUpColor: '#26a69a', wickDownColor: '#ef5350', borderUpColor: '#26a69a', borderDownColor: '#ef5350' });
                seriesRef.current = s;
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


