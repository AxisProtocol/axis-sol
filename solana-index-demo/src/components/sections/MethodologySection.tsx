'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Layers, BarChart3, ShieldCheck, Users } from 'lucide-react';
import { Card } from '../common';

type MethodologyItem = {
  title: string;
  desc: string;
  icon?: any;
  jitoLogo?: boolean;
  href?: string;
};

const methodology: MethodologyItem[] = [
  {
    icon: Layers,
    title: 'Equal-Weight Index',
    desc: 'Top 10 crypto assets equally weighted at 10% each. Prevents dominance of BTC or ETH and ensures diversification.',
    href: 'https://drive.google.com/file/d/1OoWfctw2os75C4gCuM0pXzGu5o9ACm6i/view?usp=sharing',
  },
  {
    icon: BarChart3,
    title: 'FAMC & Liquidity Screens',
    desc: 'Uses free-float adjusted market cap and 90-day turnover filter to select only high-quality, liquid assets.',
    href: 'https://drive.google.com/file/d/1OoWfctw2os75C4gCuM0pXzGu5o9ACm6i/view?usp=sharing',
  },
  {
    jitoLogo: true,
    title: 'Quarterly Rebalance (Jito BAM)',
    desc: 'Rebalanced every quarter using Jito’s Batch Auction Mechanism (BAM) to minimize slippage and MEV risk.',
    href: 'https://hackmd.io/@kidneyweakx/SkIP8gAKlg', // Jito の公式ドキュメントURLなどに差し替え可
  },
  {
    icon: ShieldCheck,
    title: 'Proof-of-Reserves & Oracles',
    desc: 'On-chain verification of reserves combined with trusted oracles guarantees transparent and verifiable backing.',
    href: 'https://muse-7.gitbook.io/axiswhitepaper/',
  },
  {
    icon: Users,
    title: 'Governance & Safety Nets',
    desc: 'Multi-sig and time-lock governance with buffer rules ensure stability, transparency, and secure operations.',
    href: 'https://drive.google.com/file/d/1cFK2YBCGGK-6D49AjVpL_ybKx-cbvifW/view?usp=sharing',
  },
];

export default function MethodologySection() {
  return (
    <section className="py-20">
      <div className="text-center mb-14">
        <h2 className="text-[clamp(2.2rem,6vw,3.2rem)] font-bold">Index Methodology</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto mt-4 text-[clamp(1rem,4vw,1.1rem)] leading-7">
          How Axis Index is constructed and maintained — transparent, rules-based, and optimized for long-term sustainability.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {methodology.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <Card className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {item.jitoLogo ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/5 rounded-full w-12 h-12 flex items-center justify-center"
                    >
                      <img
                        src="/jito-logo.png"
                        alt="Jito logo"
                        className="w-8 h-8 object-contain"
                        loading="lazy"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="bg-blue-500/20 text-blue-400 w-12 h-12 flex items-center justify-center rounded-full"
                    >
                      {item.icon && <item.icon className="w-6 h-6" />}
                    </motion.div>
                  )}
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>

              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-md bg-blue-500/20 text-blue-400 px-4 py-2 text-sm font-medium hover:bg-blue-500/30 transition-colors text-center"
                >
                  Learn More →
                </a>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
