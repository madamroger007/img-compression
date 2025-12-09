import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import {
  bufferToBase64,
  ensureSupportedMime,
  ProcessedImage,
} from '@/lib/imageProcessor';
import { getNumberFromFormData, parseImageFormData } from '@/lib/formData';

export const runtime = 'nodejs';

const MAX_DUPLICATES = 20;

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const zipOutput = url.searchParams.get('zip') === 'true';

    const { file, formData } = await parseImageFormData(request);
    ensureSupportedMime(file.mime);

    const count = Math.min(
      getNumberFromFormData(formData, 'count') ?? 1,
      MAX_DUPLICATES,
    );

    const processed: ProcessedImage = {
      name: file.filename,
      mime: file.mime,
      size: file.size,
      buffer: file.buffer,
      base64: bufferToBase64(file.buffer),
    };

    const duplicates = Array.from({ length: count }).map((_, idx) => ({
      ...processed,
      name: appendSuffix(processed.name, idx + 1),
    }));

    if (zipOutput && count > 1) {
      const zip = new JSZip();
      duplicates.forEach((item) => {
        zip.file(item.name, item.buffer);
      });
      const zipped = await zip.generateAsync({ type: 'nodebuffer' });
      return NextResponse.json({
        results: [
          {
            name: 'images.zip',
            mime: 'application/zip',
            size: zipped.length,
            base64: bufferToBase64(zipped),
          },
        ],
        meta: { count, zipped: true },
      });
    }

    return NextResponse.json({
      results: duplicates.map((item) => ({
        name: item.name,
        mime: item.mime,
        size: item.size,
        base64: item.base64,
      })),
      meta: { count, zipped: false },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function appendSuffix(filename: string, index: number) {
  const [name, ...rest] = filename.split('.');
  const ext = rest.pop();
  const suffix = `${name}-copy-${index}`;
  return ext ? `${suffix}.${ext}` : suffix;
}

function toErrorResponse(error: unknown) {
  if (error instanceof NextResponse) return error;
  const message = error instanceof Error ? error.message : 'Duplication failed.';
  return NextResponse.json({ error: message }, { status: 500 });
}

