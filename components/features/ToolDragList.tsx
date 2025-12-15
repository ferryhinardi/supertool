'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { ToolDragItem } from '@/lib/tool-components-types'
import { css } from '@/styled-system/css'

interface ToolDragListProps<T extends ToolDragItem> {
  /** List of items to render */
  items: T[]
  /** Callback when items are reordered */
  onReorder: (items: T[]) => void
  /** Render function for each item */
  renderItem: (item: T, isDragging: boolean) => React.ReactNode
  /** Key extractor function */
  keyExtractor?: (item: T) => string
  /** Custom drag handle render */
  renderHandle?: (isDragging: boolean) => React.ReactNode
  /** Show drag handle */
  showHandle?: boolean
  /** Disabled state */
  disabled?: boolean
}

/**
 * ToolDragList Component
 *
 * A reusable drag-and-drop list with keyboard accessibility.
 * Uses @dnd-kit for smooth drag interactions.
 *
 * @example
 * <ToolDragList
 *   items={files}
 *   onReorder={setFiles}
 *   renderItem={(file, isDragging) => (
 *     <div className={isDragging ? 'opacity-50' : ''}>
 *       <h4>{file.name}</h4>
 *       <p>{file.size} bytes</p>
 *     </div>
 *   )}
 *   keyExtractor={(file) => file.id}
 *   showHandle
 * />
 */
export function ToolDragList<T extends ToolDragItem>({
  items,
  onReorder,
  renderItem,
  keyExtractor = (item) => item.id,
  renderHandle,
  showHandle = true,
  disabled = false,
}: ToolDragListProps<T>) {
  // Configure sensors for drag interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => keyExtractor(item) === active.id)
      const newIndex = items.findIndex((item) => keyExtractor(item) === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(items, oldIndex, newIndex)
        onReorder(reorderedItems)
      }
    }
  }

  if (disabled) {
    // Render non-draggable list when disabled
    return (
      <div className={css({ spaceY: '3' })}>
        {items.map((item) => (
          <div
            key={keyExtractor(item)}
            className={css({
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.800/50',
              p: '4',
              opacity: 0.6,
            })}
          >
            {renderItem(item, false)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(keyExtractor)} strategy={verticalListSortingStrategy}>
        <div className={css({ spaceY: '3' })}>
          {items.map((item) => (
            <SortableItem
              key={keyExtractor(item)}
              id={keyExtractor(item)}
              item={item}
              renderItem={renderItem}
              renderHandle={renderHandle}
              showHandle={showHandle}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

/**
 * Individual Sortable Item
 */
interface SortableItemProps<T extends ToolDragItem> {
  id: string
  item: T
  renderItem: (item: T, isDragging: boolean) => React.ReactNode
  renderHandle?: (isDragging: boolean) => React.ReactNode
  showHandle: boolean
}

function SortableItem<T extends ToolDragItem>({
  id,
  item,
  renderItem,
  renderHandle,
  showHandle,
}: SortableItemProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={css({
        position: 'relative',
        rounded: 'lg',
        border: '1px solid',
        borderColor: isDragging ? 'blue.500' : 'gray.700',
        bg: isDragging ? 'gray.800/80' : 'gray.800/50',
        opacity: isDragging ? 0.8 : 1,
        shadow: isDragging ? 'lg' : 'none',
        transition: 'all 0.2s',
        _hover: {
          borderColor: 'gray.600',
          bg: 'gray.800/70',
        },
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '3',
          p: '4',
        })}
      >
        {/* Drag Handle */}
        {showHandle && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className={css({
              flexShrink: 0,
              cursor: isDragging ? 'grabbing' : 'grab',
              color: isDragging ? 'blue.400' : 'gray.500',
              transition: 'color 0.2s',
              appearance: 'none',
              bg: 'transparent',
              border: 'none',
              p: 0,
              _hover: {
                color: 'gray.400',
              },
              _active: {
                color: 'blue.400',
              },
            })}
            aria-label="Drag to reorder"
          >
            {renderHandle ? (
              renderHandle(isDragging)
            ) : (
              <GripVertical
                className={css({
                  h: '5',
                  w: '5',
                })}
              />
            )}
          </button>
        )}

        {/* Item Content */}
        <div className={css({ flex: '1', minW: '0' })}>{renderItem(item, isDragging)}</div>
      </div>
    </div>
  )
}
