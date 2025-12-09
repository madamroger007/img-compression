import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/images/convert-to-png/route';
import sharp from 'sharp';

// Create test images in different formats
const createTestPNG = () => {
    return Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
        'base64'
    );
};

const createFormData = (file: Buffer, filename = 'test.png', mimeType = 'image/png') => {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: mimeType });
    formData.append('file', blob, filename);
    return formData;
};

describe('POST /api/images/convert-to-png', () => {
    it('should convert image to PNG format', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer);

        const request = new Request('http://localhost:3000/api/images/convert-to-png', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results).toHaveLength(1);
        expect(data.results[0].mime).toBe('image/png');
        expect(data.results[0].name).toMatch(/\.png$/);
        expect(data.meta.format).toBe('png');
    });

    it('should convert JPEG to PNG', async () => {
        const pngBuffer = createTestPNG();
        const jpegBuffer = await sharp(pngBuffer).jpeg().toBuffer();
        const formData = createFormData(jpegBuffer, 'test.jpg', 'image/jpeg');

        const request = new Request('http://localhost:3000/api/images/convert-to-png', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results[0].mime).toBe('image/png');
        expect(data.results[0].name).toBe('test.png');
    });

    it('should convert WebP to PNG', async () => {
        const pngBuffer = createTestPNG();
        const webpBuffer = await sharp(pngBuffer).webp().toBuffer();
        const formData = createFormData(webpBuffer, 'test.webp', 'image/webp');

        const request = new Request('http://localhost:3000/api/images/convert-to-png', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results[0].mime).toBe('image/png');
        expect(data.results[0].name).toBe('test.png');
    });

    it('should preserve transparency in conversion', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer);

        const request = new Request('http://localhost:3000/api/images/convert-to-png', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results[0]).toHaveProperty('base64');

        // Verify the output is valid PNG with base64
        const base64 = data.results[0].base64;
        expect(base64).toBeTruthy();
        expect(typeof base64).toBe('string');
    });

    it('should return correct file structure', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer);

        const request = new Request('http://localhost:3000/api/images/convert-to-png', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data).toHaveProperty('results');
        expect(data).toHaveProperty('meta');
        expect(data.results[0]).toHaveProperty('name');
        expect(data.results[0]).toHaveProperty('mime');
        expect(data.results[0]).toHaveProperty('size');
        expect(data.results[0]).toHaveProperty('base64');
    });

    it('should handle missing file error', async () => {
        const formData = new FormData();

        const request = new Request('http://localhost:3000/api/images/convert-to-png', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toHaveProperty('error');
    });

    it('should handle filename without extension', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, 'testfile', 'image/png');

        const request = new Request('http://localhost:3000/api/images/convert-to-png', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results[0].name).toMatch(/\.png$/);
    });
});
