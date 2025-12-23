import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PDFPageThumbnails } from './PDFPageThumbnails'

interface PDFPageEditFlowProps {
  pdfFile: File
  onApply: (newOrder: number[]) => void
  onCancel: () => void
}

const PDFPageEditFlow: React.FC<PDFPageEditFlowProps> = ({ pdfFile, onApply, onCancel }) => {
  const [order, setOrder] = useState<number[]>([])
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, load the page count
  React.useEffect(() => {
    let cancelled = false
    import('pdfjs-dist').then(async (pdfjsLib) => {
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.mjs',
          import.meta.url
        ).toString()
      }
      const arrayBuffer = await pdfFile.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdfDoc = await loadingTask.promise
      if (!cancelled) {
        setPageCount(pdfDoc.numPages)
        setOrder(Array.from({ length: pdfDoc.numPages }, (_, i) => i))
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [pdfFile])

  const handleRemove = (pageIdx: number) => {
    setOrder((prev) => prev.filter((idx) => idx !== pageIdx))
  }

  if (loading || pageCount === null) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>Loading PDF pages...</div>
    )
  }

  return (
    <div
      style={{
        padding: 32,
        background: '#18181b',
        borderRadius: 12,
        maxWidth: 800,
        margin: '32px auto',
      }}
    >
      <h2 style={{ color: '#fff', fontSize: 22, marginBottom: 16 }}>Reorder or Remove Pages</h2>
      <PDFPageThumbnails
        pdfFile={pdfFile}
        order={order}
        onReorder={setOrder}
        onRemove={handleRemove}
      />
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
        <Button variant="outline" onClick={onCancel} style={{ minWidth: 100 }}>
          Cancel
        </Button>
        <Button onClick={() => onApply(order)} style={{ minWidth: 120 }}>
          Apply Changes
        </Button>
      </div>
    </div>
  )
}

export default PDFPageEditFlow
