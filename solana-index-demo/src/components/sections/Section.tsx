'use client';
import React from 'react';
import { motion } from 'framer-motion';

type SectionProps = {
  children: React.ReactNode;
  id?: string;
  /** これを true にすると画面端まで広げる（Hero 用） */
  fullBleed?: boolean;
  /** セクション自体に追加したいクラス（任意） */
  className?: string;
  /** 内側コンテナ（テキスト側）の追加クラス（任意） */
  containerClassName?: string;
};

const Section: React.FC<SectionProps> = ({
  children,
  id,
  fullBleed = false,
  className = '',
  containerClassName = '',
}) => {
  // フルブリード：セクション自体を画面左右端までブレイクアウト
  if (fullBleed) {
    return (
      <section
        id={id}
        className={`relative w-screen min-h-screen flex items-center py-32 ${className}`}
        // ブレイクアウト（親が中央寄せでも強制的に全幅）
        style={{ left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          // 中身だけ幅制限
          className={`w-full max-w-[1200px] mx-auto px-6 md:px-10 ${containerClassName}`}
        >
          {children}
        </motion.div>
      </section>
    );
  }

  // 既存（コンテナ幅）レイアウト
  return (
    <section
      id={id}
      className={`w-full min-h-screen flex justify-center items-center py-32 px-6 relative ${className}`}
      style={{ minHeight: '100vh' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`w-full max-w-[1200px] ${containerClassName}`}
      >
        {children}
      </motion.div>
    </section>
  );
};

export default Section;
