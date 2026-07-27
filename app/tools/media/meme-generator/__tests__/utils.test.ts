import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MemeConfig, TextBox } from '../types'
import {
  calculateOptimalFontSize,
  createDefaultTextBoxes,
  downloadMeme,
  formatFileSize,
  generateMeme,
  getPresetPosition,
  loadImage,
  renderTextOnCanvas,
  validateImageFile,
  wrapText,
} from '../utils'

// ============================================================================
// calculateOptimalFontSize Tests
// ============================================================================
describe('calculateOptimalFontSize', () => {
  describe('basic calculations', () => {
    it('calculates 5% of canvas width', () => {
      expect(calculateOptimalFontSize(1000)).toBe(50)
    })

    it('returns 50 for 1000px width', () => {
      expect(calculateOptimalFontSize(1000)).toBe(50)
    })

    it('returns 30 for 600px width', () => {
      expect(calculateOptimalFontSize(600)).toBe(30)
    })

    it('returns 40 for 800px width', () => {
      expect(calculateOptimalFontSize(800)).toBe(40)
    })
  })

  describe('minimum font size constraint (20px)', () => {
    it('returns minimum 20 for very small canvas', () => {
      expect(calculateOptimalFontSize(100)).toBe(20)
    })

    it('returns minimum 20 for 200px width', () => {
      expect(calculateOptimalFontSize(200)).toBe(20)
    })

    it('returns minimum 20 for 300px width', () => {
      expect(calculateOptimalFontSize(300)).toBe(20)
    })

    it('returns minimum 20 for 399px width', () => {
      expect(calculateOptimalFontSize(399)).toBe(20)
    })

    it('returns 20 for exactly 400px width (5% = 20)', () => {
      expect(calculateOptimalFontSize(400)).toBe(20)
    })

    it('returns minimum 20 for 0px width', () => {
      expect(calculateOptimalFontSize(0)).toBe(20)
    })

    it('returns minimum 20 for negative width', () => {
      expect(calculateOptimalFontSize(-100)).toBe(20)
    })
  })

  describe('maximum font size constraint (72px)', () => {
    it('returns maximum 72 for very large canvas', () => {
      expect(calculateOptimalFontSize(2000)).toBe(72)
    })

    it('returns maximum 72 for 1500px width', () => {
      expect(calculateOptimalFontSize(1500)).toBe(72)
    })

    it('returns maximum 72 for 1440px width (5% = 72)', () => {
      expect(calculateOptimalFontSize(1440)).toBe(72)
    })

    it('returns maximum 72 for 3000px width', () => {
      expect(calculateOptimalFontSize(3000)).toBe(72)
    })

    it('returns maximum 72 for 5000px width', () => {
      expect(calculateOptimalFontSize(5000)).toBe(72)
    })
  })

  describe('boundary cases', () => {
    it('returns exactly 20 at boundary (400px)', () => {
      expect(calculateOptimalFontSize(400)).toBe(20)
    })

    it('returns 20.05 rounded behavior for 401px', () => {
      const result = calculateOptimalFontSize(401)
      expect(result).toBeGreaterThan(20)
      expect(result).toBeLessThan(21)
    })

    it('returns exactly 72 at boundary (1440px)', () => {
      expect(calculateOptimalFontSize(1440)).toBe(72)
    })

    it('returns 71.95 for 1439px', () => {
      const result = calculateOptimalFontSize(1439)
      expect(result).toBeLessThan(72)
      expect(result).toBeGreaterThan(71)
    })
  })

  describe('common canvas sizes', () => {
    it('handles 640x480 canvas width', () => {
      expect(calculateOptimalFontSize(640)).toBe(32)
    })

    it('handles 1280x720 (HD) canvas width', () => {
      expect(calculateOptimalFontSize(1280)).toBe(64)
    })

    it('handles 1920x1080 (Full HD) canvas width', () => {
      expect(calculateOptimalFontSize(1920)).toBe(72) // capped at max
    })

    it('handles 800x600 canvas width', () => {
      expect(calculateOptimalFontSize(800)).toBe(40)
    })

    it('handles 1200x1200 (square) canvas width', () => {
      expect(calculateOptimalFontSize(1200)).toBe(60)
    })
  })
})

