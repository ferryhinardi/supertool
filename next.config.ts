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
  serverExternalPackages: ['pdfjs-dist'],

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize package imports - reduces bundle size
  experimental: {
    optimizePackageImports: ['framer-motion', '@tanstack/react-query', 'lucide-react'],
  },

  // Enable compression
  compress: true,
}

export default withBundleAnalyzer(nextConfig)
