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
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const generateThumbnail = async () => {
      try {
        const pdfjs = await import('pdfjs-dist')

        if (typeof window !== 'undefined') {
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.mjs',
            import.meta.url
          ).toString()
        }

        const arrayBuffer = await file.arrayBuffer()
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
        const pdfDoc = await loadingTask.promise

        // Render first page
        const page = await pdfDoc.getPage(1)
        const viewport = page.getViewport({ scale: 0.5 })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Could not get canvas context')

        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise

        if (!cancelled) {
          setThumbnail(canvas.toDataURL('image/jpeg', 0.7))
          setLoading(false)
        }
      } catch (err) {
        console.error('Error generating thumbnail:', err)
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    generateThumbnail()

    return () => {
      cancelled = true
    }
  }, [file])

  if (loading) {
    return (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          rounded: 'md',
          bg: 'gray.800',
          animation: 'pulse',
        })}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <FileText className={css({ h: '6', w: '6', color: 'gray.600' })} />
      </div>
    )
  }

  if (error || !thumbnail) {
    return (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          rounded: 'md',
          bg: 'gray.800',
        })}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <FileText className={css({ h: '6', w: '6', color: 'gray.500' })} />
      </div>
    )
  }

  return (
    <img
      src={thumbnail}
      alt="PDF thumbnail"
      className={css({
        rounded: 'md',
        objectFit: 'cover',
        border: '1px solid',
        borderColor: 'gray.700',
      })}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  )
}
