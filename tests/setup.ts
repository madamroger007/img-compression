// Test setup file
import { beforeAll, afterAll } from 'vitest';
import { File, FormData, Blob } from 'undici';

// Setup before all tests
beforeAll(() => {
    // Mock environment variables if needed
    process.env.NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT = 'true';

    // Ensure web-like globals exist for tests running in Node
    if (!globalThis.File) globalThis.File = File;
    if (!globalThis.FormData) globalThis.FormData = FormData;
    if (!globalThis.Blob) globalThis.Blob = Blob;
    globalThis.fetch = globalThis.fetch || fetch;
});

// Cleanup after all tests
afterAll(() => {
    // Cleanup any test artifacts
});
