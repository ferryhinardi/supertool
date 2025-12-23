import { X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { css } from '@/styled-system/css'

interface PDFMetadata {
  title: string
  author: string
  subject: string
  keywords: string
}

interface PDFMetadataEditorProps {
  initialMetadata?: Partial<PDFMetadata>
  onSave: (metadata: PDFMetadata) => void
  onClose: () => void
}

export function PDFMetadataEditor({ initialMetadata, onSave, onClose }: PDFMetadataEditorProps) {
  const [metadata, setMetadata] = useState<PDFMetadata>({
    title: initialMetadata?.title || '',
    author: initialMetadata?.author || '',
    subject: initialMetadata?.subject || '',
    keywords: initialMetadata?.keywords || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(metadata)
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Modal overlay is interactive backdrop for closing
    <div
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
          maxW: 'lg',
          w: 'full',
          mx: '4',
          bg: 'gray.900',
          border: '1px solid',
          borderColor: 'red.500/20',
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
            <CardTitle className={css({ color: 'red.400' })}>Edit PDF Metadata</CardTitle>
            <button
              type="button"
              onClick={onClose}
              className={css({
                p: '1',
                rounded: 'md',
                color: 'gray.400',
                _hover: { bg: 'gray.800', color: 'gray.200' },
              })}
            >
              <X className={css({ h: '5', w: '5' })} />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={css({ p: '6', spaceY: '4' })}>
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="title"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
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
                placeholder="Document title"
              />
            </div>

            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="author"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Author
              </label>
              <input
                id="author"
                type="text"
                value={metadata.author}
                onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
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
                placeholder="Author name"
              />
            </div>

            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="subject"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={metadata.subject}
                onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
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
                placeholder="Document subject"
              />
            </div>

            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="keywords"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Keywords
              </label>
              <input
                id="keywords"
                type="text"
                value={metadata.keywords}
                onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
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
                placeholder="Keywords separated by commas"
              />
            </div>

            <div className={css({ display: 'flex', gap: '3', pt: '4' })}>
              <Button
                type="submit"
                className={css({
                  flex: '1',
                  bg: 'red.600',
                  _hover: { bg: 'red.700' },
                })}
              >
                Save Metadata
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className={css({ flex: '1' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
