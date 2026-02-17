import type { NextConfig } from 'next'

// Bundle analyzer configuration (set ANALYZE=true to enable)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mkzyuyvgrqjrhnbtagyh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  serverExternalPackages: ['pdfjs-dist', 'ffmpeg-static', 'vaul'],

  // Transpile ESM packages that have issues with Next.js
  transpilePackages: [
    'react-markdown',
    'property-information',
    'hast-util-whitespace',
    'space-separated-tokens',
    'comma-separated-tokens',
    'vfile',
    'vfile-message',
    'unist-util-stringify-position',
  ],

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize package imports - reduces bundle size
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'lucide-react'],
  },

  // Enable compression
  compress: true,
}

export default withBundleAnalyzer(nextConfig)
