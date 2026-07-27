import { render, screen } from '@testing-library/react'
import type * as React from 'react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ToolDragItem } from '@/lib/data/tool-components-types'

import { ToolDragList } from '../ToolDragList'

interface MockDragItem extends ToolDragItem {
  id: string
  label: string
}

const { mockArrayMove, mockUseSortable, recordedContext } = vi.hoisted(() => ({
  mockArrayMove: vi.fn((items: MockDragItem[], oldIndex: number, newIndex: number) => {
    const reordered = [...items]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    return reordered
  }),
  mockUseSortable: vi.fn((options: { id: string }) => ({
    attributes: { 'data-sortable-id': options.id },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: options.id.includes('dragging-item'),
  })),
  recordedContext: {
    onDragEnd: undefined as
      | ((event: { active: { id: string }; over: { id: string } | null }) => void)
      | undefined,
  },
}))

vi.mock('lucide-react', () => ({
  GripVertical: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="grip-icon" {...props} />
  ),
}))

vi.mock('@/styled-system/css', () => ({
  css: () => '',
}))

vi.mock('@dnd-kit/core', () => ({
  closestCenter: vi.fn(),
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode
    onDragEnd: (event: { active: { id: string }; over: { id: string } | null }) => void
  }) => {
    recordedContext.onDragEnd = onDragEnd
    return <div data-testid="dnd-context">{children}</div>
  },
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn((_sensor: unknown, options: unknown) => options),
  useSensors: vi.fn((...sensors: unknown[]) => sensors),
}))

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: mockArrayMove,
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: mockUseSortable,
  verticalListSortingStrategy: vi.fn(),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => undefined),
    },
  },
}))

const items: MockDragItem[] = [
  { id: 'item-1', label: 'First item' },
  { id: 'item-2', label: 'Second item' },
  { id: 'dragging-item', label: 'Dragging item' },
]

describe('ToolDragList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    recordedContext.onDragEnd = undefined
  })

  it('renders a static list when disabled', () => {
    render(
      <ToolDragList
        items={items}
        disabled
        onReorder={vi.fn()}
        renderItem={(item: MockDragItem) => <span>{item.label}</span>}
      />
    )

    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /drag to reorder/i })).not.toBeInTheDocument()
    expect(screen.queryByTestId('dnd-context')).not.toBeInTheDocument()
  })

  it('renders draggable items with a default handle and custom key extractor', () => {
    render(
      <ToolDragList<MockDragItem>
        items={items}
        onReorder={vi.fn()}
        keyExtractor={(item) => `${item.id}-key`}
        renderItem={(item, isDragging) => (
          <span>{isDragging ? `${item.label} (dragging)` : item.label}</span>
        )}
      />
    )

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /drag to reorder/i })).toHaveLength(3)
    expect(screen.getByText('Dragging item (dragging)')).toBeInTheDocument()
  })

  it('supports a custom drag handle renderer', () => {
    render(
      <ToolDragList<MockDragItem>
        items={items}
        onReorder={vi.fn()}
        renderHandle={(isDragging) => (
          <span>{isDragging ? 'custom-dragging-handle' : 'custom-handle'}</span>
        )}
        renderItem={(item) => <span>{item.label}</span>}
      />
    )

    expect(screen.getAllByText('custom-handle')).toHaveLength(2)
    expect(screen.getByText('custom-dragging-handle')).toBeInTheDocument()
  })

  it('reorders items when drag end moves an item to a new position', () => {
    const onReorder = vi.fn()

    render(
      <ToolDragList<MockDragItem>
        items={items}
        onReorder={onReorder}
        renderItem={(item) => <span>{item.label}</span>}
      />
    )

    act(() => {
      recordedContext.onDragEnd?.({
        active: { id: 'item-2' },
        over: { id: 'item-1' },
      })
    })

    expect(mockArrayMove).toHaveBeenCalledWith(items, 1, 0)
    expect(onReorder).toHaveBeenCalledWith([
      { id: 'item-2', label: 'Second item' },
      { id: 'item-1', label: 'First item' },
      { id: 'dragging-item', label: 'Dragging item' },
    ])
  })

  it('does not reorder when the drag ends on the same item or no target', () => {
    const onReorder = vi.fn()

    render(
      <ToolDragList<MockDragItem>
        items={items}
        onReorder={onReorder}
        renderItem={(item) => <span>{item.label}</span>}
      />
    )

    act(() => {
      recordedContext.onDragEnd?.({
        active: { id: 'item-1' },
        over: { id: 'item-1' },
      })
      recordedContext.onDragEnd?.({
        active: { id: 'item-1' },
        over: null,
      })
    })

    expect(mockArrayMove).not.toHaveBeenCalled()
    expect(onReorder).not.toHaveBeenCalled()
  })
})
