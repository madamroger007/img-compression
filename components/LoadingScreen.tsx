'use client';

import { motion } from 'motion/react';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center p-8"
    >
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="w-32 h-32 rounded-full border-8 border-slate-200 border-t-blue-500 border-r-purple-500"
        />

        {/* Inner pulsing circle */}
        <motion.div
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <h2 className="text-slate-700 mb-2">Processing your images...</h2>
        <p className="text-slate-500">This will only take a moment</p>
      </motion.div>

      {/* Animated dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
          />
        ))}
      </div>
    </motion.div>
  );
}
