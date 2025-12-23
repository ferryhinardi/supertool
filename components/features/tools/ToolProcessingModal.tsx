'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Loader2, X, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ToolProcessingState } from '@/lib/data/tool-components-types'
import { TOOL_ANIMATIONS } from '@/lib/data/tool-components-types'
import { css } from '@/styled-system/css'

interface ToolProcessingModalProps extends ToolProcessingState {
  /** Close handler (only available if cancellable or after completion) */
  onClose?: () => void
  /** Cancel processing handler */
  onCancel?: () => void
  /** Custom color for progress indicator */
  color?: string
  /** Show close button */
  showCloseButton?: boolean
}

/**
 * ToolProcessingModal Component
 *
 * A reusable modal for showing processing progress with custom SVG progress circles,
 * status messages, and cancellation support.
 *
 * @example
 * <ToolProcessingModal
 *   isProcessing={processing}
 *   progress={75}
 *   status="Processing file..."
 *   fileName="document.pdf"
 *   estimatedTime="30 seconds"
 *   cancellable
 *   onCancel={() => setProcessing(false)}
 *   color="#ef4444"
 * />
 */
export function ToolProcessingModal({
  isProcessing,
  progress,
  status,
  fileName,
  estimatedTime,
  cancellable = false,
  error,
  onClose,
  onCancel,
  color = '#ef4444',
  showCloseButton = true,
}: ToolProcessingModalProps) {
  if (!isProcessing && !error) return null

  const isComplete = progress >= 100 && !error
  const hasError = !!error

  return (
    <AnimatePresence>
      {(isProcessing || error) && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={css({
              position: 'fixed',
              inset: '0',
              bg: 'black/60',
              backdropFilter: 'blur(4px)',
              zIndex: '50',
            })}
            onClick={isComplete || hasError ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={css({
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              w: { base: '11/12', sm: 'md' },
              maxW: 'md',
              zIndex: '50',
            })}
          >
            <div
              className={css({
                rounded: 'xl',
                border: '1px solid',
                borderColor: hasError ? 'red.500/30' : 'gray.700',
                bg: 'gray.900',
                p: '6',
                shadow: '2xl',
              })}
            >
              {/* Close button */}
              {showCloseButton && (isComplete || hasError) && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className={css({
                    position: 'absolute',
                    top: '4',
                    right: '4',
                    rounded: 'lg',
                    p: '1',
                    color: 'gray.500',
                    transition: 'colors 0.2s',
                    _hover: {
                      color: 'gray.300',
                      bg: 'gray.800',
                    },
                  })}
                  aria-label="Close"
                >
                  <X className={css({ h: '5', w: '5' })} />
                </button>
              )}

              {/* Content */}
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4',
                  textAlign: 'center',
                })}
              >
                {/* Progress Circle or Status Icon */}
                {hasError ? (
                  <motion.div {...TOOL_ANIMATIONS.scale}>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        h: '20',
                        w: '20',
                        rounded: 'full',
                        bg: 'red.500/20',
                      })}
                    >
                      <XCircle
                        className={css({
                          h: '12',
                          w: '12',
                          color: 'red.400',
                        })}
                      />
                    </div>
                  </motion.div>
                ) : isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        h: '20',
                        w: '20',
                        rounded: 'full',
                        bg: 'green.500/20',
                      })}
                    >
                      <CheckCircle
                        className={css({
                          h: '12',
                          w: '12',
                          color: 'green.400',
                        })}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <ProgressCircle value={progress} color={color} />
                )}

                {/* Status Text */}
                <div className={css({ spaceY: '2', w: 'full' })}>
                  <h3
                    className={css({
                      fontSize: 'xl',
                      fontWeight: 'bold',
                      color: hasError ? 'red.300' : isComplete ? 'green.300' : 'gray.100',
                    })}
                  >
                    {hasError ? 'Processing Failed' : isComplete ? 'Complete!' : status}
                  </h3>

                  {/* File name */}
                  {fileName && (
                    <p
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.400',
                        fontFamily: 'mono',
                        truncate: true,
                      })}
                      title={fileName}
                    >
                      {fileName}
                    </p>
                  )}

                  {/* Error message */}
                  {error && (
                    <motion.div
                      {...TOOL_ANIMATIONS.fadeInFast}
                      className={css({
                        mt: '3',
                        p: '3',
                        rounded: 'lg',
                        bg: 'red.500/10',
                        border: '1px solid',
                        borderColor: 'red.500/30',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'start',
                          gap: '2',
                          textAlign: 'left',
                        })}
                      >
                        <AlertCircle
                          className={css({
                            h: '4',
                            w: '4',
                            color: 'red.400',
                            flexShrink: 0,
                            mt: '0.5',
                          })}
                        />
                        <p
                          className={css({
                            fontSize: 'sm',
                            color: 'red.300',
                            lineHeight: 'relaxed',
                          })}
                        >
                          {error}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Estimated time */}
                  {estimatedTime && !hasError && !isComplete && (
                    <p
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.500',
                      })}
                    >
                      Estimated: {estimatedTime}
                    </p>
                  )}

                  {/* Progress percentage */}
                  {!hasError && !isComplete && (
                    <p
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'semibold',
                        color: 'gray.400',
                      })}
                    >
                      {Math.round(progress)}% complete
                    </p>
                  )}
                </div>

                {/* Actions */}
                {!isComplete && !hasError && cancellable && onCancel && (
                  <Button
                    onClick={onCancel}
                    variant="outline"
                    className={css({
                      mt: '2',
                      borderColor: 'gray.700',
                      color: 'gray.400',
                      _hover: {
                        bg: 'gray.800',
                        color: 'gray.300',
                      },
                    })}
                  >
                    Cancel
                  </Button>
                )}

                {(isComplete || hasError) && onClose && (
                  <Button
                    onClick={onClose}
                    className={css({
                      mt: '2',
                      w: 'full',
                    })}
                    style={{
                      backgroundColor: hasError ? '#dc2626' : '#10b981',
                    }}
                  >
                    {hasError ? 'Try Again' : 'Done'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Custom SVG Progress Circle
 * Replaces external library dependency
 */
function ProgressCircle({ value, color }: { value: number; color: string }) {
  const radius = 40
  const stroke = 6
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div
      className={css({
        position: 'relative',
        w: '24',
        h: '24',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`Progress: ${Math.round(value)}%`}
        role="img"
      >
        <title>Processing progress</title>
        {/* Background circle */}
        <circle
          stroke="#1f2937"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.3s ease',
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      {/* Center content */}
      <div
        className={css({
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Loader2
          className={css({
            h: '6',
            w: '6',
            animation: 'spin 1s linear infinite',
          })}
          style={{ color }}
        />
      </div>
    </div>
  )
}
