import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.dev'
  const currentDate = new Date()

  // List of all tools
  const tools = [
    'json-beautify',
    'split-bill',
    'qr-code',
    'password-generator',
    'diff',
    'markdown-editor',
    'url-shortener',
    'text-transformer',
    'image-optimizer',
    'video-converter',
    'upload',
    'base64',
    'hash-generator',
    'json-to-csv',
    'unit-converter',
    'pdf-tools',
    'daily-task-summary',
    'bmi-calculator',
    'pomodoro',
    'encryption-tool',
    'gradient-generator',
    'website-screenshot',
  ]

  // Home page
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Add all tool pages
  tools.forEach((tool) => {
    routes.push({
      url: `${baseUrl}/tools/${tool}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  return routes
}
