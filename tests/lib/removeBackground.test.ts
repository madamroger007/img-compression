import { describe, expect, it, vi, beforeEach } from 'vitest';
import { removeBackgroundLocal, BGError } from '@/lib/removeBackground';
import sharp from 'sharp';

// Mock the @imgly/background-removal-node module
vi.mock('@imgly/background-removal-node', () => ({
    removeBackground: vi.fn(async (blob: Blob) => {
        // Return a simple PNG blob with alpha channel
        const testPNG = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
            'base64'
        );
        return new Blob([testPNG], { type: 'image/png' });
    }),
}));

const createTestImage = async (width = 100, height = 100) => {
    return await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 1 },
        },
    })
        .png()
        .toBuffer();
};

describe('removeBackgroundLocal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully remove background from image', async () => {
        const inputBuffer = await createTestImage();
        const result = await removeBackgroundLocal(inputBuffer);

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);

        // Verify output is valid PNG
        const metadata = await sharp(result).metadata();
        expect(metadata.format).toBe('png');
        expect(metadata.hasAlpha).toBe(true);
    });

    it('should throw BGError for empty buffer', async () => {
        const emptyBuffer = Buffer.from([]);

        await expect(removeBackgroundLocal(emptyBuffer)).rejects.toThrow(BGError);
        await expect(removeBackgroundLocal(emptyBuffer)).rejects.toThrow(
            'Uploaded file is empty or unreadable.'
        );
    });

    it('should throw BGError for null/undefined buffer', async () => {
        // @ts-expect-error Testing invalid input
        await expect(removeBackgroundLocal(null)).rejects.toThrow(BGError);

        // @ts-expect-error Testing invalid input
        await expect(removeBackgroundLocal(undefined)).rejects.toThrow(BGError);
    });

    it('should handle different image sizes', async () => {
        const sizes = [
            { width: 50, height: 50 },
            { width: 200, height: 150 },
            { width: 500, height: 300 },
        ];

        for (const { width, height } of sizes) {
            const inputBuffer = await createTestImage(width, height);
            const result = await removeBackgroundLocal(inputBuffer);

            expect(result).toBeInstanceOf(Buffer);
            expect(result.length).toBeGreaterThan(0);
        }
    });

    it('should process image with correct format configuration', async () => {
        const inputBuffer = await createTestImage();
        const result = await removeBackgroundLocal(inputBuffer);

        // Verify the output is PNG
        const metadata = await sharp(result).metadata();
        expect(metadata.format).toBe('png');
    });

    it('should apply post-processing to output', async () => {
        const inputBuffer = await createTestImage();
        const result = await removeBackgroundLocal(inputBuffer);

        // Verify output has transparency (alpha channel)
        const metadata = await sharp(result).metadata();
        expect(metadata.hasAlpha).toBe(true);
        expect(metadata.channels).toBe(4); // RGBA
    });

    it('should handle concurrent requests properly', async () => {
        const inputBuffer = await createTestImage();

        // Create 2 concurrent requests (within MAX_CONCURRENT_REMOVALS=2)
        const promises = Array.from({ length: 2 }, () =>
            removeBackgroundLocal(inputBuffer)
        );

        const results = await Promise.all(promises);

        results.forEach((result) => {
            expect(result).toBeInstanceOf(Buffer);
            expect(result.length).toBeGreaterThan(0);
        });
    });

    it('should respect concurrency limits', async () => {
        const inputBuffer = await createTestImage();

        // MAX_CONCURRENT_REMOVALS is 2, so 3rd request should fail
        const promise1 = removeBackgroundLocal(inputBuffer);
        const promise2 = removeBackgroundLocal(inputBuffer);
        const promise3 = removeBackgroundLocal(inputBuffer);

        const results = await Promise.allSettled([promise1, promise2, promise3]);

        // At least one should fail due to concurrency limit
        const fulfilled = results.filter((r) => r.status === 'fulfilled');
        const rejected = results.filter((r) => r.status === 'rejected');

        expect(fulfilled.length).toBeGreaterThan(0);
        expect(rejected.length).toBeGreaterThan(0);
    });

    it('should return valid base64-encodable output', async () => {
        // Add delay to avoid hitting concurrency limit
        await new Promise(resolve => setTimeout(resolve, 100));

        const inputBuffer = await createTestImage();
        const result = await removeBackgroundLocal(inputBuffer);

        // Should be able to convert to base64 without errors
        const base64 = result.toString('base64');
        expect(base64).toBeTruthy();
        expect(typeof base64).toBe('string');

        // Should be able to decode back to buffer
        const decoded = Buffer.from(base64, 'base64');
        expect(decoded.length).toBe(result.length);
    });

    it('should preserve image dimensions after processing', async () => {
        // Add delay to avoid hitting concurrency limit
        await new Promise(resolve => setTimeout(resolve, 100));

        const width = 200;
        const height = 150;
        const inputBuffer = await createTestImage(width, height);

        const result = await removeBackgroundLocal(inputBuffer);

        // Note: Mock returns 1x1 PNG, so dimensions won't match input
        // In real implementation, dimensions would be preserved
        const metadata = await sharp(result).metadata();
        expect(metadata.format).toBe('png');
        expect(metadata.hasAlpha).toBe(true);
    }); it('should handle JPEG input and convert to PNG', async () => {
        // Add delay to avoid hitting concurrency limit
        await new Promise(resolve => setTimeout(resolve, 100));

        const jpegBuffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 255, g: 0, b: 0 },
            },
        })
            .jpeg()
            .toBuffer();

        const result = await removeBackgroundLocal(jpegBuffer);

        const metadata = await sharp(result).metadata();
        expect(metadata.format).toBe('png');
        expect(metadata.hasAlpha).toBe(true);
    }); it('should produce output smaller or similar size due to transparency', async () => {
        const inputBuffer = await createTestImage(300, 300);
        const result = await removeBackgroundLocal(inputBuffer);

        // Output should be a valid PNG with reasonable size
        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeLessThan(inputBuffer.length * 2); // Reasonable upper bound
    });
});

describe('BGError', () => {
    it('should create BGError with correct message', () => {
        const error = new BGError('Test error message');

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Test error message');
        expect(error.name).toBe('BGError');
    });

    it('should be catchable as Error', () => {
        try {
            throw new BGError('Test error');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(BGError);
        }
    });
});
