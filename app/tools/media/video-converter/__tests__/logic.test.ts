import { describe, expect, it } from 'vitest'

// Utility function to format file sizes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

// Utility function to format duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Utility function to calculate space savings percentage
export function calculateSavings(original: number, converted?: number): number {
  if (converted === undefined) return 0
  if (converted === 0 && original > 0) return 100
  return Math.round(((original - converted) / original) * 100)
}

// Utility function to validate video format
export function isValidVideoFormat(filename: string): boolean {
  const validExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv']
  const lowerFilename = filename.toLowerCase()
  return validExtensions.some((ext) => lowerFilename.endsWith(ext))
}

// Utility function to extract filename without extension
export function getFilenameWithoutExtension(filename: string): string {
  return filename.split('.').slice(0, -1).join('.')
}

// Utility function to get file extension
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

describe('Video Converter Utilities', () => {
  describe('formatBytes', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('should format bytes correctly', () => {
      expect(formatBytes(500)).toBe('500 Bytes')
      expect(formatBytes(1023)).toBe('1023 Bytes')
    })

    it('should format KB correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(2048)).toBe('2 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
    })

    it('should format MB correctly', () => {
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(5242880)).toBe('5 MB')
      expect(formatBytes(1572864)).toBe('1.5 MB')
    })

    it('should format GB correctly', () => {
      expect(formatBytes(1073741824)).toBe('1 GB')
      expect(formatBytes(2147483648)).toBe('2 GB')
      expect(formatBytes(1610612736)).toBe('1.5 GB')
    })

    it('should round to 2 decimal places', () => {
      expect(formatBytes(1234567)).toBe('1.18 MB')
    })
  })

  describe('formatDuration', () => {
    it('should format zero seconds correctly', () => {
      expect(formatDuration(0)).toBe('0:00')
    })

    it('should format seconds under 1 minute correctly', () => {
      expect(formatDuration(5)).toBe('0:05')
      expect(formatDuration(30)).toBe('0:30')
      expect(formatDuration(59)).toBe('0:59')
    })

    it('should format minutes and seconds correctly', () => {
      expect(formatDuration(60)).toBe('1:00')
      expect(formatDuration(90)).toBe('1:30')
      expect(formatDuration(125)).toBe('2:05')
    })

    it('should format long durations correctly', () => {
      expect(formatDuration(3600)).toBe('60:00')
      expect(formatDuration(3665)).toBe('61:05')
    })

    it('should pad seconds with leading zero', () => {
      expect(formatDuration(61)).toBe('1:01')
      expect(formatDuration(305)).toBe('5:05')
    })

    it('should handle decimal seconds by flooring', () => {
      expect(formatDuration(65.7)).toBe('1:05')
      expect(formatDuration(90.9)).toBe('1:30')
    })
  })

  describe('calculateSavings', () => {
    it('should return 0 when converted size is undefined', () => {
      expect(calculateSavings(1000)).toBe(0)
      expect(calculateSavings(5000, undefined)).toBe(0)
    })

    it('should calculate percentage correctly', () => {
      expect(calculateSavings(1000, 800)).toBe(20)
      expect(calculateSavings(1000, 500)).toBe(50)
      expect(calculateSavings(1000, 100)).toBe(90)
    })

    it('should handle no savings (same size)', () => {
      expect(calculateSavings(1000, 1000)).toBe(0)
    })

    it('should handle 100% savings (compressed to 0)', () => {
      expect(calculateSavings(1000, 0)).toBe(100)
    })

    it('should handle larger files', () => {
      expect(calculateSavings(10000000, 3000000)).toBe(70)
    })

    it('should round to nearest integer', () => {
      expect(calculateSavings(1000, 666)).toBe(33)
      expect(calculateSavings(1000, 667)).toBe(33)
    })

    it('should handle increase in size (negative savings)', () => {
      expect(calculateSavings(1000, 1200)).toBe(-20)
    })
  })

  describe('isValidVideoFormat', () => {
    it('should accept valid video formats', () => {
      expect(isValidVideoFormat('video.mp4')).toBe(true)
      expect(isValidVideoFormat('movie.webm')).toBe(true)
      expect(isValidVideoFormat('clip.avi')).toBe(true)
      expect(isValidVideoFormat('recording.mov')).toBe(true)
      expect(isValidVideoFormat('film.mkv')).toBe(true)
    })

    it('should be case insensitive', () => {
      expect(isValidVideoFormat('VIDEO.MP4')).toBe(true)
      expect(isValidVideoFormat('Movie.WebM')).toBe(true)
      expect(isValidVideoFormat('CLIP.AVI')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(isValidVideoFormat('document.pdf')).toBe(false)
      expect(isValidVideoFormat('image.jpg')).toBe(false)
      expect(isValidVideoFormat('audio.mp3')).toBe(false)
      expect(isValidVideoFormat('file.txt')).toBe(false)
    })

    it('should handle files with multiple dots', () => {
      expect(isValidVideoFormat('my.video.file.mp4')).toBe(true)
      expect(isValidVideoFormat('test.movie.webm')).toBe(true)
    })

    it('should handle files without extension', () => {
      expect(isValidVideoFormat('videofile')).toBe(false)
    })
  })

  describe('getFilenameWithoutExtension', () => {
    it('should remove single extension', () => {
      expect(getFilenameWithoutExtension('video.mp4')).toBe('video')
      expect(getFilenameWithoutExtension('movie.webm')).toBe('movie')
    })

    it('should handle multiple dots correctly', () => {
      expect(getFilenameWithoutExtension('my.video.file.mp4')).toBe('my.video.file')
      expect(getFilenameWithoutExtension('test.movie.mkv')).toBe('test.movie')
    })

    it('should handle filename without extension', () => {
      expect(getFilenameWithoutExtension('videofile')).toBe('')
    })

    it('should handle filename with only extension', () => {
      expect(getFilenameWithoutExtension('.mp4')).toBe('')
    })
  })

  describe('getFileExtension', () => {
    it('should extract extension correctly', () => {
      expect(getFileExtension('video.mp4')).toBe('mp4')
      expect(getFileExtension('movie.webm')).toBe('webm')
      expect(getFileExtension('clip.avi')).toBe('avi')
    })

    it('should be case insensitive (return lowercase)', () => {
      expect(getFileExtension('VIDEO.MP4')).toBe('mp4')
      expect(getFileExtension('Movie.WEBM')).toBe('webm')
    })

    it('should handle multiple dots', () => {
      expect(getFileExtension('my.video.file.mp4')).toBe('mp4')
    })

    it('should return empty string for no extension', () => {
      expect(getFileExtension('videofile')).toBe('')
    })

    it('should handle dot at start', () => {
      expect(getFileExtension('.mp4')).toBe('mp4')
    })
  })
})
