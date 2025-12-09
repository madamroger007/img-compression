import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/images/compress/route';

// Create a simple test image (1x1 red PNG)
const createTestPNG = () => {
    return Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
        'base64'
    );
};

// Helper to create FormData
const createFormData = (file: Buffer, fields: Record<string, string> = {}) => {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: 'image/png' });
    formData.append('file', blob, 'test.png');

    Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
    });

    return formData;
};

describe('POST /api/images/compress', () => {
    it('should compress image with default settings', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer);

        const request = new Request('http://localhost:3000/api/images/compress', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results).toHaveLength(1);
        expect(data.results[0]).toHaveProperty('name');
        expect(data.results[0]).toHaveProperty('mime');
        expect(data.results[0]).toHaveProperty('size');
        expect(data.results[0]).toHaveProperty('base64');
        expect(data.meta).toHaveProperty('preset');
    });

    it('should compress with high quality preset', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { preset: 'high' });

        const request = new Request('http://localhost:3000/api/images/compress', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.meta.preset).toBe('high');
    });

    it('should compress with custom quality', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { quality: '75' });

        const request = new Request('http://localhost:3000/api/images/compress', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.meta.quality).toBe(75);
    });

    it('should compress with max dimensions', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, {
            maxWidth: '800',
            maxHeight: '600',
        });

        const request = new Request('http://localhost:3000/api/images/compress', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.meta.maxWidth).toBe(800);
        expect(data.meta.maxHeight).toBe(600);
    });

    it('should convert to webp format', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { format: 'webp' });

        const request = new Request('http://localhost:3000/api/images/compress', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results[0].mime).toContain('webp');
        expect(data.meta.format).toBe('webp');
    });

    it('should handle missing file error', async () => {
        const formData = new FormData();

        const request = new Request('http://localhost:3000/api/images/compress', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toHaveProperty('error');
    });

    it('should handle all quality presets', async () => {
        const testBuffer = createTestPNG();
        const presets = ['high', 'medium', 'low'] as const;

        for (const preset of presets) {
            const formData = createFormData(testBuffer, { preset });
            const request = new Request('http://localhost:3000/api/images/compress', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.meta.preset).toBe(preset);
        }
    });
});
