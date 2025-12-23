import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'AI Prompt Explainer - Optimize AI Prompts for Better Results',
  description:
    'Analyze and optimize AI prompts with expert insights. Get detailed feedback on prompt clarity, structure, and effectiveness. Learn prompt engineering best practices with AI-powered analysis. Improve your ChatGPT, Claude, and other AI interactions.',
  keywords: [
    'AI prompt explainer',
    'prompt engineering',
    'prompt optimization',
    'AI prompt analyzer',
    'prompt quality checker',
    'ChatGPT prompts',
    'prompt best practices',
    'AI prompt tips',
    'prompt structure',
    'prompt clarity',
    'AI prompt guide',
    'prompt engineering tool',
    'optimize ChatGPT prompts',
    'prompt improvement',
    'AI prompt helper',
  ],
  category: 'development',
  path: '/tools/prompt-explainer',
})

export default function AIPromptExplainerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
