import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Video Subtitle Combiner - Burn SRT Subtitles Into Videos Online',
  description:
    'Merge SRT subtitle files with videos directly in your browser. Customize subtitle appearance with custom fonts, colors, and positioning. Permanently burn subtitles using FFmpeg.',
  keywords: [
    'video subtitle combiner',
    'burn subtitles',
    'srt to video',
    'add subtitles to video',
    'hardcode subtitles',
    'ffmpeg subtitles',
    'subtitle merger',
    'burn srt',
  ],
  category: 'media',
  path: '/tools/video-subtitle-combiner',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Video Subtitle Combiner')

const faqs = [
  {
    question: 'What is the Video Subtitle Combiner?',
    answer:
      'The Video Subtitle Combiner is a free online tool that burns SRT subtitle files permanently into video files. It processes everything in your browser using FFmpeg.wasm, so your videos never leave your device. You can customize subtitle appearance including font size, colors, background, and positioning.',
  },
  {
    question: 'What video and subtitle formats are supported?',
    answer:
      'The tool supports all major video formats including MP4, WebM, AVI, MOV, and MKV. For subtitles, it accepts standard SubRip (.srt) files. The subtitles are permanently burned (hardcoded) into the video, meaning they cannot be turned off.',
  },
  {
    question: 'Is this tool free and does it work offline?',
    answer:
      'Yes, the Video Subtitle Combiner is completely free to use with no registration required. All processing happens locally in your browser using FFmpeg.wasm, so your videos are never uploaded to any server. This ensures complete privacy and works even without an internet connection after the initial page load.',
  },
  {
    question: 'Can I customize how the subtitles look?',
    answer:
      'Absolutely! You can customize the subtitle font size (12-72px), font color, background color, background opacity, and positioning (top, center, or bottom). These settings allow you to match your brand style or ensure optimal readability for your audience.',
  },
]

export default function VideoSubtitleCombinerLayout({ children }: { children: React.ReactNode }) {
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
