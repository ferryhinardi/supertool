import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'JSON Beautifier & Formatter',
  description:
    'Free online JSON formatter and beautifier with syntax highlighting, validation, and minification. Format, validate, and beautify JSON with real-time error detection. Perfect for debugging API responses and configuration files.',
  keywords: [
    'json formatter',
    'json beautifier',
    'json validator',
    'json minifier',
    'format json',
    'beautify json',
    'validate json',
    'json syntax checker',
    'json editor',
    'json pretty print',
    'json parser',
    'json lint',
  ],
  category: 'development',
  path: '/tools/json-beautify',
})

export default function JSONBeautifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
