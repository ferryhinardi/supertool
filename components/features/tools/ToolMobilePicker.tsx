'use client'

import { ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { css } from '@/styled-system/css'

interface ToolMobilePickerProps {
  /** Button label */
  label: string
  /** Dialog title */
  title: string
  /** Dialog description */
  description?: string
  /** Dialog content */
  children: React.ReactNode
  /** Whether picker is disabled */
  disabled?: boolean
  /** Custom button color */
  color?: string
}

/**
 * ToolMobilePicker Component
 *
 * A mobile-optimized bottom sheet picker with smooth animations.
 * Uses Framer Motion for spring-based transitions.
 *
 * @example
 * <ToolMobilePicker
 *   label={`Operation: ${operationLabel}`}
 *   title="Choose Operation"
 *   description="Select a PDF operation to perform"
 *   color="#ef4444"
 * >
 *   <ToolOperationGrid
 *     operations={operations}
 *     selectedOperation={selected}
 *     onOperationChange={(op) => {
 *       setSelected(op)
 *       // Picker closes automatically
 *     }}
 *   />
 * </ToolMobilePicker>
 */
export function ToolMobilePicker({
  label,
  title,
  description,
  children,
  disabled = false,
  color = '#ef4444',
}: ToolMobilePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="lg"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={css({
          w: 'full',
          justifyContent: 'space-between',
          gap: '2',
          px: '4',
          py: '3',
          fontSize: 'base',
          fontWeight: 'semibold',
          borderColor: `${color}30`,
          bg: 'gray.900/50',
          _hover: {
            bg: 'gray.900/80',
            borderColor: `${color}50`,
          },
          _disabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        })}
      >
        <span>{label}</span>
        <ChevronUp
          className={css({
            h: '5',
            w: '5',
          })}
        />
      </Button>

      {/* Bottom Sheet */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className={css({
              position: 'fixed',
              inset: '0',
              bg: 'black/40',
              backdropFilter: 'blur(4px)',
              zIndex: '50',
              animation: 'fadeIn 0.2s ease-out',
            })}
          />

          {/* Bottom Sheet */}
          <div
            className={css({
              animation: 'slideUp 0.3s ease-out',
              position: 'fixed',
              bottom: '0',
              left: '0',
              right: '0',
              display: 'flex',
              flexDirection: 'column',
              maxH: '96',
              rounded: 't-2xl',
              bg: 'gray.900',
              borderTop: '1px solid',
              borderColor: 'gray.800',
              zIndex: '50',
            })}
          >
            {/* Handle */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={css({
                mx: 'auto',
                mt: '4',
                h: '1.5',
                w: '12',
                rounded: 'full',
                bg: 'gray.700',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                _hover: {
                  bg: 'gray.600',
                },
                _focus: {
                  outline: '2px solid',
                  outlineColor: 'gray.600',
                  outlineOffset: '2px',
                },
              })}
              aria-label="Close drawer"
            />

            {/* Header */}
            <div
              className={css({
                p: '6',
                borderBottom: '1px solid',
                borderColor: 'gray.800',
              })}
            >
              <h2
                className={css({
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'gray.100',
                })}
              >
                {title}
              </h2>
              {description && (
                <p
                  className={css({
                    mt: '2',
                    fontSize: 'sm',
                    color: 'gray.400',
                  })}
                >
                  {description}
                </p>
              )}
            </div>

            {/* Content */}
            <div
              className={css({
                flex: '1',
                overflowY: 'auto',
                p: '6',
              })}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={css({
                  appearance: 'none',
                  w: 'full',
                  bg: 'transparent',
                  border: 'none',
                  p: 0,
                })}
              >
                {children}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
