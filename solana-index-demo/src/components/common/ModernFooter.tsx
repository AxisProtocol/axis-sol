'use client';

import { motion } from 'framer-motion';

const ModernFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-gray-700/30 bg-black/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bottom Bar */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center space-x-4">
            <span>© {currentYear} Axis Index</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Built on Solana</span>
          </div>
          
          {/* Whitepaper Button */}
          <motion.a
            href="#"
            className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-all duration-200"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="text-lg">📚</span>
            <span className="text-sm">Whitepaper</span>
          </motion.a>
        </motion.div>
      </div>
    </footer>
  );
};

export default ModernFooter;
