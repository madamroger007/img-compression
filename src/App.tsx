import { useState } from 'react';
import { UploadArea } from './components/UploadArea';
import { LoadingScreen } from './components/LoadingScreen';
import { FileListBar } from './components/FileListBar';
import { Footer } from './components/Footer';
import { GenerateButton } from './components/GenerateButton';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

type AppState = 'idle' | 'loading' | 'uploaded' | 'processing' | 'completed';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setState('loading');

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setState('uploaded');
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      if (updated.length === 0) {
        setState('idle');
      }
      return updated;
    });
  };

  const handleAddMore = async (selectedFiles: File[]) => {
    setState('loading');

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setState('uploaded');
  };

  const handleGenerate = async () => {
    setState('processing');

    // Simulate image processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setState('completed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
      {state === 'idle' && (
        <div className="flex-1 flex flex-col">
          <UploadArea onFilesSelected={handleFilesSelected} />
          <Footer />
        </div>
      )}

      {(state === 'loading' || state === 'processing') && <LoadingScreen />}

      {(state === 'uploaded' || state === 'completed') && (
        <div className="flex-1 flex flex-col pb-40">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              {state === 'uploaded' && (
                <>
                  <h2 className="text-slate-700 mb-4">
                    Your images are ready for processing
                  </h2>
                  <p className="text-slate-500 mb-8">
                    Review your images below and click Generate to start processing
                  </p>
                  <GenerateButton onClick={handleGenerate} />
                </>
              )}
              {state === 'completed' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-slate-700 mb-4">
                    Processing Complete!
                  </h2>
                  <p className="text-slate-500 mb-8">
                    Your images have been successfully processed
                  </p>
                  <button
                    onClick={() => handleGenerate()}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Process Again
                  </button>
                </>
              )}
            </div>
          </div>
          <FileListBar
            files={files}
            onDelete={handleDeleteFile}
            onAddMore={handleAddMore}
          />
          <Footer />
        </div>
      )}
    </div>
  );
}