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

  // Legacy flat tool URLs → category-prefixed routes
  async redirects() {
    return [
      {
        source: '/tools/split-bill',
        destination: '/tools/finance/split-bill',
        permanent: true,
      },
      {
        source: '/tools/split-bill/history',
        destination: '/tools/finance/split-bill/history',
        permanent: true,
      },
      {
        source: '/tools/json-beautify',
        destination: '/tools/data/json-beautify',
        permanent: true,
      },
      {
        source: '/tools/qr-code',
        destination: '/tools/productivity/qr-code',
        permanent: true,
      },
      {
        source: '/tools/pdf-tools',
        destination: '/tools/productivity/pdf-tools',
        permanent: true,
      },
      {
        source: '/tools/password-generator',
        destination: '/tools/security/password-generator',
        permanent: true,
      },
      {
        source: '/tools/unit-converter',
        destination: '/tools/productivity/unit-converter',
        permanent: true,
      },
      {
        source: '/tools/image-optimizer',
        destination: '/tools/media/image-optimizer',
        permanent: true,
      },
      {
        source: '/tools/url-shortener',
        destination: '/tools/productivity/url-shortener',
        permanent: true,
      },
      {
        source: '/tools/upload',
        destination: '/tools/productivity/upload',
        permanent: true,
      },
    ]
  },

  // Optimize package imports - reduces bundle size
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'lucide-react'],
  },

  // Enable compression
  compress: true,
}

export default withBundleAnalyzer(nextConfig)
