import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/images/duplicate/route';

const createTestPNG = () => {
    return Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
        'base64'
    );
};

const createFormData = (file: Buffer, fields: Record<string, string> = {}) => {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: 'image/png' });
    formData.append('file', blob, 'test.png');

    Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
    });

    return formData;
};

describe('POST /api/images/duplicate', () => {
    it('should duplicate image with default count', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { count: '3' });

        const request = new Request('http://localhost:3000/api/images/duplicate', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results).toHaveLength(3);
        expect(data.meta.count).toBe(3);
        expect(data.meta.zipped).toBe(false);
    });

    it('should create unique filenames for duplicates', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { count: '3' });

        const request = new Request('http://localhost:3000/api/images/duplicate', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.results[0].name).toBe('test-copy-1.png');
        expect(data.results[1].name).toBe('test-copy-2.png');
        expect(data.results[2].name).toBe('test-copy-3.png');
    });

    it('should return ZIP when zip=true with multiple files', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { count: '3' });

        const request = new Request('http://localhost:3000/api/images/duplicate?zip=true', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results).toHaveLength(1);
        expect(data.results[0].name).toBe('images.zip');
        expect(data.results[0].mime).toBe('application/zip');
        expect(data.meta.zipped).toBe(true);
        expect(data.meta.count).toBe(3);
    });

    it('should respect MAX_DUPLICATES limit', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { count: '100' }); // Request more than limit

        const request = new Request('http://localhost:3000/api/images/duplicate', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results.length).toBeLessThanOrEqual(20); // MAX_DUPLICATES is 20
    });

    it('should handle single duplicate', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { count: '1' });

        const request = new Request('http://localhost:3000/api/images/duplicate', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results).toHaveLength(1);
        expect(data.results[0].name).toBe('test-copy-1.png');
    });

    it('should not ZIP single file even with zip=true', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { count: '1' });

        const request = new Request('http://localhost:3000/api/images/duplicate?zip=true', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.meta.zipped).toBe(false);
        expect(data.results).toHaveLength(1);
    });

    it('should preserve original file properties', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer, { count: '2' });

        const request = new Request('http://localhost:3000/api/images/duplicate', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        data.results.forEach((result: any) => {
            expect(result).toHaveProperty('mime', 'image/png');
            expect(result).toHaveProperty('size');
            expect(result).toHaveProperty('base64');
            expect(result.size).toBeGreaterThan(0);
        });
    });

    it('should handle filename without extension', async () => {
        const testBuffer = createTestPNG();
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(testBuffer)], { type: 'image/png' });
        formData.append('file', blob, 'testfile'); // No extension
        formData.append('count', '2');

        const request = new Request('http://localhost:3000/api/images/duplicate', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results[0].name).toBe('testfile-copy-1');
        expect(data.results[1].name).toBe('testfile-copy-2');
    });

    it('should handle missing file error', async () => {
        const formData = new FormData();
        formData.append('count', '3');

        const request = new Request('http://localhost:3000/api/images/duplicate', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toHaveProperty('error');
    });

    it('should handle missing count parameter', async () => {
        const testBuffer = createTestPNG();
        const formData = createFormData(testBuffer);

        const request = new Request('http://localhost:3000/api/images/duplicate', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results).toHaveLength(1); // Default to 1
    });
});
