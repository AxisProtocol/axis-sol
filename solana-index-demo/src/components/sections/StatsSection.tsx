'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Shield, Zap } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: TrendingUp,
      value: '100+',
      label: 'Early Supporters',
      color: 'text-blue-500'
    },
    {
      icon: Users,
      value: '3+',
      label: 'Ecosystem Partners',
      color: 'text-purple-500'
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Security Focused',
      color: 'text-green-500'
    },
    {
      icon: Zap,
      value: '24/7',
      label: 'Always On',
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className={`${stat.color} mb-4 flex justify-center`}>
              <stat.icon size={32} />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
