'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ToolEmptyStateProps } from '@/lib/data/tool-components-types'
import { TOOL_ANIMATIONS } from '@/lib/data/tool-components-types'
import { css } from '@/styled-system/css'

/**
 * ToolEmptyState Component
 *
 * A reusable empty state component for tools with no data/input.
 * Features animated icons, helpful tips, and clear call-to-action.
 *
 * @example
 * <ToolEmptyState
 *   icon={FileText}
 *   title="No Files Uploaded"
 *   description="Upload files to get started with processing"
 *   tips={[
 *     'Drag and drop files here',
 *     'Or click the upload button',
 *     'Supports PDF, JPG, PNG formats'
 *   ]}
 *   actionLabel="Upload Files"
 *   onAction={() => fileInput.current?.click()}
 *   color="#ef4444"
 * />
 */
export function ToolEmptyState({
  icon: Icon,
  title,
  description,
  tips = [],
  actionLabel,
  onAction,
  color = '#ef4444',
}: ToolEmptyStateProps) {
  return (
    <div
      {...TOOL_ANIMATIONS.fadeIn}
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { base: '12', sm: '16', md: '20' },
        px: '4',
        textAlign: 'center',
      })}
    >
      {/* Animated Icon */}
      <div
        className={css({
          mb: '6',
          position: 'relative',
          animation: 'float 2s ease-in-out infinite',
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            h: { base: '20', sm: '24' },
            w: { base: '20', sm: '24' },
            rounded: 'full',
            border: '2px dashed',
          })}
          style={{
            backgroundColor: `${color}20`,
            borderColor: `${color}40`,
          }}
        >
          <Icon
            className={css({
              h: { base: '10', sm: '12' },
              w: { base: '10', sm: '12' },
            })}
            style={{ color }}
          />
        </div>

        {/* Floating sparkles */}
        <div
          className={css({
            position: 'absolute',
            top: '-2',
            right: '-2',
            animation: 'spin 4s linear infinite',
          })}
        >
          <Sparkles
            className={css({
              h: '6',
              w: '6',
              color: 'yellow.400',
            })}
          />
        </div>
      </div>

      {/* Content */}
      <h3
        className={css({
          mb: '2',
          fontSize: { base: 'xl', sm: '2xl', md: '3xl' },
          fontWeight: 'bold',
          color: 'gray.100',
        })}
      >
        {title}
      </h3>

      <p
        className={css({
          mb: tips.length > 0 ? '6' : '8',
          maxW: { base: 'sm', sm: 'md', md: 'lg' },
          fontSize: { base: 'sm', sm: 'base' },
          color: 'gray.400',
          lineHeight: 'relaxed',
        })}
      >
        {description}
      </p>

      {/* Tips */}
      {tips.length > 0 && (
        <div
          className={css({
            mb: '8',
            display: 'flex',
            flexDirection: 'column',
            gap: '2',
            maxW: { base: 'sm', sm: 'md' },
            w: 'full',
          })}
        >
          {tips.map((tipText, index) => (
            <div
              key={index}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                fontSize: 'sm',
                color: 'gray.500',
                textAlign: 'left',
                animation: 'slideInLeft 0.5s ease-out forwards',
                animationDelay: '0.2s',
                opacity: 0,
              })}
            >
              <div
                className={css({
                  h: '1.5',
                  w: '1.5',
                  rounded: 'full',
                  flexShrink: 0,
                })}
                style={{ backgroundColor: color }}
              />
              {tipText}
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <div
          className={css({
            animation: 'scaleIn 0.5s ease-out forwards',
            animationDelay: '0.4s',
            opacity: 0,
          })}
        >
          <Button
            onClick={onAction}
            size="lg"
            className={css({
              gap: '2',
              minH: '12',
              px: '8',
              fontSize: 'base',
              fontWeight: 'semibold',
            })}
            style={{
              backgroundColor: color,
              borderColor: color,
            }}
          >
            <Icon
              className={css({
                h: '5',
                w: '5',
              })}
            />
            {actionLabel}
          </Button>
        </div>
      )}

      {/* Quick start hint (if tips are provided) */}
      {tips.length > 0 && (
        <div
          className={css({
            mt: '8',
            p: '4',
            rounded: 'lg',
            bg: 'gray.800/50',
            border: '1px solid',
            borderColor: 'gray.700',
            maxW: { base: 'sm', sm: 'md' },
            w: 'full',
            animation: 'fadeIn 0.5s ease-out forwards',
            animationDelay: '0.8s',
            opacity: 0,
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'start',
              gap: '3',
              textAlign: 'left',
            })}
          >
            <Sparkles
              className={css({
                h: '5',
                w: '5',
                color: 'yellow.400',
                flexShrink: 0,
                mt: '0.5',
              })}
            />
            <div>
              <h4
                className={css({
                  mb: '1',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'gray.200',
                })}
              >
                Pro Tip
              </h4>
              <p
                className={css({
                  fontSize: 'xs',
                  color: 'gray.400',
                  lineHeight: 'relaxed',
                })}
              >
                {tips.length === 1
                  ? tips[0]
                  : 'Follow the tips above to get started quickly and efficiently'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
