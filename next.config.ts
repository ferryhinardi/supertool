import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error - React Compiler is available but types may not be updated
    reactCompiler: true,
  },
}

export default nextConfig
