import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'AI Command Explainer - Understand CLI Commands with AI',
  description:
    'Explain complex command-line commands in plain English with AI assistance. Understand bash, git, docker, kubectl commands with detailed breakdowns, safety warnings, and alternative suggestions. Free for basic explanations, unlimited with Pro.',
  keywords: [
    'AI command explainer',
    'CLI command help',
    'bash command explain',
    'git command help',
    'docker command explainer',
    'kubectl command help',
    'terminal command guide',
    'command line assistant',
    'shell command help',
    'command breakdown',
    'CLI tutorial',
    'command safety checker',
    'terminal helper',
    'command line learning',
    'bash tutorial',
  ],
  category: 'development',
  path: '/tools/ai-command-explainer',
})

export default function AICommandExplainerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
