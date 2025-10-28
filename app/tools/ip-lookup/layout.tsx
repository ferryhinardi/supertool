import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'IP Address Lookup',
  description:
    'Discover detailed information about any IP address including geolocation, ISP details, timezone, and network information. Free IP lookup tool with support for IPv4 and IPv6.',
  keywords: [
    'ip lookup',
    'ip address lookup',
    'geolocation',
    'ip geolocation',
    'isp lookup',
    'ip information',
    'what is my ip',
    'ipv4',
    'ipv6',
    'ip location',
  ],
  category: 'development',
  path: '/tools/ip-lookup',
})

export default function IPLookupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
