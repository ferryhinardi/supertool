import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SuperTool - Modern Developer Toolkit',
    short_name: 'SuperTool',
    description:
      'Professional toolkit with 40+ tools for developers and productivity. JSON formatter, image optimizer, video converter, and more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#a855f7',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['productivity', 'utilities', 'development'],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  }
}
