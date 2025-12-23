import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'YAML to JSON Converter - Free Online Tool',
  description:
    'Free online YAML to JSON converter with syntax validation. Convert between YAML and JSON formats instantly with proper formatting and error detection. Perfect for configuration files, API responses, and data transformation.',
  keywords: [
    'yaml to json',
    'json to yaml',
    'yaml converter',
    'json converter',
    'yaml json converter',
    'convert yaml to json',
    'convert json to yaml',
    'yaml parser',
    'json parser',
    'yaml validator',
    'json validator',
    'configuration converter',
    'yaml online',
    'json online',
  ],
  category: 'development',
  path: '/tools/yaml-json',
})

export default function YamlJsonConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
