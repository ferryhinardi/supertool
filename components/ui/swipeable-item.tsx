/**
 * Swipeable Item Component
 * Provides swipe-to-delete functionality with visual feedback
 */

'use client'

import { Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSwipeToDelete } from '@/hooks/common/useSwipeGesture'
import { css, cx } from '@/styled-system/css'

interface SwipeableItemProps {
  children: ReactNode
  onDelete: () => void
  disabled?: boolean
  deleteLabel?: string
  className?: string
}

export function SwipeableItem({
  children,
  onDelete,
  disabled = false,
  deleteLabel = 'Delete',
  className,
}: SwipeableItemProps) {
  const { handlers, isDeleting, deleteProgress, isSwiping, swipeDirection } =
    useSwipeToDelete(onDelete)

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      className={css({
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'pan-y', // Allow vertical scroll, prevent horizontal
      })}
    >
      {/* Delete background indicator */}
      <div
        className={css({
          position: 'absolute',
          right: '0',
          top: '0',
          bottom: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: '6',
          gap: '2',
          bg: 'red.600',
          color: 'white',
          fontWeight: 'semibold',
          fontSize: 'sm',
          transition: 'opacity 0.2s',
          opacity: isSwiping && swipeDirection === 'left' ? 1 : 0,
          width: deleteProgress > 0 ? `${Math.min(deleteProgress, 100)}%` : '0%',
        })}
      >
        <Trash2 className={css({ h: '5', w: '5' })} />
        <span>{deleteLabel}</span>
      </div>

      {/* Content wrapper with swipe transform */}
      <div
        {...handlers}
        className={cx(
          className,
          css({
            position: 'relative',
            transform:
              isSwiping && swipeDirection === 'left'
                ? `translateX(-${Math.min(deleteProgress, 100)}%)`
                : 'translateX(0)',
            transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
            cursor: 'grab',
            _active: {
              cursor: 'grabbing',
            },
          })
        )}
        style={{
          // Apply deleting animation
          ...(isDeleting && {
            animation: 'slideOutLeft 0.3s ease-out forwards',
            opacity: 0,
          }),
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Visual indicator component for swipe hint
 */
export function SwipeHint() {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2',
        py: '2',
        px: '4',
        rounded: 'full',
        bg: 'gray.800/80',
        backdropFilter: 'blur(8px)',
        border: '1px solid',
        borderColor: 'gray.700',
        fontSize: 'xs',
        color: 'gray.400',
        animation: 'pulse 2s infinite',
      })}
    >
      <span>👈</span>
      <span>Swipe left to delete</span>
    </div>
  )
}
