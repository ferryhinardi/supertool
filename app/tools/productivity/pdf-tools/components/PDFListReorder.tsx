import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { css } from '@/styled-system/css'
import { PDFThumbnail } from './PDFThumbnail'

interface PDFFile {
  id: string
  file: File
  name: string
  size: number
  pages: number
}

interface PDFListReorderProps {
  pdfs: PDFFile[]
  onReorder: (newOrder: PDFFile[]) => void
  onRemove: (id: string) => void
}

function SortablePDFItem({ pdf, onRemove }: { pdf: PDFFile; onRemove: (id: string) => void }) {
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
        borderColor: isDragging ? 'red.500' : 'gray.800',
        bg: isDragging ? 'gray.800' : 'gray.900/80',
        cursor: 'move',
        transition: 'all 0.2s',
        _hover: {
          borderColor: 'red.500/50',
        },
      })}
    >
      <div {...attributes} {...listeners} className={css({ cursor: 'grab', color: 'white' })}>
        <GripVertical className={css({ h: '5', w: '5' })} />
      </div>

      <PDFThumbnail file={pdf.file} width={60} height={75} />

      <div className={css({ flex: '1', minW: '0' })}>
        <p
          className={css({
            fontSize: 'sm',
            fontWeight: 'medium',
            color: 'gray.200',
            truncate: true,
          })}
        >
          {pdf.name}
        </p>
        <p className={css({ fontSize: 'xs', color: 'white' })}>{pdf.pages} pages</p>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(pdf.id)}
        className={css({
          color: 'red.400',
          _hover: { bg: 'red.500/20' },
        })}
      >
        <Trash2 className={css({ h: '4', w: '4' })} />
      </Button>
    </div>
  )
}

export function PDFListReorder({ pdfs, onReorder, onRemove }: PDFListReorderProps) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
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
            <SortablePDFItem key={pdf.id} pdf={pdf} onRemove={onRemove} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
