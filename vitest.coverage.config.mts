import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, type Plugin } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function arkUiMockPlugin(): Plugin {
  const mockPath = path.resolve(__dirname, './__mocks__/@ark-ui/react.ts')
  const fieldMockPath = path.resolve(__dirname, './__mocks__/@ark-ui/react/field.ts')
  const dialogMockPath = path.resolve(__dirname, './__mocks__/@ark-ui/react/dialog.ts')
  const portalMockPath = path.resolve(__dirname, './__mocks__/@ark-ui/react/portal.ts')

  return {
    name: 'ark-ui-mock-plugin',
    enforce: 'pre',
    resolveId(id) {
      if (id === '@ark-ui/react/field') {
        return fieldMockPath
      }
      if (id === '@ark-ui/react/dialog') {
        return dialogMockPath
      }
      if (id === '@ark-ui/react/portal') {
        return portalMockPath
      }
      if (id === '@ark-ui/react' || id.startsWith('@ark-ui/react/')) {
        return mockPath
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [arkUiMockPlugin(), react()],
  test: {
    globals: true,
    setupFiles: './vitest.setup.ts',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 5000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    pool: 'forks',
    isolate: true,
    // Coverage needs more throughput than the single-worker CI shard config.
    // Two workers still timed out before coverage artifacts were written, so
    // the standalone coverage job uses a moderate worker count to better match
    // the repo-wide test volume without returning to the earlier aggressive setup.
    fileParallelism: true,
    maxWorkers: 4,
    maxConcurrency: 3,
    exclude: [
      '**/node_modules/**',
      '**/.git/**',
      '**/__screenshots__/**',
      '**/dist/**',
      '**/.next/**',
    ],
    environment: 'jsdom',
    browser: {
      enabled: false,
      provider: playwright(),
      instances: [
        {
          browser: 'chromium',
        },
      ],
      headless: true,
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      processingConcurrency: 4,
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
  optimizeDeps: {
    exclude: [
      '@ark-ui/react',
      '@ark-ui/react/field',
      '@ark-ui/react/dialog',
      '@ark-ui/react/portal',
    ],
  },
  ssr: {
    external: ['@ark-ui/react'],
  },
})
