import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock Supabase client globally
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => {
            // Return mock rating stats
            if (table === 'tool_rating_stats') {
              return Promise.resolve({
                data: {
                  tool_id: 'test-tool',
                  total_ratings: 100,
                  average_rating: '4.5',
                  rating_1_count: 5,
                  rating_2_count: 10,
                  rating_3_count: 15,
                  rating_4_count: 30,
                  rating_5_count: 40,
                },
                error: null,
              })
            }
            return Promise.resolve({ data: null, error: null })
          },
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  },
}))

// Mock next/navigation globally
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Setup global mocks before all tests
beforeAll(async () => {
  // Mock process.env for browser mode
  if (typeof window !== 'undefined' && typeof process === 'undefined') {
    // @ts-expect-error - Mock process for browser mode
    globalThis.process = {
      env: {
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_ADS: 'false',
        NEXT_PUBLIC_GOOGLE_ADSENSE_ID: '',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      },
    }
  } else {
    // Set env vars for Node.js environment
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  }

  // Import CSS for browser mode screenshots
  if (typeof window !== 'undefined') {
    try {
      await import('./app/panda.css')
      await import('./app/globals.css')
    } catch (error) {
      // CSS files may not exist or fail to load, that's okay
      console.warn('Failed to load CSS files:', error)
    }
  }

  // Polyfill Web Crypto API for Node.js test environment
  if (!globalThis.crypto) {
    try {
      // Only import node:crypto in non-browser environments
      const { webcrypto } = await import('node:crypto')
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        writable: true,
        configurable: true,
      })
    } catch {
      // Browser environment or import failed, skip crypto polyfill
    }
  }
  // Mock indexedDB
  if (typeof globalThis.indexedDB === 'undefined') {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: {},
      writable: true,
      configurable: true,
    })
  }

  // Mock canvas for browser fingerprinting
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = (() =>
      ({
        fillStyle: '',
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({
          data: new Uint8ClampedArray(4),
        }),
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => ({ width: 0 }),
        transform: () => {},
        rect: () => {},
        clip: () => {},
      }) as unknown as CanvasRenderingContext2D) as unknown as typeof HTMLCanvasElement.prototype.getContext

    HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,test'
    HTMLCanvasElement.prototype.toBlob = (callback) => {
      // Create a mock blob for testing
      const blob = new Blob(['mock-canvas-data'], { type: 'image/png' })
      if (callback) {
        setTimeout(() => callback(blob), 0)
      }
    }
  }

  // Mock URL.createObjectURL
  if (typeof URL.createObjectURL === 'undefined') {
    URL.createObjectURL = () => 'blob:mock-url'
  }

  if (typeof URL.revokeObjectURL === 'undefined') {
    URL.revokeObjectURL = () => {}
  }

  // Polyfill Blob.arrayBuffer() for Node.js test environment
  if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = async function () {
      const reader = new FileReader()
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as ArrayBuffer)
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(this)
      })
    }
  }

  // Mock clipboard API globally - make it writable so tests can spy on it
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: (_text: string) => Promise.resolve(),
        readText: () => Promise.resolve(''),
      },
      writable: true,
      configurable: true,
    })
  }
})

// Setup spies before each test
beforeEach(() => {
  // Reset and spy on clipboard methods for each test
  if (navigator.clipboard) {
    // Check if methods exist before spying
    if (typeof navigator.clipboard.writeText === 'function') {
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    }
    if (typeof navigator.clipboard.readText === 'function') {
      vi.spyOn(navigator.clipboard, 'readText').mockResolvedValue('')
    }
  }
})

// Cleanup after each test case
afterEach(() => {
  cleanup()
  // Clear all mocks after each test
  vi.clearAllMocks()
})

// Extend Vitest's expect with jest-dom matchers
expect.extend({})
