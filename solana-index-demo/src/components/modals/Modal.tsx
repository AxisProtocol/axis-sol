import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export const Modal = ({ isOpen, onClose, type, title, message }: ModalProps) => {
  // 状態に応じてアイコンと色を決定
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';

  return (
    <AnimatePresence>
      {isOpen && (
        // オーバーレイ（背景の黒い部分）
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[2000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* モーダル本体 */}
          <motion.div
            className="bg-white/10 border border-white/10 rounded-2xl p-10 w-[90%] max-w-[450px] relative text-center"
            onClick={(e) => e.stopPropagation()} // モーダル内クリックで閉じないように
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button className="absolute top-4 right-4 bg-none border-none text-gray-400 cursor-pointer hover:text-white transition-colors" onClick={onClose}><X /></button>
            <div className="mb-6">
                <Icon className={`stroke-[1.5] ${iconColor}`} size={48} />
            </div>
            <h3 className="text-3xl font-semibold m-0 mb-2 text-white">{title}</h3>
            <p className="text-gray-300 leading-relaxed">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};