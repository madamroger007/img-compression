import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import {
  compressImage,
  convertToPng,
  resolveQuality,
  bufferToBase64,
  duplicateImage,
} from '@/lib/imageProcessor';

// Create a simple 10x10 red PNG using Sharp directly for reliable format conversions
const createSamplePNG = async (): Promise<Buffer> => {
  return sharp({
    create: {
      width: 10,
      height: 10,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
};

// Legacy 1x1 PNG for simple tests
const SAMPLE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YohsxEAAAAASUVORK5CYII=',
  'base64',
);

describe('imageProcessor', () => {
  describe('resolveQuality', () => {
    it('should resolve high quality preset', () => {
      expect(resolveQuality('high')).toBe(90);
    });

    it('should resolve medium quality preset', () => {
      expect(resolveQuality('medium')).toBe(80);
    });

    it('should resolve low quality preset', () => {
      expect(resolveQuality('low')).toBe(65);
    });

    it('should use fallback when preset is undefined', () => {
      expect(resolveQuality(undefined, 50)).toBe(50);
    });

    it('should use fallback when preset is invalid', () => {
      // @ts-expect-error Testing invalid preset
      expect(resolveQuality('invalid', 60)).toBe(60);
    });
  });

  describe('compressImage', () => {
    it('should compress and return a buffer', async () => {
      const result = await compressImage(
        { buffer: SAMPLE_PNG, filename: 'test.png', mime: 'image/png' },
        { preset: 'medium' },
      );
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.mime).toMatch(/image/);
    });

    it('should compress with custom quality', async () => {
      const result = await compressImage(
        { buffer: SAMPLE_PNG, filename: 'test.png', mime: 'image/png' },
        { quality: 75 },
      );
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it('should resize image with maxWidth', async () => {
      const largeImage = await sharp({
        create: { width: 1000, height: 500, channels: 3, background: { r: 255, g: 0, b: 0 } }
      }).png().toBuffer();

      const result = await compressImage(
        { buffer: largeImage, filename: 'large.png', mime: 'image/png' },
        { maxWidth: 500 },
      );

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.width).toBeLessThanOrEqual(500);
    });

    it('should resize image with maxHeight', async () => {
      const largeImage = await sharp({
        create: { width: 500, height: 1000, channels: 3, background: { r: 255, g: 0, b: 0 } }
      }).png().toBuffer();

      const result = await compressImage(
        { buffer: largeImage, filename: 'large.png', mime: 'image/png' },
        { maxHeight: 500 },
      );

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.height).toBeLessThanOrEqual(500);
    });

    it('should convert to webp format', async () => {
      const result = await compressImage(
        { buffer: SAMPLE_PNG, filename: 'test.png', mime: 'image/png' },
        { format: 'webp' },
      );

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.format).toBe('webp');
      expect(result.mime).toBe('image/webp');
    });

    it('should convert to jpeg format', async () => {
      const result = await compressImage(
        { buffer: SAMPLE_PNG, filename: 'test.png', mime: 'image/png' },
        { format: 'jpeg' },
      );

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.format).toBe('jpeg');
      expect(result.mime).toBe('image/jpeg');
    });

    it('should preserve filename with format change', async () => {
      const result = await compressImage(
        { buffer: SAMPLE_PNG, filename: 'test.png', mime: 'image/png' },
        { format: 'webp' },
      );

      expect(result.name).toBe('test.webp');
    });
  });

  describe('convertToPng', () => {
    it('should convert webp to png', async () => {
      const samplePNG = await createSamplePNG();
      const webpBuffer = await sharp(samplePNG).webp().toBuffer();
      const result = await convertToPng({
        buffer: webpBuffer,
        filename: 'sample.webp',
        mime: 'image/webp',
      });
      expect(result.mime).toBe('image/png');
      expect(result.name.endsWith('.png')).toBe(true);
    });

    it('should convert jpeg to png', async () => {
      const samplePNG = await createSamplePNG();
      const jpegBuffer = await sharp(samplePNG).jpeg().toBuffer();
      const result = await convertToPng({
        buffer: jpegBuffer,
        filename: 'sample.jpg',
        mime: 'image/jpeg',
      });
      expect(result.mime).toBe('image/png');
      expect(result.name).toBe('sample.png');
    });

    it('should handle png input', async () => {
      const result = await convertToPng({
        buffer: SAMPLE_PNG,
        filename: 'test.png',
        mime: 'image/png',
      });
      expect(result.mime).toBe('image/png');
    });

    it('should preserve image dimensions', async () => {
      const testImage = await sharp({
        create: { width: 100, height: 50, channels: 3, background: { r: 255, g: 0, b: 0 } }
      }).jpeg().toBuffer();

      const result = await convertToPng({
        buffer: testImage,
        filename: 'test.jpg',
        mime: 'image/jpeg',
      });

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(50);
    });
  });

  describe('bufferToBase64', () => {
    it('should convert buffer to base64 string', () => {
      const base64 = bufferToBase64(SAMPLE_PNG);
      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);
    });

    it('should produce decodable base64', () => {
      const base64 = bufferToBase64(SAMPLE_PNG);
      const decoded = Buffer.from(base64, 'base64');
      expect(decoded).toEqual(SAMPLE_PNG);
    });

    it('should handle empty buffer', () => {
      const emptyBuffer = Buffer.from([]);
      const base64 = bufferToBase64(emptyBuffer);
      expect(base64).toBe('');
    });

    it('should handle large buffers', () => {
      const largeBuffer = Buffer.alloc(100000);
      const base64 = bufferToBase64(largeBuffer);
      expect(base64.length).toBeGreaterThan(0);
    });
  });

  describe('duplicateImage', () => {
    const createProcessedImage = (filename: string, mime: string): any => ({
      buffer: SAMPLE_PNG,
      name: filename,
      filename: filename,
      mime: mime,
      size: SAMPLE_PNG.length,
      base64: bufferToBase64(SAMPLE_PNG),
    });

    it('should create single duplicate', () => {
      const input = createProcessedImage('test.png', 'image/png');
      const result = duplicateImage(input, 1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test-copy-1.png');
      expect(result[0].mime).toBe('image/png');
    });

    it('should create multiple duplicates', () => {
      const input = createProcessedImage('test.png', 'image/png');
      const result = duplicateImage(input, 3);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('test-copy-1.png');
      expect(result[1].name).toBe('test-copy-2.png');
      expect(result[2].name).toBe('test-copy-3.png');
    });

    it('should handle filename without extension', () => {
      const input = createProcessedImage('testfile', 'image/png');
      const result = duplicateImage(input, 2);

      expect(result[0].name).toBe('testfile-copy-1');
      expect(result[1].name).toBe('testfile-copy-2');
    });

    it('should preserve MIME type', () => {
      const input = createProcessedImage('test.jpg', 'image/jpeg');
      const result = duplicateImage(input, 2);

      result.forEach(item => {
        expect(item.mime).toBe('image/jpeg');
      });
    });

    it('should include base64 encoding', () => {
      const input = createProcessedImage('test.png', 'image/png');
      const result = duplicateImage(input, 1);

      expect(result[0].base64).toBeTruthy();
      expect(typeof result[0].base64).toBe('string');
    });

    it('should handle zero count', () => {
      const input = createProcessedImage('test.png', 'image/png');
      const result = duplicateImage(input, 0);

      expect(result).toHaveLength(0);
    });

    it('should maintain correct size for all duplicates', () => {
      const input = createProcessedImage('test.png', 'image/png');
      const result = duplicateImage(input, 3);

      result.forEach(item => {
        expect(item.size).toBe(SAMPLE_PNG.length);
      });
    });
  });
});

