'use client';

import { motion, Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { EChartProps } from '../charts/EChartsChart';
import { DashboardCard } from '../common';

interface MarketEvent {
  event_date: string;
  title: string;
  description: string;
}

interface ChartSectionProps {
  echartsData: (string | number)[][] | null;
  events: MarketEvent[];
}

const EChartsChart = dynamic<EChartProps>(
  () => import('../charts/EChartsChart'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px]">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
        <p className="ml-4 text-gray-300">Loading chart…</p>
      </div>
    ),
  }
);

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
};

export default function ChartSection({ echartsData, events }: ChartSectionProps) {
  return (
    <DashboardCard 
      variants={sectionVariants}
      className="w-full p-4 md:p-8"
    >
      {echartsData && <EChartsChart data={echartsData} events={events} disableAnimation />}
    </DashboardCard>
  );
}
