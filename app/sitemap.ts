import type { MetadataRoute } from 'next'
import { type ToolCategory, tools } from '@/lib/data/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
  const currentDate = new Date()

  // Home page
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Category landing pages
  const categories: ToolCategory[] = [
    'data',
    'development',
    'media',
    'productivity',
    'security',
    'finance',
    'design',
  ]
  categories.forEach((category) => {
    routes.push({
      url: `${baseUrl}/tools/${category}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  // Add ALL tool pages dynamically from the tools registry
  tools.forEach((tool) => {
    // Skip coming soon tools that don't have pages yet
    if (tool.comingSoon) return

    // Determine priority based on tool attributes
    let priority = 0.6
    if (tool.popular) priority = 0.9
    else if (tool.new) priority = 0.8

    routes.push({
      url: `${baseUrl}${tool.href}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority,
    })
  })

  return routes
}
