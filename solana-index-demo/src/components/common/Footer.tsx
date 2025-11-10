// src/components/common/Footer.tsx
'use client';

import React from 'react';
import { Twitter, Github, Send } from 'lucide-react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="container mx-auto max-w-6xl px-4 py-16">
        {/* --- 上段: ロゴとサイトマップ --- */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          {/* 左側: ロゴとスローガン */}
          <div className="w-full md:w-1/3">
            <a href="/" className="inline-block mb-4">
            <Image
                  src="/logo.png"
                  alt="Axis Protocol Logo"
                  width={60}
                  height={60}
                  className="w-16 h-16 lg:w-[190px] lg:h-[170px]"
                  priority
                />
            </a>
            <p className="text-gray-400 max-w-xs text-sm leading-relaxed">
              Let&apos;s build the future of the crypto economy together.
            </p>
          </div>

          {/* 右側: サイトマップリンク */}
          <nav className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Protocol</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#core-engine" className="text-gray-400 hover:text-white transition-colors">
                    Core Engine
                  </a>
                </li>
                <li>
                  <a href="#index-overview" className="text-gray-400 hover:text-white transition-colors">
                    Methodology
                  </a>
                </li>
                <li>
                  <a href="#ecosystem" className="text-gray-400 hover:text-white transition-colors">
                    Supporters
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Community</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://discord.com/invite/PTGVdd5KZQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/Axis_Solana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Twitter (X)
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#vision-video" className="text-gray-400 hover:text-white transition-colors">
                    Watch Pitch
                  </a>
                </li>
                <li>
                  <a
                    href="https://muse-7.gitbook.io/axiswhitepaper/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Docs (GitBook)
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/AxisProtocol/axis-sol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* --- 下段: コピーライトとソーシャル --- */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* 左側: コピーライトと免責事項 */}
          <div className="text-sm text-gray-500 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Axis Protocol. All rights reserved.</span>
            <span className="mx-2">|</span>
            <a href="/disclaimer" className="hover:text-gray-300 transition-colors">
              Disclaimer
            </a>
          </div>

          {/* 右側: ソーシャルアイコン */}
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/Axis_Solana"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://t.me/muse_jp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <Send className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/AxisProtocol/axis-sol"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
