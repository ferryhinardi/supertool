import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { css } from '@/styled-system/css'
import { PDFThumbnail } from './PDFThumbnail'

interface PDFFile {
  id: string
  file: File
  name: string
  size: number
  pages: number
}

interface PDFReorderListProps {
  pdfs: PDFFile[]
  onReorder: (newOrder: PDFFile[]) => void
}

function SortablePDFItem({ pdf }: { pdf: PDFFile }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pdf.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        p: '3',
        rounded: 'lg',
        border: '1px solid',
        borderColor: isDragging ? 'red.500/50' : 'gray.800',
        bg: isDragging ? 'red.500/10' : 'gray.900/80',
        cursor: 'move',
        _hover: {
          borderColor: 'red.500/30',
          bg: 'gray.900',
        },
      })}
    >
      <div
        {...attributes}
        {...listeners}
        className={css({
          cursor: 'grab',
          color: 'gray.400',
          _hover: { color: 'red.400' },
        })}
      >
        <GripVertical
          className={css({
            h: '5',
            w: '5',
          })}
        />
      </div>

      <PDFThumbnail file={pdf.file} />

      <div className={css({ minW: '0', flex: '1' })}>
        <p
          className={css({
            truncate: true,
            fontSize: 'sm',
            fontWeight: 'medium',
            color: 'gray.200',
          })}
        >
          {pdf.name}
        </p>
        <p
          className={css({
            fontSize: 'xs',
            color: 'gray.500',
          })}
        >
          {pdf.pages} pages
        </p>
      </div>
    </div>
  )
}

export function PDFReorderList({ pdfs, onReorder }: PDFReorderListProps) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: {
    active: { id: string | number }
    over: { id: string | number } | null
  }) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = pdfs.findIndex((pdf) => pdf.id === active.id)
      const newIndex = pdfs.findIndex((pdf) => pdf.id === over.id)
      const newOrder = arrayMove(pdfs, oldIndex, newIndex)
      onReorder(newOrder)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pdfs.map((pdf) => pdf.id)} strategy={verticalListSortingStrategy}>
        <div className={css({ spaceY: '2' })}>
          {pdfs.map((pdf) => (
            <SortablePDFItem key={pdf.id} pdf={pdf} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
