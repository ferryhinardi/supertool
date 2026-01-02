// Size preset interface
export interface SizePreset {
  name: string
  width: number
  height: number
  category: 'web' | 'social' | 'video' | 'print' | 'ad'
  description?: string
}

// Size presets organized by category
export const sizePresets: SizePreset[] = [
  // Web presets
  {
    name: 'Full HD',
    width: 1920,
    height: 1080,
    category: 'web',
    description: 'Standard desktop screen',
  },
  {
    name: 'HD',
    width: 1280,
    height: 720,
    category: 'web',
    description: '720p resolution',
  },
  {
    name: 'Laptop',
    width: 1366,
    height: 768,
    category: 'web',
    description: 'Common laptop size',
  },
  {
    name: 'Desktop',
    width: 1024,
    height: 768,
    category: 'web',
    description: 'Classic desktop',
  },
  {
    name: 'Tablet Landscape',
    width: 1024,
    height: 768,
    category: 'web',
    description: 'iPad landscape',
  },
  {
    name: 'Tablet Portrait',
    width: 768,
    height: 1024,
    category: 'web',
    description: 'iPad portrait',
  },
  {
    name: 'Mobile',
    width: 375,
    height: 667,
    category: 'web',
    description: 'iPhone size',
  },
  {
    name: 'Small Mobile',
    width: 320,
    height: 568,
    category: 'web',
    description: 'iPhone SE',
  },

  // Social media presets
  {
    name: 'Instagram Square',
    width: 1080,
    height: 1080,
    category: 'social',
    description: 'Instagram post',
  },
  {
    name: 'Instagram Portrait',
    width: 1080,
    height: 1350,
    category: 'social',
    description: 'Instagram 4:5',
  },
  {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    category: 'social',
    description: 'Full screen story',
  },
  {
    name: 'Facebook Link',
    width: 1200,
    height: 630,
    category: 'social',
    description: 'Facebook shared link',
  },
  {
    name: 'Facebook Cover',
    width: 820,
    height: 312,
    category: 'social',
    description: 'Page cover photo',
  },
  {
    name: 'Twitter Card',
    width: 1024,
    height: 512,
    category: 'social',
    description: 'Twitter link preview',
  },
  {
    name: 'Twitter Header',
    width: 1500,
    height: 500,
    category: 'social',
    description: 'Profile header',
  },
  {
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    category: 'social',
    description: 'Video thumbnail',
  },
  {
    name: 'LinkedIn Post',
    width: 1200,
    height: 627,
    category: 'social',
    description: 'LinkedIn shared image',
  },
  {
    name: 'Pinterest Pin',
    width: 1000,
    height: 1500,
    category: 'social',
    description: 'Tall pin format',
  },

  // Video presets
  {
    name: '4K Ultra HD',
    width: 3840,
    height: 2160,
    category: 'video',
    description: '2160p resolution',
  },
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    category: 'video',
    description: 'Full HD video',
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    category: 'video',
    description: 'HD video',
  },
  {
    name: '480p',
    width: 854,
    height: 480,
    category: 'video',
    description: 'SD video',
  },
  {
    name: 'Vertical Video',
    width: 1080,
    height: 1920,
    category: 'video',
    description: 'Mobile vertical',
  },

  // Print presets (300 DPI)
  {
    name: 'A4 (300 DPI)',
    width: 2480,
    height: 3508,
    category: 'print',
    description: '8.27 × 11.69 inches',
  },
  {
    name: 'A3 (300 DPI)',
    width: 3508,
    height: 4961,
    category: 'print',
    description: '11.69 × 16.54 inches',
  },
  {
    name: 'A4 (150 DPI)',
    width: 1240,
    height: 1754,
    category: 'print',
    description: 'Screen preview',
  },
  {
    name: 'Letter (300 DPI)',
    width: 2550,
    height: 3300,
    category: 'print',
    description: '8.5 × 11 inches',
  },

  // Ad banner presets
  {
    name: 'Leaderboard',
    width: 728,
    height: 90,
    category: 'ad',
    description: 'Top banner',
  },
  {
    name: 'Medium Rectangle',
    width: 300,
    height: 250,
    category: 'ad',
    description: 'Common sidebar ad',
  },
  {
    name: 'Large Rectangle',
    width: 336,
    height: 280,
    category: 'ad',
    description: 'Large sidebar ad',
  },
  {
    name: 'Wide Skyscraper',
    width: 160,
    height: 600,
    category: 'ad',
    description: 'Tall vertical ad',
  },
  {
    name: 'Half Page',
    width: 300,
    height: 600,
    category: 'ad',
    description: 'Large vertical ad',
  },
  {
    name: 'Mobile Banner',
    width: 320,
    height: 50,
    category: 'ad',
    description: 'Mobile ad',
  },
  {
    name: 'Large Mobile Banner',
    width: 320,
    height: 100,
    category: 'ad',
    description: 'Larger mobile ad',
  },
  {
    name: 'Billboard',
    width: 970,
    height: 250,
    category: 'ad',
    description: 'Extra large banner',
  },
]

// Generate SVG placeholder image
export function generateSVG(
  width: number,
  height: number,
  bgColor: string,
  text: string,
  textColor: string,
  fontSize: number
): string {
  // Escape special characters in text for XML
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}px" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${escapedText}</text>
</svg>`
}

// Convert SVG string to data URL
export function svgToDataURL(svg: string): string {
  // Use encodeURIComponent + btoa for base64 encoding
  const encoded = encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
    String.fromCharCode(Number.parseInt(p1, 16))
  )
  return `data:image/svg+xml;base64,${btoa(encoded)}`
}

// Download file helper
export function downloadFile(dataURL: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataURL
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Convert SVG to PNG using canvas
export function svgToPNG(
  svg: string,
  width: number,
  height: number,
  callback: (dataURL: string) => void
): void {
  const svgDataURL = svgToDataURL(svg)
  const img = new Image()

  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Failed to get canvas context')
      return
    }

    ctx.drawImage(img, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        callback(url)
        // Clean up after a delay to allow download
        setTimeout(() => URL.revokeObjectURL(url), 100)
      }
    }, 'image/png')
  }

  img.onerror = () => {
    console.error('Failed to load SVG image')
  }

  img.src = svgDataURL
}

// Default color palette
export const colorPalette = [
  '#cccccc',
  '#999999',
  '#666666',
  '#333333',
  '#000000',
  '#ffffff',
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
]
