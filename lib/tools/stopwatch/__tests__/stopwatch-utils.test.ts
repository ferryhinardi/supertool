/**
 * Tests for stopwatch utilities
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  calculateLapStatistics,
  downloadFile,
  exportLapsAsCSV,
  exportLapsAsJSON,
  importPresetsFromFile,
  type LapTime,
  playBeepSound,
} from '../stopwatch-utils'

describe('stopwatch-utils', () => {
  describe('playBeepSound', () => {
    it('should not throw when called in browser environment', () => {
      // Mock AudioContext as a proper constructor
      const mockOscillator = {
        connect: vi.fn(),
        frequency: { value: 0 },
        type: 'sine',
        start: vi.fn(),
        stop: vi.fn(),
      }
      const mockGainNode = {
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      }
      const mockAudioContext = {
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGainNode),
        destination: {},
        currentTime: 0,
      }

      // Use a proper class constructor mock
      class MockAudioContext {
        createOscillator = mockAudioContext.createOscillator
        createGain = mockAudioContext.createGain
        destination = mockAudioContext.destination
        currentTime = mockAudioContext.currentTime
      }

      vi.stubGlobal('AudioContext', MockAudioContext)

      expect(() => playBeepSound()).not.toThrow()
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode)
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination)
      expect(mockOscillator.frequency.value).toBe(800)
      expect(mockOscillator.start).toHaveBeenCalled()
      expect(mockOscillator.stop).toHaveBeenCalled()

      vi.unstubAllGlobals()
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      class BrokenAudioContext {
        constructor() {
          throw new Error('AudioContext not supported')
        }
      }

      vi.stubGlobal('AudioContext', BrokenAudioContext)

      expect(() => playBeepSound()).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to play beep sound:', expect.any(Error))

      consoleSpy.mockRestore()
      vi.unstubAllGlobals()
    })

    it('should fall back to webkitAudioContext when AudioContext is unavailable', () => {
      const mockOscillator = {
        connect: vi.fn(),
        frequency: { value: 0 },
        type: 'sine',
        start: vi.fn(),
        stop: vi.fn(),
      }
      const mockGainNode = {
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      }
      const mockAudioContext = {
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGainNode),
        destination: {},
        currentTime: 0,
      }

      class MockWebkitAudioContext {
        createOscillator = mockAudioContext.createOscillator
        createGain = mockAudioContext.createGain
        destination = mockAudioContext.destination
        currentTime = mockAudioContext.currentTime
      }

      Object.defineProperty(window, 'AudioContext', {
        value: undefined,
        configurable: true,
        writable: true,
      })
      Object.defineProperty(window, 'webkitAudioContext', {
        value: MockWebkitAudioContext,
        configurable: true,
        writable: true,
      })

      expect(() => playBeepSound()).not.toThrow()
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode)
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination)
      expect(mockOscillator.start).toHaveBeenCalled()
      expect(mockOscillator.stop).toHaveBeenCalled()

      delete (window as Window & { webkitAudioContext?: typeof MockWebkitAudioContext })
        .webkitAudioContext
      vi.unstubAllGlobals()
    })
  })

  describe('exportLapsAsCSV', () => {
    it('should return empty string for empty laps array', () => {
      expect(exportLapsAsCSV([], 0)).toBe('')
    })

    it('should export single lap correctly', () => {
      const laps: LapTime[] = [{ id: '1', time: 5000, lapDuration: 5000 }]
      const csv = exportLapsAsCSV(laps, 5000)

      expect(csv).toContain('Lap Number,Lap Time (ms),Total Time (ms),Lap Duration')
      expect(csv).toContain('1,5000,5000,00:05.00,00:05.00')
      expect(csv).toContain('Total Time,5000,00:05.00')
      expect(csv).toContain('Total Laps,1')
    })

    it('should export multiple laps in reverse order (newest first)', () => {
      const laps: LapTime[] = [
        { id: '2', time: 10000, lapDuration: 5000 },
        { id: '1', time: 5000, lapDuration: 5000 },
      ]
      const csv = exportLapsAsCSV(laps, 10000)

      const lines = csv.split('\n')
      // First data row should be lap 2 (newest)
      expect(lines[1]).toContain('2,5000,10000')
      // Second data row should be lap 1
      expect(lines[2]).toContain('1,5000,5000')
    })

    it('should format times correctly', () => {
      const laps: LapTime[] = [{ id: '1', time: 65500, lapDuration: 65500 }]
      const csv = exportLapsAsCSV(laps, 65500)

      // 65500ms = 1:05.50 (65.5 seconds = 1 min 5.5 sec)
      expect(csv).toContain('01:05.50')
    })
  })

  describe('exportLapsAsJSON', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-09T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should export laps with correct structure', () => {
      const laps: LapTime[] = [{ id: '1', time: 5000, lapDuration: 5000 }]
      const json = exportLapsAsJSON(laps, 5000)
      const data = JSON.parse(json)

      expect(data).toHaveProperty('exportDate')
      expect(data).toHaveProperty('totalTime', 5000)
      expect(data).toHaveProperty('totalTimeFormatted', '00:05.00')
      expect(data).toHaveProperty('lapCount', 1)
      expect(data).toHaveProperty('laps')
      expect(data).toHaveProperty('statistics')
    })

    it('should include lap details with formatted times', () => {
      const laps: LapTime[] = [{ id: 'lap-123', time: 10000, lapDuration: 10000 }]
      const json = exportLapsAsJSON(laps, 10000)
      const data = JSON.parse(json)

      expect(data.laps[0]).toEqual({
        lapNumber: 1,
        id: 'lap-123',
        time: 10000,
        timeFormatted: '00:10.00',
        lapDuration: 10000,
        lapDurationFormatted: '00:10.00',
      })
    })

    it('should include statistics in export', () => {
      const laps: LapTime[] = [
        { id: '2', time: 15000, lapDuration: 5000 },
        { id: '1', time: 10000, lapDuration: 10000 },
      ]
      const json = exportLapsAsJSON(laps, 15000)
      const data = JSON.parse(json)

      expect(data.statistics).toHaveProperty('average')
      expect(data.statistics).toHaveProperty('fastest')
      expect(data.statistics).toHaveProperty('slowest')
      expect(data.statistics.fastest).toBe(5000)
      expect(data.statistics.slowest).toBe(10000)
      expect(data.statistics.average).toBe(7500)
    })
  })

  describe('calculateLapStatistics', () => {
    it('should return zeros for empty laps array', () => {
      const stats = calculateLapStatistics([])

      expect(stats.average).toBe(0)
      expect(stats.fastest).toBe(0)
      expect(stats.slowest).toBe(0)
      expect(stats.totalTime).toBe(0)
    })

    it('should calculate statistics for single lap', () => {
      const laps: LapTime[] = [{ id: '1', time: 5000, lapDuration: 5000 }]
      const stats = calculateLapStatistics(laps)

      expect(stats.average).toBe(5000)
      expect(stats.fastest).toBe(5000)
      expect(stats.slowest).toBe(5000)
      expect(stats.totalTime).toBe(5000)
    })

    it('should calculate correct statistics for multiple laps', () => {
      const laps: LapTime[] = [
        { id: '3', time: 18000, lapDuration: 3000 },
        { id: '2', time: 15000, lapDuration: 5000 },
        { id: '1', time: 10000, lapDuration: 10000 },
      ]
      const stats = calculateLapStatistics(laps)

      expect(stats.average).toBe(6000) // (3000 + 5000 + 10000) / 3
      expect(stats.fastest).toBe(3000)
      expect(stats.slowest).toBe(10000)
      expect(stats.totalTime).toBe(18000) // First lap's time
    })

    it('should include formatted time strings', () => {
      const laps: LapTime[] = [{ id: '1', time: 65000, lapDuration: 65000 }]
      const stats = calculateLapStatistics(laps)

      expect(stats.averageFormatted).toBe('01:05.00')
      expect(stats.fastestFormatted).toBe('01:05.00')
      expect(stats.slowestFormatted).toBe('01:05.00')
      expect(stats.totalTimeFormatted).toBe('01:05.00')
    })
  })

  describe('downloadFile', () => {
    it('should create blob, link, and trigger download', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      const mockCreateElement = vi.fn(() => mockLink)
      const mockAppendChild = vi.fn()
      const mockRemoveChild = vi.fn()
      const mockCreateObjectURL = vi.fn(() => 'blob:url')
      const mockRevokeObjectURL = vi.fn()

      vi.stubGlobal('document', {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      })
      vi.stubGlobal('URL', {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      })

      downloadFile('test content', 'test.txt', 'text/plain')

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockLink.href).toBe('blob:url')
      expect(mockLink.download).toBe('test.txt')
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink)
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url')

      vi.unstubAllGlobals()
    })
  })

  describe('importPresetsFromFile', () => {
    it('should parse valid JSON file with presets', async () => {
      const validPresets = [
        { name: 'Work', duration: 1500000 },
        { name: 'Break', duration: 300000 },
      ]
      const file = new File([JSON.stringify(validPresets)], 'presets.json', {
        type: 'application/json',
      })

      const result = await importPresetsFromFile(file)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'Work', duration: 1500000 })
      expect(result[1]).toEqual({ name: 'Break', duration: 300000 })
    })

    it('should filter out invalid presets (missing required fields)', async () => {
      const mixedPresets = [
        { name: 'Valid', duration: 1000 },
        { name: 'Missing Duration' },
        { duration: 2000 },
        { name: 'Also Valid', duration: 3000 },
      ]
      const file = new File([JSON.stringify(mixedPresets)], 'presets.json', {
        type: 'application/json',
      })

      const result = await importPresetsFromFile(file)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Valid')
      expect(result[1].name).toBe('Also Valid')
    })

    it('should reject if file is not an array', async () => {
      const invalidData = { name: 'Not an array', duration: 1000 }
      const file = new File([JSON.stringify(invalidData)], 'presets.json', {
        type: 'application/json',
      })

      await expect(importPresetsFromFile(file)).rejects.toThrow(
        'Invalid file format: expected an array of presets'
      )
    })

    it('should reject if no valid presets found', async () => {
      const noValidPresets = [{ foo: 'bar' }, { baz: 123 }]
      const file = new File([JSON.stringify(noValidPresets)], 'presets.json', {
        type: 'application/json',
      })

      await expect(importPresetsFromFile(file)).rejects.toThrow('No valid presets found in file')
    })

    it('should reject on invalid JSON', async () => {
      const file = new File(['not valid json'], 'presets.json', {
        type: 'application/json',
      })

      await expect(importPresetsFromFile(file)).rejects.toThrow()
    })
  })
})
