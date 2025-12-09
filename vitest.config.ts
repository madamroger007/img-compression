import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: [
                'lib/**/*.ts',
                'app/api/**/*.ts',
            ],
            exclude: [
                'node_modules/',
                'tests/',
                '*.config.*',
                'types/',
                'components/**/*',
                'src/**/*',
                'app/layout.tsx',
                'app/page.tsx',
                'app/generator/**/*',
                'app/tools/**/*',
                '.next/**/*',
                'coverage/**/*',
            ],
            all: false,
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
});

