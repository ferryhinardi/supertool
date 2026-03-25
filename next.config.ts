import type { NextConfig } from 'next'

// Bundle analyzer configuration (set ANALYZE=true to enable)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Content-Security-Policy header value.
// Using Report-Only mode first so violations are logged without blocking anything.
// Switch to 'Content-Security-Policy' once you've verified no regressions.
const cspHeader = [
  // Only serve content from the same origin by default
  "default-src 'self'",
  // Scripts: same-origin + inline scripts required by Next.js (unsafe-inline) + Vercel Analytics
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.googletagmanager.com",
  // Styles: same-origin + inline styles required by Panda CSS and component libraries
  "style-src 'self' 'unsafe-inline'",
  // Images: same-origin + data URIs (used by tools) + Supabase storage + external URLs for tools like IP Lookup
  "img-src 'self' data: blob: https://*.supabase.co https://*.vercel-storage.com https:",
  // Fonts: same-origin only
  "font-src 'self'",
  // API calls: same-origin + known external APIs used by tools
  "connect-src 'self' https://*.supabase.co https://api.exchangerate-api.com https://ipapi.co https://www.google-analytics.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  // Media (video/audio): same-origin + blob URLs used by the video converter
  "media-src 'self' blob:",
  // Workers: blob URLs required for FFmpeg WASM and other in-browser processing
  "worker-src 'self' blob:",
  // Frames: deny embedding in iframes to prevent clickjacking
  "frame-ancestors 'none'",
  // Object/embed: disallow plugin content
  "object-src 'none'",
  // Base URI: restrict <base> tag to same origin
  "base-uri 'self'",
  // Form submissions: same-origin only
  "form-action 'self'",
].join('; ')

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
    optimizePackageImports: [
      '@tanstack/react-query',
      'lucide-react',
      'recharts',
      'date-fns',
      'date-fns-tz',
      '@radix-ui/react-slot',
    ],
  },

  // Enable compression
  compress: true,

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Report-Only CSP: logs violations without blocking. Change to
          // 'Content-Security-Policy' once you've validated no false positives.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: cspHeader,
          },
          // Prevent browsers from MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Block the page from being loaded in an iframe (anti-clickjacking)
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Control referrer information sent with requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Enforce HTTPS for 1 year (only in production to avoid breaking localhost)
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                },
              ]
            : []),
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)
