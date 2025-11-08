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
  IndexOverviewSection,
  MethodologySection,
  LoadingScreen,
  VisionVideoSection,
  CoreEngineSection
} from '../components/sections';

/* ====== TurtleLayer（1匹＋“確実に見える”デバッグ版） ====== */
const TurtleLayer: React.FC = () => {
  // デバッグ用: まずは確実に目視できる強めの表示に。
  const DEBUG = true; // ← 見えたら false にしてトーンを落とす

  return (
    <>
      <style jsx global>{`
        @keyframes turtle-swim-line {
          from { transform: translate3d(-30vw, 0, 0); }
          to   { transform: translate3d(130vw, 0, 0); }
        }
        @keyframes turtle-bob {
          0% { transform: translateY(0) }
          25% { transform: translateY(-10px) }
          50% { transform: translateY(4px) }
          75% { transform: translateY(-6px) }
          100% { transform: translateY(0) }
        }
        @keyframes turtle-roll {
          0% { transform: rotate(-3deg) }
          50% { transform: rotate(3deg) }
          100% { transform: rotate(-3deg) }
        }
        @media (prefers-reduced-motion: reduce) {
          .turtle-fixed, .turtle-img { animation: none !important; }
        }
      `}</style>

      <div
        className="pointer-events-none fixed left-0 turtle-fixed"
        style={{
          // まずは画面中央付近を横断させて“確実に視界”に入れる
          top: '50vh',
          transform: 'translateY(-50%)',
          height: 360,
          width: 360 * 1.6,
          // いったん最前面で確認（見えたら 5〜8 に下げて main の背面へ）
          zIndex: 2147483000,
          // 超ゆっくり。180〜240s 推奨
          animation: `turtle-swim-line 180s linear 0s infinite`,
        }}
      >
        <img
          src="/turtle.png" // ← public/turtle.png 前提。拡張子違いなら合わせてください
          alt=""
          className="turtle-img"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            // ★ デバッグのため派手に見せる（見えたら下の“仕上げ値”に変更）
            opacity: DEBUG ? 0.85 : 0.10,
            // 黒背景に黒い亀なので“明るく+スクリーン合成”で必ず視認
            filter: DEBUG
              ? 'brightness(2.2) contrast(0.9) drop-shadow(0 0 12px rgba(255,255,255,0.35))'
              : 'grayscale(1) brightness(1.4) contrast(0.9) drop-shadow(0 0 8px rgba(255,255,255,0.12))',
            mixBlendMode: DEBUG ? 'screen' : 'screen',
            animation: `turtle-bob 16s ease-in-out 0.8s infinite, turtle-roll 22s ease-in-out 1.6s infinite`,
          }}
          // 画像ロード確認（DevTools コンソールに出ます）
          onLoad={() => console.info('[turtle] loaded')}
          onError={(e) => console.error('[turtle] image load error', (e as any).currentTarget?.src)}
        />
        {/* デバッグ用の枠線（不要なら削除） */}
        {DEBUG && (
          <div style={{position:'absolute',inset:0,border:'1px dashed rgba(0,200,255,.6)',borderRadius:8}}/>
        )}
      </div>
    </>
  );
};
/* ====== /TurtleLayer ====== */

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

  const fullText = "Let's build the future of the crypto economy, together.";

  const sections = [
    { id: 'hero', component: HeroSection },
    { id: 'core-engine', component: CoreEngineSection },
    { id: 'index-overview', component: IndexOverviewSection },
    { id: 'vision-video', component: VisionVideoSection },
    { id: 'methodology', component: MethodologySection },
  ];

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
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
  }, []);

  const skipIntro = () => {
    setIsLoading(false);
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  useEffect(() => {
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) return;
    let rafId = 0;
    let lastX = 0;
    let lastY = 0;
    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: lastX, y: lastY });
        rafId = 0;
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove as any);
      if (rafId) cancelAnimationFrame(rafId);
    };
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
        <div
          className="relative bg-black text-white min-h-screen overflow-y-auto overscroll-y-contain"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', scrollBehavior: 'smooth' }}
        >
          <Header />
          <Background mouseX={mousePosition.x} mouseY={mousePosition.y} />

          {/* まずは“絶対に見える”よう最前面で確認 → 見えたら zIndex を下げる */}
          <TurtleLayer />

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
