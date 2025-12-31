import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Webhook Tester | Test & Debug Webhooks in Real-Time',
  description:
    'Test and debug webhooks in real-time. Generate unique webhook URLs, inspect requests, view headers and payloads, and customize responses. Perfect for webhook development and testing.',
  keywords: [
    'webhook tester',
    'webhook debugger',
    'test webhooks',
    'webhook inspector',
    'webhook receiver',
    'API testing',
    'webhook development',
    'REST API testing',
    'HTTP testing',
    'webhook simulator',
  ],
  openGraph: {
    title: 'Webhook Tester | Test & Debug Webhooks in Real-Time',
    description:
      'Test and debug webhooks in real-time. Generate unique URLs, inspect requests, and customize responses. Perfect for webhook development.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Webhook Tester | Test & Debug Webhooks in Real-Time',
    description:
      'Test and debug webhooks in real-time. Generate unique URLs, inspect requests, and customize responses.',
  },
}

export default function WebhookTesterLayout({ children }: { children: React.ReactNode }) {
  return children
}
