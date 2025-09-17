'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common';
import { TrendingUp, ShieldCheck, Wallet } from 'lucide-react';
import Image from 'next/image';
import { getCoinIcon } from '../common';

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

/* ========= 構成銘柄（静的） ========= */
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
  { name:'Cardano',   symbol:'ADA', weight:10, price:0.93030,    mcap:34.0e9,  vol:2.4e9,   change24h:+0.3, color:'#2A6DF4', chainBadges:['ADA'] },
  { name:'TRON',      symbol:'TRX', weight:10, price:0.34971,    mcap:33.1e9,  vol:0.675e9, change24h:-0.6, color:'#E50914', chainBadges:['TRX'] },
  { name:'Chainlink', symbol:'LINK',weight:10, price:24.9000,    mcap:16.9e9,  vol:1.0e9,   change24h:-0.7, color:'#2A5ADA', chainBadges:['ETH','NEAR','POLYGON'] },
  { name:'Hyperliquid',symbol:'HLP',weight:10, price:54.7210,    mcap:14.8e9,  vol:0.198e9, change24h:-1.4, color:'#00E5A8', chainBadges:['HL'] },
  { name:'Stellar',   symbol:'XLM', weight:10, price:0.40523,    mcap:12.9e9,  vol:0.271e9, change24h:+0.2, color:'#06B6D4', chainBadges:['XLM'] },
];

/* ========= ドーナツ & カード ========= */
const ringBackground = (colors: string[]) =>
  `conic-gradient(${colors.map((c, i) => `${c} ${i * 10}% ${(i + 1) * 10}%`).join(',')})`;

const CARDS = [
  { icon: TrendingUp, title: 'Top-10 Index Token',
    desc: 'One token that holds the top 10 crypto assets in equal 10% weights, reviewed and rebalanced quarterly.' },
  { icon: ShieldCheck, title: 'Bridge-Free & PoR-Backed',
    desc: 'Collateral remains on native chains while AXIS circulates on Solana. Proof-of-Reserves and price oracles verify full backing on-chain.' },
  { icon: Wallet, title: 'Buy on Axis Dashboard',
    desc: 'Connect your wallet and purchase directly on the Axis dashboard. Sell AXIS anytime to redeem the underlying value.' },
];

/* ========= Section ========= */
export default function IndexOverviewSection() {
  return (
    <section className="py-12">
      {/* タイトル（大きめ） */}
      <div className="max-w-[1200px] mx-auto mb-10">
        <h1 className="text-[clamp(2.8rem,7vw,4.2rem)] leading-tight font-extrabold">Axis Index</h1>
        <p className="text-[clamp(1.1rem,2.4vw,1.35rem)] text-gray-300 mt-3">
          Live performance and current constituents of the equal-weighted top-10 index.
        </p>
      </div>

      {/* 上段：ドーナツ + 3カード */}
      <div className="max-w-[1200px] mx-auto mb-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          className="lg:col-span-1 flex items-center justify-center"
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="relative w-44 h-44 md:w-52 md:h-52 rounded-full"
            style={{ background: ringBackground(ASSETS.map(a => a.color)) }}
          >
            <div className="absolute inset-3 bg-[#0B1020] rounded-full flex items-center justify-center text-gray-300">
              <div className="text-center">
                <div className="text-3xl font-bold">10</div>
                <div className="text-sm opacity-70">Assets</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((c, i) => (
            <motion.div key={c.title}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.06 * i }}
            >
              <Card className="h-full text-left">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div whileHover={{ rotate: 8, scale: 1.05 }}
                    className="bg-blue-500/20 text-blue-400 rounded-full w-10 h-10 flex items-center justify-center">
                    <c.icon className="w-5 h-5" />
                  </motion.div>
                  <h3 className="font-semibold">{c.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 下段：Index Components（フル幅） */}
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Index Components</h3>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1.5 rounded-md bg-white text-black">Current</span>
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
                              src={getCoinIcon(a.symbol)}
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
    </section>
  );
}
