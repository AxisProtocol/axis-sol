// VisionVideoSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const YOUTUBE_VIDEO_ID = 'hqJHbJSB55Y';
const YOUTUBE_THUMBNAIL_URL = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`;

// animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const VisionVideoSection: React.FC = () => {
  const [showVideo, setShowVideo] = React.useState(false);

  return (
    <motion.section
      // ★ 背景は透明 / 余白は広く / ほぼフルスクリーン
      className="text-white py-24 lg:py-36 min-h-[90vh]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {/* ★ コンテンツ幅を増やし、左右マージンをやや薄めに */}
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-16 xl:gap-24">
          {/* 左: テキスト（大きく） */}
          <div className="lg:col-span-5">
            {/* overline: ボタンっぽさを完全排除 */}
            <motion.span
              className="block text-xs tracking-[0.18em] uppercase text-white/50 mb-4"
              variants={itemVariants}
            >
              Why Axis
            </motion.span>

            <motion.h2
              className="text-[clamp(4rem,14vw,7rem)]  leading-[1.05] mb-6"
              variants={itemVariants}
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Our Mission
            </motion.h2>

            <motion.p
              className="text-[clamp(1.05rem,2.2vw,1.25rem)] text-white/70 leading-relaxed max-w-[48ch] mb-10"
              variants={itemVariants}
            >
              Hear directly from our founder on why Axis is building the future of the crypto economy.
            </motion.p>

            {/* CTAは任意：テキストリンク風（ボタンに見せない） */}
            <motion.button
              onClick={() => setShowVideo(true)}
              className="group inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors"
              variants={itemVariants}
            >
              <span className="text-base font-semibold">Watch the pitch</span>
              <span className="grid place-items-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <Play className="w-5 h-5" />
              </span>
            </motion.button>
          </div>

          {/* 右: 動画（大きく・ほぼヒーローサイズ） */}
          <div className="lg:col-span-7">
            <motion.div
              className="
                relative w-full aspect-video
                rounded-2xl overflow-hidden
                shadow-[0_30px_120px_rgba(0,0,0,0.45)]
                ring-1 ring-white/10
                cursor-pointer
              "
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowVideo(true)}
            >
              {showVideo ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
                  title="Axis Protocol Pitch"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${YOUTUBE_THUMBNAIL_URL})` }}
                  aria-label="Axis Protocol Pitch thumbnail"
                />
              )}

              {/* 再生オーバーレイ（常時中央 / 大きめ） */}
              {!showVideo && (
                <div className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors grid place-items-center">
                  <div className="flex items-center gap-4">
                    <span className="grid place-items-center w-20 h-20 rounded-full bg-black/60 ring-1 ring-white/20">
                      <Play className="w-9 h-9 text-white" />
                    </span>
                    <span className="hidden md:block text-white/90 text-lg font-semibold">
                      Click to play
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default VisionVideoSection;
