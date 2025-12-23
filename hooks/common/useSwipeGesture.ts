/**
 * Custom hook for handling swipe gestures on mobile devices
 * Supports swipe-to-delete with visual feedback
 */

import type React from 'react'
import { useEffect, useRef, useState } from 'react'

export interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number // Minimum distance in pixels to trigger swipe
  velocityThreshold?: number // Minimum velocity to trigger swipe
  preventScroll?: boolean // Prevent vertical scroll during horizontal swipe
}

export interface SwipeState {
  isSwiping: boolean
  direction: 'left' | 'right' | null
  distance: number
  velocity: number
}

export function useSwipeGesture(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 100,
    velocityThreshold = 0.3,
    preventScroll = true,
  } = options

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    distance: 0,
    velocity: 0,
  })

  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchStartTime = useRef<number>(0)
  const currentX = useRef<number>(0)
  const isSwiping = useRef<boolean>(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    touchStartTime.current = Date.now()
    currentX.current = touch.clientX
    isSwiping.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return

    const touch = e.touches[0]
    currentX.current = touch.clientX
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    // Detect horizontal swipe (more horizontal than vertical movement)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true

      // Prevent vertical scroll during horizontal swipe
      if (preventScroll) {
        e.preventDefault()
      }

      const direction = deltaX > 0 ? 'right' : 'left'
      const distance = Math.abs(deltaX)
      const time = Date.now() - touchStartTime.current
      const velocity = distance / time

      setSwipeState({
        isSwiping: true,
        direction,
        distance,
        velocity,
      })
    }
  }

  const handleTouchEnd = () => {
    if (!isSwiping.current) {
      setSwipeState({
        isSwiping: false,
        direction: null,
        distance: 0,
        velocity: 0,
      })
      return
    }

    const deltaX = currentX.current - touchStartX.current
    const distance = Math.abs(deltaX)
    const time = Date.now() - touchStartTime.current
    const velocity = distance / time

    // Trigger swipe action if threshold is met
    if (distance >= threshold || velocity >= velocityThreshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    // Reset state
    setSwipeState({
      isSwiping: false,
      direction: null,
      distance: 0,
      velocity: 0,
    })
    isSwiping.current = false
    touchStartX.current = 0
    touchStartY.current = 0
  }

  return {
    swipeState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

/**
 * Hook for swipe-to-delete functionality
 * Returns handlers and visual state for swipe-to-delete UI
 */
export function useSwipeToDelete(onDelete: () => void) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteProgress, setDeleteProgress] = useState(0)

  const { swipeState, handlers } = useSwipeGesture({
    onSwipeLeft: () => {
      setIsDeleting(true)
      setTimeout(() => {
        onDelete()
        setIsDeleting(false)
        setDeleteProgress(0)
      }, 300)
    },
    threshold: 120,
    velocityThreshold: 0.5,
  })

  // Calculate delete progress (0-100%)
  useEffect(() => {
    if (swipeState.isSwiping && swipeState.direction === 'left') {
      const progress = Math.min((swipeState.distance / 120) * 100, 100)
      setDeleteProgress(progress)
    } else if (!swipeState.isSwiping) {
      setDeleteProgress(0)
    }
  }, [swipeState])

  return {
    handlers,
    isDeleting,
    deleteProgress,
    isSwiping: swipeState.isSwiping,
    swipeDirection: swipeState.direction,
  }
}
