import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Code Converter | Convert Between 12+ Programming Languages',
  description:
    'Convert code between Python, JavaScript, TypeScript, Java, C++, Go, Rust, and more with AI. Instant translation with syntax highlighting, explanations, and optimization. Free AI-powered code converter.',
  keywords: [
    'code converter',
    'programming language converter',
    'AI code translation',
    'Python to JavaScript',
    'Java to Python',
    'TypeScript converter',
    'code translation tool',
    'multi-language converter',
    'syntax converter',
    'AI code generator',
    'code transpiler',
    'language migration',
  ],
  openGraph: {
    title: 'AI Code Converter | Convert Between 12+ Programming Languages',
    description:
      'Convert code between Python, JavaScript, TypeScript, Java, C++, Go, Rust, and more with AI. Instant translation with syntax highlighting and explanations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Code Converter | Convert Between 12+ Programming Languages',
    description:
      'Convert code between Python, JavaScript, TypeScript, Java, C++, Go, Rust, and more with AI. Free AI-powered code converter.',
  },
}

export default function AICodeConverterLayout({ children }: { children: React.ReactNode }) {
  return children
}
