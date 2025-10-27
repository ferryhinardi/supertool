'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Code,
  Upload,
  Zap,
  ArrowRight,
  Sparkles,
  GitCompare,
  Search,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  Clock,
  Star,
  Image,
  FileJson,
  Globe,
  Lock,
  Palette,
  Scissors,
  Hash,
  Calendar,
  FileText,
  Terminal,
  X,
  Video,
  Calculator,
  DollarSign,
  Timer,
  Users,
  FileSpreadsheet,
  Shield,
  Activity,
  TrendingDown,
  Percent,
  Repeat,
  QrCode,
  Key,
  Cake,
  FileDown,
  Wand2,
  Network,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Field, FieldInput } from '@/components/ui/field'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { FeedbackDialog } from '@/components/features/FeedbackDialog'
import { TreatMeDialog } from '@/components/features/TreatMeDialog'
import { css } from '@/styled-system/css'

type ToolCategory =
  | 'all'
  | 'data'
  | 'media'
  | 'development'
  | 'productivity'
  | 'security'
  | 'finance'

interface Tool {
  title: string
  description: string
  icon: React.ElementType
  href: string
  gradient: string
  features: string[]
  category: ToolCategory
  comingSoon?: boolean
  popular?: boolean
  new?: boolean
}

// Color mapping for gradients
const colorMap: Record<string, string> = {
  'purple-500': '#a855f7',
  'pink-500': '#ec4899',
  'orange-500': '#f97316',
  'red-500': '#ef4444',
  'green-500': '#22c55e',
  'emerald-500': '#10b981',
  'cyan-500': '#06b6d4',
  'blue-500': '#3b82f6',
  'yellow-500': '#eab308',
  'teal-500': '#14b8a6',
  'indigo-500': '#6366f1',
  'rose-500': '#f43f5e',
  'fuchsia-500': '#d946ef',
}

// Convert Tailwind gradient class to CSS gradient string
const gradientToCss = (gradient: string): string => {
  const match = gradient.match(/from-(\S+)\s+(?:via-(\S+)\s+)?to-(\S+)/)
  if (!match) return gradient

  const [, from, via, to] = match
  const fromColor = colorMap[from] || from
  const toColor = colorMap[to] || to

  if (via) {
    const viaColor = colorMap[via] || via
    return `linear-gradient(135deg, ${fromColor}, ${viaColor}, ${toColor})`
  }

  return `linear-gradient(135deg, ${fromColor}, ${toColor})`
}

