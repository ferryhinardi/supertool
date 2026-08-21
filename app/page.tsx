'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileJson,
  Grid3x3,
  Image,
  LayoutGrid,
  LayoutList,
  Lock,
  Search,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Script from 'next/script'
import { memo, startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Field, FieldInput } from '@/components/ui/field'
import { ToolSearch } from '@/components/ui/tool-search'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  generateOrganizationSchema,
  generateWebApplicationSchema,
  generateWebSiteSchema,
} from '@/lib/data/structured-data'
import { type Tool, type ToolCategory, tools } from '@/lib/data/tools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Lazy load non-critical components to reduce initial bundle size
const RecentTools = dynamic(
  () =>
    import('@/components/features/tools/RecentTools').then((mod) => ({
      default: mod.RecentTools,
    })),
  {
    ssr: false,
    loading: () => null,
  }
)

const AdContainer = dynamic(
  () =>
    import('@/components/features/ads/AdContainer').then((mod) => ({
      default: mod.AdContainer,
    })),
  {
    ssr: false,
    loading: () => null,
  }
)

const FeedbackDialog = dynamic(
  () =>
    import('@/components/features/shared/FeedbackDialog').then((mod) => ({
      default: mod.FeedbackDialog,
    })),
  {
    ssr: false,
  }
)

const TreatMeDialog = dynamic(
  () =>
    import('@/components/features/shared/TreatMeDialog').then((mod) => ({
      default: mod.TreatMeDialog,
    })),
  {
    ssr: false,
  }
)

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

// Cache for gradient conversions to avoid recalculating
const gradientCache = new Map<string, string>()

// Convert Tailwind gradient class to CSS gradient string
const gradientToCss = (gradient: string): string => {
  // Return cached result if available
  const cached = gradientCache.get(gradient)
  if (cached !== undefined) {
    return cached
  }

  const match = gradient.match(/from-(\S+)\s+(?:via-(\S+)\s+)?to-(\S+)/)
  if (!match) {
    gradientCache.set(gradient, gradient)
    return gradient
  }

  const [, from, via, to] = match
  const fromColor = colorMap[from] || from
  const toColor = colorMap[to] || to

  let result: string
  if (via) {
    const viaColor = colorMap[via] || via
    result = `linear-gradient(135deg, ${fromColor}, ${viaColor}, ${toColor})`
  } else {
    result = `linear-gradient(135deg, ${fromColor}, ${toColor})`
  }

  // Cache the result
  gradientCache.set(gradient, result)
  return result
}

