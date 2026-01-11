import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Dockerfile Formatter - Beautify & Validate Dockerfiles',
  description:
    'Free online Dockerfile formatter and validator. Format, beautify, and lint your Dockerfiles. Follow Docker best practices, optimize layer caching, and ensure consistent formatting for your container configurations.',
  keywords: [
    'dockerfile formatter',
    'dockerfile beautifier',
    'dockerfile validator',
    'format dockerfile',
    'dockerfile linter',
    'docker best practices',
    'dockerfile syntax',
    'container config formatter',
    'dockerfile editor',
    'docker file format',
    'dockerfile optimization',
    'devops tool',
  ],
  category: 'development',
  path: '/tools/development/dockerfile-formatter',
})

export default function DockerfileFormatterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
