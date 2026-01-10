import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock Supabase client globally
vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: { session: null },
          error: null,
        })
      ),
      onAuthStateChange: vi.fn((callback) => {
        // Immediately call callback with null session for tests
        callback('SIGNED_OUT', null)
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        }
      }),
    },
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

// Mock Framer Motion to disable animations in tests
vi.mock('framer-motion', () => {
  const React = require('react')

  // Create a simple passthrough component for each motion element
  const createMotionComponent = (element: string) => {
    return React.forwardRef(
      (
        { children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
        ref: React.ForwardedRef<unknown>
      ) => {
        // Filter out Framer Motion specific props
        const {
          initial: _initial,
          animate: _animate,
          exit: _exit,
          transition: _transition,
          variants: _variants,
          whileHover: _whileHover,
          whileTap: _whileTap,
          whileFocus: _whileFocus,
          whileDrag: _whileDrag,
          whileInView: _whileInView,
          drag: _drag,
          dragConstraints: _dragConstraints,
          dragElastic: _dragElastic,
          dragMomentum: _dragMomentum,
          layout: _layout,
          layoutId: _layoutId,
          onAnimationStart: _onAnimationStart,
          onAnimationComplete: _onAnimationComplete,
          ...filteredProps
        } = props

        return React.createElement(element, { ...filteredProps, ref }, children)
      }
    )
  }

  return {
    motion: {
      div: createMotionComponent('div'),
      span: createMotionComponent('span'),
      button: createMotionComponent('button'),
      p: createMotionComponent('p'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      section: createMotionComponent('section'),
      article: createMotionComponent('article'),
      ul: createMotionComponent('ul'),
      li: createMotionComponent('li'),
      form: createMotionComponent('form'),
      input: createMotionComponent('input'),
      textarea: createMotionComponent('textarea'),
      a: createMotionComponent('a'),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: vi.fn(),
      onChange: vi.fn(),
    }),
    useTransform: () => ({
      get: () => 0,
      set: vi.fn(),
      onChange: vi.fn(),
    }),
    useDragControls: () => ({
      start: vi.fn(),
    }),
  }
})

// Mock Supabase globally with full chain
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => {
      const selectChain = {
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      }
      return {
        select: vi.fn(() => selectChain),
        insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      }
    }),
    auth: {
      signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithOAuth: vi.fn(() => Promise.resolve({ data: { url: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

// Mock idb (IndexedDB wrapper library)
vi.mock('idb', () => ({
  openDB: vi.fn(() =>
    Promise.resolve({
      put: vi.fn(() => Promise.resolve()),
      get: vi.fn(() => Promise.resolve(null)),
      getAll: vi.fn(() => Promise.resolve([])),
      getAllFromIndex: vi.fn(() => Promise.resolve([])),
      delete: vi.fn(() => Promise.resolve()),
      clear: vi.fn(() => Promise.resolve()),
      transaction: vi.fn(() => ({
        store: {
          add: vi.fn(),
          put: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn(),
          getAll: vi.fn(),
        },
        done: Promise.resolve(),
      })),
      createObjectStore: vi.fn(),
      close: vi.fn(),
    })
  ),
}))

// Mock sonner toast library
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    message: vi.fn(),
    promise: vi.fn(),
    custom: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock localStorage
class LocalStorageMock {
  private store: Map<string, string>

  constructor() {
    this.store = new Map()
  }

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.get(key) || null
  }

  setItem(key: string, value: string) {
    this.store.set(key, value)
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  get length() {
    return this.store.size
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] || null
  }
}

// Setup global mocks before all tests
beforeAll(async () => {
  // Mock localStorage globally
  Object.defineProperty(globalThis, 'localStorage', {
    value: new LocalStorageMock(),
    writable: true,
    configurable: true,
  })

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
    const mockIndexedDB = {
      open: vi.fn(() => ({
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: {
          transaction: vi.fn(() => ({
            objectStore: vi.fn(() => ({
              add: vi.fn(() => ({ onsuccess: null, onerror: null })),
              get: vi.fn(() => ({ onsuccess: null, onerror: null })),
              put: vi.fn(() => ({ onsuccess: null, onerror: null })),
              delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
              clear: vi.fn(() => ({ onsuccess: null, onerror: null })),
              getAll: vi.fn(() => ({ onsuccess: null, onerror: null })),
            })),
          })),
          createObjectStore: vi.fn(() => ({
            createIndex: vi.fn(),
          })),
          close: vi.fn(),
        },
      })),
      deleteDatabase: vi.fn(),
    }
    Object.defineProperty(globalThis, 'indexedDB', {
      value: mockIndexedDB,
      writable: true,
      configurable: true,
    })
  }

  // Mock window.scrollTo for JSDOM
  if (typeof window !== 'undefined' && !window.scrollTo) {
    window.scrollTo = vi.fn()
  }

  // Mock ResizeObserver
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }

  // Mock global fetch
  if (typeof globalThis.fetch === 'undefined') {
    globalThis.fetch = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) => {
      return Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        })
      )
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
  // Clear localStorage before each test
  localStorage.clear()

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
