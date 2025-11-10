// pages/index.tsx
'use client';
import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

import { Header } from '../components/common';
import { Modal } from '../components/modals/Modal';
import Footer  from '../components/common/Footer';

// ★ セクションは遅延読み込み
const HeroSection = dynamic(() => import('../components/sections').then(m => m.HeroSection), { ssr: false });
const CoreEngineSection = dynamic(() => import('../components/sections').then(m => m.CoreEngineSection), { ssr: false });
const IndexOverviewSection = dynamic(() => import('../components/sections').then(m => m.IndexOverviewSection), { ssr: false });
const VisionVideoSection = dynamic(() => import('../components/sections').then(m => m.VisionVideoSection), { ssr: false });
const EcosystemSection = dynamic(() => import('../components/sections').then(m => m.EcosystemSection), { ssr: false });
const MethodologySection = dynamic(() => import('../components/sections').then(m => m.MethodologySection), { ssr: false });

// ★ Waitlist をクライアント専用で動的読込（必須）
const WaitlistForm = dynamic(
  () => import('../components/waitlist/WaitlistForm').then(m => m.default),
  { ssr: false }
);
// ↑ パスはあなたの配置に合わせてください
// 例）../components/overlays/WaitlistForm など

// Section ラッパ
const Section: React.FC<React.PropsWithChildren<{ id?: string; className?: string }>> = ({ id, className, children }) => (
  <section id={id} className={`cv-auto ${className ?? ''}`}>
    {children}
  </section>
);

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

  useEffect(() => {
    const seen = sessionStorage.getItem('hasSeenIntro');
    if (seen) { setIsLoading(false); return; }
    let i = 0;
    const t = setInterval(() => {
      if (i < fullText.length) { setTypewriterText(fullText.slice(0, i + 1)); i++; }
      else { clearInterval(t); setTimeout(() => { setIsLoading(false); sessionStorage.setItem('hasSeenIntro','true'); }, 200); }
    }, 40);
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
          <div
            onClick={() => { setIsLoading(false); sessionStorage.setItem('hasSeenIntro', 'true'); }}
            className="cursor-pointer"
          >
            <div className="cv-auto"><div className="cv-auto" /></div>
          </div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <div className="relative min-h-screen text-white">
          <Header />

          <main className="relative z-10 min-h-screen">
            <HeroSection />

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

          {/* ★ ここで1回だけマウント（Portalで body 直下に出るので場所はどこでもOK） */}
          <WaitlistForm />
        </div>
      )}
    </>
  );
};

export default AxisLandingPage;