// ============================================================================
// getPresetPosition Tests
// ============================================================================
describe('getPresetPosition', () => {
  describe('top position', () => {
    it('returns y: 5 for top position', () => {
      expect(getPresetPosition('top')).toEqual({ y: 5 })
    })

    it('returns correct object structure', () => {
      const result = getPresetPosition('top')
      expect(result).toHaveProperty('y')
      expect(typeof result.y).toBe('number')
    })
  })

  describe('middle position', () => {
    it('returns y: 45 for middle position', () => {
      expect(getPresetPosition('middle')).toEqual({ y: 45 })
    })

    it('middle position is roughly centered', () => {
      const result = getPresetPosition('middle')
      expect(result.y).toBeGreaterThan(40)
      expect(result.y).toBeLessThan(50)
    })
  })

  describe('bottom position', () => {
    it('returns y: 85 for bottom position', () => {
      expect(getPresetPosition('bottom')).toEqual({ y: 85 })
    })

    it('bottom position is near bottom edge', () => {
      const result = getPresetPosition('bottom')
      expect(result.y).toBeGreaterThan(80)
      expect(result.y).toBeLessThan(100)
    })
  })

  describe('custom position', () => {
    it('returns y: 50 for custom position', () => {
      expect(getPresetPosition('custom')).toEqual({ y: 50 })
    })

    it('custom defaults to center', () => {
      const result = getPresetPosition('custom')
      expect(result.y).toBe(50)
    })
  })

  describe('position ordering', () => {
    it('top < middle < bottom', () => {
      const top = getPresetPosition('top').y
      const middle = getPresetPosition('middle').y
      const bottom = getPresetPosition('bottom').y
      expect(top).toBeLessThan(middle)
      expect(middle).toBeLessThan(bottom)
    })

    it('all positions are within valid range (0-100)', () => {
      const positions: Array<'top' | 'middle' | 'bottom' | 'custom'> = [
        'top',
        'middle',
        'bottom',
        'custom',
      ]
      positions.forEach((pos) => {
        const result = getPresetPosition(pos)
        expect(result.y).toBeGreaterThanOrEqual(0)
        expect(result.y).toBeLessThanOrEqual(100)
      })
    })
  })
})

// ============================================================================
// validateImageFile Tests
// ============================================================================
describe('validateImageFile', () => {
  describe('valid image files', () => {
    it('accepts JPEG files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      expect(validateImageFile(file)).toEqual({ valid: true })
    })

    it('accepts PNG files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      expect(validateImageFile(file)).toEqual({ valid: true })
    })

    it('accepts GIF files', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' })
      expect(validateImageFile(file)).toEqual({ valid: true })
    })

    it('accepts WebP files', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' })
      expect(validateImageFile(file)).toEqual({ valid: true })
    })

    it('accepts BMP files', () => {
      const file = new File([''], 'test.bmp', { type: 'image/bmp' })
      expect(validateImageFile(file)).toEqual({ valid: true })
    })

    it('accepts SVG files', () => {
      const file = new File([''], 'test.svg', { type: 'image/svg+xml' })
      expect(validateImageFile(file)).toEqual({ valid: true })
    })
  })

  describe('invalid file types', () => {
    it('rejects text files', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must be an image')
    })

    it('rejects PDF files', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must be an image')
    })

    it('rejects video files', () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must be an image')
    })

    it('rejects audio files', () => {
      const file = new File([''], 'test.mp3', { type: 'audio/mpeg' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must be an image')
    })

    it('rejects JavaScript files', () => {
      const file = new File([''], 'test.js', { type: 'application/javascript' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must be an image')
    })

    it('rejects JSON files', () => {
      const file = new File([''], 'test.json', { type: 'application/json' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must be an image')
    })

    it('rejects HTML files', () => {
      const file = new File([''], 'test.html', { type: 'text/html' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must be an image')
    })

    it('rejects ZIP files', () => {
      const file = new File([''], 'test.zip', { type: 'application/zip' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must be an image')
    })
  })

  describe('file size validation', () => {
    it('accepts files under 10MB', () => {
      const file = new File(['x'.repeat(1000)], 'test.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }) // 5MB
      expect(validateImageFile(file)).toEqual({ valid: true })
    })

    it('accepts files exactly 10MB', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }) // 10MB
      expect(validateImageFile(file)).toEqual({ valid: true })
    })

    it('rejects files over 10MB', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 }) // 10MB + 1 byte
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Image must be smaller than 10MB')
    })

    it('rejects 15MB files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Image must be smaller than 10MB')
    })

    it('rejects 100MB files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 100 * 1024 * 1024 })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Image must be smaller than 10MB')
    })

    it('accepts 1KB files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 1024 })
      expect(validateImageFile(file)).toEqual({ valid: true })
    })

    it('accepts empty files (0 bytes)', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 0 })
      expect(validateImageFile(file)).toEqual({ valid: true })
    })
  })

  describe('error message format', () => {
    it('returns error property only when invalid', () => {
      const validFile = new File([''], 'test.png', { type: 'image/png' })
      const result = validateImageFile(validFile)
      expect(result).not.toHaveProperty('error')
    })

    it('includes error message for invalid type', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' })
      const result = validateImageFile(file)
      expect(result.error).toBeDefined()
      expect(typeof result.error).toBe('string')
    })

    it('includes error message for invalid size', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 })
      const result = validateImageFile(file)
      expect(result.error).toBeDefined()
      expect(typeof result.error).toBe('string')
    })
  })
})

