import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Setup global mocks before all tests
beforeAll(async () => {
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
    HTMLCanvasElement.prototype.getContext = () =>
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
      }) as any

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
})

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Extend Vitest's expect with jest-dom matchers
expect.extend({})
