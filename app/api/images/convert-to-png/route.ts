import { NextResponse } from 'next/server';
import { convertToPng, ensureSupportedMime } from '@/lib/imageProcessor';
import { parseImageFormData } from '@/lib/formData';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { file } = await parseImageFormData(request);
    ensureSupportedMime(file.mime);

    const result = await convertToPng({
      buffer: file.buffer,
      filename: file.filename,
      mime: file.mime,
    });

    return NextResponse.json({
      results: [
        {
          name: result.name,
          mime: result.mime,
          size: result.size,
          base64: result.base64,
        },
      ],
      meta: { format: 'png' },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof NextResponse) return error;
  const message = error instanceof Error ? error.message : 'PNG conversion failed.';
  return NextResponse.json({ error: message }, { status: 500 });
}

