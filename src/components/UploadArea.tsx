import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
}

export function UploadArea({ onFilesSelected }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (droppedFiles.length > 0) {
      onFilesSelected(droppedFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative w-full min-h-[500px] flex flex-col items-center justify-center
            border-4 border-dashed rounded-3xl cursor-pointer
            transition-all duration-300 ease-in-out
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 shadow-2xl scale-[1.02]'
                : 'border-slate-300 bg-white/50 shadow-xl hover:border-purple-400 hover:bg-white/70 hover:shadow-2xl'
            }
          `}
        >
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div
              className={`
              p-8 rounded-full mb-8
              transition-all duration-300
              ${
                isDragging
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                  : 'bg-gradient-to-br from-blue-400 to-purple-500'
              }
            `}
            >
              <Upload
                className={`w-24 h-24 text-white transition-transform duration-300 ${
                  isDragging ? 'animate-bounce' : ''
                }`}
              />
            </div>

            <h2
              className={`mb-4 transition-colors duration-300 ${
                isDragging ? 'text-blue-600' : 'text-slate-700'
              }`}
            >
              Drag & Drop your images here
            </h2>

            <p className="text-slate-500 mb-8">or click to upload</p>

            <div className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              Choose Files
            </div>
          </motion.div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </motion.div>
    </div>
  );
}
