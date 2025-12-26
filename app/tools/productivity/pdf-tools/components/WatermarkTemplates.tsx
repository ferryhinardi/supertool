'use client'

import { AlertCircle, Copy, FileCheck, FileEdit, Lock, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { css } from '@/styled-system/css'

export interface WatermarkTemplate {
  name: string
  text: string
  opacity: number
  rotation: number
  position:
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'center'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right'
    | 'diagonal'
  color: string
  fontSize: number
  pattern: boolean
  icon: ReactNode
}

export const watermarkPresets: WatermarkTemplate[] = [
  {
    name: 'Confidential',
    text: 'CONFIDENTIAL',
    opacity: 0.3,
    rotation: -45,
    position: 'diagonal',
    color: '#ff0000',
    fontSize: 60,
    pattern: true,
    icon: <Lock className={css({ w: '5', h: '5' })} />,
  },
  {
    name: 'Draft',
    text: 'DRAFT',
    opacity: 0.5,
    rotation: 0,
    position: 'top',
    color: '#ff9800',
    fontSize: 40,
    pattern: false,
    icon: <FileEdit className={css({ w: '5', h: '5' })} />,
  },
  {
    name: 'Copy',
    text: 'COPY',
    opacity: 0.4,
    rotation: -45,
    position: 'diagonal',
    color: '#2196f3',
    fontSize: 50,
    pattern: true,
    icon: <Copy className={css({ w: '5', h: '5' })} />,
  },
  {
    name: 'Urgent',
    text: 'URGENT',
    opacity: 0.6,
    rotation: 0,
    position: 'top',
    color: '#ff0000',
    fontSize: 50,
    pattern: false,
    icon: <AlertCircle className={css({ w: '5', h: '5' })} />,
  },
  {
    name: 'Sample',
    text: 'SAMPLE',
    opacity: 0.35,
    rotation: -45,
    position: 'diagonal',
    color: '#9c27b0',
    fontSize: 55,
    pattern: true,
    icon: <FileCheck className={css({ w: '5', h: '5' })} />,
  },
  {
    name: 'Custom',
    text: 'CUSTOM TEXT',
    opacity: 0.3,
    rotation: -45,
    position: 'center',
    color: '#b3b3b3',
    fontSize: 50,
    pattern: false,
    icon: <Sparkles className={css({ w: '5', h: '5' })} />,
  },
]

interface WatermarkTemplatesProps {
  onSelectTemplate: (template: WatermarkTemplate) => void
  currentTemplate?: string
}

export function WatermarkTemplates({ onSelectTemplate, currentTemplate }: WatermarkTemplatesProps) {
  return (
    <div className={css({ spaceY: '3' })}>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          fontSize: 'sm',
          fontWeight: 'medium',
          color: 'white',
        })}
      >
        <Sparkles className={css({ w: '4', h: '4', color: 'blue.400' })} />
        <span>Quick Templates</span>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: {
            base: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: '3',
          w: 'full',
        })}
      >
        {watermarkPresets.map((template) => {
          const isActive = currentTemplate === template.name

          return (
            <button
              key={template.name}
              type="button"
              onClick={() => onSelectTemplate(template)}
              className={css({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2',
                p: '3',
                borderRadius: 'lg',
                border: '1px solid',
                borderColor: isActive ? 'blue.500' : 'gray.700',
                bg: isActive ? 'blue.500/20' : 'gray.800/30',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
                transition: 'all',
                transitionDuration: '200ms',
                _hover: {
                  borderColor: isActive ? 'blue.400' : 'gray.600',
                  bg: isActive ? 'blue.500/30' : 'gray.800/50',
                  transform: 'translateY(-2px)',
                },
                _active: {
                  transform: 'translateY(0)',
                },
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  w: '10',
                  h: '10',
                  borderRadius: 'md',
                  bg: isActive ? 'blue.500/20' : 'gray.700/50',
                  color: isActive ? 'blue.400' : 'gray.400',
                })}
              >
                {template.icon}
              </div>

              <span
                className={css({
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  color: isActive ? 'blue.300' : 'gray.400',
                  textAlign: 'center',
                })}
              >
                {template.name}
              </span>
            </button>
          )
        })}
      </div>

      <div
        className={css({
          fontSize: 'xs',
          color: 'white',
          fontStyle: 'italic',
        })}
      >
        Select a template to apply preset watermark settings
      </div>
    </div>
  )
}
