'use client';
import React from 'react';
import { Mail, Send } from 'lucide-react';
import { Button, Card } from '../common';

const CalendlySection = () => (
  <div className="py-24 px-6 bg-gray-900 text-white">
    <div className="w-full max-w-[1100px] mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Learn More</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Schedule a call to discuss our vision and angel round.
        </p>
      </div>
      
      <Card className="p-0">
        <div
          className="h-[700px] rounded-xl overflow-hidden"
          dangerouslySetInnerHTML={{
            __html: `<iframe
                src="https://calendly.com/yusukekikuta-05/axis-pitch"
                width="100%"
                height="100%"
                frameborder="0"
              ></iframe>`
          }}
        />
      </Card>
      
      <div className="flex gap-6 justify-center mt-8 flex-wrap">
        <Button 
          href="mailto:yusukekikuta.05@gmail.com" 
          variant="outline"
          className="gap-2"
          external
        >
          <Mail size={18} /> yusukekikuta.05@gmail.com
        </Button>
        <Button 
          href="https://t.me/yus0509" 
          variant="outline"
          className="gap-2"
          external
        >
          <Send size={18} /> @yus0509 on Telegram
        </Button>
      </div>
    </div>
  </div>
);

export default CalendlySection;
