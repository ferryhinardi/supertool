import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: './vitest.setup.ts',
    testTimeout: 60000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    // Browser mode is only enabled for specific tests that need it (e.g., screenshot tests)
    // Most tests will use jsdom environment for better performance and compatibility
    // To use browser mode in a test file, add: // @vitest-environment browser
    environment: 'jsdom',
    browser: {
      enabled: false, // Disabled by default, only enabled when test file specifies @vitest-environment browser
      provider: playwright(),
      instances: [
        {
          browser: 'chromium',
        },
      ],
      headless: true,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.config.{js,ts,mts}',
        '**/types.ts',
        '**/*.d.ts',
        '**/__tests__/**',
        '**/test-utils/**',
        'styled-system/**',
        '.next/**',
        'out/**',
        'public/**',
        'scripts/**',
        '.mcp/**',
      ],
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