const categories: {
  value: ToolCategory
  label: string
  icon: React.ElementType
  description: string
}[] = [
  {
    value: 'data',
    label: 'Data Processing',
    icon: FileJson,
    description: 'Transform, convert, and format your data',
  },
  {
    value: 'development',
    label: 'Developer Tools',
    icon: Terminal,
    description: 'Essential utilities for developers',
  },
  {
    value: 'media',
    label: 'Media Tools',
    icon: Image,
    description: 'Optimize, convert, and enhance your media files',
  },
  {
    value: 'productivity',
    label: 'Productivity',
    icon: Zap,
    description: 'Boost your daily workflow and efficiency',
  },
  {
    value: 'security',
    label: 'Security & Encryption',
    icon: Lock,
    description: 'Secure your data and generate credentials',
  },
  {
    value: 'finance',
    label: 'Finance & Calculators',
    icon: Calculator,
    description: 'Calculate, convert, and manage your finances',
  },
  {
    value: 'design',
    label: 'Design & Visual Tools',
    icon: Eye,
    description: 'Create, optimize, and analyze visual assets',
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [toolsView, setToolsView] = useState<'popular' | 'all'>(() => {
    // Load saved preference from localStorage
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('toolsView') as 'popular' | 'all') || 'popular'
    }
    return 'popular'
  })
  const [expandedCategories, setExpandedCategories] = useState<Set<ToolCategory>>(
    new Set(categories.map((c) => c.value))
  )
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hasRestoredScroll = useRef(false)

  // Disable browser's native scroll restoration to prevent conflicts
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Scroll restoration - save and restore scroll position
  useEffect(() => {
    const scrollKey = 'homepage-scroll-y'

    // Restore scroll position on mount
    if (!hasRestoredScroll.current) {
      const savedScroll = sessionStorage.getItem(scrollKey)
      if (savedScroll) {
        // Use multiple checks to ensure content is fully rendered before restoring
        const restore = () => {
          const scrollY = Number.parseInt(savedScroll, 10)
          window.scrollTo(0, scrollY)

          // Verify scroll was applied (sometimes first attempt fails if content not ready)
          requestAnimationFrame(() => {
            if (Math.abs(window.scrollY - scrollY) > 10) {
              window.scrollTo(0, scrollY)
            }
          })
        }

        // Wait for content to render and images to load
        if (document.readyState === 'complete') {
          restore()
        } else {
          window.addEventListener('load', restore, { once: true })
        }

        // Also try after a delay as backup
        const timeoutId = setTimeout(restore, 100)
        hasRestoredScroll.current = true

        return () => {
          clearTimeout(timeoutId)
          window.removeEventListener('load', restore)
        }
      }
      hasRestoredScroll.current = true
    }

    // Save scroll position periodically and on navigation
    let rafId: number
    let lastScroll = 0

    const saveScroll = () => {
      const currentScroll = window.scrollY
      // Only save if scroll changed significantly (reduces sessionStorage writes)
      if (Math.abs(currentScroll - lastScroll) > 50) {
        sessionStorage.setItem(scrollKey, currentScroll.toString())
        lastScroll = currentScroll
      }
    }

    const handleScroll = () => {
      // Use requestAnimationFrame for better performance
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      rafId = requestAnimationFrame(saveScroll)
    }

    // Listen to scroll
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Save on page hide (navigation, tab close, etc.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem(scrollKey, window.scrollY.toString())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Final save on unmount
      sessionStorage.setItem(scrollKey, window.scrollY.toString())
    }
  }, [])

  // Toggle category expansion
  const toggleCategory = (category: ToolCategory) => {
    // Use startTransition to mark this as non-urgent
    startTransition(() => {
      setExpandedCategories((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(category)) {
          newSet.delete(category)
        } else {
          newSet.add(category)
        }
        return newSet
      })
    })
  }

  // ESC to clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) {
        // Use startTransition for non-urgent state update
        startTransition(() => {
          setSearchQuery('')
        })
        searchInputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery])

  // Filter & Sort tools based on search, view mode, and category
  const filteredToolsByCategory = useMemo(() => {
    const result: Record<ToolCategory, Tool[]> = {
      data: [],
      development: [],
      media: [],
      productivity: [],
      security: [],
      finance: [],
      design: [],
      all: [],
    }

    let allTools = tools

    // Filter by toolsView (popular or all)
    if (toolsView === 'popular' && !searchQuery) {
      // Show only popular tools + top 5 new tools (max 20 tools total)
      const popularTools = tools.filter((t) => t.popular && !t.comingSoon)
      const newTools = tools.filter((t) => t.new && !t.comingSoon && !t.popular).slice(0, 5)
      allTools = [...popularTools, ...newTools]
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      allTools = allTools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.features.some((f) => f.toLowerCase().includes(query))
      )
    }

    // Group by category
    for (const tool of allTools) {
      if (tool.category !== 'all') {
        result[tool.category].push(tool)
      }
    }

    // Sort each category
    const sortTools = (toolsArray: Tool[]) =>
      toolsArray.sort((a, b) => {
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

    // Apply sorting to each category
    for (const category of Object.keys(result) as ToolCategory[]) {
      if (category !== 'all') {
        result[category] = sortTools(result[category])
      }
    }

    return result
  }, [searchQuery, toolsView])

  const stats = useMemo(() => {
    const total = tools.length
    const popular = tools.filter((t) => t.popular).length
    return { total, popular }
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
      {/* Hero Section */}
      <div
        className={css({
          position: 'relative',
          zIndex: '10',
          mx: 'auto',
          w: 'full',
          maxW: { base: 'full', sm: '3xl', md: '4xl', lg: '5xl' },
          spaceY: '4',
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
            px: '4',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Sparkles className={css({ h: '4', w: '4', color: 'purple.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'purple.300',
            })}
          >
            {stats.total}+ Tools
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
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
            SuperTool
          </span>
        </h1>
      </div>

      {/* Search and Filter Bar - Skip initial animation to reduce TBT */}
      <div
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
          className={css({
            w: { base: 'full', sm: '85%', md: '75%', lg: '60%' },
          })}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value
                  // Use startTransition for non-urgent filtering
                  startTransition(() => {
                    setSearchQuery(value)
                  })
                }}
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
                <button
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
                </button>
              )}

              {/* Global Tool Search hint */}
              {!searchQuery && (
                <div
                  id="search-hint"
                  className={css({
                    pointerEvents: 'none',
                    position: 'absolute',
                    insetY: '0',
                    right: 8,
                    display: { base: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: '2',
                    pr: '5',
                  })}
                >
                  <span
                    className={css({
                      fontSize: 'xs',
                      color: 'gray.600',
                      fontWeight: 'medium',
                    })}
                  >
                    Quick search
                  </span>
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
                      color: 'gray.400',
                    })}
                  >
                    ⌘K
                  </kbd>
                </div>
              )}
            </div>
          </Field>
        </div>

        {/* Tools View Toggle - Left aligned */}
        <div
          className={css({
            mx: 'auto',
            w: 'full',
            maxW: { base: 'full', md: '100%' },
            display: 'flex',
            flexDirection: { base: 'column', sm: 'row' },
            alignItems: { base: 'stretch', sm: 'center' },
            justifyContent: { sm: 'space-between' },
            gap: '4',
          })}
        >
          {/* Tools View Toggle (Popular/All) */}
          <fieldset
            className={css({
              display: 'flex',
              gap: '1',
              w: { base: 'full', sm: 'auto' },
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: '1',
            })}
            aria-label="Tools view"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setToolsView('popular')
                trackToolEvent('view_mode_toggle', { mode: 'popular' })
              }}
              aria-label="Popular tools"
              aria-pressed={toolsView === 'popular'}
              className={css({
                h: { base: '11', sm: '9' },
                flex: { base: '1', sm: 'initial' },
                justifyContent: 'center',
                px: { base: '2', sm: '4' },
                gap: '2',
                fontSize: 'sm',
                fontWeight: 'semibold',
                ...(toolsView === 'popular'
                  ? {
                      bg: 'rgba(168, 85, 247, 0.2)',
                      color: 'purple.300',
                      borderColor: 'purple.500',
                    }
                  : { color: 'gray.500', _hover: { color: 'gray.300' } }),
              })}
            >
              <Sparkles className={css({ h: '4', w: '4' })} />
              Popular ({stats.popular})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setToolsView('all')
                trackToolEvent('view_mode_toggle', { mode: 'all' })
              }}
              aria-label="All tools"
              aria-pressed={toolsView === 'all'}
              className={css({
                // Mirrors the sibling "Popular" button so both pills share one
                // height and split the row evenly at narrow widths.
                h: { base: '11', sm: '9' },
                flex: { base: '1', sm: 'initial' },
                justifyContent: 'center',
                px: { base: '2', sm: '4' },
                gap: '2',
                fontSize: 'sm',
                fontWeight: 'semibold',
                ...(toolsView === 'all'
                  ? {
                      bg: 'rgba(168, 85, 247, 0.2)',
                      color: 'purple.300',
                      borderColor: 'purple.500',
                    }
                  : { color: 'gray.500', _hover: { color: 'gray.300' } }),
              })}
            >
              <Grid3x3 className={css({ h: '4', w: '4' })} />
              All Tools ({stats.total})
            </Button>
          </fieldset>

          {/* View Mode Toggle - Right aligned */}
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: { base: 'flex-end', sm: 'flex-end' },
            })}
          >
            {/* View Mode Toggle */}
            <fieldset
              className={css({
                display: 'flex',
                gap: '1',
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.700',
                bg: 'rgba(17, 24, 39, 0.5)',
                p: '1',
              })}
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
                      h: { base: '11', sm: '9' },
                      w: { base: '11', sm: '9' },
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
                      // Matches the sibling "Grid view" button's mobile tap target.
                      h: { base: '11', sm: '9' },
                      w: { base: '11', sm: '9' },
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
            </fieldset>
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <div
            className={css({
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '3',
            })}
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
              <p
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'purple.300',
                })}
              >
                {Object.values(filteredToolsByCategory).flat().length} results found
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={css({
                fontSize: 'sm',
                color: 'gray.500',
                transition: 'colors 0.2s',
                _hover: { color: 'purple.400' },
              })}
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Recent Tools Section */}
      <RecentTools />

      {/* Ad Banner - Feature Flag Guarded - Skip initial animation */}
      <div
        className={css({
          position: 'relative',
          zIndex: '10',
          mx: 'auto',
          w: 'full',
          maxW: { base: 'full', md: '100%' },
        })}
      >
        <AdContainer
          slot="homepage-top"
          position="content"
          className={css({
            my: { base: '8', md: '10' },
          })}
        />
      </div>

      {/* Tools by Category Sections - Skip initial animation */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          margin: '0 auto',
          width: '100%',
          maxWidth: '1400px',
          padding: '0 1rem',
        }}
      >
        {Object.values(filteredToolsByCategory).flat().length > 0 ? (
          <div
            key={`${viewMode}-${searchQuery}`}
            className={css({ spaceY: { base: '12', md: '16' } })}
          >
            {categories.map((category) => {
              const toolsInCategory = filteredToolsByCategory[category.value]
              if (toolsInCategory.length === 0) return null

              const Icon = category.icon
              const isExpanded = expandedCategories.has(category.value)

              return (
                <section key={category.value}>
                  {/* Category Header */}
                  <div
                    className={css({
                      mb: '6',
                      display: 'flex',
                      flexDirection: { base: 'column', sm: 'row' },
                      alignItems: { base: 'stretch', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: { base: '3', sm: '4' },
                      pb: '4',
                      borderBottom: '2px solid',
                      borderColor: 'gray.800',
                    })}
                  >
                    <div
                      className={css({
                        minH: '11',
                        display: 'flex',
                        alignItems: 'center',
                        minW: 0,
                        gap: '4',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          rounded: 'xl',
                          bg: 'rgba(168, 85, 247, 0.1)',
                          p: '3',
                        })}
                      >
                        <Icon
                          className={css({
                            h: '6',
                            w: '6',
                            color: 'purple.400',
                          })}
                        />
                      </div>
                      <div className={css({ minW: 0 })}>
                        <h2
                          className={css({
                            fontSize: { base: '2xl', sm: '3xl' },
                            fontWeight: 'bold',
                            color: 'gray.100',
                          })}
                        >
                          {category.label}
                        </h2>
                        <p
                          className={css({
                            fontSize: 'sm',
                            color: 'gray.500',
                          })}
                        >
                          {category.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={css({
                          ml: '2',
                          h: '7',
                          rounded: 'full',
                          bg: 'rgba(168, 85, 247, 0.2)',
                          px: '3',
                          fontSize: 'sm',
                          fontWeight: 'bold',
                          color: 'purple.300',
                        })}
                      >
                        {toolsInCategory.length}
                      </Badge>
                    </div>

                    {/* Collapse/Expand Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategory(category.value)}
                      className={css({
                        gap: '2',
                        alignSelf: { base: 'flex-end', sm: 'auto' },
                        color: 'gray.400',
                        _hover: { color: 'purple.400' },
                      })}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className={css({ h: '5', w: '5' })} />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className={css({ h: '5', w: '5' })} />
                          Expand
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Tools Grid/List with Virtualization */}
                  {isExpanded && (
                    <VirtualizedToolsList
                      tools={toolsInCategory}
                      viewMode={viewMode}
                      categoryValue={category.value}
                    />
                  )}
                </section>
              )
            })}

            {/* See All Tools CTA - Only show in popular view */}
            {toolsView === 'popular' && !searchQuery && (
              <div
                className={css({
                  mt: '12',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6',
                  py: '12',
                  textAlign: 'center',
                })}
              >
                <div className={css({ spaceY: '4' })}>
                  <h3
                    className={css({
                      fontSize: { base: '2xl', sm: '3xl' },
                      fontWeight: 'bold',
                      color: 'gray.200',
                    })}
                  >
                    Explore All {stats.total} Tools
                  </h3>
                  <p
                    className={css({
                      maxW: '2xl',
                      mx: 'auto',
                      fontSize: { base: 'base', sm: 'lg' },
                      color: 'gray.400',
                    })}
                  >
                    Discover our complete collection of professional tools across all categories
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => {
                    setToolsView('all')
                    trackToolEvent('view_mode_toggle', { mode: 'all', source: 'cta_button' })
                  }}
                  className={css({
                    gap: '3',
                    h: '14',
                    px: '8',
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    bg: 'rgba(168, 85, 247, 0.2)',
                    border: '1px solid',
                    borderColor: 'purple.500/50',
                    color: 'purple.300',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s',
                    _hover: {
                      bg: 'rgba(168, 85, 247, 0.3)',
                      borderColor: 'purple.500/70',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
                    },
                  })}
                >
                  <Grid3x3 className={css({ h: '5', w: '5' })} />
                  View All Tools
                  <ArrowRight className={css({ h: '5', w: '5' })} />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            key="no-results"
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
              <Search className={css({ h: '16', w: '16', color: 'gray.600' })} strokeWidth={1.5} />
            </div>
            <h3
              className={css({
                mb: '3',
                fontSize: '2xl',
                fontWeight: 'bold',
                color: 'gray.300',
              })}
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
                  <span
                    className={css({
                      fontWeight: 'semibold',
                      color: 'purple.400',
                    })}
                  >
                    &quot;{searchQuery}&quot;
                  </span>
                </>
              ) : (
                'No tools available'
              )}
            </p>
            <p
              className={css({
                mb: '8',
                maxW: 'md',
                fontSize: 'sm',
                color: 'gray.600',
              })}
            >
              Try adjusting your search to find what you&apos;re looking for
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
            </div>
          </div>
        )}
      </div>

      {/* Ad Banner Bottom - Feature Flag Guarded - Skip initial animation */}
      <div
        className={css({
          position: 'relative',
          zIndex: '10',
          mx: 'auto',
          w: 'full',
          maxW: { base: 'full', md: '100%' },
        })}
      >
        <AdContainer
          slot="homepage-bottom"
          position="footer"
          className={css({
            my: { base: '8', md: '10' },
          })}
        />
      </div>

      {/* Fixed Position Buttons - Feedback & Support */}
      <div
        className={css({
          position: 'fixed',
          right: { base: '3', sm: '4' },
          bottom: { base: '3', sm: '4' },
          zIndex: 'toast',
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
          pointerEvents: 'none',
        })}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <TreatMeDialog />
        </div>

        <div style={{ pointerEvents: 'auto' }}>
          <FeedbackDialog />
        </div>
      </div>

      {/* Structured Data for SEO */}
      <Script
        id="structured-data-website"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON.stringify ensures proper escaping of structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebSiteSchema(process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id')
          ),
        }}
      />
      <Script
        id="structured-data-webapp"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON.stringify ensures proper escaping of structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebApplicationSchema(process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id')
          ),
        }}
      />
      <Script
        id="structured-data-org"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON.stringify ensures proper escaping of structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateOrganizationSchema(process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id')
          ),
        }}
      />

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}
      <ToolSearch />
    </div>
  )
}

