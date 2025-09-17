'use client';

import { motion, Variants } from 'framer-motion';

interface MarketEvent {
  event_date: string;
  title: string;
  description: string;
}

interface EventTimelineProps {
  events: MarketEvent[];
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
};

export default function EventTimeline({ events }: EventTimelineProps) {
  return (
    <motion.div 
      className="w-full mb-12"
      variants={sectionVariants} 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="text-2xl md:text-3xl mb-6 border-l-4 border-blue-500 pl-4 text-white">Event Timeline</h2>
      
      <div className="space-y-8">
        {events.map((event, index) => (
          <div key={event.title} className="flex flex-col md:flex-row gap-3 md:gap-6 border-l-2 border-gray-700 pl-4 md:pl-6 relative">
            <div className="absolute left-[-7px] top-[5px] w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-900 shadow-lg"></div>
            
            <div className="font-semibold text-gray-400 min-w-[130px] pt-1">
              {new Date(event.event_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-lg md:text-xl font-semibold m-0 mb-2 text-white">
                {event.title}
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed m-0">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
