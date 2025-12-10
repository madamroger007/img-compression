'use client';

import React, { useMemo, useState } from 'react';
import { FileListBar } from '@/components/FileListBar';
import { Footer } from '@/components/Footer';
import { GenerateButton } from '@/components/GenerateButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ScanOverlay } from '@/components/ScanOverlay';
import { UploadArea } from '@/components/UploadArea';
import { Toaster, toast } from 'sonner';
import type { UploadedFile } from '@/types/uploads';
import type { ApiResponse, ImageResult, Operation } from '@/types/images';

type AppState = 'idle' | 'loading' | 'uploaded' | 'processing' | 'completed';

const AUTO_DOWNLOAD_DEFAULT =
  process.env.NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT !== 'false';

export default function GeneratorPage() {
  const [state, setState] = useState<AppState>('idle');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [operation, setOperation] = useState<Operation>('compress');
  const [qualityPreset, setQualityPreset] = useState<'high' | 'medium' | 'low'>(
    'high',
  );
  const [quality, setQuality] = useState<number | undefined>(90);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(1200);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(1200);
  const [duplicateCount, setDuplicateCount] = useState(2);
  const [zipOutput, setZipOutput] = useState(true);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoDownload, setAutoDownload] = useState(AUTO_DOWNLOAD_DEFAULT);
  const [showScan, setShowScan] = useState(false);
  const [refinement, setRefinement] = useState(true);

  const hasFiles = files.length > 0;
  const primaryFile = files[0];

  const activeDescription = useMemo(() => {
    switch (operation) {
      case 'compress':
        return 'Compress with smart resizing and high perceived quality.';
      case 'convert-to-png':
        return 'Convert any image to PNG while keeping transparency.';
      case 'duplicate':
        return 'Duplicate the uploaded image multiple times or as a zip.';
      default:
        return '';
    }
  }, [operation]);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setState('loading');
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2, 11),
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
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2, 11),
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setState('uploaded');
  };

  const buildFormData = () => {
    if (!primaryFile) {
      throw new Error('Please upload at least one image first.');
    }
    const form = new FormData();
    form.append('file', primaryFile.file);

    if (operation === 'compress') {
      form.append('preset', qualityPreset);
      if (quality) form.append('quality', String(quality));
      if (maxWidth) form.append('maxWidth', String(maxWidth));
      if (maxHeight) form.append('maxHeight', String(maxHeight));
    }

    // Background removal doesn't need additional form fields
    // All processing is done server-side with local models

    if (operation === 'duplicate') {
      form.append('count', String(duplicateCount));
    }

    return form;
  };

  const endpointForOperation = () => {
    switch (operation) {
      case 'compress':
        return '/api/images/compress';
      case 'convert-to-png':
        return '/api/images/convert-to-png';
      case 'duplicate':
        return `/api/images/duplicate${zipOutput ? '?zip=true' : ''}`;
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setResults([]);

    if (!primaryFile) {
      setError('Upload an image to get started.');
      return;
    }

    setState('processing');
    setShowScan(true);

    try {
      const form = buildFormData();
      const endpoint = endpointForOperation();
      const response = await fetch(endpoint, {
        method: 'POST',
        body: form,
      });

      // Handle JSON response for all operations
      const data: ApiResponse = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Request failed.');
      }

      setResults(data.results || []);
      setState('completed');

      if (autoDownload && data.results) {
        triggerDownloads(data.results);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      setState(hasFiles ? 'uploaded' : 'idle');
    } finally {
      setShowScan(false);
    }
  };

  const triggerDownloads = (items: ImageResult[]) => {
    items.forEach((item) => {
      if (!item.base64) return;
      const blob = base64ToBlob(item.base64, item.mime);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.name || 'image';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
    if (items.length > 0) {
      toast.success('Download started', {
        description: `${items.length} file${items.length > 1 ? 's' : ''} ready.`,
      });
    }
  };

  function base64ToBlob(base64: string, mime: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
      <ScanOverlay show={showScan} />
      <Toaster position="top-right" />

      {state === 'idle' && (
        <div className="flex-1 flex flex-col">
          <UploadArea onFilesSelected={handleFilesSelected} />
          <Footer />
        </div>
      )}

      {(state === 'loading' || (state === 'processing' && !showScan)) && (
        <LoadingScreen />
      )}

      {(state === 'uploaded' || state === 'completed') && (
        <div className="flex-1 flex flex-col pb-40">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-5xl space-y-8">
              <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-xl p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Image tools
                      </p>
                      <h2 className="text-2xl font-semibold text-slate-800">
                        {operation.replace('-', ' ')}
                      </h2>
                      <p className="text-sm text-slate-500">{activeDescription}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <input
                        id="auto-download"
                        type="checkbox"
                        checked={autoDownload}
                        onChange={(e) => setAutoDownload(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <label htmlFor="auto-download" className="text-slate-700">
                        Auto download after generate
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Operation
                      </label>
                      <select
                        value={operation}
                        onChange={(e) => setOperation(e.target.value as Operation)}
                        className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="compress">Compress</option>
                        <option value="convert-to-png">Convert to PNG</option>
                        <option value="duplicate">Duplicate</option>
                      </select>
                    </div>

                    {operation === 'compress' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Quality preset
                          </label>
                          <select
                            value={qualityPreset}
                            onChange={(e) =>
                              setQualityPreset(e.target.value as 'high' | 'medium' | 'low')
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="high">High (near-lossless)</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low / smallest</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Target quality (1-100)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={quality ?? ''}
                            onChange={(e) =>
                              setQuality(
                                e.target.value ? Number(e.target.value) : undefined,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="90"
                          />
                        </div>
                      </>
                    )}

                    {operation === 'duplicate' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Copies (max 20)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={duplicateCount}
                            onChange={(e) =>
                              setDuplicateCount(Math.min(20, Number(e.target.value) || 1))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Zip output
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id="zip-output"
                              type="checkbox"
                              checked={zipOutput}
                              onChange={(e) => setZipOutput(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            <label htmlFor="zip-output" className="text-slate-700">
                              Return a single zip when duplicating
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {(operation === 'compress' || operation === 'convert-to-png') && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Max width (px)
                          </label>
                          <input
                            type="number"
                            value={maxWidth ?? ''}
                            onChange={(e) =>
                              setMaxWidth(
                                e.target.value ? Number(e.target.value) : undefined,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="1200"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Max height (px)
                          </label>
                          <input
                            type="number"
                            value={maxHeight ?? ''}
                            onChange={(e) =>
                              setMaxHeight(
                                e.target.value ? Number(e.target.value) : undefined,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="1200"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-end">
                      <GenerateButton
                        onClick={handleGenerate}
                        isLoading={showScan}
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 min-h-[360px] flex items-center justify-center shadow-inner p-6">
                {state === 'completed' && results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {results.map((item) => (
                      <div
                        key={item.name}
                        className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(item.size / 1024).toFixed(1)} KB · {item.mime}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              item.base64 && triggerDownloads([item])
                            }
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Download
                          </button>
                        </div>
                        {item.mime.startsWith('image/') && item.base64 ? (
                          <img
                            src={`data:${item.mime};base64,${item.base64}`}
                            alt={item.name}
                            className="w-full h-64 object-contain bg-slate-50"
                          />
                        ) : (
                          <div className="h-64 flex items-center justify-center text-slate-500 text-sm bg-slate-50">
                            {item.mime === 'application/zip'
                              ? 'ZIP file ready to download'
                              : 'Preview not available'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 space-y-2">
                    <p className="text-lg font-semibold text-slate-700">
                      Results will appear here
                    </p>
                    <p className="text-sm">
                      Choose a tool and click Generate to process your image.
                    </p>
                    {!hasFiles && (
                      <p className="text-xs text-slate-400">
                        (Upload an image to begin.)
                      </p>
                    )}
                  </div>
                )}
              </div>
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

