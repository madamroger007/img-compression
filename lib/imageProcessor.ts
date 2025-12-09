import sharp from 'sharp';

export type QualityPreset = 'high' | 'medium' | 'low';

export interface CompressOptions {
    quality?: number;
    preset?: QualityPreset;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'jpeg' | 'webp' | 'png';
}

export interface ProcessedImage {
    name: string;
    mime: string;
    size: number;
    buffer: Buffer;
    base64: string;
}

interface BaseProcessInput {
    buffer: Buffer;
    filename: string;
    mime: string;
}

const QUALITY_BY_PRESET: Record<QualityPreset, number> = {
    high: 90,
    medium: 80,
    low: 65,
};

const SUPPORTED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/heic',
    'image/heif',
]);

export function ensureSupportedMime(mime: string) {
    if (!SUPPORTED_MIME.has(mime)) {
        throw new Error('Unsupported image format. Please upload jpeg, png, webp, avif, or heic.');
    }
}

export function resolveQuality(preset?: QualityPreset, quality?: number) {
    if (typeof quality === 'number' && Number.isFinite(quality)) {
        return clamp(Math.round(quality), 1, 100);
    }
    if (preset && QUALITY_BY_PRESET[preset]) {
        return QUALITY_BY_PRESET[preset];
    }
    return QUALITY_BY_PRESET.high;
}

export async function compressImage(
    input: BaseProcessInput,
    options: CompressOptions,
): Promise<ProcessedImage> {
    ensureSupportedMime(input.mime);
    const quality = resolveQuality(options.preset, options.quality);
    const format = options.format ?? 'jpeg';

    const pipeline = sharp(input.buffer, { failOn: 'none' })
        .rotate()
        .resize({
            width: options.maxWidth,
            height: options.maxHeight,
            fit: 'inside',
            withoutEnlargement: true,
            fastShrinkOnLoad: true,
        });

    switch (format) {
        case 'png':
            pipeline.png({ quality, compressionLevel: 9, adaptiveFiltering: true });
            break;
        case 'webp':
            pipeline.webp({ quality, effort: 5 });
            break;
        default:
            pipeline.jpeg({
                quality,
                mozjpeg: true,
                chromaSubsampling: '4:4:4',
                trellisQuantisation: true,
            });
    }

    const buffer = await pipeline.toBuffer();
    return toProcessedImage(buffer, deriveFilename(input.filename, formatMime(format)), formatMime(format));
}

export async function convertToPng(
    input: BaseProcessInput,
): Promise<ProcessedImage> {
    ensureSupportedMime(input.mime);
    const buffer = await sharp(input.buffer, { failOn: 'none' }).rotate().png({ quality: 100 }).toBuffer();
    return toProcessedImage(buffer, deriveFilename(input.filename, 'image/png'), 'image/png');
}

export function duplicateImage(input: ProcessedImage, count: number): ProcessedImage[] {
    return Array.from({ length: count }).map((_, i) => {
        const name = appendSuffix(input.name, i + 1);
        return {
            ...input,
            name,
        };
    });
}

export function bufferToBase64(buffer: Buffer) {
    return buffer.toString('base64');
}

function toProcessedImage(buffer: Buffer, name: string, mime: string): ProcessedImage {
    return {
        name,
        mime,
        size: buffer.length,
        buffer,
        base64: bufferToBase64(buffer),
    };
}

function formatMime(format: 'jpeg' | 'webp' | 'png'): string {
    switch (format) {
        case 'webp':
            return 'image/webp';
        case 'png':
            return 'image/png';
        default:
            return 'image/jpeg';
    }
}

function deriveFilename(filename: string, mime: string): string {
    const base = filename.replace(/\.[^/.]+$/, '');
    const ext = mimeToExtension(mime);
    return `${base}.${ext}`;
}

function mimeToExtension(mime: string): string {
    switch (mime) {
        case 'image/png':
            return 'png';
        case 'image/webp':
            return 'webp';
        default:
            return 'jpg';
    }
}

function appendSuffix(filename: string, index: number) {
    const [name, ...rest] = filename.split('.');
    const ext = rest.pop();
    const suffix = `${name}-copy-${index}`;
    return ext ? `${suffix}.${ext}` : suffix;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