// ============================================================================
// createDefaultTextBoxes Tests
// ============================================================================
describe('createDefaultTextBoxes', () => {
  describe('box count 0', () => {
    it('returns empty array for 0 boxes', () => {
      expect(createDefaultTextBoxes(0)).toEqual([])
    })

    it('returns array type', () => {
      expect(Array.isArray(createDefaultTextBoxes(0))).toBe(true)
    })
  })

  describe('box count 1 (top only)', () => {
    it('returns 1 text box', () => {
      const boxes = createDefaultTextBoxes(1)
      expect(boxes).toHaveLength(1)
    })

    it('first box has id "top"', () => {
      const boxes = createDefaultTextBoxes(1)
      expect(boxes[0].id).toBe('top')
    })

    it('first box has position "top"', () => {
      const boxes = createDefaultTextBoxes(1)
      expect(boxes[0].position).toBe('top')
    })

    it('first box has y: 5', () => {
      const boxes = createDefaultTextBoxes(1)
      expect(boxes[0].y).toBe(5)
    })

    it('first box has centered x: 50', () => {
      const boxes = createDefaultTextBoxes(1)
      expect(boxes[0].x).toBe(50)
    })

    it('first box has correct default styling', () => {
      const boxes = createDefaultTextBoxes(1)
      expect(boxes[0].fontSize).toBe(48)
      expect(boxes[0].fontFamily).toBe('Impact, sans-serif')
      expect(boxes[0].color).toBe('#FFFFFF')
      expect(boxes[0].strokeColor).toBe('#000000')
      expect(boxes[0].strokeWidth).toBe(3)
      expect(boxes[0].align).toBe('center')
      expect(boxes[0].uppercase).toBe(true)
      expect(boxes[0].shadowEnabled).toBe(true)
      expect(boxes[0].rotation).toBe(0)
    })

    it('first box has empty text', () => {
      const boxes = createDefaultTextBoxes(1)
      expect(boxes[0].text).toBe('')
    })
  })

  describe('box count 2 (top + bottom)', () => {
    it('returns 2 text boxes', () => {
      const boxes = createDefaultTextBoxes(2)
      expect(boxes).toHaveLength(2)
    })

    it('has top and bottom boxes', () => {
      const boxes = createDefaultTextBoxes(2)
      expect(boxes[0].id).toBe('top')
      expect(boxes[1].id).toBe('bottom')
    })

    it('bottom box has position "bottom"', () => {
      const boxes = createDefaultTextBoxes(2)
      expect(boxes[1].position).toBe('bottom')
    })

    it('bottom box has y: 85', () => {
      const boxes = createDefaultTextBoxes(2)
      expect(boxes[1].y).toBe(85)
    })

    it('both boxes have same styling', () => {
      const boxes = createDefaultTextBoxes(2)
      expect(boxes[0].fontSize).toBe(boxes[1].fontSize)
      expect(boxes[0].fontFamily).toBe(boxes[1].fontFamily)
      expect(boxes[0].color).toBe(boxes[1].color)
      expect(boxes[0].strokeColor).toBe(boxes[1].strokeColor)
    })

    it('both boxes are centered horizontally', () => {
      const boxes = createDefaultTextBoxes(2)
      expect(boxes[0].x).toBe(50)
      expect(boxes[1].x).toBe(50)
    })
  })

  describe('box count 3 (top + bottom + middle)', () => {
    it('returns 3 text boxes', () => {
      const boxes = createDefaultTextBoxes(3)
      expect(boxes).toHaveLength(3)
    })

    it('has top, bottom, and middle boxes', () => {
      const boxes = createDefaultTextBoxes(3)
      expect(boxes[0].id).toBe('top')
      expect(boxes[1].id).toBe('bottom')
      expect(boxes[2].id).toBe('middle')
    })

    it('middle box has position "middle"', () => {
      const boxes = createDefaultTextBoxes(3)
      expect(boxes[2].position).toBe('middle')
    })

    it('middle box has y: 45', () => {
      const boxes = createDefaultTextBoxes(3)
      expect(boxes[2].y).toBe(45)
    })

    it('all boxes have empty text', () => {
      const boxes = createDefaultTextBoxes(3)
      boxes.forEach((box) => {
        expect(box.text).toBe('')
      })
    })
  })

  describe('box count > 3', () => {
    it('returns only 3 boxes for count 4', () => {
      const boxes = createDefaultTextBoxes(4)
      expect(boxes).toHaveLength(3)
    })

    it('returns only 3 boxes for count 5', () => {
      const boxes = createDefaultTextBoxes(5)
      expect(boxes).toHaveLength(3)
    })

    it('returns only 3 boxes for count 10', () => {
      const boxes = createDefaultTextBoxes(10)
      expect(boxes).toHaveLength(3)
    })
  })

  describe('box structure validation', () => {
    it('all boxes have required properties', () => {
      const boxes = createDefaultTextBoxes(3)
      const requiredProps = [
        'id',
        'text',
        'position',
        'x',
        'y',
        'fontSize',
        'fontFamily',
        'color',
        'strokeColor',
        'strokeWidth',
        'align',
        'uppercase',
        'shadowEnabled',
        'rotation',
      ]
      boxes.forEach((box) => {
        requiredProps.forEach((prop) => {
          expect(box).toHaveProperty(prop)
        })
      })
    })

    it('boxes have unique ids', () => {
      const boxes = createDefaultTextBoxes(3)
      const ids = boxes.map((b) => b.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('boxes have different y positions', () => {
      const boxes = createDefaultTextBoxes(3)
      const yPositions = boxes.map((b) => b.y)
      expect(new Set(yPositions).size).toBe(yPositions.length)
    })
  })

  describe('negative box counts', () => {
    it('returns empty array for negative count', () => {
      expect(createDefaultTextBoxes(-1)).toEqual([])
    })

    it('returns empty array for -5', () => {
      expect(createDefaultTextBoxes(-5)).toEqual([])
    })
  })
})

// ============================================================================
// formatFileSize Tests
// ============================================================================
describe('formatFileSize', () => {
  describe('bytes (< 1024)', () => {
    it('returns "0 Bytes" for 0', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
    })

    it('returns "1.00 Bytes" for 1 byte', () => {
      expect(formatFileSize(1)).toBe('1.00 Bytes')
    })

    it('returns "500.00 Bytes" for 500 bytes', () => {
      expect(formatFileSize(500)).toBe('500.00 Bytes')
    })

    it('returns "1023.00 Bytes" for 1023 bytes', () => {
      expect(formatFileSize(1023)).toBe('1023.00 Bytes')
    })
  })

  describe('kilobytes (1024 - 1048575)', () => {
    it('returns "1.00 KB" for 1024 bytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB')
    })

    it('returns "1.50 KB" for 1536 bytes', () => {
      expect(formatFileSize(1536)).toBe('1.50 KB')
    })

    it('returns "10.00 KB" for 10240 bytes', () => {
      expect(formatFileSize(10240)).toBe('10.00 KB')
    })

    it('returns "100.00 KB" for 102400 bytes', () => {
      expect(formatFileSize(102400)).toBe('100.00 KB')
    })

    it('returns "1023.00 KB" for 1047552 bytes', () => {
      expect(formatFileSize(1047552)).toBe('1023.00 KB')
    })
  })

  describe('megabytes (>= 1048576)', () => {
    it('returns "1.00 MB" for 1048576 bytes', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB')
    })

    it('returns "5.00 MB" for 5242880 bytes', () => {
      expect(formatFileSize(5242880)).toBe('5.00 MB')
    })

    it('returns "10.00 MB" for 10485760 bytes', () => {
      expect(formatFileSize(10485760)).toBe('10.00 MB')
    })

    it('returns approximately "1.50 MB" for 1.5 MB', () => {
      expect(formatFileSize(1572864)).toBe('1.50 MB')
    })
  })

  describe('decimal precision', () => {
    it('shows 2 decimal places', () => {
      const result = formatFileSize(1500)
      expect(result).toMatch(/\d+\.\d{2}/)
    })

    it('rounds correctly for 1025 bytes', () => {
      expect(formatFileSize(1025)).toBe('1.00 KB')
    })

    it('formats 2560 bytes correctly', () => {
      expect(formatFileSize(2560)).toBe('2.50 KB')
    })
  })

  describe('edge cases', () => {
    it('handles very large numbers', () => {
      // 100 MB
      const result = formatFileSize(104857600)
      expect(result).toBe('100.00 MB')
    })

    it('handles exact power of 1024', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(1048576)).toBe('1.00 MB')
    })
  })
})

