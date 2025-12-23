import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { css } from '@/styled-system/css'

interface PDFThumbnailProps {
  file: File
  width?: number
  height?: number
}

export function PDFThumbnail({ file, width = 80, height = 100 }: PDFThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function generateThumbnail() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        if (typeof window !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.mjs',
            import.meta.url
          ).toString()
        }

        const arrayBuffer = await file.arrayBuffer()
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdfDoc = await loadingTask.promise

        // Render first page as thumbnail
        const page = await pdfDoc.getPage(1)
        const viewport = page.getViewport({ scale: 0.5 })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) return

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise

        if (!cancelled) {
          setThumbnail(canvas.toDataURL('image/png'))
          setLoading(false)
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error)
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    generateThumbnail()

    return () => {
      cancelled = true
    }
  }, [file])

  if (loading || !thumbnail) {
    return (
      <div
        className={css({
          h: '16',
          w: '12',
          flexShrink: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          rounded: 'md',
          bg: 'gray.800',
          animation: 'pulse',
        })}
      >
        <FileText
          className={css({
            h: '6',
            w: '6',
            color: 'gray.400',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          })}
        />
      </div>
    )
  }

  return (
    <img
      src={thumbnail}
      alt="PDF preview"
      className={css({
        h: '16',
        w: '12',
        flexShrink: '0',
        rounded: 'md',
        objectFit: 'cover',
        border: '1px solid',
        borderColor: 'gray.700',
      })}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  )
}
