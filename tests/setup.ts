// Test setup file
import { beforeAll, afterAll } from 'vitest';
import { File, FormData } from 'undici';
import { Blob } from 'buffer';

// Setup before all tests
beforeAll(() => {
    // Mock environment variables if needed
    process.env.NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT = 'true';

    // Ensure web-like globals exist for tests running in Node
    const fileCtor = File as unknown as typeof globalThis.File;
    const formDataCtor = FormData as unknown as typeof globalThis.FormData;
    const blobCtor = Blob as unknown as typeof globalThis.Blob;

    if (!globalThis.File) globalThis.File = fileCtor;
    if (!globalThis.FormData) globalThis.FormData = formDataCtor;
    if (!globalThis.Blob) globalThis.Blob = blobCtor;
    globalThis.fetch = globalThis.fetch || fetch;
});

// Cleanup after all tests
afterAll(() => {
    // Cleanup any test artifacts
});