// ============================================================================
// wrapText Tests (requires canvas context mock)
// ============================================================================
describe('wrapText', () => {
  let mockCtx: CanvasRenderingContext2D

  beforeEach(() => {
    mockCtx = {
      measureText: vi.fn((text: string) => ({ width: text.length * 10 })) as unknown as (
        text: string
      ) => TextMetrics,
    } as unknown as CanvasRenderingContext2D
  })

  describe('single word', () => {
    it('returns single word as one line', () => {
      const result = wrapText(mockCtx, 'Hello', 1000)
      expect(result).toEqual(['Hello'])
    })

    it('handles empty string', () => {
      const result = wrapText(mockCtx, '', 1000)
      expect(result).toEqual([''])
    })
  })

  describe('multiple words that fit', () => {
    it('keeps words on same line when they fit', () => {
      const result = wrapText(mockCtx, 'Hello World', 1000)
      expect(result).toEqual(['Hello World'])
    })

    it('handles three words that fit', () => {
      const result = wrapText(mockCtx, 'Hello Beautiful World', 1000)
      expect(result).toEqual(['Hello Beautiful World'])
    })
  })

  describe('wrapping when text exceeds width', () => {
    it('wraps text when exceeding max width', () => {
      // Each char is 10px, so "Hello World" = 110px
      // Max width 50px should cause wrap
      const result = wrapText(mockCtx, 'Hello World', 50)
      expect(result.length).toBeGreaterThan(1)
    })

    it('wraps long sentence into multiple lines', () => {
      const result = wrapText(mockCtx, 'This is a very long sentence that should wrap', 100)
      expect(result.length).toBeGreaterThan(1)
    })
  })

  describe('measureText integration', () => {
    it('calls measureText for each word combination', () => {
      wrapText(mockCtx, 'Hello Beautiful World', 1000)
      expect(mockCtx.measureText).toHaveBeenCalled()
    })

    it('uses measureText to determine line breaks', () => {
      // Custom mock that returns specific widths
      mockCtx.measureText = vi.fn((text: string) => ({
        width: text === 'Hello World' ? 200 : text.length * 10,
      })) as unknown as (text: string) => TextMetrics
      const result = wrapText(mockCtx, 'Hello World Test', 150)
      expect(result.length).toBeGreaterThan(1)
    })
  })

  describe('edge cases', () => {
    it('handles single character words', () => {
      const result = wrapText(mockCtx, 'a b c d e', 1000)
      expect(result).toEqual(['a b c d e'])
    })

    it('handles text with multiple spaces', () => {
      const result = wrapText(mockCtx, 'Hello  World', 1000) // Note: double space becomes single
      // The function splits by single space, so double space creates empty string
      expect(result.length).toBeGreaterThanOrEqual(1)
    })
  })
})

