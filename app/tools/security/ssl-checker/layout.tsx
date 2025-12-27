import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SSL/TLS Certificate Checker - SuperTool',
  description:
    'Inspect SSL/TLS certificate details, expiration dates, and security status for any website. Check certificate chain, cipher suites, protocol versions, and get detailed security recommendations to improve your website security.',
  openGraph: {
    title: 'SSL/TLS Certificate Checker',
    description:
      'Check SSL certificates, track expiration dates, analyze security configuration, and get recommendations',
  },
}

export default function SSLCheckerLayout({ children }: { children: React.ReactNode }) {
  return children
}
