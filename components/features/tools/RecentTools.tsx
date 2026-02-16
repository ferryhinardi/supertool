'use client'

import { ArrowRight, Clock, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useClearRecentTools, useRecentTools } from '@/hooks/tools/useRecentTools'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

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

export function RecentTools() {
  const { data: recentTools, isLoading } = useRecentTools()
  const clearRecentTools = useClearRecentTools()

  // Don't show section if no recent tools and not loading
  if (!isLoading && (!recentTools || recentTools.length === 0)) {
    return null
  }

  const handleClearHistory = () => {
    clearRecentTools.mutate()
    trackToolEvent('recent_tools_cleared', {
      count: recentTools?.length || 0,
    })
  }

  const handleToolClick = (toolId: string, title: string) => {
    trackToolEvent('recent_tool_click', {
      tool_id: toolId,
      tool_name: title,
    })
  }

  return (
    <section
      className={css({
        position: 'relative',
        zIndex: '10',
        mx: 'auto',
        w: 'full',
        maxW: { base: 'full', sm: '3xl', md: '4xl', lg: '5xl' },
        mb: { base: '8', sm: '10', md: '12' },
        animation: 'slideUp 0.5s ease-out forwards',
        animationDelay: '0.2s',
        opacity: 0,
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: '6',
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
          <Clock className={css({ h: '6', w: '6', color: 'purple.400' })} />
          <h2
            className={css({
              fontSize: { base: '2xl', sm: '3xl' },
              fontWeight: 'bold',
              bgGradient: 'to-r',
              gradientFrom: 'purple.400',
              gradientTo: 'pink.400',
              bgClip: 'text',
              color: 'gray.100',
            })}
          >
            Recently Viewed
          </h2>
        </div>

        {recentTools && recentTools.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            disabled={clearRecentTools.isPending}
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              color: 'gray.400',
              fontSize: 'sm',
              _hover: {
                color: 'red.400',
                bg: 'red.500/10',
              },
            })}
          >
            <X className={css({ h: '4', w: '4' })} />
            Clear History
          </Button>
        )}
      </div>

      {isLoading ? (
        <div
          className={css({
            display: 'flex',
            gap: '4',
            overflowX: 'auto',
            pb: '4',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(168, 85, 247, 0.3) transparent',
          })}
        >
          {[...Array(4)].map((_, i) => (
            <Card
              key={`skeleton-${
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items don't have stable ids
                i
              }`}
              className={css({
                position: 'relative',
                flexShrink: 0,
                w: { base: '72', sm: '80' },
                h: '36',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                bg: 'rgba(168, 85, 247, 0.05)',
                backdropFilter: 'blur(16px)',
                animation: 'pulse 2s infinite',
              })}
            />
          ))}
        </div>
      ) : (
        <div
          className={css({
            display: 'flex',
            gap: '4',
            overflowX: 'auto',
            pb: '4',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(168, 85, 247, 0.3) transparent',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              bg: 'rgba(255, 255, 255, 0.05)',
              rounded: 'full',
            },
            '&::-webkit-scrollbar-thumb': {
              bg: 'rgba(168, 85, 247, 0.3)',
              rounded: 'full',
              _hover: {
                bg: 'rgba(168, 85, 247, 0.5)',
              },
            },
          })}
        >
          {recentTools?.map((tool) => {
            const Icon = Clock // Using Clock as default icon for now
            return (
              <div
                key={tool.href}
                className={css({
                  flexShrink: 0,
                  animation: 'slideInLeft 0.3s ease-out forwards',
                  opacity: 0,
                })}
              >
                <Link
                  href={tool.href}
                  onClick={() => handleToolClick(tool.toolId, tool.title)}
                  className={css({
                    display: 'block',
                    _hover: {
                      transform: 'translateY(-4px)',
                    },
                    transition: 'transform 0.2s',
                  })}
                >
                  <Card
                    className={css({
                      position: 'relative',
                      overflow: 'hidden',
                      w: { base: '72', sm: '80' },
                      h: '36',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      bg: 'rgba(17, 24, 39, 0.8)',
                      backdropFilter: 'blur(16px)',
                      p: '6',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      _hover: {
                        borderColor: 'purple.500/50',
                        boxShadow: '0 0 40px rgba(168, 85, 247, 0.2)',
                      },
                      transition: 'all 0.3s',
                    })}
                  >
                    {/* Gradient accent bar */}
                    <div
                      className={css({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        h: '1',
                      })}
                      style={{
                        background: gradientToCss(tool.gradient),
                      }}
                    />

                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'start',
                        gap: '4',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          h: '12',
                          w: '12',
                          rounded: 'lg',
                          boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
                        })}
                        style={{
                          background: gradientToCss(tool.gradient),
                        }}
                      >
                        <Icon className={css({ h: '6', w: '6', color: 'white' })} />
                      </div>

                      <div className={css({ flex: 1, minW: 0 })}>
                        <h3
                          className={css({
                            fontSize: 'lg',
                            fontWeight: 'semibold',
                            color: 'gray.100',
                            truncate: true,
                          })}
                        >
                          {tool.title}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      })}
                    >
                      <span
                        className={css({
                          fontSize: 'sm',
                          color: 'gray.400',
                        })}
                      >
                        View Again
                      </span>
                      <ArrowRight
                        className={css({
                          h: '4',
                          w: '4',
                          color: 'purple.400',
                          _groupHover: {
                            transform: 'translateX(4px)',
                          },
                          transition: 'transform 0.2s',
                        })}
                      />
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
          })}
        </div>
      )}
    </section>
  )
}
