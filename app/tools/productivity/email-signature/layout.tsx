import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Signature Generator - Create Professional HTML Signatures | SuperTool',
  description:
    'Create professional HTML email signatures with customizable templates, social icons, colors, and branding. Export as HTML or plain text for any email client. Free online signature maker.',
  keywords: [
    'email signature generator',
    'html email signature',
    'professional signature',
    'email signature maker',
    'signature template',
    'outlook signature',
    'gmail signature',
    'email branding',
  ],
  openGraph: {
    title: 'Email Signature Generator - Professional HTML Signatures',
    description:
      'Create beautiful email signatures with 6 customizable templates, social icons, and branding options. Export as HTML or plain text.',
    type: 'website',
  },
}

export default function EmailSignatureLayout({ children }: { children: React.ReactNode }) {
  return children
}
