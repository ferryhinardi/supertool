'use client'

import { Star } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  generateBrowserFingerprint,
  getRatingStats,
  type RatingStats,
  submitRating,
} from '@/lib/services/rating-service'
import { css } from '@/styled-system/css'
import { flex } from '@/styled-system/patterns'

interface ToolRatingProps {
  toolId: string
  toolName: string
}

export function ToolRating({ toolId, toolName }: ToolRatingProps) {
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const loadRatingStats = useCallback(async () => {
    const data = await getRatingStats(toolId)
    setStats(data)
  }, [toolId])

  const checkIfUserRated = useCallback(() => {
    const ratedTools = JSON.parse(localStorage.getItem('rated_tools') || '{}') as Record<
      string,
      number
    >
    if (ratedTools[toolId]) {
      setHasRated(true)
      setUserRating(ratedTools[toolId])
    }
  }, [toolId])

  useEffect(() => {
    loadRatingStats()
    checkIfUserRated()
  }, [loadRatingStats, checkIfUserRated])

  const handleRatingSubmit = async (rating: number) => {
    if (hasRated || isSubmitting) return

    setIsSubmitting(true)
    const fingerprint = generateBrowserFingerprint()

    const result = await submitRating({
      toolId,
      rating,
      userFingerprint: fingerprint,
    })

    if (result.success) {
      // Store in localStorage
      const ratedTools = JSON.parse(localStorage.getItem('rated_tools') || '{}') as Record<
        string,
        number
      >
      ratedTools[toolId] = rating
      localStorage.setItem('rated_tools', JSON.stringify(ratedTools))

      setHasRated(true)
      setUserRating(rating)
      setFeedback('Thanks for rating!')
      setTimeout(() => setFeedback(''), 3000)

      // Reload stats
      await loadRatingStats()
    } else {
      setFeedback(result.error || 'Failed to submit rating')
      setTimeout(() => setFeedback(''), 3000)
    }

    setIsSubmitting(false)
  }

  const renderStars = (count: number, filled: boolean) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1
      const isFilled = (filled && starValue <= count) || (!filled && starValue <= hoveredRating)

      return (
        <button
          key={`star-${filled ? 'filled' : 'hover'}-${starValue}`}
          type="button"
          className={css({
            background: 'transparent',
            border: 'none',
            cursor: hasRated ? 'default' : 'pointer',
            padding: 0,
            transition: 'transform 0.1s',
            _hover: {
              transform: hasRated ? 'none' : 'scale(1.1)',
            },
            _disabled: {
              cursor: 'not-allowed',
              opacity: 0.5,
            },
          })}
          onMouseEnter={() => !hasRated && setHoveredRating(starValue)}
          onMouseLeave={() => !hasRated && setHoveredRating(0)}
          onClick={() => handleRatingSubmit(starValue)}
          disabled={hasRated || isSubmitting}
          aria-label={`Rate ${starValue} stars`}
        >
          <Star
            className={css({
              width: '6',
              height: '6',
              color: isFilled || starValue <= userRating ? '#f59e0b' : '#d1d5db',
              fill: isFilled || starValue <= userRating ? '#f59e0b' : 'none',
              transition: 'all 0.2s',
            })}
          />
        </button>
      )
    })
  }

  if (!stats) {
    return null
  }

  return (
    <div
      className={css({
        width: '100%',
        padding: '6',
        bg: 'white',
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'gray.200',
        _dark: {
          bg: 'gray.800',
          borderColor: 'gray.700',
        },
      })}
    >
      <div
        className={flex({
          direction: 'column',
          gap: '4',
        })}
      >
        {/* Title */}
        <h3
          className={css({
            fontSize: 'lg',
            fontWeight: 'semibold',
            color: 'gray.900',
            _dark: { color: 'white' },
          })}
        >
          Rate this tool
        </h3>

        {/* Current Rating Display */}
        {stats.totalRatings > 0 && (
          <div
            className={flex({
              align: 'center',
              gap: '2',
            })}
          >
            <div className={flex({ gap: '1' })}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`display-star-${index + 1}`}
                  className={css({
                    width: '5',
                    height: '5',
                    color: index < Math.round(stats.averageRating) ? '#f59e0b' : '#d1d5db',
                    fill: index < Math.round(stats.averageRating) ? '#f59e0b' : 'none',
                  })}
                />
              ))}
            </div>
            <span
              className={css({
                fontSize: 'sm',
                color: 'gray.600',
                _dark: { color: 'gray.400' },
              })}
            >
              {stats.averageRating.toFixed(1)} ({stats.totalRatings}{' '}
              {stats.totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        )}

        {/* Interactive Rating Stars */}
        {!hasRated && (
          <div>
            <p
              className={css({
                fontSize: 'sm',
                color: 'gray.600',
                marginBottom: '2',
                _dark: { color: 'gray.400' },
              })}
            >
              How would you rate {toolName}?
            </p>
            <div className={flex({ gap: '1' })}>{renderStars(hoveredRating, false)}</div>
          </div>
        )}

        {/* User's Rating (After Submission) */}
        {hasRated && (
          <div>
            <p
              className={css({
                fontSize: 'sm',
                color: 'gray.600',
                marginBottom: '2',
                _dark: { color: 'gray.400' },
              })}
            >
              Your rating:
            </p>
            <div className={flex({ gap: '1' })}>{renderStars(userRating, true)}</div>
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <p
            className={css({
              fontSize: 'sm',
              color: feedback.includes('Thanks') ? 'green.600' : 'red.600',
              fontWeight: 'medium',
            })}
          >
            {feedback}
          </p>
        )}

        {/* Rating Distribution (Optional) */}
        {stats.totalRatings > 0 && (
          <div
            className={css({
              paddingTop: '4',
              borderTop: '1px solid',
              borderColor: 'gray.200',
              _dark: { borderColor: 'gray.700' },
            })}
          >
            <p
              className={css({
                fontSize: 'xs',
                color: 'gray.500',
                marginBottom: '2',
                _dark: { color: 'gray.500' },
              })}
            >
              Rating distribution
            </p>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5]
              const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0

              return (
                <div
                  key={rating}
                  className={flex({
                    align: 'center',
                    gap: '2',
                    marginBottom: '1',
                  })}
                >
                  <span
                    className={css({
                      fontSize: 'xs',
                      color: 'gray.600',
                      width: '2',
                      _dark: { color: 'gray.400' },
                    })}
                  >
                    {rating}
                  </span>
                  <Star
                    className={css({
                      width: '3',
                      height: '3',
                      color: '#f59e0b',
                      fill: '#f59e0b',
                    })}
                  />
                  <div
                    className={css({
                      flex: 1,
                      height: '2',
                      bg: 'gray.200',
                      borderRadius: 'full',
                      overflow: 'hidden',
                      _dark: { bg: 'gray.700' },
                    })}
                  >
                    <div
                      className={css({
                        height: '100%',
                        bg: '#f59e0b',
                        borderRadius: 'full',
                        transition: 'width 0.3s',
                      })}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span
                    className={css({
                      fontSize: 'xs',
                      color: 'gray.600',
                      width: '8',
                      textAlign: 'right',
                      _dark: { color: 'gray.400' },
                    })}
                  >
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
