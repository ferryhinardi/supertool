import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
  const currentDate = new Date()

  // List of all tools with priority levels
  const popularTools = ['json-beautify', 'password-generator', 'split-bill']

  const activeTools = [
    'qr-code',
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
    'ip-lookup',
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

  // Add popular tool pages (higher priority)
  popularTools.forEach((tool) => {
    routes.push({
      url: `${baseUrl}/tools/${tool}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  })

  // Add active tool pages
  activeTools.forEach((tool) => {
    routes.push({
      url: `${baseUrl}/tools/${tool}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  })

  return routes
}
