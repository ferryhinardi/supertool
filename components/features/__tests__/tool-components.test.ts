import { describe, expect, it } from 'vitest'
import {
  TOOL_COLORS,
  TOOL_LAYOUT,
  ToolDragList,
  ToolEmptyState,
  ToolKeyboardShortcuts,
  ToolMobilePicker,
  ToolOperationGrid,
  ToolProcessingModal,
} from '@/components/features/tool-components'

describe('tool-components barrel', () => {
  it('re-exports shared tool components and constants', () => {
    expect(ToolDragList).toBeTypeOf('function')
    expect(ToolEmptyState).toBeTypeOf('function')
    expect(ToolKeyboardShortcuts).toBeTypeOf('function')
    expect(ToolMobilePicker).toBeTypeOf('function')
    expect(ToolOperationGrid).toBeTypeOf('function')
    expect(ToolProcessingModal).toBeTypeOf('function')
    expect(TOOL_COLORS).toBeDefined()
    expect(TOOL_LAYOUT).toBeDefined()
  })
})
