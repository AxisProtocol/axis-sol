'use client';
import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { AnimatePresence } from 'framer-motion';

import { Header } from '../components/common';
import { Modal } from '../components/modals/Modal';
import Footer  from '../components/common/Footer';
import {
  Section,
  HeroSection,
  IndexOverviewSection,
  MethodologySection,
  LoadingScreen,
  VisionVideoSection,
  EcosystemSection,
  CoreEngineSection
} from '../components/sections';

const AxisLandingPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [typewriterText, setTypewriterText] = useState('');
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  const fullText = "Let's build the future of the crypto economy, together.";

  const sections = [
    { id: 'hero', component: HeroSection },
    { id: 'core-engine', component: CoreEngineSection },
    { id: 'index-overview', component: IndexOverviewSection },
    { id: 'vision-video', component: VisionVideoSection },
    { id: 'ecosystem', component: EcosystemSection },
    { id: 'methodology', component: MethodologySection },
  ];

  useEffect(() => {
    const seen = sessionStorage.getItem('hasSeenIntro');
    if (seen) { setIsLoading(false); return; }
    let i = 0;
    const t = setInterval(() => {
      if (i < fullText.length) { setTypewriterText(fullText.slice(0, i + 1)); i++; }
      else { clearInterval(t); setTimeout(() => { setIsLoading(false); sessionStorage.setItem('hasSeenIntro','true'); }, 1000); }
    }, 100);
    return () => clearInterval(t);
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
          <div onClick={() => { setIsLoading(false); sessionStorage.setItem('hasSeenIntro', 'true'); }} className="cursor-pointer">
            <LoadingScreen typewriterText={typewriterText} />
          </div>
        )}
      </AnimatePresence>

      {!isLoading && (
        // 背景は globals.css に定義済み。ここでは重なり順を素直に。
        <div
          className="relative min-h-screen text-white overflow-y-auto overscroll-y-contain"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', scrollBehavior: 'smooth' }}
        >
          <Header />

          <main className="relative z-10 min-h-screen">
            {/* ✅ Hero は単独でフルブリード表示 */}
            <HeroSection />

            {/* 以降だけ Section ラッパを使う */}
            <Section id="core-engine">
              <CoreEngineSection />
            </Section>

            <Section id="index-overview">
              <IndexOverviewSection />
            </Section>

            <Section id="vision-video">
              <VisionVideoSection />
            </Section>
            <Section id="ecosystem">
              <EcosystemSection />
            </Section>

            <Section id="methodology">
              <MethodologySection />
            </Section>
          </main>

          <Footer />
        </div>
      )}
    </>
  );
};

export default AxisLandingPage;
