import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2 } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'

interface PDFPageThumbnailsProps {
  pdfFile: File
  onReorder: (newOrder: number[]) => void
  onRemove: (pageIndex: number) => void
  order: number[]
}

// Helper to render a page thumbnail using pdfjs
const renderPageThumbnail = async (
  pdfjsLib: typeof import('pdfjs-dist'),
  pdfFile: File,
  pageNum: number
): Promise<string> => {
  const arrayBuffer = await pdfFile.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdfDoc = await loadingTask.promise
  const page = await pdfDoc.getPage(pageNum)
  const viewport = page.getViewport({ scale: 0.3 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not get 2D context from canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: context, canvas, viewport }).promise
  return canvas.toDataURL('image/png')
}

function SortableThumbnail({
  id,
  thumbnail,
  onRemove,
  index,
}: {
  id: number
  thumbnail: string
  onRemove: (index: number) => void
  index: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: isDragging ? '2px solid #f87171' : '1px solid #444',
    borderRadius: 8,
    background: '#18181b',
    marginBottom: 12,
    position: 'relative',
    width: 120,
    height: 160,
    overflow: 'hidden',
    boxShadow: isDragging ? '0 0 8px #f87171' : '0 1px 4px #222',
  } as React.CSSProperties
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img
        src={thumbnail}
        alt={`Page ${index + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          background: 'rgba(30,30,30,0.8)',
          border: 'none',
          borderRadius: '50%',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title="Remove page"
      >
        <Trash2 size={16} color="#f87171" />
      </button>
    </div>
  )
}

export const PDFPageThumbnails: React.FC<PDFPageThumbnailsProps> = ({
  pdfFile,
  onReorder,
  onRemove,
  order,
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [pdfjsLib, setPdfjsLib] = useState<typeof import('pdfjs-dist') | null>(null)

  useEffect(() => {
    // Dynamically import pdfjs-dist
    import('pdfjs-dist').then((module) => {
      if (typeof window !== 'undefined') {
        module.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${module.version}/build/pdf.worker.min.mjs`
      }
      setPdfjsLib(module)
    })
  }, [])

  useEffect(() => {
    if (!pdfjsLib) return
    let cancelled = false
    Promise.all(order.map((pageIdx) => renderPageThumbnail(pdfjsLib, pdfFile, pageIdx + 1))).then(
      (thumbs) => {
        if (!cancelled) setThumbnails(thumbs)
      }
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfjsLib, pdfFile, order])

  const sensors = useSensors(useSensor(PointerSensor))

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
          const oldIndex = order.indexOf(Number(active.id))
          const newIndex = order.indexOf(Number(over?.id))
          const newOrder = arrayMove(order, oldIndex, newIndex)
          onReorder(newOrder)
        }
      }}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
          {order.map((pageIdx, i) => (
            <SortableThumbnail
              key={pageIdx}
              id={pageIdx}
              thumbnail={thumbnails[i] || ''}
              onRemove={onRemove}
              index={pageIdx}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
