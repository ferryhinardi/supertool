/**
 * Bill Templates Selector
 * Displays saved templates for quick bill setup
 */

'use client'

import { FileText, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteBillTemplate, loadBillTemplates } from '@/lib/tools/split-bill/split-bill-storage'
import { css } from '@/styled-system/css'

interface Template {
  id: string
  name: string
  description?: string
  billAmount: string
  tipPercent: string
  taxPercent: string
  currency: string
  people: Array<{
    name: string
    percentage?: number
  }>
  splitType: 'equal' | 'percentage' | 'items'
  createdAt: string
}

interface TemplatesSelectorProps {
  onSelectTemplate: (template: Template) => void
}

export function TemplatesSelector({ onSelectTemplate }: TemplatesSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>(loadBillTemplates())

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete template "${name}"?`)) {
      deleteBillTemplate(id)
      setTemplates(loadBillTemplates())
      toast.success('Template deleted')
    }
  }

  const handleSelect = (template: Template) => {
    onSelectTemplate(template)
    setIsOpen(false)
    toast.success(`Template "${template.name}" loaded!`)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
        })}
      >
        <FileText className={css({ h: '4', w: '4' })} />
        Load Template ({templates.length})
      </Button>
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={css({
        position: 'fixed',
        inset: '0',
        zIndex: '50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s',
      })}
      onClick={() => setIsOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
    >
      <div
        role="document"
        className={css({
          bg: 'gray.900',
          rounded: '2xl',
          border: '2px solid',
          borderColor: 'purple.500/30',
          maxW: '2xl',
          w: 'full',
          mx: '4',
          maxH: '90vh',
          overflowY: 'auto',
          shadow: '2xl',
          animation: 'scaleIn 0.2s',
        })}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: '6',
            borderBottom: '1px solid',
            borderColor: 'gray.800',
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
            <FileText className={css({ h: '6', w: '6', color: 'green.400' })} />
            <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'white' })}>
              Bill Templates
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className={css({
              color: 'gray.400',
              _hover: { color: 'white', bg: 'gray.800' },
            })}
          >
            <X className={css({ h: '5', w: '5' })} />
          </Button>
        </div>

        {/* Content */}
        <div className={css({ p: '6' })}>
          {templates.length === 0 ? (
            <div
              className={css({
                textAlign: 'center',
                py: '8',
                color: 'gray.500',
              })}
            >
              <FileText className={css({ h: '12', w: '12', mx: 'auto', mb: '4', opacity: 0.5 })} />
              <p>No templates saved yet</p>
              <p className={css({ fontSize: 'sm', mt: '1' })}>
                Create a template by clicking "Save Template" after setting up a bill
              </p>
            </div>
          ) : (
            <div className={css({ spaceY: '3' })}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.800',
                    bg: 'gray.800/50',
                    transition: 'all 0.2s',
                    _hover: { bg: 'gray.800', borderColor: 'green.500/30' },
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'start',
                      justifyContent: 'space-between',
                      gap: '3',
                    })}
                  >
                    <div className={css({ flex: '1' })}>
                      <h3
                        className={css({
                          fontSize: 'lg',
                          fontWeight: 'semibold',
                          color: 'white',
                          mb: '1',
                        })}
                      >
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className={css({ fontSize: 'sm', color: 'gray.400', mb: '2' })}>
                          {template.description}
                        </p>
                      )}
                      <div
                        className={css({
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '2',
                          fontSize: 'xs',
                          color: 'gray.500',
                        })}
                      >
                        <span>
                          {template.people.length}{' '}
                          {template.people.length === 1 ? 'person' : 'people'}
                        </span>
                        <span>•</span>
                        <span>{template.currency}</span>
                        <span>•</span>
                        <span>{template.splitType} split</span>
                        <span>•</span>
                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={css({ display: 'flex', gap: '2' })}>
                      <Button
                        onClick={() => handleSelect(template)}
                        size="sm"
                        variant="default"
                        className={css({
                          bg: 'green.600',
                          _hover: { bg: 'green.500' },
                        })}
                      >
                        Load
                      </Button>
                      <Button
                        onClick={() => handleDelete(template.id, template.name)}
                        size="sm"
                        variant="ghost"
                        className={css({
                          color: 'red.400',
                          _hover: { color: 'red.300', bg: 'red.500/10' },
                        })}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
