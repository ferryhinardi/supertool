import { Download, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { css } from '@/styled-system/css'
import { PDFThumbnail } from './PDFThumbnail'

interface ComparisonViewProps {
  originalFile: File
  processedBlob: Blob
  originalSize: number
  processedSize: number
  onDownload: () => void
  onClose: () => void
}

export function ComparisonView({
  originalFile,
  processedBlob,
  originalSize,
  processedSize,
  onDownload,
  onClose,
}: ComparisonViewProps) {
  const [processedFile] = useState(() => {
    return new File([processedBlob], 'processed.pdf', { type: 'application/pdf' })
  })

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  const compressionRatio = Math.round(((originalSize - processedSize) / originalSize) * 100)
  const savings = originalSize - processedSize

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
        overflowY: 'auto',
        p: { base: '3', sm: '4' },
      })}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <Card
        className={css({
          maxW: '4xl',
          w: 'full',
          maxH: 'full',
          my: 'auto',
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
              gap: '3',
            })}
          >
            <CardTitle className={css({ color: 'red.400', minW: '0' })}>
              Before & After Comparison
            </CardTitle>
            <button
              type="button"
              onClick={onClose}
              className={css({
                p: '1',
                rounded: 'md',
                color: 'white',
                _hover: { bg: 'gray.800', color: 'gray.200' },
              })}
            >
              <X className={css({ h: '5', w: '5' })} />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={css({ p: { base: '4', sm: '6' }, spaceY: '6' })}>
            {/* Statistics */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
                gap: '4',
                p: '4',
                rounded: 'lg',
                bg: 'gray.800/50',
              })}
            >
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'red.400' })}>
                  {compressionRatio}%
                </div>
                <div className={css({ fontSize: 'xs', color: 'white' })}>Size Reduction</div>
              </div>
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'orange.400' })}>
                  {formatBytes(savings)}
                </div>
                <div className={css({ fontSize: 'xs', color: 'white' })}>Space Saved</div>
              </div>
              <div className={css({ textAlign: 'center' })}>
                <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'yellow.400' })}>
                  {formatBytes(processedSize)}
                </div>
                <div className={css({ fontSize: 'xs', color: 'white' })}>Final Size</div>
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '4',
              })}
            >
              {/* Original */}
              <div
                className={css({
                  p: '4',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.800',
                  bg: 'gray.900/50',
                  textAlign: 'center',
                  spaceY: '3',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <PDFThumbnail file={originalFile} width={150} height={200} />
                </div>
                <div>
                  <h3 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'white' })}>
                    Original
                  </h3>
                  <p className={css({ fontSize: 'xs', color: 'white' })}>
                    {formatBytes(originalSize)}
                  </p>
                </div>
              </div>

              {/* Processed */}
              <div
                className={css({
                  p: '4',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'red.500/30',
                  bg: 'red.500/10',
                  textAlign: 'center',
                  spaceY: '3',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <PDFThumbnail file={processedFile} width={150} height={200} />
                </div>
                <div>
                  <h3 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'red.300' })}>
                    Processed
                  </h3>
                  <p className={css({ fontSize: 'xs', color: 'red.400' })}>
                    {formatBytes(processedSize)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '3',
                pt: '4',
              })}
            >
              <Button
                onClick={onDownload}
                className={css({
                  w: 'full',
                  gap: '2',
                  bg: 'red.600',
                  _hover: { bg: 'red.700' },
                })}
              >
                <Download className={css({ h: '4', w: '4' })} />
                Download Processed File
              </Button>
              <Button variant="outline" onClick={onClose} className={css({ w: 'full' })}>
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
