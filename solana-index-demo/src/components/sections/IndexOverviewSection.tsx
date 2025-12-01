// IndexOverviewSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getCoinIcon } from '../common';
import dynamic from 'next/dynamic';
const BacktestSimulator = dynamic(() => import('./BacktestSimulator').then(m => m.BacktestSimulator), { ssr: false });

/* ========= utils ========= */
const fmtUSD = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (abs >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3)  return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(4)}`;
};
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

/* ========= 構成銘柄（既存） ========= */
type AssetRow = {
  name: string; symbol: string; weight: number;
  price: number; mcap: number; vol: number; change24h: number;
  color: string; chainBadges: string[];
};

const ASSETS: AssetRow[] = [
  { name:'Bitcoin',   symbol:'BTC', weight:10, price:115961.4736, mcap:2309e9, vol:29.8e9,  change24h:-0.0, color:'#F7931A', chainBadges:['BTC'] },
  { name:'Ethereum',  symbol:'ETH', weight:10, price:4667.4302,  mcap:563.2e9, vol:30.3e9,  change24h:-0.9, color:'#627EEA', chainBadges:['ETH'] },
  { name:'XRP',       symbol:'XRP', weight:10, price:3.1227,     mcap:186.1e9, vol:4.9e9,   change24h:+0.6, color:'#00AAE4', chainBadges:['XRP'] },
  { name:'Solana',    symbol:'SOL', weight:10, price:242.6701,   mcap:131.6e9, vol:7.5e9,   change24h:+0.1, color:'#14F195', chainBadges:['SOL'] },
  { name:'BNB',       symbol:'BNB', weight:10, price:933.8972,   mcap:129.9e9, vol:1.6e9,   change24h:+0.6, color:'#F3BA2F', chainBadges:['BNB'] },
];

// Top5（ロゴグリッド用）
const TOP5 = ASSETS.slice(0, 5);

/* ========= アニメーション ========= */
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function IndexOverviewSection() {
  return (
    <motion.section
      className="py-20 lg:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={sectionVariants}
    >
      {/* ヘッダー */}
      <div className="max-w-[1200px] mx-auto mb-12">
  {/* 見出し行：h1 を flex にしない */}
  <div className="flex items-baseline gap-6 flex-wrap md:flex-nowrap">
    <motion.h1
      className="leading-[0.98] font-bold text-white
                 text-[clamp(2.6rem,7vw,7rem)]"
      variants={itemVariants}
      style={{ fontFamily: 'var(--font-serif)' }}
    >
      What&apos;s CaP5?
    </motion.h1>
  </div>

  <motion.p
    className="text-[clamp(1.05rem,2.4vw,1.25rem)] text-gray-300 mt-3 italic"
    variants={itemVariants}
  >
    Live performance and current constituents of the index.
  </motion.p>
</div>


      {/* --- パート1: CaP5（ロゴ + Top5ロゴグリッド） --- */}
      <div className="max-w-[1200px] mx-auto mb-14">
        {/* CaP5 ロゴ（1枚） */}
       

        <motion.div className="text-center mb-6" variants={itemVariants}>
          <h2 className="text-2xl md:text-3xl font-bold">
            The Axis <span className="text-cyan-400">CaP5</span> Constituents
          </h2>
          <p className="text-gray-400 mt-3">
            Diversified exposure to five leading assets, optimized by rules.
          </p>
        </motion.div>

        {/* 構成銘柄のロゴは従来通り getCoinIcon を使用 */}
        <div className="flex flex-wrap items-center justify-center gap-7 lg:gap-10">
          {TOP5.map((a) => (
            <motion.div
              key={a.symbol}
              className="flex flex-col items-center gap-3 text-center"
              whileHover={{ scale: 1.08 }}
            >
              <span className="inline-flex items-center justify-center w-18 h-18 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10">
                <Image
                  src={getCoinIcon(a.symbol)}
                  alt={`${a.name} logo`}
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </span>
              <span className="text-sm font-medium italic">{a.symbol}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mb-20 px-4">
         <motion.div variants={itemVariants}>
           <BacktestSimulator />
         </motion.div>
      </div>

      {/* --- パート2: Methodology（要約 + CTA遷移） --- */}
      <div className="max-w-[1200px] mx-auto mb-16">
        <motion.div
          className="mx-auto max-w-[900px] text-center"
          variants={itemVariants}
        >
          <h3 className="text-2xl md:text-3xl font-bold">Methodology (Summary)</h3>
          <p className="text-gray-300 mt-3 leading-relaxed">
            Inverse-volatility weighting, quarterly rebalancing (via Jito BAM),
            strict liquidity & safety screens, and on-chain Proof of Reserves.
          </p>

          {/* CTA：詳細は別ページへ */}
          <div className="mt-6 flex items-center justify-center">
            <a
              href="https://zenodo.org/records/17521527"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/15 hover:border-cyan-400/60 transition-colors"
            >
              Read full methodology
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* --- 既存：Index Components（テーブル） --- */}
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={itemVariants}
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Index Components</h3>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1.5 rounded-md bg-cyan-400 text-black">Current</span>
                <span className="px-3 py-1.5 rounded-md bg-white/5 text-gray-300">Logs</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-gray-400">
                  <tr className="border-b border-white/10">
                    <th className="py-2 text-left">Asset</th>
                    <th className="py-2 text-right pr-2">Weight</th>
                    <th className="py-2 text-right pr-2">Price</th>
                    <th className="py-2 text-right pr-2">Market Cap</th>
                    <th className="py-2 text-right pr-2">Volume</th>
                    <th className="py-2 text-right pr-2">24h</th>
                    <th className="py-2 text-center">Chain</th>
                  </tr>
                </thead>
                <tbody>
                  {ASSETS.map((a) => (
                    <tr key={a.symbol} className="border-b border-white/5 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full overflow-hidden bg-white/5">
                            <Image
                              src={getCoinIcon(a.symbol)} // ← ここも従来どおり
                              alt={a.symbol}
                              width={28}
                              height={28}
                              className="object-contain"
                            />
                          </span>
                          <div className="leading-tight">
                            <div className="font-medium">{a.name}</div>
                            <div className="text-xs text-gray-400">{a.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right pr-2">{a.weight.toFixed(1)}%</td>
                      <td className="py-3 text-right pr-2">{fmtUSD(a.price)}</td>
                      <td className="py-3 text-right pr-2">{fmtUSD(a.mcap)}</td>
                      <td className="py-3 text-right pr-2">{fmtUSD(a.vol)}</td>
                      <td className="py-3 text-right pr-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            a.change24h >= 0
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {fmtPct(a.change24h)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {a.chainBadges.map((c) => (
                            <span key={c} className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}
