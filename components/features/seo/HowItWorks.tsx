'use client'

import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { css } from '@/styled-system/css'

export interface HowToStep {
  name: string
  description: string
  icon?: React.ElementType
}

interface HowItWorksProps {
  steps: HowToStep[]
  title?: string
  description?: string
}

export function HowItWorks({ steps, title = 'How It Works', description }: HowItWorksProps) {
  return (
    <Card
      className={css({
        borderColor: 'gray.800',
        bg: 'gray.900/50',
        backdropFilter: 'blur(4px)',
      })}
    >
      <CardHeader>
        <CardTitle
          className={css({
            fontSize: { base: 'xl', sm: '2xl' },
            fontWeight: 'bold',
            color: 'white',
          })}
        >
          {title}
        </CardTitle>
        {description && (
          <p
            className={css({
              color: 'gray.400',
              fontSize: 'sm',
              mt: '2',
            })}
          >
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={css({
            p: { base: '4', sm: '5', md: '6' },
          })}
        >
          <ol
            className={css({
              spaceY: '6',
              position: 'relative',
              // Vertical line connecting steps (desktop only)
              _before: {
                content: '""',
                position: 'absolute',
                left: '4',
                top: '8',
                bottom: '8',
                w: '0.5',
                bg: 'gray.800',
                display: { base: 'none', md: 'block' },
              },
            })}
          >
            {steps.map((step, index) => {
              const Icon = step.icon || Check

              return (
                <li
                  key={`step-${index}`}
                  className={css({
                    display: 'flex',
                    gap: '4',
                    position: 'relative',
                  })}
                >
                  {/* Step number circle */}
                  <div
                    className={css({
                      flexShrink: '0',
                      w: { base: '8', md: '10' },
                      h: { base: '8', md: '10' },
                      borderRadius: 'full',
                      bg: 'gradient-to-br from-purple-500 to-pink-500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: '1',
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                    })}
                  >
                    {Icon && (
                      <Icon
                        className={css({
                          w: { base: '4', md: '5' },
                          h: { base: '4', md: '5' },
                          color: 'white',
                        })}
                      />
                    )}
                  </div>

                  {/* Step content */}
                  <div className={css({ flex: '1', pt: { base: '0', md: '1' } })}>
                    <h3
                      className={css({
                        fontSize: { base: 'base', sm: 'lg' },
                        fontWeight: 'semibold',
                        color: 'white',
                        mb: '2',
                      })}
                    >
                      {step.name}
                    </h3>
                    <p
                      className={css({
                        fontSize: { base: 'sm', sm: 'base' },
                        color: 'gray.400',
                        lineHeight: 'relaxed',
                      })}
                    >
                      {step.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for use in sidebars
 */
export function CompactHowItWorks({ steps }: { steps: HowToStep[] }) {
  return (
    <ol className={css({ spaceY: '3' })}>
      {steps.map((step, index) => (
        <li
          key={`compact-step-${index}`}
          className={css({
            display: 'flex',
            gap: '3',
          })}
        >
          <div
            className={css({
              flexShrink: '0',
              w: '6',
              h: '6',
              borderRadius: 'full',
              bg: 'purple.500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'xs',
              fontWeight: 'bold',
              color: 'white',
            })}
          >
            {index + 1}
          </div>
          <div className={css({ flex: '1' })}>
            <h4
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'white',
                mb: '1',
              })}
            >
              {step.name}
            </h4>
            <p
              className={css({
                fontSize: 'xs',
                color: 'gray.400',
                lineHeight: 'relaxed',
              })}
            >
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