// Virtualized Tools List Component - Optimized for large lists
const VirtualizedToolsList = memo(function VirtualizedToolsList({
  tools,
  viewMode,
  categoryValue,
}: {
  tools: Tool[]
  viewMode: 'grid' | 'list'
  categoryValue: ToolCategory
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Determine columns based on viewport and view mode
  const [columns, setColumns] = useState(1)

  // Mount check for SSR safety
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const updateColumns = () => {
      if (viewMode === 'list') {
        setColumns(1)
        return
      }

      const width = window.innerWidth
      if (width >= 1280) {
        // xl
        setColumns(4)
      } else if (width >= 1024) {
        // lg
        setColumns(3)
      } else if (width >= 640) {
        // sm
        setColumns(2)
      } else {
        setColumns(1)
      }
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [viewMode])

  // Estimate item size based on view mode
  const estimateSize = viewMode === 'grid' ? 350 : 200

  // Create rows for grid view (group tools by columns)
  const rows = useMemo(() => {
    if (viewMode === 'list') {
      return tools.map((tool) => [tool])
    }

    const result: Tool[][] = []
    for (let i = 0; i < tools.length; i += columns) {
      result.push(tools.slice(i, i + columns))
    }
    return result
  }, [tools, columns, viewMode])

  // Only create virtualizer after mount to prevent ResizeObserver errors
  // We use estimated sizes only (no measureElement) to avoid ResizeObserver issues
  const rowVirtualizer = useVirtualizer({
    count: isMounted ? rows.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 2,
    // Removed measureElement to prevent ResizeObserver errors
    // Using estimated sizes provides good enough performance
  })

  // Fallback to non-virtualized rendering during SSR or initial mount
  if (!isMounted) {
    return (
      <div
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
        {tools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} viewMode={viewMode} />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      className={css({
        position: 'relative',
        w: 'full',
      })}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowTools = rows[virtualRow.index]

          return (
            <div
              key={`${categoryValue}-row-${virtualRow.index}`}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
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
                {rowTools.map((tool) => (
                  <ToolCard key={tool.title} tool={tool} viewMode={viewMode} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

// Tool Card Component - Memoized to prevent unnecessary re-renders
const ToolCard = memo(function ToolCard({
  tool,
  viewMode,
}: {
  tool: Tool
  viewMode: 'grid' | 'list'
}) {
  const Icon = tool.icon
  const isComingSoon = tool.comingSoon

  // Save scroll position when clicking on tool links
  const handleToolClick = () => {
    if (!isComingSoon) {
      sessionStorage.setItem('homepage-scroll-y', window.scrollY.toString())
    }
  }

  if (viewMode === 'list') {
    return (
      <div>
        <Link
          href={isComingSoon ? '#' : tool.href}
          onClick={handleToolClick}
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
            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                alignItems: { base: 'stretch', sm: 'flex-start' },
                gap: '5',
              })}
            >
              <div
                className={css({
                  flexShrink: 0,
                  rounded: 'xl',
                  p: '4',
                  shadow: 'lg',
                })}
                style={{
                  background: gradientToCss(tool.gradient),
                }}
              >
                <Icon className={css({ h: '7', w: '7', color: 'white' })} />
              </div>

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
                    className={css({
                      fontSize: 'xl',
                      fontWeight: 'bold',
                      color: 'gray.100',
                    })}
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

                  {tool.premium && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className={css({
                        bg: 'violet.500/20',
                        px: '2.5',
                        py: '1',
                        color: 'violet.300',
                        border: '1px solid',
                        borderColor: 'violet.500/30',
                      })}
                    >
                      <Star className={css({ mr: '1', h: '3.5', w: '3.5' })} />
                      Pro
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

                <div
                  className={css({
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2',
                  })}
                >
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
                  display: { base: 'none', sm: 'block' },
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
      </div>
    )
  }

  // Grid view
  return (
    <div>
      <Link
        href={isComingSoon ? '#' : tool.href}
        onClick={handleToolClick}
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
              <div
                className={css({
                  rounded: 'xl',
                  p: '3.5',
                  shadow: 'lg',
                })}
                style={{
                  background: gradientToCss(tool.gradient),
                }}
              >
                <Icon className={css({ h: '7', w: '7', color: 'white' })} />
              </div>

              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1',
                })}
              >
                {tool.popular && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className={css({
                      bg: 'orange.500/20',
                      px: '2',
                      py: '1',
                      color: 'orange.300',
                    })}
                  >
                    <TrendingUp className={css({ h: '3.5', w: '3.5' })} />
                  </Badge>
                )}

                {tool.new && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className={css({
                      bg: 'blue.500/20',
                      px: '2',
                      py: '1',
                      color: 'blue.300',
                    })}
                  >
                    <Sparkles className={css({ h: '3.5', w: '3.5' })} />
                  </Badge>
                )}

                {tool.premium && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    className={css({
                      bg: 'violet.500/20',
                      px: '2',
                      py: '1',
                      color: 'violet.300',
                      border: '1px solid',
                      borderColor: 'violet.500/30',
                    })}
                  >
                    <Star className={css({ h: '3.5', w: '3.5' })} />
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

            <div
              className={css({
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5',
                pt: '2',
              })}
            >
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
    </div>
  )
})
