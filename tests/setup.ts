// Test setup file
import { beforeAll, afterAll } from 'vitest';

// Setup before all tests
beforeAll(() => {
    // Mock environment variables if needed
    process.env.NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT = 'true';
});

// Cleanup after all tests
afterAll(() => {
    // Cleanup any test artifacts
});

// Mock Next.js specific globals if needed
global.fetch = global.fetch || fetch;
