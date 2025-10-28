import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'AI Prompt Formatter - ChatGPT, Claude, Gemini',
  description:
    'Professional AI prompt formatter and optimizer. Format prompts for ChatGPT, Claude, Gemini, and other AI models. Templates for few-shot learning, chain-of-thought reasoning, role-based prompts, and more. Improve AI responses with structured prompt engineering.',
  keywords: [
    'prompt formatter',
    'ai prompt',
    'prompt engineering',
    'chatgpt prompt',
    'claude prompt',
    'gemini prompt',
    'prompt optimizer',
    'prompt template',
    'few-shot learning',
    'chain of thought',
    'ai prompt generator',
    'prompt structure',
  ],
  category: 'development',
  path: '/tools/prompt-formatter',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Prompt Formatter')

const faqs = [
  {
    question: 'What is a prompt formatter and why do I need it?',
    answer:
      'A prompt formatter helps structure your AI prompts for better results. Well-formatted prompts with clear instructions, context, and examples lead to more accurate and relevant AI responses. Our tool provides professional templates for different prompt engineering techniques like few-shot learning, chain-of-thought reasoning, and role-based prompts.',
  },
  {
    question: 'Which AI models does this prompt formatter support?',
    answer:
      'Our prompt formatter supports all major AI models including ChatGPT (GPT-3.5, GPT-4), Claude (Anthropic), Google Gemini, and other language models. Each model has optimized formatting options to match their specific strengths and prompting styles.',
  },
  {
    question: 'What are the different prompt templates available?',
    answer:
      'We offer 8 professional templates across three categories: Basic (Few-Shot Learning, Role-Based, Zero-Shot), Advanced (Chain of Thought, Structured Output, Iterative Refinement), and Specialized (Code Generation, Creative Writing). Each template is designed for specific use cases and helps you create effective AI prompts.',
  },
  {
    question: 'How do I create effective AI prompts?',
    answer:
      'Effective AI prompts should be specific, provide relevant context, include examples when appropriate, break down complex tasks into steps, and specify the desired output format. Use our templates as a starting point, then customize them with your specific requirements. The Optimize button can also help add structure to your prompts automatically.',
  },
]

export default function PromptFormatterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs, baseUrl)),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />
    </>
  )
}
