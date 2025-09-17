import React from 'react';
import { FaGithub, FaXTwitter } from 'react-icons/fa6'; // ★★★ Xのアイコンをインポート ★★★
import { FaTelegramPlane } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="relative w-full z-[100] backdrop-blur-md border-t border-white/10">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center p-4 px-8 flex-wrap gap-4 md:flex-row md:justify-between md:items-center md:gap-4 md:p-3 md:px-4">
        <p className="text-gray-400 text-sm m-0">
          © {new Date().getFullYear()} Axis Protocol. All rights reserved.
        </p>
        <div className="flex gap-6">
        <a href="https://github.com/AxisProtocol/axis-sol" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-400 text-xl transition-all duration-300 hover:text-white hover:scale-110">
        <FaGithub />
        </a>

          <a href="https://x.com/axis__Solana" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-gray-400 text-xl transition-all duration-300 hover:text-white hover:scale-110">
            <FaXTwitter />
          </a>
          <a href="https://t.me/+17f3f2qcJFMxYzE1" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-gray-400 text-xl transition-all duration-300 hover:text-white hover:scale-110">
            <FaTelegramPlane />
          </a>
        </div>
      </div>
    </footer>
  );
};