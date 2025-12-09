'use client';

import React, { useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { UploadedFile } from '@/types/uploads';

interface FileListBarProps {
  files: UploadedFile[];
  onDelete: (id: string) => void;
  onAddMore: (files: File[]) => void;
}

export function FileListBar({ files, onDelete, onAddMore }: FileListBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (selectedFiles.length > 0) {
      onAddMore(selectedFiles);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <AnimatePresence mode="popLayout">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex-shrink-0"
                onMouseEnter={() => setHoveredId(file.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="w-28 h-28 rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 hover:border-purple-400 transition-all duration-300">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <AnimatePresence>
                  {hoveredId === file.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center cursor-pointer"
                      onClick={() => onDelete(file.id)}
                    >
                      <Trash2 className="w-8 h-8 text-white hover:text-red-400 transition-colors" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add More Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddMoreClick}
            className="flex-shrink-0 w-28 h-28 rounded-xl border-4 border-dashed border-slate-300 hover:border-purple-500 bg-slate-50 hover:bg-purple-50 flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-8 h-8 text-slate-400" />
            <span className="text-slate-600">Add More</span>
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </motion.div>
  );
}
