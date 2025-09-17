'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Flag, Target, Rocket, Compass } from 'lucide-react';
import { Card } from '../common';

const RoadmapSection = () => {
  const roadmapItems = [
    { 
      icon: Flag, 
      phase: "2025 Q4: Foundation", 
      title: "Protocol Built & Secured", 
      description: "Smart contracts, security audits, Dubai legal structure." 
    },
    { 
      icon: Target, 
      phase: "2026 Q1: Launch", 
      title: "Mainnet Launch", 
      description: "Launch $AXIS-INDEX and Genesis Investor airdrop campaign." 
    },
    { 
      icon: Rocket, 
      phase: "2026 Q2: Growth", 
      title: "Scale & Integrate", 
      description: "Achieve $1M AUM and secure key partnerships." 
    },
    { 
      icon: Compass, 
      phase: "2026 Q3: Decentralization", 
      title: "Community Governance", 
      description: "Launch $AXIS staking and begin next product development." 
    },
  ];

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Roadmap</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Building the asset management layer for the digital economy.
        </p>
      </div>
      
      <div className="relative max-w-[900px] mx-auto my-4">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent -translate-x-1/2" />
        
        {roadmapItems.map((item, index) => (
          <div key={index} className={`relative w-1/2 px-4 box-border ${index % 2 === 0 ? 'text-right pr-12' : 'left-1/2 pl-12 text-left'} mb-16`}> 
            <motion.div
              className={`absolute top-0 -translate-y-1/2 w-12 h-12 rounded-full bg-gray-800 border-2 border-blue-500 flex items-center justify-center ${index % 2 === 0 ? 'right-[-24px]' : 'left-[-24px]'}`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <item.icon className="w-6 h-6 text-blue-500" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <p className="font-bold text-blue-500 mb-2">{item.phase}</p>
                <h3 className="card-title text-xl mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </Card>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapSection;
