'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  const timeframes = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

  const analysisData = {
    overview: {
      title: "Index Performance Overview",
      description: "Comprehensive analysis of the Axis Solana Index performance across different timeframes and market conditions.",
      metrics: [
        { label: "Total Return", value: "+156.7%", change: "+12.3%", period: "YTD" },
        { label: "Volatility", value: "24.3%", change: "-2.1%", period: "vs S&P 500" },
        { label: "Sharpe Ratio", value: "1.87", change: "+0.15", period: "Risk-adjusted" },
        { label: "Max Drawdown", value: "-18.4%", change: "-5.2%", period: "vs Previous" }
      ]
    },
    composition: {
      title: "Index Composition Analysis",
      description: "Detailed breakdown of asset allocation, sector exposure, and rebalancing impact on performance.",
      sectors: [
        { name: "DeFi Protocols", allocation: 35, performance: "+23.4%" },
        { name: "Layer 1 Blockchains", allocation: 28, performance: "+18.7%" },
        { name: "Infrastructure", allocation: 22, performance: "+31.2%" },
        { name: "Gaming & Metaverse", allocation: 15, performance: "+12.8%" }
      ]
    },
    risk: {
      title: "Risk Analysis & Metrics",
      description: "Comprehensive risk assessment including volatility analysis, correlation metrics, and stress testing results.",
      riskMetrics: [
        { metric: "Value at Risk (95%)", value: "8.2%", riskLevel: "Low" },
        { metric: "Expected Shortfall", value: "12.1%", riskLevel: "Medium" },
        { metric: "Correlation with BTC", value: "0.67", riskLevel: "Moderate" },
        { metric: "Beta to Crypto Market", value: "0.89", riskLevel: "Low" }
      ]
    },
    comparison: {
      title: "Benchmark Comparison",
      description: "Performance comparison against traditional indices and crypto benchmarks to highlight relative strength.",
      benchmarks: [
        { name: "S&P 500", performance: "+12.4%", vsAxis: "+144.3%" },
        { name: "NASDAQ-100", performance: "+18.7%", vsAxis: "+138.0%" },
        { name: "BTC", performance: "+89.2%", vsAxis: "+67.5%" },
        { name: "ETH", performance: "+67.8%", vsAxis: "+88.9%" }
      ]
    }
  };

  const renderMetrics = (metrics: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-semibold text-white">{metric.label || metric.metric}</h4>
            <span className="text-sm text-gray-400">{metric.period}</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
          <div className="text-sm">
            {metric.change && (
              <span className={metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                {metric.change}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderSectors = (sectors: any[]) => (
    <div className="space-y-4">
      {sectors.map((sector, index) => (
        <motion.div
          key={index}
          className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-white">{sector.name}</h4>
            <span className="text-sm text-gray-400">{sector.allocation}%</span>
          </div>
          <div className="text-lg mb-3">
            <span className={sector.performance.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
              {sector.performance}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${sector.allocation}%` }}
            ></div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderBenchmarks = (benchmarks: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {benchmarks.map((benchmark, index) => (
        <motion.div
          key={index}
          className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="text-lg font-semibold text-white mb-2">{benchmark.name}</div>
          <div className="text-2xl font-bold mb-2">
            <span className={benchmark.performance.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
              {benchmark.performance}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            vs Axis: 
            <span className={`ml-1 ${benchmark.vsAxis.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {benchmark.vsAxis}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderContent = () => {
    const currentData = analysisData[activeTab as keyof typeof analysisData];
    
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 text-center max-w-3xl mx-auto">{currentData.description}</p>
            {renderMetrics((currentData as any).metrics)}
          </div>
        );
      case 'composition':
        return (
          <div>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 text-center max-w-3xl mx-auto">{currentData.description}</p>
            {renderSectors((currentData as any).sectors)}
          </div>
        );
      case 'risk':
        return (
          <div>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 text-center max-w-3xl mx-auto">{currentData.description}</p>
            {renderMetrics((currentData as any).riskMetrics)}
          </div>
        );
      case 'comparison':
        return (
          <div>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 text-center max-w-3xl mx-auto">{currentData.description}</p>
            {renderBenchmarks((currentData as any).benchmarks)}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-16 bg-black text-white min-h-screen md:px-6">
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold m-0 md:text-5xl"
        >
          Index Analysis & Performance
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 mb-12 leading-relaxed text-xl text-gray-400 text-center max-w-2xl mx-auto md:text-base"
        >
          Deep dive into the performance metrics, risk analysis, and comparative insights
        </motion.p>
      </div>

      <div className="flex items-center justify-center mb-8 gap-4">
        <span className="text-gray-400">Timeframe:</span>
        <div className="flex gap-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedTimeframe === timeframe 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-500'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 bg-white/5 rounded-xl p-2 backdrop-blur-sm">
            {Object.keys(analysisData).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {analysisData[activeTab as keyof typeof analysisData].title}
          </h2>
          {renderContent()}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto mt-16">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h4 className="text-xl font-semibold text-white mb-3">Strong Outperformance</h4>
            <p className="text-gray-300 leading-relaxed">The Axis Index has consistently outperformed traditional market indices, demonstrating the growth potential of the Solana ecosystem.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h4 className="text-xl font-semibold text-white mb-3">Risk Management</h4>
            <p className="text-gray-300 leading-relaxed">Our diversified approach and regular rebalancing help manage volatility while maintaining strong returns.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h4 className="text-xl font-semibold text-white mb-3">Market Correlation</h4>
            <p className="text-gray-300 leading-relaxed">Moderate correlation with Bitcoin provides diversification benefits while maintaining exposure to crypto growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