// ============================================================================
// renderTextOnCanvas Tests (requires canvas context mock)
// ============================================================================
describe('renderTextOnCanvas', () => {
  let mockCtx: CanvasRenderingContext2D

  beforeEach(() => {
    mockCtx = {
      font: '',
      textAlign: 'left' as CanvasTextAlign,
      textBaseline: 'alphabetic' as CanvasTextBaseline,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      lineJoin: 'miter' as CanvasLineJoin,
      miterLimit: 10,
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      fillText: vi.fn(),
      strokeText: vi.fn(),
    } as unknown as CanvasRenderingContext2D
  })

  const createTextBox = (overrides: Partial<TextBox> = {}): TextBox => ({
    id: 'test',
    text: 'Hello World',
    position: 'top',
    x: 50,
    y: 10,
    fontSize: 48,
    fontFamily: 'Impact, sans-serif',
    color: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 3,
    align: 'center',
    uppercase: false,
    shadowEnabled: false,
    rotation: 0,
    ...overrides,
  })

  describe('text rendering', () => {
    it('calls fillText with correct text', () => {
      const textBox = createTextBox({ text: 'Test Text' })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.fillText).toHaveBeenCalledWith('Test Text', 500, 50)
    })

    it('converts text to uppercase when uppercase is true', () => {
      const textBox = createTextBox({ text: 'hello', uppercase: true })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.fillText).toHaveBeenCalledWith('HELLO', 500, 50)
    })

    it('keeps original case when uppercase is false', () => {
      const textBox = createTextBox({ text: 'Hello', uppercase: false })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.fillText).toHaveBeenCalledWith('Hello', 500, 50)
    })
  })

  describe('position calculations', () => {
    it('calculates x position as percentage of canvas width', () => {
      const textBox = createTextBox({ x: 25 })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.fillText).toHaveBeenCalledWith(expect.any(String), 250, expect.any(Number))
    })

    it('calculates y position as percentage of canvas height', () => {
      const textBox = createTextBox({ y: 20 })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.fillText).toHaveBeenCalledWith(expect.any(String), expect.any(Number), 100)
    })

    it('handles 0% position', () => {
      const textBox = createTextBox({ x: 0, y: 0 })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.fillText).toHaveBeenCalledWith(expect.any(String), 0, 0)
    })

    it('handles 100% position', () => {
      const textBox = createTextBox({ x: 100, y: 100 })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.fillText).toHaveBeenCalledWith(expect.any(String), 1000, 500)
    })
  })

  describe('font styling', () => {
    it('sets correct font string', () => {
      const textBox = createTextBox({ fontSize: 36, fontFamily: 'Arial' })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.font).toBe('36px Arial')
    })

    it('sets text alignment', () => {
      const textBox = createTextBox({ align: 'left' })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.textAlign).toBe('left')
    })

    it('sets textBaseline to top', () => {
      const textBox = createTextBox()
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.textBaseline).toBe('top')
    })

    it('sets fill color', () => {
      const textBox = createTextBox({ color: '#FF0000' })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.fillStyle).toBe('#FF0000')
    })
  })

  describe('stroke (outline)', () => {
    it('draws stroke when strokeWidth > 0', () => {
      const textBox = createTextBox({ strokeWidth: 3 })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.strokeText).toHaveBeenCalled()
    })

    it('does not draw stroke when strokeWidth is 0', () => {
      const textBox = createTextBox({ strokeWidth: 0 })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.strokeText).not.toHaveBeenCalled()
    })

    it('sets stroke color', () => {
      const textBox = createTextBox({ strokeColor: '#0000FF', strokeWidth: 2 })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.strokeStyle).toBe('#0000FF')
    })

    it('sets line width', () => {
      const textBox = createTextBox({ strokeWidth: 5 })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.lineWidth).toBe(5)
    })

    it('sets lineJoin to round', () => {
      const textBox = createTextBox({ strokeWidth: 2 })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.lineJoin).toBe('round')
    })
  })

  describe('shadow effects', () => {
    it('applies shadow when shadowEnabled is true', () => {
      const textBox = createTextBox({ shadowEnabled: true })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      // Shadow should be set before drawing
      expect(mockCtx.shadowColor).toBe('transparent') // Reset after drawing
    })

    it('resets shadow after drawing', () => {
      const textBox = createTextBox({ shadowEnabled: true })
      renderTextOnCanvas(mockCtx, textBox, 1000, 500)
      expect(mockCtx.shadowColor).toBe('transparent')
      expect(mockCtx.shadowBlur).toBe(0)
      expect(mockCtx.shadowOffsetX).toBe(0)
      expect(mockCtx.shadowOffsetY).toBe(0)
    })
  })
})

