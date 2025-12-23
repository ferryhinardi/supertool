'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ToolEmptyStateProps } from '@/lib/tool-components-types'
import { TOOL_ANIMATIONS } from '@/lib/tool-components-types'
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
    <motion.div
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
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        className={css({
          mb: '6',
          position: 'relative',
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
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
          className={css({
            position: 'absolute',
            top: '-2',
            right: '-2',
          })}
        >
          <Sparkles
            className={css({
              h: '6',
              w: '6',
              color: 'yellow.400',
            })}
          />
        </motion.div>
      </motion.div>

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
            <motion.div
              key={tipText}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                fontSize: 'sm',
                color: 'gray.500',
                textAlign: 'left',
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
            </motion.div>
          ))}
        </div>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
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
        </motion.div>
      )}

      {/* Quick start hint (if tips are provided) */}
      {tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={css({
            mt: '8',
            p: '4',
            rounded: 'lg',
            bg: 'gray.800/50',
            border: '1px solid',
            borderColor: 'gray.700',
            maxW: { base: 'sm', sm: 'md' },
            w: 'full',
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
        </motion.div>
      )}
    </motion.div>
  )
}
