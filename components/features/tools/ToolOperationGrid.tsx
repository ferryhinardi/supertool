'use client'

import { motion } from 'framer-motion'
import type {
  ToolGridLayout,
  ToolOperation,
  ToolOperationCategory,
} from '@/lib/data/tool-components-types'
import { TOOL_ANIMATIONS } from '@/lib/data/tool-components-types'
import { trackEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface ToolOperationGridProps {
  /** List of operations to display */
  operations?: ToolOperation[]
  /** Categorized operations (alternative to flat operations list) */
  categories?: ToolOperationCategory[]
  /** Currently selected operation ID */
  selectedOperation: string
  /** Callback when operation changes */
  onOperationChange: (operationId: string) => void
  /** Whether grid is disabled */
  disabled?: boolean
  /** Custom grid layout */
  columns?: ToolGridLayout
  /** Show category labels */
  showCategories?: boolean
  /** Analytics category name */
  analyticsCategory?: string
}

/**
 * ToolOperationGrid Component
 *
 * A reusable grid for displaying tool operations/modes with visual feedback,
 * keyboard navigation, and accessibility support.
 *
 * @example
 * // Flat operations
 * <ToolOperationGrid
 *   operations={[
 *     { id: 'format', label: 'Format', icon: Code, color: '#3b82f6', description: 'Format JSON' },
 *     { id: 'minify', label: 'Minify', icon: Minimize2, color: '#10b981', description: 'Compress JSON' },
 *   ]}
 *   selectedOperation={mode}
 *   onOperationChange={setMode}
 * />
 *
 * @example
 * // Categorized operations
 * <ToolOperationGrid
 *   categories={[
 *     {
 *       id: 'transform',
 *       label: 'Transform',
 *       operations: [...],
 *     },
 *   ]}
 *   selectedOperation={mode}
 *   onOperationChange={setMode}
 *   showCategories
 * />
 */
export function ToolOperationGrid({
  operations,
  categories,
  selectedOperation,
  onOperationChange,
  disabled = false,
  columns = { base: 1, sm: 2, lg: 3 },
  showCategories = true,
  analyticsCategory = 'tool',
}: ToolOperationGridProps) {
  // Determine if we're using flat operations or categories
  const isCategorized = !!categories && categories.length > 0
  const flatOperations = operations || []

  const handleOperationClick = (operationId: string) => {
    if (disabled) return

    onOperationChange(operationId)

    // Track analytics
    trackEvent({
      action: 'operation_changed',
      category: analyticsCategory,
      label: operationId,
    })
  }

  // Build grid column template
  const gridColumns = {
    base: `repeat(${columns.base || 1}, 1fr)`,
    sm: `repeat(${columns.sm || 2}, 1fr)`,
    md: `repeat(${columns.md || columns.sm || 2}, 1fr)`,
    lg: `repeat(${columns.lg || 3}, 1fr)`,
    xl: `repeat(${columns.xl || columns.lg || 3}, 1fr)`,
  }

  // Render categorized operations
  if (isCategorized && categories) {
    return (
      <div className={css({ spaceY: '6' })}>
        {categories.map((category, categoryIndex) => (
          <motion.div key={category.id} {...TOOL_ANIMATIONS.stagger(categoryIndex * 0.1)}>
            {showCategories && (
              <h3
                className={css({
                  mb: '3',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'gray.400',
                  textTransform: 'uppercase',
                  letterSpacing: 'wider',
                })}
              >
                {category.label}
              </h3>
            )}

            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: gridColumns,
                gap: '3',
                w: 'full',
              })}
            >
              {category.operations.map((op) => (
                <OperationButton
                  key={op.id}
                  operation={op}
                  isSelected={selectedOperation === op.id}
                  onClick={() => handleOperationClick(op.id)}
                  disabled={disabled || op.disabled || false}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Render flat operations
  return (
    <motion.div {...TOOL_ANIMATIONS.fadeIn}>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: '3',
          w: 'full',
        })}
      >
        {flatOperations.map((op) => (
          <OperationButton
            key={op.id}
            operation={op}
            isSelected={selectedOperation === op.id}
            onClick={() => handleOperationClick(op.id)}
            disabled={disabled || op.disabled || false}
          />
        ))}
      </div>
    </motion.div>
  )
}

/**
 * Individual Operation Button
 */
interface OperationButtonProps {
  operation: ToolOperation
  isSelected: boolean
  onClick: () => void
  disabled: boolean
}

function OperationButton({ operation, isSelected, onClick, disabled }: OperationButtonProps) {
  const Icon = operation.icon

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={css({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        p: '4',
        rounded: 'lg',
        border: '2px solid',
        borderColor: isSelected ? 'currentColor' : 'gray.700',
        bg: isSelected ? 'currentColor/10' : 'gray.800/50',
        textAlign: 'left',
        transition: 'all 0.2s',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        minH: '20',
        _hover: disabled
          ? {}
          : {
              borderColor: 'currentColor',
              bg: 'currentColor/5',
            },
        _focus: {
          outline: '2px solid',
          outlineColor: 'currentColor',
          outlineOffset: '2px',
        },
      })}
      style={{ color: operation.color }}
      aria-pressed={isSelected}
      aria-label={
        operation.description ? `${operation.label}: ${operation.description}` : operation.label
      }
      aria-disabled={disabled}
    >
      {/* Glow effect for selected */}
      {isSelected && (
        <div
          className={css({
            position: 'absolute',
            inset: '-2px',
            rounded: 'lg',
            opacity: 0.5,
            pointerEvents: 'none',
            filter: 'blur(8px)',
          })}
          style={{ background: operation.color }}
        />
      )}

      {/* Icon */}
      <div
        className={css({
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          h: '12',
          w: '12',
          rounded: 'lg',
          bg: isSelected ? 'currentColor/20' : 'currentColor/10',
        })}
      >
        <Icon
          className={css({
            h: '6',
            w: '6',
          })}
          style={{ color: operation.color }}
        />
      </div>

      {/* Content */}
      <div className={css({ minW: '0', flex: '1' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            mb: '1',
          })}
        >
          <h4
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: isSelected ? 'currentColor' : 'gray.200',
            })}
          >
            {operation.label}
          </h4>

          {/* Badge */}
          {operation.badge && (
            <span
              className={css({
                px: '2',
                py: '0.5',
                rounded: 'md',
                bg: 'currentColor/20',
                fontSize: 'xs',
                fontWeight: 'semibold',
                color: 'currentColor',
              })}
            >
              {operation.badge}
            </span>
          )}

          {/* Selected checkmark */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                h: '5',
                w: '5',
                rounded: 'full',
                bg: 'currentColor',
              })}
            >
              <svg
                className={css({ h: '3', w: '3', color: 'white' })}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <title>Selected</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          )}
        </div>

        {/* Description */}
        {operation.description && (
          <p
            className={css({
              fontSize: 'xs',
              color: isSelected ? 'currentColor/80' : 'gray.500',
              lineHeight: 'tight',
            })}
          >
            {operation.description}
          </p>
        )}

        {/* Keyboard shortcut */}
        {operation.shortcut && (
          <kbd
            className={css({
              mt: '1',
              display: 'inline-block',
              px: '1.5',
              py: '0.5',
              rounded: 'sm',
              bg: 'gray.700',
              fontSize: 'xs',
              fontFamily: 'mono',
              color: 'gray.400',
            })}
          >
            {operation.shortcut}
          </kbd>
        )}
      </div>
    </motion.button>
  )
}
