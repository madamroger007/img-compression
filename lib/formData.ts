import { NextResponse } from 'next/server';

export interface ParsedImageFile {
    buffer: Buffer;
    filename: string;
    mime: string;
    size: number;
}

export interface FormParseOptions {
    maxSizeBytes?: number;
}

const DEFAULT_MAX_SIZE = 15 * 1024 * 1024; // 15MB

export async function parseImageFormData(
    request: Request,
    options: FormParseOptions = {},
): Promise<{ file: ParsedImageFile; formData: FormData }> {
    const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_SIZE;
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
        throw NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
    }

    const filename = sanitizeFilename(file.name || 'upload');
    const mime = file.type || 'application/octet-stream';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > maxSize) {
        throw NextResponse.json(
            {
                error: `File is too large. Limit is ${Math.round(maxSize / (1024 * 1024))}MB.`,
            },
            { status: 413 },
        );
    }

    return {
        file: { buffer, filename, mime, size: buffer.length },
        formData,
    };
}

export function getNumberFromFormData(
    formData: FormData,
    key: string,
): number | undefined {
    const value = formData.get(key);
    if (value === null) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
}

export function getBooleanFromFormData(
    formData: FormData,
    key: string,
): boolean | undefined {
    const value = formData.get(key);
    if (value === null) return undefined;
    if (typeof value === 'string') {
        return value === 'true' || value === '1' || value === 'on';
    }
    return undefined;
}

function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

