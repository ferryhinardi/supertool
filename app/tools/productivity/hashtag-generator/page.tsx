'use client'

import { Check, Copy, Hash, MapPin, RefreshCw, Star, Target, TrendingUp, Users } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  analyzeContent,
  CATEGORIES,
  type CategoryId,
  formatHashtag,
  formatHashtagsForCopy,
  generateHashtags,
  getPopularityColor,
  getPopularityLabel,
  type Hashtag,
  PLATFORMS,
  type PlatformId,
} from './utils'

// Icon mapping for categories
const CATEGORY_ICONS: Record<CategoryId, typeof Hash> = {
  general: Hash,
  trending: TrendingUp,
  niche: Target,
  branded: Star,
  community: Users,
  location: MapPin,
}

export default function HashtagGeneratorPage() {
  const [content, setContent] = useState<string>('')
  const [platform, setPlatform] = useState<PlatformId>('instagram')
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([])
  const [generatedHashtags, setGeneratedHashtags] = useState<Hashtag[]>([])
  const [selectedHashtags, setSelectedHashtags] = useState<Set<string>>(new Set())
  const [copySuccess, setCopySuccess] = useState<'space' | 'newline' | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const platformConfig = PLATFORMS[platform]

  // Handle content change
  const handleContentChange = (value: string) => {
    setContent(value)
  }

  // Handle platform change
  const handlePlatformChange = (value: PlatformId) => {
    setPlatform(value)
    trackToolEvent('hashtag_platform_changed', { platform: value })
  }

  // Handle category toggle
  const handleCategoryToggle = (categoryId: CategoryId) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]

      trackToolEvent('hashtag_category_filtered', {
        category: categoryId,
        action: prev.includes(categoryId) ? 'removed' : 'added',
        activeCategories: newCategories,
      })

      return newCategories
    })
  }

  // Generate hashtags
  const handleGenerate = useCallback(() => {
    if (!content.trim()) return

    const hashtags = generateHashtags(content, {
      platform,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      maxCount: platformConfig.recommended.max * 2, // Generate more than recommended for selection
      includeGeneral: true,
    })

    setGeneratedHashtags(hashtags)
    setSelectedHashtags(
      new Set(hashtags.slice(0, platformConfig.recommended.max).map((h) => h.tag))
    )
    setHasGenerated(true)

    const topics = analyzeContent(content)
    trackToolEvent('hashtag_generated', {
      platform,
      topicsDetected: topics,
      hashtagCount: hashtags.length,
      categoriesFiltered: selectedCategories,
    })
  }, [content, platform, selectedCategories, platformConfig.recommended.max])

  // Toggle hashtag selection
  const handleHashtagToggle = (tag: string) => {
    setSelectedHashtags((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        // Check if we've hit the platform max
        if (newSet.size >= platformConfig.maxHashtags) {
          return prev
        }
        newSet.add(tag)
      }
      return newSet
    })
  }

  // Copy hashtags
  const handleCopy = async (separator: 'space' | 'newline') => {
    const selected = generatedHashtags.filter((h) => selectedHashtags.has(h.tag))
    const text = formatHashtagsForCopy(selected, separator)

    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(separator)
      setTimeout(() => setCopySuccess(null), 2000)

      trackToolEvent('hashtag_copied', {
        format: separator,
        count: selected.length,
        platform,
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Select all / deselect all
  const handleSelectAll = () => {
    const maxToSelect = Math.min(generatedHashtags.length, platformConfig.recommended.max)
    setSelectedHashtags(new Set(generatedHashtags.slice(0, maxToSelect).map((h) => h.tag)))
  }

  const handleDeselectAll = () => {
    setSelectedHashtags(new Set())
  }

  // Selected hashtags array for display
  const selectedHashtagsList = useMemo(() => {
    return generatedHashtags.filter((h) => selectedHashtags.has(h.tag))
  }, [generatedHashtags, selectedHashtags])

  // Count status
  const countStatus = useMemo(() => {
    const count = selectedHashtags.size
    const { min, max } = platformConfig.recommended
    if (count < min) return 'low'
    if (count > max) return 'high'
    return 'optimal'
  }, [selectedHashtags.size, platformConfig.recommended])

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div className={css({ spaceY: 4, textAlign: 'center' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          })}
        >
          <Hash className={css({ w: 10, h: 10, color: 'pink.400' })} />
          <h1
            className={css({
              fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
              fontWeight: 'bold',
              bgGradient: 'to-r',
              gradientFrom: 'pink.500',
              gradientTo: 'rose.500',
              bgClip: 'text',
              color: 'transparent',
            })}
          >
            Hashtag Generator
          </h1>
        </div>
        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
          })}
        >
          Generate trending and relevant hashtags for your social media posts. Optimized for
          Instagram, Twitter, TikTok, LinkedIn, and more.
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
          gap: { base: 6, lg: 8 },
          alignItems: 'start',
        })}
      >
        {/* Left Panel - Generator */}
        <div className={css({ spaceY: 6 })}>
          {/* Content Input */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
              <Hash className={css({ w: 5, h: 5, color: 'pink.400' })} />
              <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
                Enter Your Content
              </h2>
            </div>

            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter your post content or describe your topic... (e.g., 'Beautiful sunset at the beach today! Perfect end to a relaxing vacation.')"
              rows={4}
              className={css({
                w: 'full',
                p: 4,
                fontSize: 'md',
                bg: 'gray.900',
                color: 'white',
                border: '1px solid',
                borderColor: 'gray.700',
                rounded: 'lg',
                outline: 'none',
                resize: 'vertical',
                minH: '120px',
                _focus: {
                  borderColor: 'pink.500',
                  ring: '2px',
                  ringColor: 'rgba(236, 72, 153, 0.3)',
                },
                _placeholder: { color: 'gray.500' },
              })}
            />

            {/* Platform Selector */}
            <div className={css({ spaceY: 2 })}>
              <label
                htmlFor="platform-select"
                className={css({ fontSize: 'sm', color: 'gray.400' })}
              >
                Platform
              </label>
              <select
                id="platform-select"
                value={platform}
                onChange={(e) => handlePlatformChange(e.target.value as PlatformId)}
                className={css({
                  w: 'full',
                  p: 3,
                  fontSize: 'md',
                  bg: 'gray.900',
                  color: 'white',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  rounded: 'lg',
                  outline: 'none',
                  cursor: 'pointer',
                  _focus: { borderColor: 'pink.500' },
                })}
              >
                {Object.entries(PLATFORMS).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.name}
                  </option>
                ))}
              </select>
              <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                {platformConfig.description}
              </p>
            </div>

            {/* Category Filters */}
            <div className={css({ spaceY: 2 })}>
              <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Filter by Category (optional)
              </span>
              <div className={css({ display: 'flex', gap: 2, flexWrap: 'wrap' })}>
                {Object.entries(CATEGORIES).map(([key, data]) => {
                  const categoryId = key as CategoryId
                  const isSelected = selectedCategories.includes(categoryId)
                  const Icon = CATEGORY_ICONS[categoryId]

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleCategoryToggle(categoryId)}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 3,
                        py: 2,
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        rounded: 'lg',
                        bg: isSelected ? 'pink.600' : 'gray.800',
                        color: isSelected ? 'white' : 'gray.300',
                        border: '1px solid',
                        borderColor: isSelected ? 'pink.500' : 'gray.700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        _hover: {
                          bg: isSelected ? 'pink.500' : 'gray.700',
                          borderColor: 'pink.500',
                        },
                      })}
                    >
                      <Icon className={css({ w: 4, h: 4 })} />
                      {data.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!content.trim()}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                w: 'full',
                p: 4,
                fontSize: 'lg',
                fontWeight: 'semibold',
                rounded: 'lg',
                bg: content.trim() ? 'pink.600' : 'gray.700',
                color: content.trim() ? 'white' : 'gray.400',
                border: '1px solid',
                borderColor: content.trim() ? 'pink.500' : 'gray.600',
                cursor: content.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                _hover: content.trim() ? { bg: 'pink.500' } : {},
              })}
            >
              <RefreshCw className={css({ w: 5, h: 5 })} />
              Generate Hashtags
            </button>
          </div>

          {/* Generated Hashtags */}
          {hasGenerated && (
            <div
              className={css({
                bg: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                rounded: 'xl',
                p: { base: 4, sm: 6 },
                spaceY: 4,
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                })}
              >
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                  Generated Hashtags ({generatedHashtags.length})
                </h3>
                <div className={css({ display: 'flex', gap: 2 })}>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={css({
                      px: 3,
                      py: 1.5,
                      fontSize: 'xs',
                      rounded: 'md',
                      bg: 'gray.800',
                      color: 'gray.300',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.700' },
                    })}
                  >
                    Select Recommended
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className={css({
                      px: 3,
                      py: 1.5,
                      fontSize: 'xs',
                      rounded: 'md',
                      bg: 'gray.800',
                      color: 'gray.300',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.700' },
                    })}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {generatedHashtags.length === 0 ? (
                <p
                  className={css({ fontSize: 'sm', color: 'gray.500', textAlign: 'center', py: 8 })}
                >
                  No hashtags found. Try adjusting your content or removing category filters.
                </p>
              ) : (
                <div className={css({ display: 'flex', gap: 2, flexWrap: 'wrap' })}>
                  {generatedHashtags.map((hashtag) => {
                    const isSelected = selectedHashtags.has(hashtag.tag)
                    const popularityColor = getPopularityColor(hashtag.popularity)

                    return (
                      <button
                        key={hashtag.tag}
                        type="button"
                        onClick={() => handleHashtagToggle(hashtag.tag)}
                        className={css({
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          px: 3,
                          py: 2,
                          rounded: 'lg',
                          bg: isSelected ? 'rgba(236, 72, 153, 0.2)' : 'gray.900',
                          border: '2px solid',
                          borderColor: isSelected ? 'pink.500' : 'gray.800',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          _hover: {
                            borderColor: isSelected ? 'pink.400' : 'gray.600',
                            bg: isSelected ? 'rgba(236, 72, 153, 0.3)' : 'gray.800',
                          },
                        })}
                      >
                        <span
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: isSelected ? 'pink.300' : 'white',
                          })}
                        >
                          {formatHashtag(hashtag.tag)}
                        </span>
                        <div
                          className={css({ display: 'flex', alignItems: 'center', gap: 2, mt: 1 })}
                        >
                          <span
                            className={css({
                              fontSize: 'xs',
                              color: popularityColor,
                              fontWeight: 'medium',
                            })}
                          >
                            {getPopularityLabel(hashtag.popularity)}
                          </span>
                          {hashtag.posts && (
                            <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                              {hashtag.posts}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Selected & Copy */}
        <div className={css({ spaceY: 4 })}>
          {/* Platform Recommendations */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 3,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              {platformConfig.name} Tips
            </h3>
            <div className={css({ spaceY: 2 })}>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  rounded: 'md',
                  bg: 'gray.900',
                  border: '1px solid',
                  borderColor: 'gray.800',
                })}
              >
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Maximum</span>
                <span
                  className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'pink.400' })}
                >
                  {platformConfig.maxHashtags} hashtags
                </span>
              </div>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  rounded: 'md',
                  bg: 'gray.900',
                  border: '1px solid',
                  borderColor: 'gray.800',
                })}
              >
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Recommended</span>
                <span
                  className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'green.400' })}
                >
                  {platformConfig.recommended.min}-{platformConfig.recommended.max} hashtags
                </span>
              </div>
            </div>
          </div>

          {/* Selected Hashtags */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 4,
            })}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                Selected Hashtags
              </h3>
              <span
                className={css({
                  px: 2,
                  py: 1,
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  rounded: 'md',
                  bg:
                    countStatus === 'optimal'
                      ? 'green.900'
                      : countStatus === 'low'
                        ? 'yellow.900'
                        : 'red.900',
                  color:
                    countStatus === 'optimal'
                      ? 'green.300'
                      : countStatus === 'low'
                        ? 'yellow.300'
                        : 'red.300',
                  border: '1px solid',
                  borderColor:
                    countStatus === 'optimal'
                      ? 'green.700'
                      : countStatus === 'low'
                        ? 'yellow.700'
                        : 'red.700',
                })}
              >
                {selectedHashtags.size}/{platformConfig.recommended.max}
              </span>
            </div>

            {selectedHashtagsList.length === 0 ? (
              <p className={css({ fontSize: 'sm', color: 'gray.500', textAlign: 'center', py: 4 })}>
                No hashtags selected. Generate and click on hashtags to select them.
              </p>
            ) : (
              <>
                <div
                  className={css({
                    p: 3,
                    bg: 'gray.900',
                    border: '1px solid',
                    borderColor: 'gray.800',
                    rounded: 'lg',
                    maxH: '200px',
                    overflowY: 'auto',
                  })}
                >
                  <p
                    className={css({
                      fontSize: 'sm',
                      color: 'gray.300',
                      lineHeight: 'relaxed',
                      wordBreak: 'break-word',
                    })}
                  >
                    {selectedHashtagsList.map((h) => formatHashtag(h.tag)).join(' ')}
                  </p>
                </div>

                {/* Copy Buttons */}
                <div className={css({ display: 'flex', gap: 2 })}>
                  <button
                    type="button"
                    onClick={() => handleCopy('space')}
                    className={css({
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      p: 3,
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      rounded: 'lg',
                      bg: copySuccess === 'space' ? 'green.600' : 'pink.600',
                      color: 'white',
                      border: '1px solid',
                      borderColor: copySuccess === 'space' ? 'green.500' : 'pink.500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { bg: copySuccess === 'space' ? 'green.500' : 'pink.500' },
                    })}
                  >
                    {copySuccess === 'space' ? (
                      <Check className={css({ w: 4, h: 4 })} />
                    ) : (
                      <Copy className={css({ w: 4, h: 4 })} />
                    )}
                    {copySuccess === 'space' ? 'Copied!' : 'Copy (Spaces)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy('newline')}
                    className={css({
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      p: 3,
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      rounded: 'lg',
                      bg: copySuccess === 'newline' ? 'green.600' : 'gray.700',
                      color: 'white',
                      border: '1px solid',
                      borderColor: copySuccess === 'newline' ? 'green.500' : 'gray.600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { bg: copySuccess === 'newline' ? 'green.500' : 'gray.600' },
                    })}
                  >
                    {copySuccess === 'newline' ? (
                      <Check className={css({ w: 4, h: 4 })} />
                    ) : (
                      <Copy className={css({ w: 4, h: 4 })} />
                    )}
                    {copySuccess === 'newline' ? 'Copied!' : 'Copy (Lines)'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Popularity Legend */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 3,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Popularity Legend
            </h3>
            <div className={css({ spaceY: 2 })}>
              <LegendItem color="pink.400" label="Viral" description="100M+ posts" />
              <LegendItem color="green.400" label="High" description="10M-100M posts" />
              <LegendItem color="yellow.400" label="Medium" description="1M-10M posts" />
              <LegendItem color="gray.400" label="Low" description="Under 1M posts" />
            </div>
          </div>

          {/* Tips */}
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              rounded: 'xl',
              p: { base: 4, sm: 6 },
              spaceY: 3,
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
              Pro Tips
            </h3>
            <div className={css({ spaceY: 2 })}>
              <TipItem text="Mix viral and niche hashtags for the best reach and engagement." />
              <TipItem text="Use fewer hashtags on Twitter/X to avoid looking spammy." />
              <TipItem text="Place hashtags in comments on Instagram to keep captions clean." />
              <TipItem text="Research trending hashtags in your niche regularly." />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        className={css({
          bg: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          rounded: 'xl',
          p: { base: 4, sm: 6 },
          spaceY: 4,
        })}
      >
        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
          Features
        </h3>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 4,
          })}
        >
          <FeatureCard
            title="Trending Hashtags"
            description="Get the most popular and trending hashtags for maximum visibility and reach."
          />
          <FeatureCard
            title="Niche Suggestions"
            description="Discover targeted hashtags specific to your industry or topic for better engagement."
          />
          <FeatureCard
            title="Copy to Clipboard"
            description="Easily copy all selected hashtags with one click, formatted for your platform."
          />
          <FeatureCard
            title="Platform Specific"
            description="Optimized recommendations for Instagram, Twitter, TikTok, LinkedIn, and more."
          />
        </div>
      </div>
    </main>
  )
}

// Legend Item Component
function LegendItem({
  color,
  label,
  description,
}: {
  color: string
  label: string
  description: string
}) {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        rounded: 'md',
        bg: 'gray.900',
        border: '1px solid',
        borderColor: 'gray.800',
      })}
    >
      <span
        className={css({
          w: 3,
          h: 3,
          rounded: 'full',
          bg: color,
          flexShrink: 0,
        })}
      />
      <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
        {label}
      </span>
      <span className={css({ fontSize: 'xs', color: 'gray.500', ml: 'auto' })}>{description}</span>
    </div>
  )
}

// Tip Item Component
function TipItem({ text }: { text: string }) {
  return (
    <div className={css({ display: 'flex', gap: 2 })}>
      <span className={css({ color: 'pink.400', flexShrink: 0 })}>•</span>
      <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>{text}</p>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className={css({
        p: 4,
        rounded: 'lg',
        bg: 'gray.900',
        border: '1px solid',
        borderColor: 'gray.800',
        spaceY: 2,
      })}
    >
      <h4 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'pink.400' })}>
        {title}
      </h4>
      <p className={css({ fontSize: 'xs', color: 'gray.400', lineHeight: 'relaxed' })}>
        {description}
      </p>
    </div>
  )
}
