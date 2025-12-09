'use client';

import { motion } from 'motion/react';
import { Loader2, Scan } from 'lucide-react';

interface ScanOverlayProps {
  show: boolean;
  message?: string;
}

export function ScanOverlay({ show, message }: ScanOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent" />
        <div className="relative p-8 flex flex-col items-center gap-6">
          <div className="relative w-40 h-40 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden shadow-xl">
            <div className="absolute inset-0 flex items-center justify-center text-blue-500">
              <Scan className="w-16 h-16" />
            </div>
            <motion.div
              className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-blue-500/25 to-transparent"
              initial={{ y: -80 }}
              animate={{ y: 200 }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-6 rounded-xl border border-dashed border-slate-300"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <div className="text-lg font-semibold">Scanning image...</div>
          </div>
          <p className="text-sm text-slate-500 text-center max-w-md">
            {message || 'Hold tight while we process your image with the selected tool.'}
          </p>
        </div>
      </div>
    </div>
  );
}