// ============================================================================
// loadImage Tests (requires Image mock)
// ============================================================================
describe('loadImage', () => {
  let originalImage: typeof Image

  beforeEach(() => {
    originalImage = global.Image
    // Mock Image constructor with class-based approach
    global.Image = class MockImage {
      crossOrigin = ''
      src = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      width = 800
      height = 600

      constructor() {
        // Simulate async image loading
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 0)
      }
    } as unknown as typeof Image
  })

  afterEach(() => {
    global.Image = originalImage
  })

  describe('loading from URL', () => {
    it('loads image from URL string', async () => {
      const promise = loadImage('https://example.com/image.jpg')
      await expect(promise).resolves.toBeDefined()
    })

    it('sets crossOrigin to anonymous', async () => {
      let capturedCrossOrigin = ''
      global.Image = class MockImage {
        crossOrigin = ''
        src = ''
        onload: (() => void) | null = null
        onerror: (() => void) | null = null

        constructor() {
          setTimeout(() => {
            capturedCrossOrigin = this.crossOrigin
            if (this.onload) this.onload()
          }, 0)
        }
      } as unknown as typeof Image

      await loadImage('https://example.com/image.jpg')
      expect(capturedCrossOrigin).toBe('anonymous')
    })

    it('sets src to the provided URL', async () => {
      let capturedSrc = ''
      global.Image = class MockImage {
        crossOrigin = ''
        private _src = ''
        get src() {
          return this._src
        }
        set src(value: string) {
          this._src = value
          capturedSrc = value
        }
        onload: (() => void) | null = null
        onerror: (() => void) | null = null

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload()
          }, 0)
        }
      } as unknown as typeof Image

      await loadImage('https://example.com/test.png')
      expect(capturedSrc).toBe('https://example.com/test.png')
    })
  })

  describe('loading from File', () => {
    let originalFileReader: typeof FileReader

    beforeEach(() => {
      originalFileReader = global.FileReader
      global.FileReader = class MockFileReader {
        onload: ((e: { target: { result: string } }) => void) | null = null
        onerror: (() => void) | null = null

        readAsDataURL() {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: 'data:image/png;base64,test' } })
            }
          }, 0)
        }
      } as unknown as typeof FileReader
    })

    afterEach(() => {
      global.FileReader = originalFileReader
    })

    it('loads image from File object', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      const promise = loadImage(file)
      await expect(promise).resolves.toBeDefined()
    })
  })

  describe('error handling', () => {
    it('rejects on image load error', async () => {
      global.Image = class MockImage {
        crossOrigin = ''
        src = ''
        onload: (() => void) | null = null
        onerror: (() => void) | null = null

        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror()
          }, 0)
        }
      } as unknown as typeof Image

      await expect(loadImage('https://invalid.com/image.jpg')).rejects.toThrow(
        'Failed to load image'
      )
    })
  })
})

