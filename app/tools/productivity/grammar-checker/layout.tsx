import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Grammar & Spell Checker (AI-Powered)',
  description:
    'Free AI-powered grammar and spell checker. Check your text for grammar, spelling, punctuation, and style issues instantly. Get intelligent suggestions to improve your writing with GPT-4o-mini.',
  keywords: [
    'grammar checker',
    'spell checker',
    'spelling checker',
    'grammar check',
    'spell check',
    'writing assistant',
    'proofreading tool',
    'grammar correction',
    'punctuation checker',
    'style checker',
    'AI grammar checker',
    'text editor',
    'writing helper',
    'grammar fixer',
  ],
  category: 'productivity',
  path: '/tools/grammar-checker',
})

export default function GrammarCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
