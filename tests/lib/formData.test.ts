import { describe, expect, it } from 'vitest';
import { parseImageFormData, getNumberFromFormData } from '@/lib/formData';

const createMockRequest = (formData: FormData) => {
    return new Request('http://localhost:3000/test', {
        method: 'POST',
        body: formData,
    });
};

const createTestPNG = () => {
    return Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
        'base64'
    );
};

describe('parseImageFormData', () => {
    it('should parse valid image from FormData', async () => {
        const formData = new FormData();
        const testBuffer = createTestPNG();
        const blob = new Blob([testBuffer], { type: 'image/png' });
        formData.append('file', blob, 'test.png');

        const request = createMockRequest(formData);
        const result = await parseImageFormData(request);

        expect(result.file).toBeDefined();
        expect(result.file.filename).toBe('test.png');
        expect(result.file.mime).toBe('image/png');
        expect(result.file.buffer).toBeInstanceOf(Buffer);
        expect(result.file.size).toBeGreaterThan(0);
        expect(result.formData).toBeInstanceOf(FormData);
    });

    it('should handle filename without extension', async () => {
        const formData = new FormData();
        const testBuffer = createTestPNG();
        const blob = new Blob([testBuffer], { type: 'image/png' });
        formData.append('file', blob, 'testfile');

        const request = createMockRequest(formData);
        const result = await parseImageFormData(request);

        expect(result.file.filename).toBe('testfile');
    });

    it('should preserve MIME type', async () => {
        const formData = new FormData();
        const testBuffer = createTestPNG();
        const blob = new Blob([testBuffer], { type: 'image/jpeg' });
        formData.append('file', blob, 'test.jpg');

        const request = createMockRequest(formData);
        const result = await parseImageFormData(request);

        expect(result.file.mime).toBe('image/jpeg');
    });

    it('should handle missing filename', async () => {
        const formData = new FormData();
        const testBuffer = createTestPNG();
        const blob = new Blob([testBuffer], { type: 'image/png' });
        formData.append('file', blob);

        const request = createMockRequest(formData);
        const result = await parseImageFormData(request);

        expect(result.file.filename).toBeDefined();
        expect(typeof result.file.filename).toBe('string');
    });

    it('should throw error when file field is missing', async () => {
        const formData = new FormData();
        const request = createMockRequest(formData);

        await expect(parseImageFormData(request)).rejects.toThrow();
    });

    it('should calculate correct file size', async () => {
        const formData = new FormData();
        const testBuffer = createTestPNG();
        const blob = new Blob([testBuffer], { type: 'image/png' });
        formData.append('file', blob, 'test.png');

        const request = createMockRequest(formData);
        const result = await parseImageFormData(request);

        expect(result.file.size).toBe(testBuffer.length);
    });
});

describe('getNumberFromFormData', () => {
    it('should parse valid number string', () => {
        const formData = new FormData();
        formData.append('quality', '85');

        const result = getNumberFromFormData(formData, 'quality');
        expect(result).toBe(85);
    });

    it('should return undefined for missing field', () => {
        const formData = new FormData();

        const result = getNumberFromFormData(formData, 'quality');
        expect(result).toBeUndefined();
    });

    it('should return undefined for non-numeric string', () => {
        const formData = new FormData();
        formData.append('quality', 'not-a-number');

        const result = getNumberFromFormData(formData, 'quality');
        expect(result).toBeUndefined();
    });

    it('should handle zero value', () => {
        const formData = new FormData();
        formData.append('width', '0');

        const result = getNumberFromFormData(formData, 'width');
        expect(result).toBe(0);
    });

    it('should handle negative numbers', () => {
        const formData = new FormData();
        formData.append('offset', '-10');

        const result = getNumberFromFormData(formData, 'offset');
        expect(result).toBe(-10);
    });

    it('should handle decimal numbers', () => {
        const formData = new FormData();
        formData.append('scale', '1.5');

        const result = getNumberFromFormData(formData, 'scale');
        expect(result).toBe(1.5);
    });

    it('should handle empty string', () => {
        const formData = new FormData();
        formData.append('value', '');

        const result = getNumberFromFormData(formData, 'value');
        expect(result).toBe(0); // Empty string converts to 0
    });

    it('should handle whitespace', () => {
        const formData = new FormData();
        formData.append('value', '  100  ');

        const result = getNumberFromFormData(formData, 'value');
        expect(result).toBe(100);
    });

    it('should handle multiple fields', () => {
        const formData = new FormData();
        formData.append('width', '800');
        formData.append('height', '600');
        formData.append('quality', '90');

        expect(getNumberFromFormData(formData, 'width')).toBe(800);
        expect(getNumberFromFormData(formData, 'height')).toBe(600);
        expect(getNumberFromFormData(formData, 'quality')).toBe(90);
    });

    it('should handle very large numbers', () => {
        const formData = new FormData();
        formData.append('size', '9999999');

        const result = getNumberFromFormData(formData, 'size');
        expect(result).toBe(9999999);
    });
});
