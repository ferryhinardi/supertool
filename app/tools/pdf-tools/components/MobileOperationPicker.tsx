'use client'

import { ChevronUp } from 'lucide-react'
import { Drawer } from 'vaul'
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
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Button
          variant="outline"
          size="lg"
          disabled={disabled}
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
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay
          className={css({
            position: 'fixed',
            inset: '0',
            bg: 'black/40',
            backdropFilter: 'blur(4px)',
            zIndex: '50',
          })}
        />
        <Drawer.Content
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
            })}
          />

          {/* Header */}
          <div
            className={css({
              p: '6',
              borderBottom: '1px solid',
              borderColor: 'gray.800',
            })}
          >
            <Drawer.Title
              className={css({
                fontSize: 'xl',
                fontWeight: 'bold',
                color: 'gray.100',
              })}
            >
              Choose Operation
            </Drawer.Title>
            <Drawer.Description
              className={css({
                mt: '2',
                fontSize: 'sm',
                color: 'gray.400',
              })}
            >
              Select a PDF operation to perform
            </Drawer.Description>
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
                // Close drawer after selection
                document.querySelector('[data-vaul-drawer]')?.setAttribute('data-state', 'closed')
              }}
              disabled={disabled}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
