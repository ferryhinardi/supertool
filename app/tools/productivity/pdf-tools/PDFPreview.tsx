'use client'

import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { css } from '@/styled-system/css'

interface PDFPreviewProps {
  file: File
}

export function PDFPreview({ file }: PDFPreviewProps) {
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

        if (cancelled) return

        // Render first page as thumbnail
        const page = await pdfDoc.getPage(1)
        const viewport = page.getViewport({ scale: 0.5 })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Could not get canvas context')

        canvas.height = viewport.height
        canvas.width = viewport.width

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
          h: '20',
          w: '20',
          flexShrink: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          rounded: 'lg',
          bg: 'gray.800',
        })}
      >
        <div
          className={css({
            h: '4',
            w: '4',
            rounded: 'full',
            border: '2px solid',
            borderColor: 'red.400',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          })}
        />
      </div>
    )
  }

  if (error || !thumbnail) {
    return (
      <div
        className={css({
          h: '20',
          w: '20',
          flexShrink: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          rounded: 'lg',
          bg: 'gray.800',
        })}
      >
        <FileText
          className={css({
            h: '8',
            w: '8',
            color: 'gray.400',
          })}
        />
      </div>
    )
  }

  return (
    <div
      className={css({
        h: '20',
        w: '20',
        flexShrink: '0',
        rounded: 'lg',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'gray.700',
        bg: 'gray.800',
      })}
    >
      <img
        src={thumbnail}
        alt="PDF preview"
        className={css({
          h: 'full',
          w: 'full',
          objectFit: 'cover',
        })}
      />
    </div>
  )
}
