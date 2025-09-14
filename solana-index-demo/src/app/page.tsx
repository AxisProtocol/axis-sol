'use client';
import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { AnimatePresence } from 'framer-motion';
// Components
import { Header, Background, Button, Card } from '../components/common';
import { Modal } from '../components/modals/Modal';
import { Footer } from '../components/common/Footer';
import {
  Section,
  HeroSection,
  WhyWinSection,
  ProductSection,
  TractionSection,
  StatsSection,
  RoadmapSection,
  TeamSection,
  WaitlistSection,
  CalendlySection,
  LoadingScreen
} from '../components/sections';

const AxisLandingPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [typewriterText, setTypewriterText] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    type: 'success' as 'success' | 'error', 
    title: '', 
    message: '' 
  });

  const fullText = "Because markets can't grow up without a good guide.";

  const sections = [
    { id: 'hero', component: HeroSection },
    { id: 'why-win', component: WhyWinSection },
    { id: 'product', component: ProductSection },
  ];

  useEffect(() => {
    // Check if user has seen the intro before
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    
    if (hasSeenIntro) {
      // Skip loading screen if user has seen it before
      setIsLoading(false);
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypewriterText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setIsLoading(false);
          sessionStorage.setItem('hasSeenIntro', 'true');
        }, 1000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []); // Remove fullText dependency to prevent re-running

  // Function to skip the intro
  const skipIntro = () => {
    setIsLoading(false);
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
      
      <AnimatePresence>
        {isLoading && (
          <div onClick={skipIntro} className="cursor-pointer">
            <LoadingScreen typewriterText={typewriterText} />
          </div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <div className="relative bg-black text-white min-h-screen">
          <Header />
          <Background mouseX={mousePosition.x} mouseY={mousePosition.y} />

          <main className="w-full relative z-10 min-h-screen">
            {sections.map((section) => (
              <Section key={section.id} id={section.id}>
                <section.component />
              </Section>
            ))}
          </main>
          
          <Footer />
        </div>
      )}
    </>
  );
};

export default AxisLandingPage;