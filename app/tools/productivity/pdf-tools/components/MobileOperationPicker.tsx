'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { css } from '@/styled-system/css'
import type { OperationType } from './OperationGrid'
import { OperationGrid } from './OperationGrid'

interface MobileOperationPickerProps {
  selectedOperation: OperationType
  onOperationChange: (operation: OperationType) => void
  operationLabel: string
  disabled?: boolean
}

export function MobileOperationPicker({
  selectedOperation,
  onOperationChange,
  operationLabel,
  disabled = false,
}: MobileOperationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
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
          borderColor: 'red.500/30',
          bg: 'gray.900/50',
          _hover: {
            bg: 'gray.900/80',
            borderColor: 'red.500/50',
          },
        })}
      >
        <span>Operation: {operationLabel}</span>
        <ChevronUp
          className={css({
            h: '5',
            w: '5',
          })}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className={css({
                position: 'fixed',
                inset: '0',
                bg: 'black/40',
                backdropFilter: 'blur(4px)',
                zIndex: '50',
              })}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={css({
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
              <div
                className={css({
                  mx: 'auto',
                  mt: '4',
                  h: '1.5',
                  w: '12',
                  rounded: 'full',
                  bg: 'gray.700',
                  cursor: 'pointer',
                })}
                onClick={() => setIsOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsOpen(false)
                  }
                }}
                role="button"
                tabIndex={0}
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
                  Choose Operation
                </h2>
                <p
                  className={css({
                    mt: '2',
                    fontSize: 'sm',
                    color: 'white',
                  })}
                >
                  Select a PDF operation to perform
                </p>
              </div>

              {/* Content */}
              <div
                className={css({
                  flex: '1',
                  overflowY: 'auto',
                  p: '6',
                })}
              >
                <OperationGrid
                  selectedOperation={selectedOperation}
                  onOperationChange={(operation) => {
                    onOperationChange(operation)
                    setIsOpen(false)
                  }}
                  disabled={disabled}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
