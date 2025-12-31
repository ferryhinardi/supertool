import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Device Mockup Generator | Create Realistic Device Screenshots',
  description:
    'Create professional device mockups instantly. Add your screenshots to iPhone, MacBook, iPad, or Android frames. Customize backgrounds, export high-resolution mockups for presentations, portfolios, and marketing materials.',
  keywords: [
    'device mockup generator',
    'mockup creator',
    'iphone mockup',
    'macbook mockup',
    'screenshot mockup',
    'device frame',
    'app mockup',
    'website mockup',
    'presentation mockup',
    'portfolio mockup',
    'free mockup tool',
    'online mockup generator',
  ],
  openGraph: {
    title: 'Device Mockup Generator | Professional Device Frames',
    description:
      'Create stunning device mockups with realistic frames. Perfect for showcasing apps, websites, and designs in presentations and portfolios.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Device Mockup Generator',
    description:
      'Create professional device mockups with realistic iPhone, MacBook, and Android frames.',
  },
}

export default function DeviceMockupLayout({ children }: { children: React.ReactNode }) {
  return children
}
