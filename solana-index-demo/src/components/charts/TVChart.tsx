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
  const baselineRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const lwRef = useRef<any>(null);

  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [resolution, setResolution] = useState<Resolution>(initialResolution);
  const [bars, setBars] = useState<number>(initialBars);
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'line' | 'candles'>('candles');
  const [refresh, setRefresh] = useState<number>(0); // bump to trigger fetch when series becomes ready
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const retryRef = useRef<number>(0);

  const queryParams = useMemo(() => ({ symbol, resolution, bars }), [symbol, resolution, bars]);

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        layout: { 
          background: { type: 'solid', color: '#0b0e11' }, 
          textColor: '#d1d4dc' 
        },
        grid: { 
          vertLines: { color: '#1f2326' }, 
          horzLines: { color: '#1f2326' } 
        },
        rightPriceScale: { 
          borderVisible: false,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: { 
          borderVisible: false, 
          timeVisible: true, 
          secondsVisible: true 
        },
        crosshair: { 
          mode: 1,
          vertLine: {
            color: '#758696',
            width: 0.5,
            style: 0,
            labelBackgroundColor: '#2962FF',
          },
          horzLine: {
            color: '#758696',
            width: 0.5,
            style: 0,
            labelBackgroundColor: '#2962FF',
          },
        },
        width: containerRef.current.clientWidth,
        height: Math.max(320, Math.floor(containerRef.current.clientHeight || 480)),
      });
      chartRef.current = chart;

      const addBuiltInSeries = (type: 'line' | 'candles') => {
        const optsLine = { 
          color: '#1a73e8', 
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
        } as any;
        
        const optsCandle = {
          upColor: '#26a69a', 
          downColor: '#ef5350',
          wickUpColor: '#26a69a', 
          wickDownColor: '#ef5350',
          borderUpColor: '#26a69a', 
          borderDownColor: '#ef5350',
          priceLineVisible: false,
          lastValueVisible: true,
        } as any;
        
        const anyChart = chart as any;
        const isLine = type === 'line';
        
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

      const addBaselineSeries = () => {
        const anyChart = chart as any;
        
        // Try to add baseline series at value 100
        try {
          if (typeof anyChart.addBaselineSeries === 'function') {
            const baseline = anyChart.addBaselineSeries({
              baseValue: { type: 'price', price: 100 },
              topLineColor: 'rgba(255, 255, 255, 0.3)',
              topFillColor1: 'rgba(255, 255, 255, 0.1)',
              topFillColor2: 'rgba(255, 255, 255, 0.05)',
              bottomLineColor: 'rgba(255, 255, 255, 0.3)',
              bottomFillColor1: 'rgba(255, 255, 255, 0.05)',
              bottomFillColor2: 'rgba(255, 255, 255, 0.1)',
              priceLineVisible: true,
              lastValueVisible: false,
            });
            return baseline;
          }
          
          // Try V5 API
          if (typeof anyChart.addSeries === 'function' && lwRef.current?.BaselineSeries) {
            const baseline = anyChart.addSeries(lwRef.current.BaselineSeries, {
              baseValue: { type: 'price', price: 100 },
              topLineColor: 'rgba(255, 255, 255, 0.3)',
              topFillColor1: 'rgba(255, 255, 255, 0.1)',
              topFillColor2: 'rgba(255, 255, 255, 0.05)',
              bottomLineColor: 'rgba(255, 255, 255, 0.3)',
              bottomFillColor1: 'rgba(255, 255, 255, 0.05)',
              bottomFillColor2: 'rgba(255, 255, 255, 0.1)',
              priceLineVisible: true,
              lastValueVisible: false,
            });
            return baseline;
          }
        } catch (e) {
          console.warn('[TVChart] Failed to add baseline series', e);
        }
        return null;
      };

      const makeSeries = () => {
        if (!chartRef.current) return;
        
        // Remove existing series
        if (seriesRef.current && typeof seriesRef.current.priceScale === 'function') {
          chartRef.current.removeSeries(seriesRef.current);
        }
        if (baselineRef.current && typeof baselineRef.current.priceScale === 'function') {
          chartRef.current.removeSeries(baselineRef.current);
        }
        
        if (retryRef.current === 0) {
          console.log('[TVChart] attempting to create series');
        }
        
        // Create main series
        const s = addBuiltInSeries(mode === 'candles' ? 'candles' : 'line');
        if (s) {
          seriesRef.current = s;
          
          // Create baseline series
          const baseline = addBaselineSeries();
          if (baseline) {
            baselineRef.current = baseline;
            // Baseline data will be set when we fetch the actual data
          }
          
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
      baselineRef.current = null;
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
        const data = await res.json() as { s?: string; t?: number[]; c?: number[]; o?: number[]; h?: number[]; l?: number[]; v?: number[] };
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
            low: data.l?.[i] ?? data.c[i],
            close: data.c?.[i] ?? data.c[i],
          }));
          console.log('[TVChart] setting candle data', { count: candles.length, sample: candles[0] });
          seriesRef.current.setData(candles);
        }
        
        // Update baseline data
        if (baselineRef.current) {
          const baselineData = data.t.map((t: number) => ({ time: t, value: 100 }));
          baselineRef.current.setData(baselineData);
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

  const handleModeChange = (newMode: 'line' | 'candles') => {
    setMode(newMode);
    if (chartRef.current) {
      try { 
        chartRef.current.removeSeries(seriesRef.current); 
      } catch {}
      
      const chartAny = chartRef.current as any;
      let s: any = null;
      
      // Prefer v5 SeriesDefinition API if available
      if (typeof chartAny.addSeries === 'function' && lwRef.current) {
        const def = newMode === 'line' ? lwRef.current.LineSeries : lwRef.current.CandlestickSeries;
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
        if (newMode === 'candles' && typeof chartAny.addCandlestickSeries === 'function') {
          s = chartAny.addCandlestickSeries();
        } else if (newMode === 'line' && typeof chartAny.addLineSeries === 'function') {
          s = chartAny.addLineSeries();
        }
      }
      
      // Try v5 addSeries API variants
      if (!s && typeof chartAny.addSeries === 'function') {
        try { s = chartAny.addSeries(newMode === 'line' ? 'Line' : 'Candlestick', {}); } catch {}
        if (!s) { try { s = chartAny.addSeries(newMode === 'line' ? 'line' : 'candlestick', {}); } catch {} }
        if (!s) { try { s = chartAny.addSeries({ type: newMode === 'line' ? 'Line' : 'Candlestick' }); } catch {} }
      }
      
      if (!s) {
        console.error('[TVChart] failed to create series on mode change');
        return;
      }
      
      // Apply styling
      if (newMode === 'line') {
        s.applyOptions({ 
          color: '#1a73e8', 
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
        });
      }
      if (newMode === 'candles') {
        s.applyOptions({ 
          upColor: '#26a69a', 
          downColor: '#ef5350', 
          wickUpColor: '#26a69a', 
          wickDownColor: '#ef5350', 
          borderUpColor: '#26a69a', 
          borderDownColor: '#ef5350',
          priceLineVisible: false,
          lastValueVisible: true,
        });
      }
      
      seriesRef.current = s;
      console.log('[TVChart] series recreated for mode change', { mode: newMode });
      // trigger refetch for new series
      setRefresh((x) => x + 1);
    }
  };

  return (
    <div className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Control Panel */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4 p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-700/50 backdrop-blur-sm">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Symbol Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">Symbol</label>
            <input
              className="px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-600/50 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="INDEX:FAMC"
            />
          </div>

          {/* Resolution Select */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">Resolution</label>
            <select
              className="px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-600/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              value={resolution}
              onChange={(e) => setResolution(e.target.value as Resolution)}
            >
              <option value="1">1m</option>
              <option value="5">5m</option>
              <option value="15">15m</option>
              <option value="60">1h</option>
              <option value="240">4h</option>
              <option value="D">1D</option>
            </select>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">Chart Type</label>
            <div className="flex rounded-lg bg-gray-800/80 border border-gray-600/50 overflow-hidden">
              <button
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  mode === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
                onClick={() => handleModeChange('line')}
              >
                Line
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  mode === 'candles'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
                onClick={() => handleModeChange('candles')}
              >
                Candles
              </button>
            </div>
          </div>

          {/* Bars Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">Bars</label>
            <input
              type="number"
              min={50}
              max={5000}
              step={50}
              className="px-3 py-2 w-24 rounded-lg bg-gray-800/80 border border-gray-600/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              value={bars}
              onChange={(e) => setBars(Math.max(50, Math.min(5000, Number(e.target.value) || 500)))}
            />
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-800/80 border border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {/* Data Source Info */}
          <div className="text-xs text-gray-400 hidden md:block">
            Data via /tv endpoints
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={containerRef} 
        className={`w-full ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[420px]'} rounded-lg overflow-hidden border border-gray-700/50`}
      />
    </div>
  );
}