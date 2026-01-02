import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regex Tester - Test Regular Expressions Online | SuperTool',
  description:
    'Free online regex tester with live matching, syntax highlighting, and code generation. Test regular expressions with common patterns library for JavaScript, Python, PHP, and more.',
  keywords: [
    'regex tester',
    'regular expression',
    'regex validator',
    'pattern matcher',
    'regex tool',
    'regex debugger',
    'regex builder',
    'online regex',
    'regex testing',
    'regex patterns',
    'email validation',
    'url validation',
    'regex javascript',
    'regex python',
  ],
  openGraph: {
    title: 'Regex Tester - Test Regular Expressions Online',
    description:
      'Free online regex tester with live matching, syntax highlighting, and code generation. Test regular expressions with common patterns library.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regex Tester - Test Regular Expressions Online',
    description:
      'Free online regex tester with live matching, syntax highlighting, and code generation.',
  },
}

export default function RegexTesterLayout({ children }: { children: React.ReactNode }) {
  return children
}
