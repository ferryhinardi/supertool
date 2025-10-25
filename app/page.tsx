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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'

type ToolCategory = 'all' | 'data' | 'media' | 'development' | 'productivity' | 'security'

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
    title: 'Hash Generator & Verifier',
    description:
      'Generate cryptographic hashes using MD5, SHA-1, SHA-256, SHA-512, and more. Hash text or entire files, compare hashes, and verify file integrity.',
    icon: Hash,
    href: '/tools/hash-generator',
    gradient: 'from-red-500 to-pink-500',
    features: ['Multiple Algorithms', 'File Hashing', 'Compare & Verify', 'HMAC'],
    category: 'security',
    comingSoon: true,
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
]

const categories: { value: ToolCategory; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Tools', icon: LayoutGrid },
  { value: 'data', label: 'Data', icon: FileJson },
  { value: 'development', label: 'Development', icon: Terminal },
  { value: 'media', label: 'Media', icon: Image },
  { value: 'productivity', label: 'Productivity', icon: Zap },
  { value: 'security', label: 'Security', icon: Lock },
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

  // Filter tools based on search and category
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
    <div className="relative mx-auto min-h-screen max-w-7xl space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-10 lg:space-y-12 lg:px-8 lg:py-12">
      {/* Subtle background gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* Compact Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 space-y-6 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-5 py-2.5 backdrop-blur-sm">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <span className="text-base font-semibold text-purple-300">
            {stats.total} Professional Tools & Growing
          </span>
        </div>

        <h1 className="text-5xl font-extrabold sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            SuperTool Collection
          </span>
          <span className="mt-2 block text-3xl text-gray-300 sm:text-4xl md:text-5xl">
            Professional Developer Toolkit
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
          Fast, beautiful, and powerful web-based tools designed for developers, designers, and
          productivity enthusiasts
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 space-y-6"
      >
        {/* Search Input */}
        <div className="mx-auto w-full max-w-md">
          <div className="group relative w-full">
            {/* Input Field */}
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-16 w-full rounded-xl border-2 border-gray-800 bg-gray-900/50 pr-14 pl-6 text-base font-medium text-gray-100 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-500 hover:border-gray-700 hover:bg-gray-900/70 focus:border-purple-500 focus:bg-gray-900/80 focus:shadow-xl focus:shadow-purple-500/20 focus-visible:ring-4 focus-visible:ring-purple-500/20 sm:text-lg"
              autoComplete="off"
              spellCheck="false"
            />

            {/* Clear Button */}
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 my-auto mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all hover:bg-gray-700 hover:text-gray-200 focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                aria-label="Clear search"
                type="button"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </motion.button>
            )}

            {/* Search hint */}
            {!searchQuery && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute inset-y-0 right-0 hidden items-center pr-5 sm:flex"
              >
                <kbd className="rounded border border-gray-700 bg-gray-800/50 px-2 py-1 text-xs font-semibold text-gray-500">
                  Ctrl K
                </kbd>
              </motion.div>
            )}
          </div>
        </div>

        {/* Category Pills and View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.value
              return (
                <Button
                  key={category.value}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`group h-11 gap-2 px-4 text-base font-medium transition-all ${
                    isActive
                      ? 'border-purple-500/50 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
                      : 'border-gray-700 bg-gray-900/50 text-gray-300 hover:border-purple-500/30 hover:bg-gray-800/50 hover:text-purple-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                  {category.value === 'all' && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 rounded-full bg-purple-500/30 px-2.5 text-xs font-bold text-purple-200"
                    >
                      {stats.total}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 rounded-lg border border-gray-700 bg-gray-900/50 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-9 w-9 p-0 ${
                viewMode === 'grid'
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-9 w-9 p-0 ${
                viewMode === 'list'
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <LayoutList className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        {(searchQuery || selectedCategory !== 'all') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-4 py-2 backdrop-blur-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
              <p className="text-sm font-medium text-purple-300">
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
                className="text-sm text-gray-500 underline-offset-2 transition-colors hover:text-purple-400 hover:underline"
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
        className="relative z-10"
      >
        <AnimatePresence mode="wait">
          {filteredTools.length > 0 ? (
            <motion.div
              key={`${viewMode}-${selectedCategory}-${searchQuery}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'space-y-3'
              }
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
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 flex items-center justify-center rounded-full bg-gray-800/50 p-8">
                <Search className="h-16 w-16 text-gray-600" strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-300">No tools found</h3>
              <p className="mb-2 max-w-md text-base leading-relaxed text-gray-500">
                {searchQuery ? (
                  <>
                    No results for{' '}
                    <span className="font-semibold text-purple-400">&quot;{searchQuery}&quot;</span>
                  </>
                ) : (
                  'No tools match the selected filters'
                )}
              </p>
              <p className="mb-8 max-w-md text-sm text-gray-600">
                Try adjusting your search or filters to find what you&apos;re looking for
              </p>
              <div className="flex gap-3">
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                    className="border-purple-500/30 px-4 py-5 text-sm hover:bg-purple-500/10"
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
                  className="border-purple-500/30 px-6 py-5 text-base hover:bg-purple-500/10"
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
        className="relative z-10 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-blue-900/20 p-8 backdrop-blur-sm"
      >
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-purple-400">{stats.active}</div>
            <div className="flex items-center justify-center gap-1.5 text-base font-medium text-gray-400">
              <Zap className="h-4 w-4" />
              <span>Active Tools</span>
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-pink-400">{stats.total}</div>
            <div className="flex items-center justify-center gap-1.5 text-base font-medium text-gray-400">
              <LayoutGrid className="h-4 w-4" />
              <span>Total Tools</span>
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-blue-400">{stats.popular}</div>
            <div className="flex items-center justify-center gap-1.5 text-base font-medium text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span>Popular</span>
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-cyan-400">{stats.new}</div>
            <div className="flex items-center justify-center gap-1.5 text-base font-medium text-gray-400">
              <Star className="h-4 w-4" />
              <span>New This Week</span>
            </div>
          </div>
        </div>
      </motion.div>
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
          className={`block ${isComingSoon ? 'pointer-events-none' : ''}`}
        >
          <Card
            className={`group relative overflow-hidden border-purple-500/20 bg-gray-900/50 backdrop-blur-sm transition-all hover:border-purple-500/40 hover:bg-gray-900/80 hover:shadow-lg hover:shadow-purple-500/10 ${isComingSoon ? 'opacity-60' : ''}`}
            style={{ padding: '20px' }}
          >
            <div className="flex items-start gap-5">
              <motion.div
                className={`flex-shrink-0 rounded-xl bg-gradient-to-br p-4 ${tool.gradient} shadow-lg`}
                whileHover={noMotion ? {} : { rotate: [0, -5, 5, 0], scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="h-7 w-7 text-white" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl font-bold text-gray-100">{tool.title}</CardTitle>
                  {tool.popular && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="bg-orange-500/20 px-2.5 py-1 text-orange-300"
                    >
                      <TrendingUp className="mr-1 h-3.5 w-3.5" />
                      Popular
                    </Badge>
                  )}
                  {tool.new && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="bg-blue-500/20 px-2.5 py-1 text-blue-300"
                    >
                      <Sparkles className="mr-1 h-3.5 w-3.5" />
                      New
                    </Badge>
                  )}
                  {isComingSoon && (
                    <Badge
                      variant="warning"
                      size="sm"
                      className="bg-yellow-500/20 px-2.5 py-1 text-yellow-300"
                    >
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <CardDescription className="mb-4 text-base leading-relaxed text-gray-400">
                  {tool.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm text-purple-300"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <ArrowRight className="h-6 w-6 flex-shrink-0 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-purple-400" />
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
        className={`block h-full ${isComingSoon ? 'pointer-events-none' : ''}`}
      >
        <Card
          className={`group relative h-full overflow-hidden border-purple-500/20 bg-gray-900/50 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-gray-900/80 hover:shadow-xl hover:shadow-purple-500/20 ${isComingSoon ? 'opacity-60' : ''}`}
          style={{ padding: '24px' }}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <motion.div
                className={`rounded-xl bg-gradient-to-br p-3.5 ${tool.gradient} shadow-lg`}
                whileHover={noMotion ? {} : { rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
              >
                <Icon className="h-7 w-7 text-white" />
              </motion.div>
              <div className="flex flex-col gap-1">
                {tool.popular && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className="bg-orange-500/20 px-2 py-1 text-orange-300"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                  </Badge>
                )}
                {tool.new && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className="bg-blue-500/20 px-2 py-1 text-blue-300"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </Badge>
                )}
                {isComingSoon && (
                  <Badge
                    variant="warning"
                    size="sm"
                    className="bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300"
                  >
                    Soon
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <CardTitle className="mb-3 text-xl leading-tight font-bold text-gray-100">
                {tool.title}
              </CardTitle>
              <CardDescription className="line-clamp-3 text-sm leading-relaxed text-gray-400">
                {tool.description}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tool.features.slice(0, 3).map((feature) => (
                <Badge
                  key={feature}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-300"
                >
                  {feature}
                </Badge>
              ))}
              {tool.features.length > 3 && (
                <Badge
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-300"
                >
                  +{tool.features.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Card>
      </Link>
    </motion.div>
  )
}