// ============================================================================
// generateMeme Tests (requires document/canvas mock)
// ============================================================================
describe('generateMeme', () => {
  let mockCanvas: HTMLCanvasElement
  let mockCtx: CanvasRenderingContext2D

  beforeEach(() => {
    mockCtx = {
      drawImage: vi.fn(),
      font: '',
      textAlign: 'left' as CanvasTextAlign,
      textBaseline: 'alphabetic' as CanvasTextBaseline,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      lineJoin: 'miter' as CanvasLineJoin,
      miterLimit: 10,
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      fillText: vi.fn(),
      strokeText: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockdata'),
    } as unknown as HTMLCanvasElement

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas
      return document.createElement(tagName)
    })

    // Mock Image for loadImage
    global.Image = class MockImage {
      crossOrigin = ''
      src = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      width = 800
      height = 600

      constructor() {
        setTimeout(() => this.onload?.(), 0)
      }
    } as unknown as typeof Image
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createMemeConfig = (overrides: Partial<MemeConfig> = {}): MemeConfig => ({
    template: {
      id: '1',
      name: 'Test Template',
      category: 'classic',
      imageUrl: 'https://example.com/meme.jpg',
      width: 800,
      height: 600,
      boxCount: 2,
      keywords: ['test'],
      popularity: 5,
    },
    customImage: null,
    textBoxes: [
      {
        id: 'top',
        text: 'Top Text',
        position: 'top',
        x: 50,
        y: 5,
        fontSize: 48,
        fontFamily: 'Impact',
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 3,
        align: 'center',
        uppercase: true,
        shadowEnabled: true,
        rotation: 0,
      },
    ],
    canvasWidth: 800,
    canvasHeight: 600,
    ...overrides,
  })

  describe('canvas setup', () => {
    it('creates canvas element', async () => {
      const config = createMemeConfig()
      await generateMeme(config)
      expect(document.createElement).toHaveBeenCalledWith('canvas')
    })

    it('sets canvas dimensions from config', async () => {
      const config = createMemeConfig({ canvasWidth: 1200, canvasHeight: 900 })
      await generateMeme(config)
      expect(mockCanvas.width).toBe(1200)
      expect(mockCanvas.height).toBe(900)
    })

    it('gets 2d context', async () => {
      const config = createMemeConfig()
      await generateMeme(config)
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    })
  })

  describe('image source handling', () => {
    it('uses template imageUrl when no custom image', async () => {
      const config = createMemeConfig()
      await generateMeme(config)
      expect(mockCtx.drawImage).toHaveBeenCalled()
    })

    it('throws error when no image source provided', async () => {
      const config = createMemeConfig({ template: null, customImage: null })
      await expect(generateMeme(config)).rejects.toThrow('No image source provided')
    })
  })

  describe('text rendering', () => {
    it('renders text boxes with content', async () => {
      const config = createMemeConfig()
      await generateMeme(config)
      expect(mockCtx.fillText).toHaveBeenCalled()
    })

    it('skips empty text boxes', async () => {
      const config = createMemeConfig({
        textBoxes: [
          {
            id: 'top',
            text: '   ', // whitespace only
            position: 'top',
            x: 50,
            y: 5,
            fontSize: 48,
            fontFamily: 'Impact',
            color: '#FFFFFF',
            strokeColor: '#000000',
            strokeWidth: 3,
            align: 'center',
            uppercase: true,
            shadowEnabled: true,
            rotation: 0,
          },
        ],
      })
      await generateMeme(config)
      // fillText should not be called for empty text
      expect(mockCtx.fillText).not.toHaveBeenCalled()
    })
  })

  describe('output', () => {
    it('returns data URL', async () => {
      const config = createMemeConfig()
      const result = await generateMeme(config)
      expect(result).toBe('data:image/png;base64,mockdata')
    })

    it('calls toDataURL with png format', async () => {
      const config = createMemeConfig()
      await generateMeme(config)
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png')
    })
  })

  describe('error handling', () => {
    it('throws error if canvas context is null', async () => {
      mockCanvas.getContext = vi.fn().mockReturnValue(null)
      const config = createMemeConfig()
      await expect(generateMeme(config)).rejects.toThrow('Failed to get canvas context')
    })
  })
})

