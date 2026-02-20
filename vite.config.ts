import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import * as path from 'path';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.spec.ts', '**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/main.ts',
        '**/environment*.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@core': path.resolve(__dirname, './src/app/core'),
      '@features': path.resolve(__dirname, './src/app/features'),
      '@shared': path.resolve(__dirname, './src/app/shared'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  }
});
