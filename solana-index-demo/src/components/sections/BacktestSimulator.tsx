'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Activity } from 'lucide-react';
import { SIMULATION_DATA, SimulationDataPoint } from '../../data/simulationData';

// --- Types & Constants ---
type TimeRange = { label: string; days: number };
const RANGES: TimeRange[] = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'YTD', days: 0 }, // 0 is a flag for YTD
  { label: 'ALL', days: -1 },
];

export const BacktestSimulator: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(RANGES[5]); // Default: ALL

  // --- Logic: Filter & Rebase Data ---
  const chartData = useMemo(() => {
    // 1. Filter by date range
    let filtered: SimulationDataPoint[] = [];
    const lastDataPoint = SIMULATION_DATA[SIMULATION_DATA.length - 1];
    const lastDate = new Date(lastDataPoint.date);

    if (selectedRange.label === 'ALL') {
      filtered = SIMULATION_DATA;
    } else if (selectedRange.label === 'YTD') {
      // Assuming "Current Date" context is late 2025 based on data
      const currentYear = lastDate.getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      filtered = SIMULATION_DATA.filter(d => d.date >= startOfYear);
    } else {
      const cutoffDate = new Date(lastDate);
      cutoffDate.setDate(cutoffDate.getDate() - selectedRange.days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];
      filtered = SIMULATION_DATA.filter(d => d.date >= cutoffStr);
    }

    if (filtered.length === 0) return [];

    // 2. Rebase (Start at 0%)
    // The first point in the filtered range becomes the baseline.
    const baseAxis = filtered[0].AXIS_IVW;
    const baseMcw = filtered[0].MCW_Cap40;
    // const baseSol = filtered[0].SOL_Hold; // Optional: include SOL benchmark

    return filtered.map(d => ({
      date: d.date,
      // Percentage Change Formula: ((Current - Base) / Base) * 100
      axisPct: ((d.AXIS_IVW - baseAxis) / baseAxis) * 100,
      mcwPct: ((d.MCW_Cap40 - baseMcw) / baseMcw) * 100,
      // solPct: ((d.SOL_Hold - baseSol) / baseSol) * 100,
    }));
  }, [selectedRange]);

  // --- Summary Stats ---
  const final = chartData[chartData.length - 1] || { axisPct: 0, mcwPct: 0 };
  const spread = final.axisPct - final.mcwPct;

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      
      {/* Header: Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Performance Simulator</h3>
          </div>
          <p className="text-sm text-gray-400">
            Compare <span className="text-cyan-400 font-bold">Axis (IVW)</span> vs. Standard Market-Cap Weighting.
          </p>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 overflow-x-auto">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setSelectedRange(r)}
              className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                selectedRange.label === r.label
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="flex items-end gap-6 mb-6 px-1">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Axis Return</span>
          <div className="text-3xl font-bold text-cyan-400">
            {final.axisPct > 0 ? '+' : ''}{final.axisPct.toFixed(2)}%
          </div>
        </div>
        <div className="pl-6 border-l border-white/10">
           <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">vs Market Cap</span>
           <div className={`text-xl font-bold ${spread >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
             {spread > 0 ? '+' : ''}{spread.toFixed(2)}%
             <span className="text-sm font-normal text-gray-500 ml-1">Spread</span>
           </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAxis" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              stroke="#525252" 
              fontSize={11}
              tickFormatter={(str) => {
                const d = new Date(str);
                return `${d.getMonth()+1}/${d.getDate()}`; // format: MM/DD
              }}
              minTickGap={40}
            />
            
            <YAxis 
              stroke="#525252" 
              fontSize={11}
              tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(0)}%`}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ padding: 0 }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
              formatter={(val: number) => [`${val > 0 ? '+' : ''}${val.toFixed(2)}%`, '']}
            />
            
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
            
            {/* Competitor: MCW (Gray) */}
            <Area 
              type="monotone" 
              dataKey="mcwPct" 
              name="Market Cap Weighted (Competitors)" 
              stroke="#71717a" 
              strokeWidth={2}
              fill="transparent" 
              dot={false}
              strokeDasharray="4 4"
            />

            {/* Hero: Axis (Cyan) */}
            <Area 
              type="monotone" 
              dataKey="axisPct" 
              name="Axis (Inverse Volatility)" 
              stroke="#22d3ee" 
              strokeWidth={3}
              fill="url(#gradAxis)" 
              dot={false}
              activeDot={{ r: 6, fill: "#22d3ee", stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] text-gray-500">
          *Backtest simulation based on historical data (2020-2025). Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
};