// ============================================================================
// downloadMeme Tests (requires document mock)
// ============================================================================
describe('downloadMeme', () => {
  let mockLink: HTMLAnchorElement
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') return mockLink
      return document.createElement(tagName)
    })

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink)
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('link creation', () => {
    it('creates anchor element', () => {
      downloadMeme('data:image/png;base64,test')
      expect(document.createElement).toHaveBeenCalledWith('a')
    })

    it('sets href to data URL', () => {
      downloadMeme('data:image/png;base64,testdata')
      expect(mockLink.href).toBe('data:image/png;base64,testdata')
    })
  })

  describe('filename handling', () => {
    it('uses default filename "meme.png"', () => {
      downloadMeme('data:image/png;base64,test')
      expect(mockLink.download).toBe('meme.png')
    })

    it('uses custom filename when provided', () => {
      downloadMeme('data:image/png;base64,test', 'custom-meme.png')
      expect(mockLink.download).toBe('custom-meme.png')
    })

    it('handles filenames with different extensions', () => {
      downloadMeme('data:image/png;base64,test', 'meme.jpg')
      expect(mockLink.download).toBe('meme.jpg')
    })
  })

  describe('download process', () => {
    it('appends link to body', () => {
      downloadMeme('data:image/png;base64,test')
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
    })

    it('triggers click on link', () => {
      downloadMeme('data:image/png;base64,test')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('removes link from body after click', () => {
      downloadMeme('data:image/png;base64,test')
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
    })

    it('executes in correct order: append -> click -> remove', () => {
      const callOrder: string[] = []
      appendChildSpy.mockImplementation(() => {
        callOrder.push('append')
        return mockLink
      })
      mockLink.click = vi.fn(() => callOrder.push('click'))
      removeChildSpy.mockImplementation(() => {
        callOrder.push('remove')
        return mockLink
      })

      downloadMeme('data:image/png;base64,test')
      expect(callOrder).toEqual(['append', 'click', 'remove'])
    })
  })
})
