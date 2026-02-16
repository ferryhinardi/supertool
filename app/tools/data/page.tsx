'use client'

import { ArrowLeft, ArrowRight, FileJson, Sparkles, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { type Tool, tools } from '@/lib/data/tools'
import { css } from '@/styled-system/css'

// Filter tools for this category
const categoryTools = tools.filter((t) => t.category === 'data')

// Helper function to convert Tailwind gradient to CSS
function gradientToCss(gradient: string): string {
  const gradientMap: Record<string, string> = {
    'from-purple-500 to-pink-500': 'linear-gradient(135deg, #a855f7, #ec4899)',
    'from-blue-500 to-cyan-500': 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'from-green-500 to-emerald-500': 'linear-gradient(135deg, #22c55e, #10b981)',
    'from-orange-500 to-red-500': 'linear-gradient(135deg, #f97316, #ef4444)',
    'from-violet-500 to-purple-500': 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    'from-cyan-500 to-blue-500': 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    'from-pink-500 to-rose-500': 'linear-gradient(135deg, #ec4899, #f43f5e)',
    'from-amber-500 to-orange-500': 'linear-gradient(135deg, #f59e0b, #f97316)',
    'from-teal-500 to-green-500': 'linear-gradient(135deg, #14b8a6, #22c55e)',
    'from-indigo-500 to-violet-500': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'from-rose-500 to-pink-500': 'linear-gradient(135deg, #f43f5e, #ec4899)',
    'from-emerald-500 to-teal-500': 'linear-gradient(135deg, #10b981, #14b8a6)',
    'from-sky-500 to-indigo-500': 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    'from-fuchsia-500 to-pink-500': 'linear-gradient(135deg, #d946ef, #ec4899)',
    'from-lime-500 to-green-500': 'linear-gradient(135deg, #84cc16, #22c55e)',
    'from-yellow-500 to-amber-500': 'linear-gradient(135deg, #eab308, #f59e0b)',
    'from-red-500 to-orange-500': 'linear-gradient(135deg, #ef4444, #f97316)',
    'from-slate-500 to-gray-500': 'linear-gradient(135deg, #64748b, #6b7280)',
  }

  if (gradientMap[gradient]) {
    return gradientMap[gradient]
  }

  // Parse gradient string dynamically
  const fromMatch = gradient.match(/from-(\w+)-(\d+)/)
  const toMatch = gradient.match(/to-(\w+)-(\d+)/)

  if (fromMatch && toMatch) {
    return `linear-gradient(135deg, var(--colors-${fromMatch[1]}-${fromMatch[2]}), var(--colors-${toMatch[1]}-${toMatch[2]}))`
  }

  return 'linear-gradient(135deg, #a855f7, #ec4899)'
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  const isComingSoon = tool.comingSoon

  return (
    <div>
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
}

export default function DataToolsPage() {
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
      {/* Back navigation */}
      <div>
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className={css({
              color: 'gray.400',
              _hover: { color: 'gray.100', bg: 'gray.800/50' },
            })}
          >
            <ArrowLeft className={css({ h: '4', w: '4', mr: '2' })} />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Category Header */}
      <div
        className={css({
          textAlign: 'center',
          spaceY: '4',
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            rounded: '2xl',
            p: '4',
            shadow: 'lg',
            bg: 'linear-gradient(135deg, #a855f7, #ec4899)',
            animation: 'scaleIn 0.3s ease-out forwards',
            opacity: 0,
          })}
        >
          <FileJson className={css({ h: '10', w: '10', color: 'white' })} />
        </div>

        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientVia: 'pink.400',
            gradientTo: 'purple.400',
            bgClip: 'text',
            color: 'transparent',
            animation: 'slideUp 0.4s ease-out forwards',
            animationDelay: '0.1s',
            opacity: 0,
          })}
        >
          Data Processing Tools
        </h1>

        <p
          className={css({
            maxW: '2xl',
            mx: 'auto',
            fontSize: { base: 'lg', md: 'xl' },
            color: 'gray.400',
            animation: 'slideUp 0.4s ease-out forwards',
            animationDelay: '0.2s',
            opacity: 0,
          })}
        >
          Transform, convert, and format your data with our powerful collection of{' '}
          {categoryTools.length} free online tools.
        </p>

        <div
          className={css({
            display: 'flex',
            justifyContent: 'center',
            gap: '4',
            flexWrap: 'wrap',
            animation: 'slideUp 0.4s ease-out forwards',
            animationDelay: '0.3s',
            opacity: 0,
          })}
        >
          <Badge
            variant="secondary"
            className={css({
              bg: 'purple.500/20',
              px: '3',
              py: '1.5',
              color: 'purple.300',
            })}
          >
            {categoryTools.length} Tools
          </Badge>
          <Badge
            variant="secondary"
            className={css({
              bg: 'green.500/20',
              px: '3',
              py: '1.5',
              color: 'green.300',
            })}
          >
            100% Free
          </Badge>
          <Badge
            variant="secondary"
            className={css({
              bg: 'blue.500/20',
              px: '3',
              py: '1.5',
              color: 'blue.300',
            })}
          >
            Browser-Based
          </Badge>
        </div>
      </div>

      {/* Tools Grid */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: { base: '4', sm: '6' },
          w: 'full',
          animation: 'fadeIn 0.5s ease-out forwards',
          animationDelay: '0.4s',
          opacity: 0,
        })}
      >
        {categoryTools.map((tool) => (
          <div
            key={tool.href}
            className={css({
              animation: 'slideUp 0.3s ease-out forwards',
              animationDelay: '0.1s',
              opacity: 0,
            })}
          >
            <ToolCard tool={tool} />
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div
        className={css({
          textAlign: 'center',
          py: '8',
          animation: 'fadeIn 0.5s ease-out forwards',
          animationDelay: '0.6s',
          opacity: 0,
        })}
      >
        <Link href="/">
          <Button
            variant="outline"
            size="lg"
            className={css({
              borderColor: 'purple.500/30',
              color: 'purple.300',
              _hover: {
                bg: 'purple.500/10',
                borderColor: 'purple.500/50',
              },
            })}
          >
            Explore All Tools
            <ArrowRight className={css({ h: '4', w: '4', ml: '2' })} />
          </Button>
        </Link>
      </div>
    </main>
  )
}
