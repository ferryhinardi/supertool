import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regex Pattern Library & Tester - Test Regular Expressions Online | SuperTool',
  description:
    'Interactive regex tester with real-time matching, capture group display, and 12+ pre-built patterns. Test email, URL, phone, IP address validation patterns and more. Learn regex with instant visual feedback.',
  keywords: [
    'regex tester',
    'regular expression tester',
    'regex online',
    'regex pattern library',
    'regex validator',
    'test regex',
    'regex match groups',
    'regex flags',
    'regex patterns',
    'email regex',
    'url regex',
    'phone regex',
    'regex tutorial',
    'regex debugger',
    'regex explainer',
  ],
  openGraph: {
    title: 'Regex Pattern Library & Tester - Test Regular Expressions Online',
    description:
      'Interactive regex tester with real-time matching and 12+ pre-built patterns. Test and learn regex with instant visual feedback.',
    type: 'website',
    url: 'https://supertool.app/tools/regex-tester',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regex Pattern Library & Tester',
    description: 'Test regular expressions in real-time with visual match highlighting',
  },
  alternates: {
    canonical: 'https://supertool.app/tools/regex-tester',
  },
}

export default function RegexTesterLayout({ children }: { children: React.ReactNode }) {
  return children
}
