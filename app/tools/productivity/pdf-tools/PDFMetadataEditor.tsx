'use client'

import { Book, Calendar, FileText, Hash, Save, User, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { css } from '@/styled-system/css'

export interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string
  creator?: string
  producer?: string
  creationDate?: string
  modificationDate?: string
}

interface PDFMetadataEditorProps {
  metadata: PDFMetadata
  onSave: (metadata: PDFMetadata) => void
  onClose: () => void
}

export function PDFMetadataEditor({ metadata, onSave, onClose }: PDFMetadataEditorProps) {
  const [formData, setFormData] = useState<PDFMetadata>(metadata)

  const handleChange = (field: keyof PDFMetadata, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave(formData)
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
        bg: 'black/60',
        backdropFilter: 'blur(4px)',
      })}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <Card
        className={css({
          maxW: '2xl',
          w: 'full',
          mx: '4',
          borderColor: 'gray.800',
          bg: 'gray.900',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <FileText className={css({ h: '5', w: '5', color: 'red.400' })} />
              Edit PDF Metadata
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className={css({
                h: '8',
                w: '8',
                p: '0',
                color: 'white',
                _hover: { bg: 'gray.800' },
              })}
            >
              <X className={css({ h: '4', w: '4' })} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={css({ spaceY: '4', p: '6' })}>
            {/* Title */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="metadata-title"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'white',
                })}
              >
                <Book className={css({ h: '4', w: '4' })} />
                Title
              </label>
              <input
                id="metadata-title"
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Document title"
                className={css({
                  w: 'full',
                  rounded: 'md',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800',
                  px: '3',
                  py: '2',
                  fontSize: 'sm',
                  color: 'gray.100',
                  _focus: { borderColor: 'red.500', outline: 'none' },
                })}
              />
            </div>

            {/* Author */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="metadata-author"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'white',
                })}
              >
                <User className={css({ h: '4', w: '4' })} />
                Author
              </label>
              <input
                id="metadata-author"
                type="text"
                value={formData.author || ''}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="Author name"
                className={css({
                  w: 'full',
                  rounded: 'md',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800',
                  px: '3',
                  py: '2',
                  fontSize: 'sm',
                  color: 'gray.100',
                  _focus: { borderColor: 'red.500', outline: 'none' },
                })}
              />
            </div>

            {/* Subject */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="metadata-subject"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'white',
                })}
              >
                <FileText className={css({ h: '4', w: '4' })} />
                Subject
              </label>
              <input
                id="metadata-subject"
                type="text"
                value={formData.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Document subject"
                className={css({
                  w: 'full',
                  rounded: 'md',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800',
                  px: '3',
                  py: '2',
                  fontSize: 'sm',
                  color: 'gray.100',
                  _focus: { borderColor: 'red.500', outline: 'none' },
                })}
              />
            </div>

            {/* Keywords */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="metadata-keywords"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'white',
                })}
              >
                <Hash className={css({ h: '4', w: '4' })} />
                Keywords
              </label>
              <input
                id="metadata-keywords"
                type="text"
                value={formData.keywords || ''}
                onChange={(e) => handleChange('keywords', e.target.value)}
                placeholder="Comma-separated keywords"
                className={css({
                  w: 'full',
                  rounded: 'md',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  bg: 'gray.800',
                  px: '3',
                  py: '2',
                  fontSize: 'sm',
                  color: 'gray.100',
                  _focus: { borderColor: 'red.500', outline: 'none' },
                })}
              />
            </div>

            {/* Read-only fields */}
            <div
              className={css({
                pt: '4',
                spaceY: '3',
                borderTop: '1px solid',
                borderColor: 'gray.800',
              })}
            >
              <p className={css({ fontSize: 'xs', color: 'white' })}>Read-only Information</p>

              {metadata.creationDate && (
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    fontSize: 'sm',
                    color: 'white',
                  })}
                >
                  <Calendar className={css({ h: '4', w: '4' })} />
                  <span>Created: {new Date(metadata.creationDate).toLocaleString()}</span>
                </div>
              )}

              {metadata.modificationDate && (
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    fontSize: 'sm',
                    color: 'white',
                  })}
                >
                  <Calendar className={css({ h: '4', w: '4' })} />
                  <span>Modified: {new Date(metadata.modificationDate).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={css({ display: 'flex', gap: '2', pt: '4' })}>
              <Button
                onClick={handleSave}
                className={css({ flex: '1', gap: '2', bg: 'red.600', _hover: { bg: 'red.700' } })}
              >
                <Save className={css({ h: '4', w: '4' })} />
                Save Metadata
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className={css({ borderColor: 'gray.700' })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
