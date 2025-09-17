'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, Button } from '../common';

const TeamSection = () => {
  const teamMembers = [
    { 
      name: "Yusuke Kikuta", 
      role: "Founder", 
      bio: "Self-taught engineer with 13-year music career background. Built successful freelance blockchain development career. Obsessive focus and resilience are our competitive advantages.", 
      image: "/muse.jpg", 
      link: "https://x.com/muse_0509", 
      isSuperTeam: true 
    },
  ];

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Founder</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Early-stage investing is a bet on the founder. I will out-learn, out-build, and out-execute any competitor.
        </p>
      </div>
      
      <div className="flex justify-center gap-12 flex-wrap">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            className="w-80"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <Card className="text-center">
              <div className="avatar mb-6">
                <div className="w-32 h-32 rounded-full relative">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    width={128} 
                    height={128} 
                    className="rounded-full object-cover" 
                  />
                  {member.isSuperTeam && (
                    <div className="absolute -bottom-2 -right-2">
                      <Image 
                        src="/superteam.png" 
                        alt="SuperTeam Badge" 
                        width={48} 
                        height={48} 
                        className="rounded-full bg-gray-800 p-1" 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="card-title text-xl mb-1">{member.name}</h3>
              <p className="text-blue-500 mb-4">{member.role}</p>
              <p className="text-gray-400 leading-relaxed text-sm">{member.bio}</p>
              
              <div className="card-actions justify-center mt-6">
                <Button 
                  href={member.link} 
                  variant="outline"
                  size="sm"
                  external
                >
                  X account
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
