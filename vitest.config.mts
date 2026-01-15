import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, type Plugin } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Custom plugin to intercept @ark-ui/react imports and redirect to mock
// This prevents the massive dependency tree from being parsed and causing OOM
function arkUiMockPlugin(): Plugin {
  const mockPath = path.resolve(__dirname, './__mocks__/@ark-ui/react.ts')
  const fieldMockPath = path.resolve(__dirname, './__mocks__/@ark-ui/react/field.ts')
  const dialogMockPath = path.resolve(__dirname, './__mocks__/@ark-ui/react/dialog.ts')
  const portalMockPath = path.resolve(__dirname, './__mocks__/@ark-ui/react/portal.ts')

  return {
    name: 'ark-ui-mock-plugin',
    enforce: 'pre', // Run before other plugins
    resolveId(id) {
      // Handle subpath imports first (more specific matches)
      if (id === '@ark-ui/react/field') {
        return fieldMockPath
      }
      if (id === '@ark-ui/react/dialog') {
        return dialogMockPath
      }
      if (id === '@ark-ui/react/portal') {
        return portalMockPath
      }
      // Handle main import and any other subpaths
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
    testTimeout: 60000,
    hookTimeout: 30000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    exclude: [
      '**/node_modules/**',
      '**/.git/**',
      '**/__screenshots__/**',
      '**/dist/**',
      '**/.next/**',
    ],
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
    // Externalize @ark-ui/react to prevent OOM issues in jsdom environment
    // Note: The arkUiMockPlugin() above handles the actual mocking
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  // Prevent Vite from pre-bundling @ark-ui/react which causes OOM in jsdom
  optimizeDeps: {
    exclude: [
      '@ark-ui/react',
      '@ark-ui/react/field',
      '@ark-ui/react/dialog',
      '@ark-ui/react/portal',
    ],
  },
  // Mark @ark-ui/react as external for SSR/test environments
  ssr: {
    external: ['@ark-ui/react'],
  },
})
