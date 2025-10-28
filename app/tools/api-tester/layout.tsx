import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'API Request Tester - Test REST APIs Online',
  description:
    'Free online API request tester for REST APIs. Send GET, POST, PUT, DELETE requests with custom headers, authentication, and request body. Save presets, track history, and view responses. Lightweight alternative to Postman.',
  keywords: [
    'api tester',
    'rest api tester',
    'api request tool',
    'http client',
    'postman alternative',
    'test api online',
    'api testing tool',
    'rest client',
    'http request tester',
    'api debugging',
    'curl alternative',
    'request headers',
    'bearer token',
    'basic auth',
    'json api',
  ],
  category: 'development',
  path: '/tools/api-tester',
})

export default function ApiTesterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