const tools: Tool[] = [
  // Popular tools first
  {
    title: 'JSON Beautifier & Formatter',
    description:
      'Professional JSON formatting tool with real-time syntax highlighting, validation, minification, and error detection. Perfect for debugging API responses and configuration files.',
    icon: Code,
    href: '/tools/json-beautify',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Syntax Highlighting', 'Validation', 'Minify', 'Copy & Download'],
    category: 'data',
    popular: true,
  },

  // New tools
  {
    title: 'Code Diff Viewer',
    description:
      'GitHub-style diff comparison tool for text, JSON, and code files. Compare changes side-by-side with split or unified view, perfect for code reviews and version control.',
    icon: GitCompare,
    href: '/tools/diff',
    gradient: 'from-orange-500 to-red-500',
    features: ['Split/Unified View', 'JSON Support', 'Syntax Highlighting', 'Line Numbers'],
    category: 'development',
    new: true,
  },
  {
    title: 'Markdown Editor & Preview',
    description:
      'GitHub-flavored markdown editor with live preview. Write README files, PR summaries, and documentation with support for tables, task lists, code highlighting, and more.',
    icon: FileText,
    href: '/tools/markdown-editor',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Live Preview', 'GFM Support', 'Syntax Highlight', 'Export HTML/MD'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'URL Shortener & Analytics',
    description:
      'Create short, memorable links with custom aliases. Track clicks, geographic data, referrers, and user devices. Generate QR codes for easy mobile sharing.',
    icon: Globe,
    href: '/tools/url-shortener',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Custom Aliases', 'Click Analytics', 'QR Codes', 'Link Management'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Text Transformer & Counter',
    description:
      'Powerful text manipulation tool with 20+ operations: case conversion, duplicate removal, word/character counting, sorting, trimming, and find-replace with regex support.',
    icon: Scissors,
    href: '/tools/text-transformer',
    gradient: 'from-yellow-500 to-orange-500',
    features: ['Case Conversion', 'Word Count', 'Remove Duplicates', 'Sort Lines'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Image Optimizer & Converter',
    description:
      'Professional image compression tool that reduces file size by up to 80% without visible quality loss. Supports JPG, PNG, WebP formats with bulk processing and dimension resizing.',
    icon: Image,
    href: '/tools/image-optimizer',
    gradient: 'from-teal-500 to-cyan-500',
    features: ['WebP/AVIF', 'Bulk Processing', 'Quality Control', 'Resize'],
    category: 'media',
    new: true,
  },
  {
    title: 'Video Converter & Compressor',
    description:
      'Convert videos between formats (MP4, WebM, AVI, MOV) and compress file sizes with modern codecs (H.264, H.265, VP9). All processing happens in your browser using FFmpeg.',
    icon: Video,
    href: '/tools/video-converter',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Multiple Formats', 'Fast Conversion', 'Compression', 'Web Optimized'],
    category: 'media',
    new: true,
  },

  // Active tools (not popular or new)
  {
    title: 'Cloud File Upload',
    description:
      'Secure cloud storage uploader with drag-and-drop interface. Upload any file type and get instant shareable public URLs with automatic cloud backup and CDN delivery.',
    icon: Upload,
    href: '/tools/upload',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Drag & Drop', 'Cloud Storage', 'Public URLs', 'Instant Sharing'],
    category: 'productivity',
  },

  // Coming soon tools
  {
    title: 'Base64 Encoder & Decoder',
    description:
      'Convert text, files, and images to Base64 encoding with instant decoding support. Preview encoded images directly in browser before downloading or copying.',
    icon: Lock,
    href: '/tools/base64',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Text & Files', 'Image Preview', 'Copy & Download', 'URL Safe'],
    category: 'security',
    new: true,
  },

  // Finance & Calculations
  {
    title: 'Split Bill Calculator',
    description:
      'Split bills among friends with ease. Calculate individual shares, add tips and taxes, track payments, and generate shareable summaries. Perfect for dining out or shared expenses.',
    icon: Users,
    href: '/tools/split-bill',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Multiple People', 'Tip & Tax', 'Payment Tracking', 'Share Summary'],
    category: 'finance',
    new: true,
    popular: true,
  },
  {
    title: 'QR Code Generator',
    description:
      'Generate QR codes instantly for URLs, text, WiFi credentials, contact info, and more. Customize colors, add logos, and download in high resolution PNG or SVG format.',
    icon: QrCode,
    href: '/tools/qr-code',
    gradient: 'from-violet-500 to-purple-500',
    features: ['Multiple Types', 'Customizable', 'High Resolution', 'Logo Support'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Password Generator',
    description:
      'Generate cryptographically secure passwords with customizable length and character sets. Includes password strength meter, bulk generation, and memorable password options.',
    icon: Key,
    href: '/tools/password-generator',
    gradient: 'from-red-500 to-pink-500',
    features: ['Secure Random', 'Custom Rules', 'Strength Meter', 'Bulk Generate'],
    category: 'security',
    new: true,
    popular: true,
  },
  {
    title: 'Unit Converter',
    description:
      'Convert between 30+ unit categories including length, weight, temperature, volume, area, speed, time, and more. Supports metric, imperial, and scientific units.',
    icon: Repeat,
    href: '/tools/unit-converter',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['30+ Categories', 'Bidirectional', 'Favorites', 'Scientific Units'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Timezone Converter',
    description:
      'Convert time across multiple timezones with DST awareness. Perfect for scheduling international meetings, coordinating with remote teams, and tracking global events.',
    icon: Globe,
    href: '/tools/timezone-converter',
    gradient: 'from-indigo-500 to-blue-500',
    features: ['Multiple Zones', 'DST Aware', 'Meeting Planner', 'Time Slider'],
    category: 'productivity',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Tip Calculator',
    description:
      'Calculate tips quickly with preset percentages (10%, 15%, 18%, 20%) or custom amounts. Split bills among multiple people and round totals up or down for convenience.',
    icon: DollarSign,
    href: '/tools/tip-calculator',
    gradient: 'from-green-500 to-teal-500',
    features: ['Quick Presets', 'Split Bill', 'Round Options', 'Total Summary'],
    category: 'finance',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Currency Converter',
    description:
      'Convert between 150+ world currencies with real-time exchange rates. View historical rate charts, save favorite pairs, and get accurate conversion calculations.',
    icon: DollarSign,
    href: '/tools/currency-converter',
    gradient: 'from-yellow-500 to-orange-500',
    features: ['Live Rates', '150+ Currencies', 'Rate History', 'Favorites'],
    category: 'finance',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Pomodoro Timer',
    description:
      'Boost productivity with the Pomodoro Technique. Customizable work/break intervals, task tracking, statistics, and desktop notifications to keep you focused.',
    icon: Timer,
    href: '/tools/pomodoro',
    gradient: 'from-red-500 to-orange-500',
    features: ['Custom Intervals', 'Task Lists', 'Statistics', 'Sound Alerts'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Percentage Calculator',
    description:
      'Calculate percentages, discounts, markups, and taxes instantly. Multiple calculation modes including percentage of, increase/decrease, and reverse percentage calculations.',
    icon: Percent,
    href: '/tools/percentage-calculator',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Multiple Modes', 'Discount Calculator', 'Tax Calculator', 'Reverse Calculate'],
    category: 'finance',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Age Calculator',
    description:
      'Calculate exact age from birthdate with precision down to days, hours, and minutes. See days until next birthday, age in different units, and life event milestones.',
    icon: Cake,
    href: '/tools/age-calculator',
    gradient: 'from-pink-500 to-rose-500',
    features: ['Exact Age', 'Next Birthday', 'Multiple Units', 'Life Events'],
    category: 'productivity',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Color Picker & Palette Generator',
    description:
      'Advanced color tool for designers and developers. Pick colors, generate harmonious palettes, create gradients, and convert between HEX, RGB, HSL, and HSV formats instantly.',
    icon: Palette,
    href: '/tools/color-picker',
    gradient: 'from-pink-500 to-rose-500',
    features: ['HEX/RGB/HSL', 'Palettes', 'Gradients', 'Accessibility'],
    category: 'media',
    comingSoon: true,
  },
  {
    title: 'Invoice Generator',
    description:
      'Create professional invoices with customizable templates. Add line items, taxes, discounts, payment terms, and company branding. Export as PDF or print directly.',
    icon: FileSpreadsheet,
    href: '/tools/invoice-generator',
    gradient: 'from-blue-500 to-indigo-500',
    features: ['Templates', 'Tax & Discount', 'PDF Export', 'Client Management'],
    category: 'productivity',
    comingSoon: true,
  },
  {
    title: 'PDF Tools Suite',
    description:
      'Comprehensive PDF toolkit to merge, split, compress, and convert PDFs. Add watermarks, extract pages, convert to images, and more. All processing done in-browser.',
    icon: FileDown,
    href: '/tools/pdf-tools',
    gradient: 'from-red-500 to-orange-500',
    features: ['Merge/Split', 'Compress', 'Convert', 'Watermark'],
    category: 'productivity',
  },
  {
    title: 'Loan & Mortgage Calculator',
    description:
      'Calculate monthly payments, total interest, and amortization schedules for loans and mortgages. Compare different scenarios and visualize payment breakdowns over time.',
    icon: TrendingDown,
    href: '/tools/loan-calculator',
    gradient: 'from-emerald-500 to-teal-500',
    features: ['Amortization Table', 'Payment Schedule', 'Interest Breakdown', 'Compare Loans'],
    category: 'finance',
    comingSoon: true,
  },
  {
    title: 'BMI & Health Calculator',
    description:
      'Calculate Body Mass Index (BMI), ideal weight range, and health categories. Support for both metric and imperial units with personalized health insights and recommendations.',
    icon: Activity,
    href: '/tools/bmi-calculator',
    gradient: 'from-green-500 to-emerald-500',
    features: ['BMI Chart', 'Health Tips', 'Imperial/Metric', 'Ideal Weight Range'],
    category: 'productivity',
  },
  {
    title: 'Gradient Generator',
    description:
      'Create beautiful CSS gradients visually with an intuitive interface. Support for linear, radial, and conic gradients. Export as CSS, copy code, or save presets.',
    icon: Wand2,
    href: '/tools/gradient-generator',
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
    features: ['Multiple Types', 'Color Picker', 'CSS Export', 'Presets'],
    category: 'media',
    comingSoon: true,
  },
  {
    title: 'Stopwatch & Timer',
    description:
      'Professional stopwatch with lap tracking and multiple simultaneous countdown timers. Save timer presets, set custom alarms, and get desktop notifications when time is up.',
    icon: Clock,
    href: '/tools/stopwatch-timer',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Multiple Timers', 'Lap Times', 'Presets', 'Alarm Sounds'],
    category: 'productivity',
    comingSoon: true,
  },
  {
    title: 'JSON to CSV Converter',
    description:
      'Convert JSON data to CSV format with support for nested objects and arrays. Flatten complex structures, customize delimiters, preview results, and download instantly.',
    icon: FileSpreadsheet,
    href: '/tools/json-to-csv',
    gradient: 'from-teal-500 to-green-500',
    features: ['Flatten Nested', 'Custom Delimiter', 'Download', 'Preview'],
    category: 'data',
    new: true,
  },
  {
    title: 'Encryption & Decryption Tool',
    description:
      'Encrypt and decrypt text using AES-256 encryption. Create password-protected notes, generate secure sharing links, with all processing done locally in your browser.',
    icon: Shield,
    href: '/tools/encryption-tool',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['AES-256', 'Password Protected', 'Secure Sharing', 'No Server Storage'],
    category: 'security',
    comingSoon: true,
  },
  {
    title: 'IP Address Lookup',
    description:
      'Discover your public IP address and get detailed geolocation information. View ISP details, detect VPN usage, and support for both IPv4 and IPv6 addresses.',
    icon: Network,
    href: '/tools/ip-lookup',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Geolocation', 'ISP Info', 'VPN Detection', 'IPv4/IPv6'],
    category: 'development',
    comingSoon: true,
  },
  {
    title: 'Website Screenshot Tool',
    description:
      'Capture high-resolution screenshots of any website. Full-page capture or viewport only, multiple device sizes, and instant download. Perfect for documentation and testing.',
    icon: Smartphone,
    href: '/tools/website-screenshot',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Full Page', 'Device Sizes', 'High Resolution', 'Download'],
    category: 'development',
    new: true,
  },
  {
    title: 'Hash Generator & Verifier',
    description:
      'Generate cryptographic hashes using MD5, SHA-1, SHA-256, SHA-512, and more. Hash text or entire files, compare hashes, and verify file integrity.',
    icon: Hash,
    href: '/tools/hash-generator',
    gradient: 'from-red-500 to-pink-500',
    features: ['Multiple Algorithms', 'File Hashing', 'Compare & Verify', 'HMAC'],
    category: 'security',
    new: true,
  },
  {
    title: 'Cron Expression Builder',
    description:
      'Visual cron schedule builder with human-readable descriptions. Preview next execution times, validate expressions, and browse common cron patterns with examples.',
    icon: Calendar,
    href: '/tools/cron-expression',
    gradient: 'from-teal-500 to-green-500',
    features: ['Visual Builder', 'Next 10 Runs', 'Examples', 'Validation'],
    category: 'development',
    comingSoon: true,
  },
  {
    title: 'Regex Tester & Debugger',
    description:
      'Interactive regular expression tester with real-time matching, group capturing, and detailed explanations. Includes regex cheat sheet and common pattern library.',
    icon: Terminal,
    href: '/tools/regex-tester',
    gradient: 'from-fuchsia-500 to-pink-500',
    features: ['Live Testing', 'Match Groups', 'Cheat Sheet', 'Pattern Library'],
    category: 'development',
    comingSoon: true,
  },
  {
    title: 'Daily Task Summary',
    description:
      'Summarize your daily tasks and activities. Get insights into your productivity patterns and identify areas for improvement.',
    icon: Calendar,
    href: '/tools/daily-task-summary',
    gradient: 'from-green-500 to-blue-500',
    features: ['Task Overview', 'Time Tracking', 'Productivity Insights', 'Download'],
    category: 'productivity',
  },
]

const categories: { value: ToolCategory; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Tools', icon: LayoutGrid },
  { value: 'data', label: 'Data', icon: FileJson },
  { value: 'development', label: 'Development', icon: Terminal },
  { value: 'media', label: 'Media', icon: Image },
  { value: 'productivity', label: 'Productivity', icon: Zap },
  { value: 'security', label: 'Security', icon: Lock },
  { value: 'finance', label: 'Finance', icon: Calculator },
]

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // ESC to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('')
        searchInputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery])

  // Filter & Sort tools based on search and category and sort by popular and new, then alphabetically
  const filteredTools = useMemo(() => {
    let filtered = tools

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((tool) => tool.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tool) =>
          tool.title.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.features.some((f) => f.toLowerCase().includes(query))
      )
    }

    // Sort by priority:
    // 1. popular (not coming soon)
    // 2. new (not coming soon)
    // 3. regular tools (not coming soon)
    // 4. coming soon
    // 5. alphabetically within each group
    filtered = filtered.sort((a, b) => {
      // Coming soon tools always go to the end
      if (a.comingSoon && !b.comingSoon) return 1
      if (!a.comingSoon && b.comingSoon) return -1

      // Among non-coming-soon tools, sort by popular
      if (a.popular && !b.popular) return -1
      if (!a.popular && b.popular) return 1

      // Then by new
      if (a.new && !b.new) return -1
      if (!a.new && b.new) return 1

      // Finally alphabetically
      return a.title.localeCompare(b.title)
    })

    return filtered
  }, [searchQuery, selectedCategory])

  const stats = useMemo(() => {
    const total = tools.length
    const active = tools.filter((t) => !t.comingSoon).length
    const popular = tools.filter((t) => t.popular).length
    const newTools = tools.filter((t) => t.new).length
    return { total, active, popular, new: newTools }
  }, [])

  return (
    <div
      className={css({
        position: 'relative',
        mx: 'auto',
        minH: '100vh',
        w: 'full',
        maxW: { base: 'full', md: 'none' }, // Remove max-width constraint on desktop
        px: { base: '4', sm: '6', md: '6', lg: '8', xl: '10' },
        py: { base: '6', sm: '8', md: '10', lg: '12' },
        spaceY: { base: '10', sm: '12', lg: '14' },
      })}
    >
      {/* Subtle background gradients */}
      <div className={css({ pointerEvents: 'none', position: 'fixed', inset: '0', zIndex: '0' })}>
        <div
          className={css({
            position: 'absolute',
            top: '0',
            left: '0',
            h: '96',
            w: '96',
            rounded: 'full',
            bg: 'rgba(168, 85, 247, 0.1)',
            filter: 'blur(96px)',
          })}
        />
        <div
          className={css({
            position: 'absolute',
            top: '0',
            right: '0',
            h: '96',
            w: '96',
            rounded: 'full',
            bg: 'rgba(59, 130, 246, 0.1)',
            filter: 'blur(96px)',
          })}
        />
        <div
          className={css({
            position: 'absolute',
            bottom: '0',
            left: '33.333%',
            h: '96',
            w: '96',
            rounded: 'full',
            bg: 'rgba(236, 72, 153, 0.1)',
            filter: 'blur(96px)',
          })}
        />
      </div>

      {/* Compact Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({
          position: 'relative',
          zIndex: '10',
          mx: 'auto',
          w: 'full',
          maxW: { base: 'full', sm: '3xl', md: '4xl', lg: '5xl' },
          spaceY: '6',
          textAlign: 'center',
        })}
        style={{ margin: '0 auto' }}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            bg: 'rgba(168, 85, 247, 0.1)',
            px: '5',
            py: '2.5',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Sparkles className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span className={css({ fontSize: 'base', fontWeight: 'semibold', color: 'purple.300' })}>
            {stats.total} Professional Tools for Daily Use
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '5xl', sm: '6xl', md: '7xl' },
            fontWeight: 'extrabold',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'purple.400',
              gradientVia: 'pink.400',
              gradientTo: 'blue.400',
              bgClip: 'text',
              color: 'transparent',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SuperTool Collection
          </span>
          <span
            className={css({
              display: 'block',
              mt: '2',
              fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
              color: 'gray.300',
            })}
          >
            Your All-in-One Digital Toolkit
          </span>
        </h1>

        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            lineHeight: 'relaxed',
            color: 'gray.400',
          })}
        >
          From development tools to finance calculators, productivity boosters to media converters.
          Everything you need for work and daily life, beautifully designed and lightning fast.
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={css({
          position: 'relative',
          zIndex: '10',
          mx: 'auto',
          w: 'full',
          maxW: { base: 'full', md: '100%' },
          spaceY: '6',
        })}
      >
        {/* Search Input */}
        <div
          className={css({ w: { base: 'full', sm: '85%', md: '75%', lg: '60%' } })}
          style={{ margin: '0 auto' }}
        >
          <Field>
            <div className={css({ position: 'relative', w: 'full' })}>
              {/* Search Icon */}
              <div
                className={css({
                  position: 'absolute',
                  left: '4',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: '10',
                })}
              >
                <Search className={css({ h: '5', w: '5', color: 'gray.500' })} strokeWidth={2} />
              </div>

              {/* Input Field */}
              <FieldInput
                ref={searchInputRef}
                type="search"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className={css({
                  h: '16',
                  w: 'full',
                  rounded: 'xl',
                  border: '2px solid',
                  borderColor: 'gray.800',
                  bg: 'rgba(17, 24, 39, 0.5)',
                  fontSize: { base: 'base', sm: 'lg' },
                  fontWeight: 'medium',
                  color: 'gray.100',
                  shadow: 'lg',
                  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                  _placeholder: { color: 'gray.500' },
                  _hover: {
                    borderColor: 'gray.700',
                    bg: 'rgba(17, 24, 39, 0.7)',
                  },
                  _focus: {
                    borderColor: 'purple.500',
                    bg: 'rgba(17, 24, 39, 0.8)',
                    shadow: 'xl',
                    boxShadow: '0 20px 25px rgba(139, 92, 246, 0.2)',
                    ring: '4px',
                    ringColor: 'rgba(139, 92, 246, 0.2)',
                  },
                })}
                style={{
                  paddingLeft: 40,
                }}
                autoComplete="off"
                spellCheck="false"
                aria-label="Search tools"
                aria-describedby="search-hint"
              />

              {/* Clear Button */}
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className={css({
                    position: 'absolute',
                    insetY: '0',
                    right: '0',
                    my: 'auto',
                    mr: '4',
                    display: 'flex',
                    h: '8',
                    w: '8',
                    alignItems: 'center',
                    justifyContent: 'center',
                    rounded: 'lg',
                    bg: 'gray.800',
                    color: 'gray.400',
                    transition: 'all 0.2s',
                    _hover: { bg: 'gray.700', color: 'gray.200' },
                    _focus: {
                      outline: 'none',
                      ring: '2px',
                      ringColor: 'rgba(168, 85, 247, 0.5)',
                    },
                  })}
                  aria-label="Clear search"
                  type="button"
                >
                  <X className={css({ h: '4', w: '4' })} strokeWidth={2.5} />
                </motion.button>
              )}

              {/* Search hint */}
              {!searchQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  id="search-hint"
                  className={css({
                    pointerEvents: 'none',
                    position: 'absolute',
                    insetY: '0',
                    right: 8,
                    display: { base: 'none', sm: 'flex' },
                    alignItems: 'center',
                    pr: '5',
                  })}
                >
                  <kbd
                    className={css({
                      rounded: 'sm',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'rgba(31, 41, 55, 0.5)',
                      px: '2',
                      py: '1',
                      fontSize: 'xs',
                      fontWeight: 'semibold',
                      color: 'gray.500',
                    })}
                  >
                    Ctrl K
                  </kbd>
                </motion.div>
              )}
            </div>
          </Field>
        </div>

        {/* Category Pills and View Toggle */}
        <div
          className={css({
            mx: 'auto',
            w: 'full',
            maxW: { base: 'full', md: '100%' },
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4',
          })}
        >
          <div
            className={css({
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2',
            })}
          >
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.value
              const toolCount = tools.filter((t) =>
                category.value === 'all' ? true : t.category === category.value
              ).length

              return (
                <Tooltip key={category.value}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      aria-label={`Filter by ${category.label}`}
                      aria-pressed={isActive}
                      className={css({
                        h: '11',
                        gap: '2',
                        px: '4',
                        fontSize: 'base',
                        fontWeight: 'medium',
                        transition: 'all 0.2s',
                        ...(isActive
                          ? {
                              border: '1px solid rgba(168, 85, 247, 0.5)',
                              bg: 'rgba(168, 85, 247, 0.2)',
                              color: 'purple.200',
                              _hover: { bg: 'rgba(168, 85, 247, 0.3)' },
                            }
                          : {
                              border: '1px solid',
                              borderColor: 'gray.700',
                              bg: 'rgba(17, 24, 39, 0.5)',
                              color: 'gray.300',
                              _hover: {
                                borderColor: 'rgba(168, 85, 247, 0.3)',
                                bg: 'rgba(31, 41, 55, 0.5)',
                                color: 'purple.300',
                              },
                            }),
                      })}
                    >
                      <Icon className={css({ h: '4', w: '4' })} />
                      {category.label}
                      {category.value === 'all' && (
                        <Badge
                          variant="secondary"
                          className={css({
                            ml: '1',
                            h: '5',
                            rounded: 'full',
                            bg: 'rgba(168, 85, 247, 0.3)',
                            px: '2.5',
                            fontSize: 'xs',
                            fontWeight: 'bold',
                            color: 'purple.200',
                          })}
                        >
                          {stats.total}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {toolCount} {toolCount === 1 ? 'tool' : 'tools'} in {category.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          {/* View Mode Toggle */}
          <div
            className={css({
              display: 'flex',
              gap: '1',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: '1',
            })}
            role="group"
            aria-label="View mode"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={css({
                    h: '9',
                    w: '9',
                    p: '0',
                    ...(viewMode === 'grid'
                      ? { bg: 'rgba(168, 85, 247, 0.2)', color: 'purple.300' }
                      : { color: 'gray.500', _hover: { color: 'gray.300' } }),
                  })}
                >
                  <LayoutGrid className={css({ h: '5', w: '5' })} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={css({
                    h: '9',
                    w: '9',
                    p: '0',
                    ...(viewMode === 'list'
                      ? { bg: 'rgba(168, 85, 247, 0.2)', color: 'purple.300' }
                      : { color: 'gray.500', _hover: { color: 'gray.300' } }),
                  })}
                >
                  <LayoutList className={css({ h: '5', w: '5' })} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>
          </div>
        </div>
        {/* Results count */}
        {(searchQuery || selectedCategory !== 'all') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={css({ display: 'flex', alignItems: 'center', gap: '3' })}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                rounded: 'lg',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                bg: 'rgba(168, 85, 247, 0.1)',
                px: '4',
                py: '2',
                backdropFilter: 'blur(8px)',
              })}
            >
              <div
                className={css({
                  h: '2',
                  w: '2',
                  animation: 'pulse 2s infinite',
                  rounded: 'full',
                  bg: 'purple.400',
                })}
              />
              <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'purple.300' })}>
                {filteredTools.length} {filteredTools.length === 1 ? 'result' : 'results'}
                {selectedCategory !== 'all' &&
                  ` in ${categories.find((c) => c.value === selectedCategory)?.label}`}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className={css({
                  fontSize: 'sm',
                  color: 'gray.500',
                  transition: 'colors 0.2s',
                  _hover: { color: 'purple.400' },
                })}
              >
                Clear all
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Tools Grid/List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          position: 'relative',
          zIndex: 10,
          margin: '0 auto',
          width: '100%',
          maxWidth: '1400px',
          padding: '0 1rem',
        }}
      >
        <AnimatePresence mode="wait">
          {filteredTools.length > 0 ? (
            <motion.div
              key={`${viewMode}-${selectedCategory}-${searchQuery}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={css({
                display: viewMode === 'grid' ? 'grid' : 'flex',
                flexDirection: viewMode === 'list' ? 'column' : undefined,
                gridTemplateColumns:
                  viewMode === 'grid'
                    ? {
                        base: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)',
                        xl: 'repeat(4, 1fr)',
                      }
                    : undefined,
                gap: viewMode === 'grid' ? '6' : '4',
              })}
            >
              {filteredTools.map((tool, index) => (
                <ToolCard
                  key={tool.title}
                  tool={tool}
                  index={index}
                  viewMode={viewMode}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={css({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: '20',
                textAlign: 'center',
              })}
            >
              <div
                className={css({
                  mb: '6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rounded: 'full',
                  bg: 'rgba(31, 41, 55, 0.5)',
                  p: '8',
                })}
              >
                <Search
                  className={css({ h: '16', w: '16', color: 'gray.600' })}
                  strokeWidth={1.5}
                />
              </div>
              <h3
                className={css({ mb: '3', fontSize: '2xl', fontWeight: 'bold', color: 'gray.300' })}
              >
                No tools found
              </h3>
              <p
                className={css({
                  mb: '2',
                  maxW: 'md',
                  fontSize: 'base',
                  lineHeight: 'relaxed',
                  color: 'gray.500',
                })}
              >
                {searchQuery ? (
                  <>
                    No results for{' '}
                    <span className={css({ fontWeight: 'semibold', color: 'purple.400' })}>
                      &quot;{searchQuery}&quot;
                    </span>
                  </>
                ) : (
                  'No tools match the selected filters'
                )}
              </p>
              <p className={css({ mb: '8', maxW: 'md', fontSize: 'sm', color: 'gray.600' })}>
                Try adjusting your search or filters to find what you&apos;re looking for
              </p>
              <div className={css({ display: 'flex', gap: '3' })}>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                    className={css({
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      px: '4',
                      py: '5',
                      fontSize: 'sm',
                      _hover: { bg: 'rgba(168, 85, 247, 0.1)' },
                    })}
                  >
                    Clear search
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className={css({
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    px: '6',
                    py: '5',
                    fontSize: 'base',
                    _hover: { bg: 'rgba(168, 85, 247, 0.1)' },
                  })}
                >
                  Clear all filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          position: 'relative',
          zIndex: 10,
          margin: '0 auto',
          width: '100%',
          maxWidth: '1400px',
          overflow: 'hidden',
          borderRadius: '1rem',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          background:
            'linear-gradient(to right, rgba(88, 28, 135, 0.2), rgba(131, 24, 67, 0.2), rgba(30, 58, 138, 0.2))',
          padding: '2rem',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: '8',
          })}
        >
          <div className={css({ textAlign: 'center' })}>
            <div
              className={css({ mb: '2', fontSize: '4xl', fontWeight: 'bold', color: 'purple.400' })}
            >
              {stats.active}
            </div>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5',
                fontSize: 'base',
                fontWeight: 'medium',
                color: 'gray.400',
              })}
            >
              <Zap className={css({ h: '4', w: '4' })} />
              <span>Active Tools</span>
            </div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div
              className={css({ mb: '2', fontSize: '4xl', fontWeight: 'bold', color: 'pink.400' })}
            >
              {stats.total}
            </div>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5',
                fontSize: 'base',
                fontWeight: 'medium',
                color: 'gray.400',
              })}
            >
              <LayoutGrid className={css({ h: '4', w: '4' })} />
              <span>Total Tools</span>
            </div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div
              className={css({ mb: '2', fontSize: '4xl', fontWeight: 'bold', color: 'blue.400' })}
            >
              {stats.popular}
            </div>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5',
                fontSize: 'base',
                fontWeight: 'medium',
                color: 'gray.400',
              })}
            >
              <TrendingUp className={css({ h: '4', w: '4' })} />
              <span>Popular</span>
            </div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div
              className={css({ mb: '2', fontSize: '4xl', fontWeight: 'bold', color: 'cyan.400' })}
            >
              {stats.new}
            </div>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5',
                fontSize: 'base',
                fontWeight: 'medium',
                color: 'gray.400',
              })}
            >
              <Star className={css({ h: '4', w: '4' })} />
              <span>New This Week</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fixed Position Buttons - Feedback & Support */}
      <div
        style={{
          position: 'fixed',
          right: '1rem',
          bottom: '1rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          style={{ pointerEvents: 'auto' }}
        >
          <TreatMeDialog />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{ pointerEvents: 'auto' }}
        >
          <FeedbackDialog />
        </motion.div>
      </div>
    </div>
  )
}

// Tool Card Component
function ToolCard({
  tool,
  index,
  viewMode,
  shouldReduceMotion,
}: {
  tool: Tool
  index: number
  viewMode: 'grid' | 'list'
  shouldReduceMotion: boolean | null
}) {
  const Icon = tool.icon
  const isComingSoon = tool.comingSoon
  const noMotion = shouldReduceMotion ?? false

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        whileHover={noMotion ? {} : { x: 4 }}
      >
        <Link
          href={isComingSoon ? '#' : tool.href}
          className={css({
            display: 'block',
            pointerEvents: isComingSoon ? 'none' : 'auto',
          })}
        >
          <Card
            className={css({
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.3s',
              opacity: isComingSoon ? 0.6 : 1,
              _hover: {
                borderColor: 'purple.500/40',
                bg: 'gray.900/80',
                shadow: 'lg',
                boxShadow: '0 10px 15px rgba(139, 92, 246, 0.1)',
              },
            })}
            style={{ padding: '20px' }}
          >
            <div className={css({ display: 'flex', alignItems: 'flex-start', gap: '5' })}>
              <motion.div
                className={css({
                  flexShrink: 0,
                  rounded: 'xl',
                  p: '4',
                  shadow: 'lg',
                })}
                style={{
                  background: gradientToCss(tool.gradient),
                }}
                whileHover={noMotion ? {} : { rotate: [0, -5, 5, 0], scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className={css({ h: '7', w: '7', color: 'white' })} />
              </motion.div>

              <div className={css({ minW: 0, flex: 1 })}>
                <div
                  className={css({
                    mb: '2',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <CardTitle
                    className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'gray.100' })}
                  >
                    {tool.title}
                  </CardTitle>

                  {tool.popular && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className={css({
                        bg: 'orange.500/20',
                        px: '2.5',
                        py: '1',
                        color: 'orange.300',
                      })}
                    >
                      <TrendingUp className={css({ mr: '1', h: '3.5', w: '3.5' })} />
                      Popular
                    </Badge>
                  )}

                  {tool.new && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className={css({
                        bg: 'blue.500/20',
                        px: '2.5',
                        py: '1',
                        color: 'blue.300',
                      })}
                    >
                      <Sparkles className={css({ mr: '1', h: '3.5', w: '3.5' })} />
                      New
                    </Badge>
                  )}

                  {isComingSoon && (
                    <Badge
                      variant="warning"
                      size="sm"
                      className={css({
                        bg: 'yellow.500/20',
                        px: '2.5',
                        py: '1',
                        color: 'yellow.300',
                      })}
                    >
                      <Clock className={css({ mr: '1', h: '3.5', w: '3.5' })} />
                      Coming Soon
                    </Badge>
                  )}
                </div>

                <CardDescription
                  className={css({
                    mb: '4',
                    fontSize: 'base',
                    lineHeight: 'relaxed',
                    color: 'gray.400',
                  })}
                >
                  {tool.description}
                </CardDescription>

                <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                  {tool.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="outline"
                      size="sm"
                      className={css({
                        border: '1px solid',
                        borderColor: 'purple.500/30',
                        bg: 'purple.500/10',
                        px: '3',
                        py: '1',
                        fontSize: 'sm',
                        color: 'purple.300',
                      })}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <ArrowRight
                className={css({
                  h: '6',
                  w: '6',
                  flexShrink: 0,
                  color: 'gray.600',
                  transition: 'all 0.3s',
                  _groupHover: {
                    transform: 'translateX(4px)',
                    color: 'purple.400',
                  },
                })}
              />
            </div>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={noMotion ? {} : { y: -8, scale: 1.02 }}
      whileTap={noMotion ? {} : { scale: 0.98 }}
    >
      <Link
        href={isComingSoon ? '#' : tool.href}
        className={css({
          display: 'block',
          h: 'full',
          pointerEvents: isComingSoon ? 'none' : 'auto',
        })}
      >
        <Card
          className={css({
            position: 'relative',
            h: 'full',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.3s',
            opacity: isComingSoon ? 0.6 : 1,
            _hover: {
              borderColor: 'purple.500/50',
              bg: 'gray.900/80',
              shadow: 'xl',
              boxShadow: '0 20px 25px rgba(139, 92, 246, 0.2)',
            },
          })}
          style={{ padding: '24px' }}
        >
          <div className={css({ spaceY: '4' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              })}
            >
              <motion.div
                className={css({
                  rounded: 'xl',
                  p: '3.5',
                  shadow: 'lg',
                })}
                style={{
                  background: gradientToCss(tool.gradient),
                }}
                whileHover={noMotion ? {} : { rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
              >
                <Icon className={css({ h: '7', w: '7', color: 'white' })} />
              </motion.div>

              <div className={css({ display: 'flex', flexDirection: 'column', gap: '1' })}>
                {tool.popular && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className={css({ bg: 'orange.500/20', px: '2', py: '1', color: 'orange.300' })}
                  >
                    <TrendingUp className={css({ h: '3.5', w: '3.5' })} />
                  </Badge>
                )}

                {tool.new && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className={css({ bg: 'blue.500/20', px: '2', py: '1', color: 'blue.300' })}
                  >
                    <Sparkles className={css({ h: '3.5', w: '3.5' })} />
                  </Badge>
                )}

                {isComingSoon && (
                  <Badge
                    variant="warning"
                    size="sm"
                    className={css({
                      bg: 'yellow.500/20',
                      px: '2',
                      py: '1',
                      fontSize: 'xs',
                      color: 'yellow.300',
                    })}
                  >
                    Soon
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <CardTitle
                className={css({
                  mb: '3',
                  fontSize: 'xl',
                  lineHeight: 'tight',
                  fontWeight: 'bold',
                  color: 'gray.100',
                })}
              >
                {tool.title}
              </CardTitle>

              <CardDescription
                className={css({
                  lineClamp: 3,
                  fontSize: 'sm',
                  lineHeight: 'relaxed',
                  color: 'gray.400',
                })}
              >
                {tool.description}
              </CardDescription>
            </div>

            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '1.5', pt: '2' })}>
              {tool.features.slice(0, 3).map((feature) => (
                <Badge
                  key={feature}
                  variant="outline"
                  size="sm"
                  className={css({
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                    bg: 'purple.500/10',
                    px: '2.5',
                    py: '1',
                    fontSize: 'xs',
                    color: 'purple.300',
                  })}
                >
                  {feature}
                </Badge>
              ))}
              {tool.features.length > 3 && (
                <Badge
                  variant="outline"
                  size="sm"
                  className={css({
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                    bg: 'purple.500/10',
                    px: '2.5',
                    py: '1',
                    fontSize: 'xs',
                    color: 'purple.300',
                  })}
                >
                  +{tool.features.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Hover effect overlay */}
          <div
            className={css({
              position: 'absolute',
              inset: '0',
              bgGradient: 'to-t',
              gradientFrom: 'purple.500/10',
              gradientVia: 'transparent',
              gradientTo: 'transparent',
              opacity: 0,
              transition: 'opacity 0.3s',
              _groupHover: {
                opacity: 1,
              },
            })}
          />
        </Card>
      </Link>
    </motion.div>
  )
}
