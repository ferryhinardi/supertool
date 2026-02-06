import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  colorPalette,
  downloadFile,
  generateSVG,
  type SizePreset,
  sizePresets,
  svgToDataURL,
  svgToPNG,
} from '../templates'

describe('Placeholder Generator Templates', () => {
  describe('sizePresets', () => {
    it('contains presets for all categories', () => {
      const categories = ['web', 'social', 'video', 'print', 'ad']

      for (const category of categories) {
        const presetsInCategory = sizePresets.filter((p) => p.category === category)
        expect(presetsInCategory.length).toBeGreaterThan(0)
      }
    })

    it('has correct structure for each preset', () => {
      for (const preset of sizePresets) {
        expect(preset).toHaveProperty('name')
        expect(preset).toHaveProperty('width')
        expect(preset).toHaveProperty('height')
        expect(preset).toHaveProperty('category')
        expect(typeof preset.name).toBe('string')
        expect(typeof preset.width).toBe('number')
        expect(typeof preset.height).toBe('number')
        expect(['web', 'social', 'video', 'print', 'ad']).toContain(preset.category)
      }
    })

    it('has positive dimensions for all presets', () => {
      for (const preset of sizePresets) {
        expect(preset.width).toBeGreaterThan(0)
        expect(preset.height).toBeGreaterThan(0)
      }
    })

    it('includes expected web presets', () => {
      const webPresets = sizePresets.filter((p) => p.category === 'web')
      const webNames = webPresets.map((p) => p.name)

      expect(webNames).toContain('Full HD')
      expect(webNames).toContain('HD')
      expect(webNames).toContain('Laptop')
      expect(webNames).toContain('Mobile')
      expect(webNames).toContain('Tablet Landscape')
      expect(webNames).toContain('Tablet Portrait')
    })

    it('includes expected social media presets', () => {
      const socialPresets = sizePresets.filter((p) => p.category === 'social')
      const socialNames = socialPresets.map((p) => p.name)

      expect(socialNames).toContain('Instagram Square')
      expect(socialNames).toContain('Instagram Story')
      expect(socialNames).toContain('Facebook Cover')
      expect(socialNames).toContain('Twitter Card')
      expect(socialNames).toContain('YouTube Thumbnail')
      expect(socialNames).toContain('LinkedIn Post')
      expect(socialNames).toContain('Pinterest Pin')
    })

    it('includes expected video presets', () => {
      const videoPresets = sizePresets.filter((p) => p.category === 'video')
      const videoNames = videoPresets.map((p) => p.name)

      expect(videoNames).toContain('4K Ultra HD')
      expect(videoNames).toContain('1080p')
      expect(videoNames).toContain('720p')
      expect(videoNames).toContain('480p')
      expect(videoNames).toContain('Vertical Video')
    })

    it('includes expected print presets', () => {
      const printPresets = sizePresets.filter((p) => p.category === 'print')
      const printNames = printPresets.map((p) => p.name)

      expect(printNames).toContain('A4 (300 DPI)')
      expect(printNames).toContain('A3 (300 DPI)')
      expect(printNames).toContain('Letter (300 DPI)')
    })

    it('includes expected ad banner presets', () => {
      const adPresets = sizePresets.filter((p) => p.category === 'ad')
      const adNames = adPresets.map((p) => p.name)

      expect(adNames).toContain('Leaderboard')
      expect(adNames).toContain('Medium Rectangle')
      expect(adNames).toContain('Wide Skyscraper')
      expect(adNames).toContain('Billboard')
      expect(adNames).toContain('Mobile Banner')
    })

    it('has correct Full HD dimensions', () => {
      const fullHD = sizePresets.find((p) => p.name === 'Full HD' && p.category === 'web')
      expect(fullHD?.width).toBe(1920)
      expect(fullHD?.height).toBe(1080)
    })

    it('has correct Instagram Square dimensions', () => {
      const instagramSquare = sizePresets.find((p) => p.name === 'Instagram Square')
      expect(instagramSquare?.width).toBe(1080)
      expect(instagramSquare?.height).toBe(1080)
    })

    it('has correct 4K dimensions', () => {
      const fourK = sizePresets.find((p) => p.name === '4K Ultra HD')
      expect(fourK?.width).toBe(3840)
      expect(fourK?.height).toBe(2160)
    })

    it('has correct Leaderboard dimensions', () => {
      const leaderboard = sizePresets.find((p) => p.name === 'Leaderboard')
      expect(leaderboard?.width).toBe(728)
      expect(leaderboard?.height).toBe(90)
    })

    it('has optional description for most presets', () => {
      const presetsWithDescription = sizePresets.filter((p) => p.description)
      // Most presets should have descriptions
      expect(presetsWithDescription.length).toBeGreaterThan(sizePresets.length / 2)
    })

    it('has unique names within each category', () => {
      const categories = ['web', 'social', 'video', 'print', 'ad'] as const

      for (const category of categories) {
        const presetsInCategory = sizePresets.filter((p) => p.category === category)
        const names = presetsInCategory.map((p) => p.name)
        const uniqueNames = [...new Set(names)]
        expect(names.length).toBe(uniqueNames.length)
      }
    })
  })

  describe('colorPalette', () => {
    it('contains 22 colors', () => {
      expect(colorPalette).toHaveLength(22)
    })

    it('all colors are valid hex format', () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/

      for (const color of colorPalette) {
        expect(color).toMatch(hexRegex)
      }
    })

    it('includes grayscale colors', () => {
      expect(colorPalette).toContain('#cccccc')
      expect(colorPalette).toContain('#999999')
      expect(colorPalette).toContain('#666666')
      expect(colorPalette).toContain('#333333')
      expect(colorPalette).toContain('#000000')
      expect(colorPalette).toContain('#ffffff')
    })

    it('includes common material design colors', () => {
      expect(colorPalette).toContain('#f44336') // Red
      expect(colorPalette).toContain('#e91e63') // Pink
      expect(colorPalette).toContain('#9c27b0') // Purple
      expect(colorPalette).toContain('#2196f3') // Blue
      expect(colorPalette).toContain('#4caf50') // Green
      expect(colorPalette).toContain('#ffeb3b') // Yellow
      expect(colorPalette).toContain('#ff9800') // Orange
    })

    it('has no duplicate colors', () => {
      const uniqueColors = [...new Set(colorPalette)]
      expect(uniqueColors.length).toBe(colorPalette.length)
    })

    it('starts with default gray (#cccccc)', () => {
      expect(colorPalette[0]).toBe('#cccccc')
    })
  })

  describe('generateSVG', () => {
    it('generates valid SVG with correct dimensions', () => {
      const svg = generateSVG(800, 600, '#cccccc', '800x600', '#333333', 24)

      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(svg).toContain('width="800"')
      expect(svg).toContain('height="600"')
      expect(svg).toContain('viewBox="0 0 800 600"')
    })

    it('includes background rect with correct fill color', () => {
      const svg = generateSVG(400, 300, '#ff0000', 'Test', '#000000', 16)

      expect(svg).toContain('<rect')
      expect(svg).toContain('width="100%"')
      expect(svg).toContain('height="100%"')
      expect(svg).toContain('fill="#ff0000"')
    })

    it('includes text element with correct properties', () => {
      const svg = generateSVG(500, 500, '#000000', 'Hello World', '#ffffff', 32)

      expect(svg).toContain('<text')
      expect(svg).toContain('x="50%"')
      expect(svg).toContain('y="50%"')
      expect(svg).toContain('font-size="32px"')
      expect(svg).toContain('fill="#ffffff"')
      expect(svg).toContain('text-anchor="middle"')
      expect(svg).toContain('dominant-baseline="middle"')
      expect(svg).toContain('>Hello World</text>')
    })

    it('uses Arial font family', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Text', '#333', 12)

      expect(svg).toContain('font-family="Arial, sans-serif"')
    })

    it('escapes ampersand in text', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Tom & Jerry', '#333', 12)

      expect(svg).toContain('Tom &amp; Jerry')
      expect(svg).not.toContain('Tom & Jerry</text>')
    })

    it('escapes less than sign in text', () => {
      const svg = generateSVG(100, 100, '#ccc', 'A < B', '#333', 12)

      expect(svg).toContain('A &lt; B')
    })

    it('escapes greater than sign in text', () => {
      const svg = generateSVG(100, 100, '#ccc', 'A > B', '#333', 12)

      expect(svg).toContain('A &gt; B')
    })

    it('escapes double quotes in text', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Say "Hello"', '#333', 12)

      expect(svg).toContain('Say &quot;Hello&quot;')
    })

    it('escapes single quotes in text', () => {
      const svg = generateSVG(100, 100, '#ccc', "It's test", '#333', 12)

      expect(svg).toContain('It&apos;s test')
    })

    it('handles multiple special characters', () => {
      const svg = generateSVG(100, 100, '#ccc', '<script>alert("XSS")</script>', '#333', 12)

      expect(svg).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')
    })

    it('handles empty text', () => {
      const svg = generateSVG(200, 200, '#ffffff', '', '#000000', 20)

      expect(svg).toContain('</text>')
      expect(svg).toContain('></')
    })

    it('handles very large dimensions', () => {
      const svg = generateSVG(10000, 10000, '#ccc', 'Large', '#333', 100)

      expect(svg).toContain('width="10000"')
      expect(svg).toContain('height="10000"')
      expect(svg).toContain('viewBox="0 0 10000 10000"')
    })

    it('handles small dimensions', () => {
      const svg = generateSVG(1, 1, '#ccc', 'Tiny', '#333', 1)

      expect(svg).toContain('width="1"')
      expect(svg).toContain('height="1"')
    })

    it('handles various font sizes', () => {
      const smallFont = generateSVG(100, 100, '#ccc', 'Small', '#333', 8)
      const largeFont = generateSVG(100, 100, '#ccc', 'Large', '#333', 200)

      expect(smallFont).toContain('font-size="8px"')
      expect(largeFont).toContain('font-size="200px"')
    })

    it('handles hex color formats', () => {
      const svg = generateSVG(100, 100, '#AABBCC', 'Test', '#112233', 16)

      expect(svg).toContain('fill="#AABBCC"')
      expect(svg).toContain('fill="#112233"')
    })

    it('handles unicode text', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Placeholder', '#333', 12)

      expect(svg).toContain('Placeholder')
    })

    it('handles text with numbers', () => {
      const svg = generateSVG(1920, 1080, '#ccc', '1920x1080', '#333', 24)

      expect(svg).toContain('>1920x1080</text>')
    })
  })

  describe('svgToDataURL', () => {
    it('converts SVG to base64 data URL', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>'
      const dataURL = svgToDataURL(svg)

      expect(dataURL).toMatch(/^data:image\/svg\+xml;base64,/)
    })

    it('creates valid base64 encoding', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>'
      const dataURL = svgToDataURL(svg)
      const base64Part = dataURL.replace('data:image/svg+xml;base64,', '')

      // Base64 should only contain valid characters
      expect(base64Part).toMatch(/^[A-Za-z0-9+/=]+$/)
    })

    it('handles SVG with special characters', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Test & Demo', '#333', 12)
      const dataURL = svgToDataURL(svg)

      expect(dataURL).toMatch(/^data:image\/svg\+xml;base64,/)
      expect(dataURL.length).toBeGreaterThan(50)
    })

    it('handles SVG with unicode characters', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Placeholder', '#333', 12)
      const dataURL = svgToDataURL(svg)

      expect(dataURL).toMatch(/^data:image\/svg\+xml;base64,/)
    })

    it('produces consistent output for same input', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"></svg>'
      const dataURL1 = svgToDataURL(svg)
      const dataURL2 = svgToDataURL(svg)

      expect(dataURL1).toBe(dataURL2)
    })

    it('produces different output for different inputs', () => {
      const svg1 = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>'
      const svg2 = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"></svg>'
      const dataURL1 = svgToDataURL(svg1)
      const dataURL2 = svgToDataURL(svg2)

      expect(dataURL1).not.toBe(dataURL2)
    })

    it('handles complex SVG with all elements', () => {
      const svg = generateSVG(800, 600, '#cccccc', '800x600 Placeholder', '#333333', 48)
      const dataURL = svgToDataURL(svg)

      expect(dataURL.startsWith('data:image/svg+xml;base64,')).toBe(true)
      expect(dataURL.length).toBeGreaterThan(100)
    })

    it('handles empty SVG', () => {
      const svg = '<svg></svg>'
      const dataURL = svgToDataURL(svg)

      expect(dataURL).toMatch(/^data:image\/svg\+xml;base64,/)
    })
  })

  describe('downloadFile', () => {
    let mockLink: HTMLAnchorElement
    let appendChildSpy: ReturnType<typeof vi.spyOn>
    let removeChildSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      } as unknown as HTMLAnchorElement

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink)
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockLink)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('creates an anchor element', () => {
      downloadFile('data:image/svg+xml;base64,test', 'test.svg')

      expect(document.createElement).toHaveBeenCalledWith('a')
    })

    it('sets href to the data URL', () => {
      const dataURL = 'data:image/svg+xml;base64,testdata'
      downloadFile(dataURL, 'image.svg')

      expect(mockLink.href).toBe(dataURL)
    })

    it('sets download attribute to filename', () => {
      downloadFile('data:image/svg+xml;base64,test', 'placeholder.svg')

      expect(mockLink.download).toBe('placeholder.svg')
    })

    it('appends link to document body', () => {
      downloadFile('data:image/svg+xml;base64,test', 'test.svg')

      expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
    })

    it('triggers click on the link', () => {
      downloadFile('data:image/svg+xml;base64,test', 'test.svg')

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('removes link from document body after click', () => {
      downloadFile('data:image/svg+xml;base64,test', 'test.svg')

      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
    })

    it('handles PNG data URLs', () => {
      const pngDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg'
      downloadFile(pngDataURL, 'image.png')

      expect(mockLink.href).toBe(pngDataURL)
      expect(mockLink.download).toBe('image.png')
    })

    it('handles blob URLs', () => {
      const blobURL = 'blob:http://localhost:3000/abc123'
      downloadFile(blobURL, 'image.png')

      expect(mockLink.href).toBe(blobURL)
    })

    it('handles filenames with special characters', () => {
      downloadFile('data:image/svg+xml;base64,test', 'placeholder-800x600.svg')

      expect(mockLink.download).toBe('placeholder-800x600.svg')
    })
  })

  describe('svgToPNG', () => {
    let mockCanvas: HTMLCanvasElement
    let mockContext: CanvasRenderingContext2D
    let mockImage: HTMLImageElement
    let originalImage: typeof Image

    beforeEach(() => {
      // Store original Image constructor
      originalImage = global.Image

      // Mock canvas context
      mockContext = {
        drawImage: vi.fn(),
      } as unknown as CanvasRenderingContext2D

      // Mock canvas
      mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue(mockContext),
        toBlob: vi.fn((callback: BlobCallback) => {
          const blob = new Blob(['test'], { type: 'image/png' })
          callback(blob)
        }),
      } as unknown as HTMLCanvasElement

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'canvas') return mockCanvas
        return document.createElement(tag)
      })

      // Mock URL.createObjectURL
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/test')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      // Mock Image constructor
      mockImage = {
        src: '',
        onload: null as ((ev: Event) => void) | null,
        onerror: null as OnErrorEventHandler,
      } as unknown as HTMLImageElement

      // Use Object.assign to properly mock the Image constructor
      const MockImage = function (this: HTMLImageElement) {
        Object.assign(mockImage, {
          src: '',
          onload: null,
          onerror: null,
        })
        setTimeout(() => {
          mockImage.src = this.src
          mockImage.onload = this.onload
          mockImage.onerror = this.onerror
        }, 0)
        Object.assign(this, mockImage)
      } as unknown as typeof Image

      global.Image = MockImage
    })

    afterEach(() => {
      vi.restoreAllMocks()
      global.Image = originalImage
    })

    it('creates canvas with correct dimensions', () => {
      const svg = generateSVG(800, 600, '#ccc', 'Test', '#333', 24)
      const callback = vi.fn()

      svgToPNG(svg, 800, 600, callback)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      expect(mockCanvas.width).toBe(800)
      expect(mockCanvas.height).toBe(600)
    })

    it('gets 2d context from canvas', () => {
      const svg = generateSVG(400, 300, '#ccc', 'Test', '#333', 20)
      const callback = vi.fn()

      svgToPNG(svg, 400, 300, callback)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    })

    it('draws image to canvas', () => {
      const svg = generateSVG(200, 200, '#ccc', 'Test', '#333', 16)
      const callback = vi.fn()

      svgToPNG(svg, 200, 200, callback)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      expect(mockContext.drawImage).toHaveBeenCalled()
    })

    it('converts canvas to blob with PNG type', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Test', '#333', 12)
      const callback = vi.fn()

      svgToPNG(svg, 100, 100, callback)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png')
    })

    it('calls callback with blob URL', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Test', '#333', 12)
      const callback = vi.fn()

      svgToPNG(svg, 100, 100, callback)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      expect(callback).toHaveBeenCalledWith('blob:http://localhost/test')
    })

    it('creates object URL from blob', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Test', '#333', 12)
      const callback = vi.fn()

      svgToPNG(svg, 100, 100, callback)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      expect(URL.createObjectURL).toHaveBeenCalled()
    })

    it('sets image src to SVG data URL', () => {
      const svg = generateSVG(100, 100, '#ccc', 'Test', '#333', 12)
      const callback = vi.fn()

      svgToPNG(svg, 100, 100, callback)

      expect(mockImage.src).toMatch(/^data:image\/svg\+xml;base64,/)
    })

    it('handles null canvas context gracefully', () => {
      mockCanvas.getContext = vi.fn().mockReturnValue(null)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const svg = generateSVG(100, 100, '#ccc', 'Test', '#333', 12)
      const callback = vi.fn()

      svgToPNG(svg, 100, 100, callback)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      expect(consoleSpy).toHaveBeenCalledWith('Failed to get canvas context')
      expect(callback).not.toHaveBeenCalled()
    })

    it('handles null blob gracefully', () => {
      mockCanvas.toBlob = vi.fn((callback: BlobCallback) => {
        callback(null)
      })

      const svg = generateSVG(100, 100, '#ccc', 'Test', '#333', 12)
      const callback = vi.fn()

      svgToPNG(svg, 100, 100, callback)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      expect(callback).not.toHaveBeenCalled()
    })

    it('handles image load error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const svg = generateSVG(100, 100, '#ccc', 'Test', '#333', 12)
      const callback = vi.fn()

      svgToPNG(svg, 100, 100, callback)

      // Trigger image error
      if (mockImage.onerror) {
        mockImage.onerror(new Event('error'))
      }

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load SVG image')
      expect(callback).not.toHaveBeenCalled()
    })

    it('revokes object URL after delay', () => {
      vi.useFakeTimers()

      const svg = generateSVG(100, 100, '#ccc', 'Test', '#333', 12)
      const callback = vi.fn()

      svgToPNG(svg, 100, 100, callback)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      // Fast-forward time
      vi.advanceTimersByTime(150)

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/test')

      vi.useRealTimers()
    })
  })

  describe('Type definitions', () => {
    it('SizePreset interface has correct shape', () => {
      const preset: SizePreset = {
        name: 'Test',
        width: 100,
        height: 100,
        category: 'web',
        description: 'Test preset',
      }

      expect(preset.name).toBeDefined()
      expect(preset.width).toBeDefined()
      expect(preset.height).toBeDefined()
      expect(preset.category).toBeDefined()
    })

    it('SizePreset allows optional description', () => {
      const preset: SizePreset = {
        name: 'Test',
        width: 100,
        height: 100,
        category: 'social',
      }

      expect(preset.description).toBeUndefined()
    })

    it('category is restricted to valid values', () => {
      const validCategories = ['web', 'social', 'video', 'print', 'ad'] as const

      for (const category of validCategories) {
        const preset: SizePreset = {
          name: 'Test',
          width: 100,
          height: 100,
          category,
        }
        expect(preset.category).toBe(category)
      }
    })
  })

  describe('Integration tests', () => {
    it('generateSVG and svgToDataURL work together', () => {
      const svg = generateSVG(400, 300, '#ffffff', 'Test Image', '#000000', 24)
      const dataURL = svgToDataURL(svg)

      expect(dataURL.startsWith('data:image/svg+xml;base64,')).toBe(true)

      // Decode and verify content
      const base64 = dataURL.replace('data:image/svg+xml;base64,', '')
      const decoded = atob(base64)

      expect(decoded).toContain('width="400"')
      expect(decoded).toContain('height="300"')
    })

    it('can generate SVG for all preset sizes', () => {
      for (const preset of sizePresets) {
        const svg = generateSVG(
          preset.width,
          preset.height,
          '#cccccc',
          `${preset.width}x${preset.height}`,
          '#333333',
          24
        )

        expect(svg).toContain(`width="${preset.width}"`)
        expect(svg).toContain(`height="${preset.height}"`)
      }
    })

    it('can convert all presets to data URLs', () => {
      for (const preset of sizePresets) {
        const svg = generateSVG(
          preset.width,
          preset.height,
          colorPalette[0],
          preset.name,
          colorPalette[3],
          20
        )
        const dataURL = svgToDataURL(svg)

        expect(dataURL.startsWith('data:image/svg+xml;base64,')).toBe(true)
      }
    })

    it('uses all colors from palette in SVG generation', () => {
      for (const color of colorPalette) {
        const svg = generateSVG(100, 100, color, 'Test', '#333333', 12)
        expect(svg).toContain(`fill="${color}"`)
      }
    })
  })
})
