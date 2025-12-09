import { NextResponse } from 'next/server';
import {
    compressImage,
    ensureSupportedMime,
    type QualityPreset,
} from '@/lib/imageProcessor';
import { getNumberFromFormData, parseImageFormData } from '@/lib/formData';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const { file, formData } = await parseImageFormData(request);
        ensureSupportedMime(file.mime);

        const quality = getNumberFromFormData(formData, 'quality');
        const maxWidth = getNumberFromFormData(formData, 'maxWidth');
        const maxHeight = getNumberFromFormData(formData, 'maxHeight');
        const preset = (formData.get('preset') as QualityPreset) || undefined;
        const format =
            (formData.get('format') as 'jpeg' | 'webp' | 'png' | null) || undefined;

        const result = await compressImage(
            {
                buffer: file.buffer,
                filename: file.filename,
                mime: file.mime,
            },
            { quality, preset, maxWidth, maxHeight, format },
        );

        return NextResponse.json({
            results: [
                {
                    name: result.name,
                    mime: result.mime,
                    size: result.size,
                    base64: result.base64,
                },
            ],
            meta: {
                preset: preset ?? 'custom',
                quality: quality ?? 'auto',
                maxWidth: maxWidth ?? null,
                maxHeight: maxHeight ?? null,
                format: format ?? 'jpeg',
            },
        });
    } catch (error) {
        return toErrorResponse(error);
    }
}

function toErrorResponse(error: unknown) {
    if (error instanceof NextResponse) return error;
    const message = error instanceof Error ? error.message : 'Compression failed.';
    return NextResponse.json({ error: message }, { status: 500 });
}

