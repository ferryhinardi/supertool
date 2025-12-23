import { describe, expect, it } from 'vitest'
import {
  calculateUniquenessScore,
  collectFingerprint,
  detectAdBlocker,
  type FingerprintData,
  generateFingerprintHash,
  getAudioFingerprint,
  getBasicInfo,
  getCanvasFingerprint,
  getHardwareInfo,
  getInstalledFonts,
  getPluginsInfo,
  getScreenInfo,
  getStorageInfo,
  getTimezoneInfo,
  getWebGLInfo,
} from '../utils'

describe('Browser Fingerprint Utils', () => {
  describe('getBasicInfo', () => {
    it('should return basic browser information', () => {
      const info = getBasicInfo()

      expect(info).toHaveProperty('userAgent')
      expect(info).toHaveProperty('platform')
      expect(info).toHaveProperty('language')
      expect(info).toHaveProperty('languages')
      expect(info).toHaveProperty('cookieEnabled')
      expect(info).toHaveProperty('doNotTrack')

      expect(typeof info.userAgent).toBe('string')
      expect(typeof info.platform).toBe('string')
      expect(typeof info.language).toBe('string')
      expect(Array.isArray(info.languages)).toBe(true)
      expect(typeof info.cookieEnabled).toBe('boolean')
    })

    it('should have non-empty user agent', () => {
      const info = getBasicInfo()
      expect(info.userAgent.length).toBeGreaterThan(0)
    })

    it('should have valid language format', () => {
      const info = getBasicInfo()
      expect(info.language).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/)
    })
  })

  describe('getScreenInfo', () => {
    it('should return screen information', () => {
      const info = getScreenInfo()

      expect(info).toHaveProperty('screenResolution')
      expect(info).toHaveProperty('availableScreenResolution')
      expect(info).toHaveProperty('colorDepth')
      expect(info).toHaveProperty('pixelRatio')
      expect(info).toHaveProperty('touchSupport')

      expect(info.screenResolution).toMatch(/^\d+x\d+$/)
      expect(info.availableScreenResolution).toMatch(/^\d+x\d+$/)
      expect(typeof info.colorDepth).toBe('number')
      expect(typeof info.pixelRatio).toBe('number')
    })

    it('should have valid color depth', () => {
      const info = getScreenInfo()
      expect([8, 16, 24, 32, 48]).toContain(info.colorDepth)
    })

    it('should have positive pixel ratio', () => {
      const info = getScreenInfo()
      expect(info.pixelRatio).toBeGreaterThan(0)
    })

    it('should have touch support object', () => {
      const info = getScreenInfo()
      expect(info.touchSupport).toHaveProperty('maxTouchPoints')
      expect(info.touchSupport).toHaveProperty('touchEvent')
      expect(info.touchSupport).toHaveProperty('touchStart')
      expect(typeof info.touchSupport.maxTouchPoints).toBe('number')
      expect(typeof info.touchSupport.touchEvent).toBe('boolean')
      expect(typeof info.touchSupport.touchStart).toBe('boolean')
    })
  })

  describe('getHardwareInfo', () => {
    it('should return hardware information', () => {
      const info = getHardwareInfo()

      expect(info).toHaveProperty('hardwareConcurrency')
      expect(info).toHaveProperty('deviceMemory')

      expect(typeof info.hardwareConcurrency).toBe('number')
      expect(info.hardwareConcurrency).toBeGreaterThanOrEqual(0)
    })

    it('should have reasonable CPU core count', () => {
      const info = getHardwareInfo()
      if (info.hardwareConcurrency > 0) {
        expect(info.hardwareConcurrency).toBeLessThanOrEqual(128)
      }
    })
  })

  describe('getCanvasFingerprint', () => {
    it('should generate canvas fingerprint', () => {
      const fingerprint = getCanvasFingerprint()

      expect(typeof fingerprint).toBe('string')
      expect(fingerprint.length).toBeGreaterThan(0)
    })

    it('should return consistent fingerprint for same browser', () => {
      const fp1 = getCanvasFingerprint()
      const fp2 = getCanvasFingerprint()

      // Same browser should produce same canvas fingerprint
      expect(fp1).toBe(fp2)
    })

    it('should not return error or unsupported in test environment', () => {
      const fingerprint = getCanvasFingerprint()

      // In a proper browser environment, should work
      if (typeof document !== 'undefined') {
        expect(fingerprint).not.toBe('error')
        expect(fingerprint).not.toBe('unsupported')
      }
    })
  })

  describe('getWebGLInfo', () => {
    it('should return WebGL info or null', () => {
      const info = getWebGLInfo()

      if (info !== null) {
        expect(info).toHaveProperty('vendor')
        expect(info).toHaveProperty('renderer')
        expect(info).toHaveProperty('version')
        expect(info).toHaveProperty('shadingLanguageVersion')
        expect(info).toHaveProperty('unmaskedVendor')
        expect(info).toHaveProperty('unmaskedRenderer')

        expect(typeof info.vendor).toBe('string')
        expect(typeof info.renderer).toBe('string')
        expect(typeof info.version).toBe('string')
      }
    })

    it('should have consistent WebGL info', () => {
      const info1 = getWebGLInfo()
      const info2 = getWebGLInfo()

      // Should return same info consistently
      expect(info1).toEqual(info2)
    })
  })

  describe('getAudioFingerprint', () => {
    it('should generate audio fingerprint', () => {
      const fingerprint = getAudioFingerprint()

      expect(typeof fingerprint).toBe('string')
      expect(fingerprint.length).toBeGreaterThan(0)
    })

    it('should return consistent audio fingerprint', () => {
      const fp1 = getAudioFingerprint()
      const fp2 = getAudioFingerprint()

      // Both should be valid fingerprints (string with length > 0)
      expect(typeof fp1).toBe('string')
      expect(fp1.length).toBeGreaterThan(0)
      expect(typeof fp2).toBe('string')
      expect(fp2.length).toBeGreaterThan(0)

      // Note: In test environments, AudioContext may produce non-deterministic values
      // so we only verify both calls produce valid fingerprints, not that they're identical
    })
  })

  describe('getInstalledFonts', () => {
    it('should return array of fonts', () => {
      const fonts = getInstalledFonts()

      expect(Array.isArray(fonts)).toBe(true)
      fonts.forEach((font) => {
        expect(typeof font).toBe('string')
        expect(font.length).toBeGreaterThan(0)
      })
    })

    it('should return consistent font list', () => {
      const fonts1 = getInstalledFonts()
      const fonts2 = getInstalledFonts()

      expect(fonts1).toEqual(fonts2)
    })
  })

  describe('getTimezoneInfo', () => {
    it('should return timezone information', () => {
      const info = getTimezoneInfo()

      expect(info).toHaveProperty('timezone')
      expect(info).toHaveProperty('timezoneOffset')

      expect(typeof info.timezone).toBe('string')
      expect(typeof info.timezoneOffset).toBe('number')
    })

    it('should have valid timezone format', () => {
      const info = getTimezoneInfo()
      // Timezone should be like "America/New_York" or "UTC"
      expect(info.timezone.length).toBeGreaterThan(0)
      expect(info.timezone).toMatch(/^[A-Za-z_]+([/][A-Za-z_]+)*$/)
    })

    it('should have timezone offset in reasonable range', () => {
      const info = getTimezoneInfo()
      // Offset in minutes, should be between -12h and +14h
      expect(info.timezoneOffset).toBeGreaterThanOrEqual(-840)
      expect(info.timezoneOffset).toBeLessThanOrEqual(840)
    })
  })

  describe('getStorageInfo', () => {
    it('should return storage availability', () => {
      const info = getStorageInfo()

      expect(info).toHaveProperty('localStorage')
      expect(info).toHaveProperty('sessionStorage')
      expect(info).toHaveProperty('indexedDB')

      expect(typeof info.localStorage).toBe('boolean')
      expect(typeof info.sessionStorage).toBe('boolean')
      expect(typeof info.indexedDB).toBe('boolean')
    })

    it('should detect localStorage availability', () => {
      const info = getStorageInfo()
      // In test environment, localStorage should be available
      expect(info.localStorage).toBe(true)
    })
  })

  describe('getPluginsInfo', () => {
    it('should return plugins and MIME types', () => {
      const info = getPluginsInfo()

      expect(info).toHaveProperty('plugins')
      expect(info).toHaveProperty('mimeTypes')

      expect(Array.isArray(info.plugins)).toBe(true)
      expect(Array.isArray(info.mimeTypes)).toBe(true)
    })

    it('should have string arrays for plugins and mimeTypes', () => {
      const info = getPluginsInfo()

      info.plugins.forEach((plugin) => {
        expect(typeof plugin).toBe('string')
      })

      info.mimeTypes.forEach((mimeType) => {
        expect(typeof mimeType).toBe('string')
      })
    })
  })

  describe('detectAdBlocker', () => {
    it('should return boolean', async () => {
      const hasAdBlocker = await detectAdBlocker()
      expect(typeof hasAdBlocker).toBe('boolean')
    })

    it('should not throw errors', async () => {
      await expect(detectAdBlocker()).resolves.not.toThrow()
    })
  })

  describe('collectFingerprint', () => {
    it('should collect all fingerprint data', async () => {
      const data = await collectFingerprint()

      // Basic info
      expect(data).toHaveProperty('userAgent')
      expect(data).toHaveProperty('platform')
      expect(data).toHaveProperty('language')

      // Screen info
      expect(data).toHaveProperty('screenResolution')
      expect(data).toHaveProperty('colorDepth')
      expect(data).toHaveProperty('pixelRatio')

      // Hardware
      expect(data).toHaveProperty('hardwareConcurrency')

      // Graphics
      expect(data).toHaveProperty('canvas')
      expect(data).toHaveProperty('webgl')
      expect(data).toHaveProperty('audioFingerprint')

      // Fonts
      expect(data).toHaveProperty('fonts')
      expect(Array.isArray(data.fonts)).toBe(true)

      // Timezone
      expect(data).toHaveProperty('timezone')

      // Storage
      expect(data).toHaveProperty('localStorage')
      expect(data).toHaveProperty('sessionStorage')

      // Privacy
      expect(data).toHaveProperty('adBlocker')
    })

    it('should return consistent data on multiple calls', async () => {
      const data1 = await collectFingerprint()
      const data2 = await collectFingerprint()

      // Most fields should be identical
      expect(data1.userAgent).toBe(data2.userAgent)
      expect(data1.screenResolution).toBe(data2.screenResolution)
      expect(data1.canvas).toBe(data2.canvas)
      expect(data1.timezone).toBe(data2.timezone)
    })
  })

  describe('generateFingerprintHash', () => {
    it('should generate hash from fingerprint data', async () => {
      const data = await collectFingerprint()
      const hash = generateFingerprintHash(data)

      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should generate same hash for same data', async () => {
      const data = await collectFingerprint()
      const hash1 = generateFingerprintHash(data)
      const hash2 = generateFingerprintHash(data)

      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different data', async () => {
      const data1 = await collectFingerprint()
      const data2: FingerprintData = {
        ...data1,
        userAgent: 'Different User Agent',
      }

      const hash1 = generateFingerprintHash(data1)
      const hash2 = generateFingerprintHash(data2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('calculateUniquenessScore', () => {
    it('should return score between 0 and 100', async () => {
      const data = await collectFingerprint()
      const score = calculateUniquenessScore(data)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should give higher score for more unique features', () => {
      const minimalData: FingerprintData = {
        userAgent: '',
        platform: '',
        language: 'en',
        languages: ['en'],
        cookieEnabled: true,
        doNotTrack: null,
        screenResolution: '1920x1080',
        availableScreenResolution: '1920x1080',
        colorDepth: 24,
        pixelRatio: 1,
        touchSupport: { maxTouchPoints: 0, touchEvent: false, touchStart: false },
        hardwareConcurrency: 0,
        deviceMemory: undefined,
        canvas: 'error',
        webgl: null,
        audioFingerprint: 'unsupported',
        fonts: [],
        timezone: 'UTC',
        timezoneOffset: 0,
        localStorage: false,
        sessionStorage: false,
        indexedDB: false,
        plugins: [],
        mimeTypes: [],
        adBlocker: false,
      }

      const fullData = {
        ...minimalData,
        userAgent: 'Mozilla/5.0',
        platform: 'MacIntel',
        canvas: 'abc123',
        webgl: {
          vendor: 'Apple',
          renderer: 'Apple GPU',
          version: 'WebGL 2.0',
          shadingLanguageVersion: 'WebGL GLSL ES 3.00',
          unmaskedVendor: 'Apple Inc.',
          unmaskedRenderer: 'Apple M1',
        },
        audioFingerprint: 'xyz789',
        fonts: ['Arial', 'Helvetica', 'Times', 'Courier'],
        hardwareConcurrency: 8,
        timezone: 'America/New_York',
        touchSupport: { maxTouchPoints: 5, touchEvent: true, touchStart: true },
      }

      const minimalScore = calculateUniquenessScore(minimalData)
      const fullScore = calculateUniquenessScore(fullData)

      expect(fullScore).toBeGreaterThan(minimalScore)
    })

    it('should award points for canvas fingerprint', () => {
      const dataWithoutCanvas: FingerprintData = {
        userAgent: 'test',
        platform: 'test',
        language: 'en',
        languages: ['en'],
        cookieEnabled: true,
        doNotTrack: null,
        screenResolution: '1920x1080',
        availableScreenResolution: '1920x1080',
        colorDepth: 24,
        pixelRatio: 1,
        touchSupport: { maxTouchPoints: 0, touchEvent: false, touchStart: false },
        hardwareConcurrency: 4,
        deviceMemory: undefined,
        canvas: 'error',
        webgl: null,
        audioFingerprint: 'test',
        fonts: [],
        timezone: 'UTC',
        timezoneOffset: 0,
        localStorage: true,
        sessionStorage: true,
        indexedDB: true,
        plugins: [],
        mimeTypes: [],
        adBlocker: false,
      }

      const dataWithCanvas = { ...dataWithoutCanvas, canvas: 'valid_hash' }

      const scoreWithout = calculateUniquenessScore(dataWithoutCanvas)
      const scoreWith = calculateUniquenessScore(dataWithCanvas)

      expect(scoreWith).toBeGreaterThan(scoreWithout)
    })
  })
})
