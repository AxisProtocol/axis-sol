'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users } from 'lucide-react';
import { Card } from '../common';

const TractionSection = () => (
  <div>
    <div className="text-center mb-16">
      <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Traction</h2>
      <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
        Ecosystem-validated vision with growing community support.
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -30 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true, amount: 0.5 }} 
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <Card>
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500/20 text-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <h3 className="card-title text-xl mb-4 text-center">Ecosystem Support</h3>
          <p className="text-gray-300 text-center">
            Backed by core Solana teams including Backpack, Webacy, and MagicBlock.
          </p>
        </Card>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 30 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true, amount: 0.5 }} 
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <Card>
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500/20 text-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="card-title text-xl mb-4 text-center">Growing Community</h3>
          <p className="text-gray-300 text-center">
            100+ early supporters believing in stable, transparent on-chain investing.
          </p>
        </Card>
      </motion.div>
    </div>
  </div>
);

export default TractionSection;
