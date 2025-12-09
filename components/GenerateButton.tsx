'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function GenerateButton({ onClick, isLoading }: GenerateButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isLoading}
      className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {/* Animated background shimmer */}
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin relative z-10" />
      ) : (
        <Sparkles className="w-6 h-6 relative z-10" />
      )}
      <span className="relative z-10">
        {isLoading ? 'Generating...' : 'Generate Image'}
      </span>

      {/* Pulsing glow effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl -z-10"
      />
    </motion.button>
  );
}
