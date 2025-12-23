import Link from 'next/link'
import type { Tool } from '@/lib/data/tools'
import { tools } from '@/lib/data/tools'
import { cx } from '@/lib/utils'
import { css } from '@/styled-system/css'

interface RelatedToolsProps {
  currentToolPath: string
  category?: string
  maxItems?: number
  className?: string
}

/**
 * Get related tools based on current tool's category and features
 */
function getRelatedTools(currentToolPath: string, category?: string, maxItems: number = 4): Tool[] {
  // Filter out the current tool and coming soon tools
  const availableTools = tools.filter((tool) => tool.href !== currentToolPath && !tool.comingSoon)

  // First, try to find tools in the same category
  const sameCategoryTools = category
    ? availableTools.filter((tool) => tool.category === category)
    : []

  // Then get popular/new tools as fallback
  const popularNewTools = availableTools.filter((tool) => tool.popular || tool.new)

  // Combine: prioritize same category, then popular/new
  const relatedTools = [...sameCategoryTools, ...popularNewTools]

  // Remove duplicates and limit
  const uniqueTools = Array.from(new Map(relatedTools.map((tool) => [tool.href, tool])).values())

  return uniqueTools.slice(0, maxItems)
}

export function RelatedTools({
  currentToolPath,
  category,
  maxItems = 4,
  className,
}: RelatedToolsProps) {
  const relatedTools = getRelatedTools(currentToolPath, category, maxItems)

  if (relatedTools.length === 0) {
    return null
  }

  return (
    <section
      className={cx(
        css({
          w: 'full',
          maxW: '4xl',
          mx: 'auto',
          mt: '12',
          mb: '8',
        }),
        className
      )}
      aria-labelledby="related-tools-heading"
    >
      <h2
        id="related-tools-heading"
        className={css({
          fontSize: '2xl',
          fontWeight: 'bold',
          color: 'fg.default',
          mb: '6',
          textAlign: 'center',
        })}
      >
        Related Tools
      </h2>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: {
            base: '1fr',
            sm: 'repeat(2, 1fr)',
          },
          gap: '4',
        })}
      >
        {relatedTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={css({
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '3',
                p: '5',
                borderRadius: 'lg',
                border: '1px solid',
                borderColor: 'border.default',
                bg: 'bg.surface',
                transition: 'all',
                transitionDuration: '200ms',
                overflow: 'hidden',
                _hover: {
                  borderColor: 'accent.default',
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                },
                _focus: {
                  outline: 'none',
                  ring: '2px',
                  ringColor: 'accent.default',
                  ringOffset: '2px',
                },
              })}
            >
              {/* Gradient Background */}
              <div
                className={css({
                  position: 'absolute',
                  inset: '0',
                  opacity: '0.05',
                  bgGradient: 'to-br',
                  pointerEvents: 'none',
                })}
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--colors-accent-default), transparent)`,
                }}
              />

              {/* Icon and Title */}
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3',
                  position: 'relative',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    w: '10',
                    h: '10',
                    borderRadius: 'lg',
                    bg: 'bg.muted',
                    flexShrink: '0',
                  })}
                >
                  <Icon
                    className={css({
                      w: '5',
                      h: '5',
                      color: 'accent.default',
                    })}
                    aria-hidden="true"
                  />
                </div>

                <div className={css({ flex: '1', minW: '0' })}>
                  <h3
                    className={css({
                      fontSize: 'md',
                      fontWeight: 'semibold',
                      color: 'fg.default',
                      lineHeight: 'tight',
                    })}
                  >
                    {tool.title}
                  </h3>
                  {(tool.popular || tool.new) && (
                    <div className={css({ display: 'flex', gap: '1', mt: '1' })}>
                      {tool.popular && (
                        <span
                          className={css({
                            fontSize: 'xs',
                            px: '2',
                            py: '0.5',
                            borderRadius: 'md',
                            bg: 'orange.500/10',
                            color: 'orange.400',
                            fontWeight: 'medium',
                          })}
                        >
                          Popular
                        </span>
                      )}
                      {tool.new && (
                        <span
                          className={css({
                            fontSize: 'xs',
                            px: '2',
                            py: '0.5',
                            borderRadius: 'md',
                            bg: 'green.500/10',
                            color: 'green.400',
                            fontWeight: 'medium',
                          })}
                        >
                          New
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p
                className={css({
                  fontSize: 'sm',
                  color: 'fg.muted',
                  lineHeight: 'relaxed',
                  position: 'relative',
                  overflow: 'hidden',
                })}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {tool.description}
              </p>

              {/* Features */}
              <div
                className={css({
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '2',
                  position: 'relative',
                })}
              >
                {tool.features.slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className={css({
                      fontSize: 'xs',
                      px: '2',
                      py: '1',
                      borderRadius: 'md',
                      bg: 'bg.muted',
                      color: 'fg.muted',
                    })}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
