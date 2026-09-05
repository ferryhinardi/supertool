# Tool Component Library - Documentation

## Overview

This library provides 6 reusable UI components for building consistent, accessible tool interfaces across the SuperTool platform. All components follow the design patterns established in the PDF Tools implementation.

**Created**: December 14, 2025  
**Last Updated**: December 14, 2025  
**Version**: 1.0.0

---

## Installation & Usage

### Import Components

```typescript
// Import individual components
import { ToolOperationGrid } from '@/components/features/tool-components'
import { ToolEmptyState } from '@/components/features/tool-components'
import { ToolProcessingModal } from '@/components/features/tool-components'
import { ToolKeyboardShortcuts } from '@/components/features/tool-components'
import { ToolMobilePicker } from '@/components/features/tool-components'
import { ToolDragList } from '@/components/features/tool-components'

// Import types
import type { ToolOperation, ToolOperationCategory } from '@/components/features/tool-components'

// Import constants
import { TOOL_ANIMATIONS, TOOL_LAYOUT, TOOL_COLORS } from '@/components/features/tool-components'
```

---

## Component 1: ToolOperationGrid

**Purpose**: Display multiple operations/modes in a responsive grid with visual feedback.

### Props

```typescript
interface ToolOperationGridProps {
  operations?: ToolOperation[]              // Flat list of operations
  categories?: ToolOperationCategory[]      // Categorized operations
  selectedOperation: string                 // Current selection ID
  onOperationChange: (id: string) => void  // Selection callback
  disabled?: boolean                        // Disable all operations
  columns?: ToolGridLayout                  // Custom grid layout
  showCategories?: boolean                  // Show category labels
  analyticsCategory?: string                // Analytics category name
}
```

### Example 1: Flat Operations

```typescript
import { ToolOperationGrid } from '@/components/features/tool-components'
import { Code, Minimize2, FileJson } from 'lucide-react'

const operations = [
  { 
    id: 'format', 
    label: 'Format', 
    icon: Code, 
    color: '#3b82f6', 
    description: 'Beautify JSON with indentation' 
  },
  { 
    id: 'minify', 
    label: 'Minify', 
    icon: Minimize2, 
    color: '#10b981', 
    description: 'Compress JSON to single line',
    badge: 'Fast' 
  },
  { 
    id: 'validate', 
    label: 'Validate', 
    icon: FileJson, 
    color: '#f59e0b', 
    description: 'Check JSON syntax',
    shortcut: 'Ctrl+V'
  },
]

function JSONTool() {
  const [mode, setMode] = useState('format')

  return (
    <ToolOperationGrid
      operations={operations}
      selectedOperation={mode}
      onOperationChange={setMode}
      analyticsCategory="json_tool"
    />
  )
}
```

### Example 2: Categorized Operations

```typescript
const categories = [
  {
    id: 'transform',
    label: 'Transform',
    operations: [
      { id: 'uppercase', label: 'Uppercase', icon: ArrowUp, color: '#3b82f6', description: 'Convert to uppercase' },
      { id: 'lowercase', label: 'Lowercase', icon: ArrowDown, color: '#10b981', description: 'Convert to lowercase' },
    ],
  },
  {
    id: 'encode',
    label: 'Encode/Decode',
    operations: [
      { id: 'base64', label: 'Base64', icon: Lock, color: '#f59e0b', description: 'Encode to Base64' },
      { id: 'url', label: 'URL', icon: Link, color: '#ef4444', description: 'URL encode' },
    ],
  },
]

<ToolOperationGrid
  categories={categories}
  selectedOperation={mode}
  onOperationChange={setMode}
  showCategories
  columns={{ base: 1, sm: 2, lg: 3 }}
/>
```

---

## Component 2: ToolEmptyState

**Purpose**: Display helpful onboarding when no data/input is present.

### Props

```typescript
interface ToolEmptyStateProps {
  icon: LucideIcon              // Icon to display
  title: string                 // Main heading
  description: string           // Supporting text
  tips?: string[]              // Helpful tips list
  actionLabel?: string         // CTA button text
  onAction?: () => void        // CTA callback
  color?: string               // Color theme (hex)
}
```

### Example

```typescript
import { ToolEmptyState } from '@/components/features/tool-components'
import { FileText } from 'lucide-react'

function FileProcessor() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <ToolEmptyState
      icon={FileText}
      title="No Files Uploaded"
      description="Upload files to start processing"
      tips={[
        'Drag and drop files here',
        'Or click the upload button below',
        'Supports PDF, JPG, PNG formats',
        'Maximum 10 files at once'
      ]}
      actionLabel="Upload Files"
      onAction={() => fileInputRef.current?.click()}
      color="#ef4444"
    />
  )
}
```

---

## Component 3: ToolProcessingModal

**Purpose**: Show processing progress with status updates and cancellation.

### Props

```typescript
interface ToolProcessingModalProps extends ToolProcessingState {
  onClose?: () => void              // Close handler
  onCancel?: () => void             // Cancel handler
  color?: string                    // Progress color (hex)
  showCloseButton?: boolean         // Show close button
}

interface ToolProcessingState {
  isProcessing: boolean
  progress: number                  // 0-100
  status: string
  fileName?: string
  estimatedTime?: string
  cancellable?: boolean
  error?: string
}
```

### Example

```typescript
import { ToolProcessingModal } from '@/components/features/tool-components'

function FileConverter() {
  const [processing, setProcessing] = useState<ToolProcessingState>({
    isProcessing: false,
    progress: 0,
    status: 'Idle',
  })

  const handleConvert = async () => {
    setProcessing({
      isProcessing: true,
      progress: 0,
      status: 'Preparing files...',
      fileName: 'document.pdf',
      estimatedTime: '2 minutes',
      cancellable: true,
    })

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setProcessing(prev => ({
          ...prev,
          progress: i,
          status: i < 100 ? 'Converting...' : 'Complete!',
        }))
      }
    } catch (err) {
      setProcessing(prev => ({
        ...prev,
        error: 'Conversion failed: ' + err.message,
      }))
    }
  }

  return (
    <>
      <button onClick={handleConvert}>Convert</button>
      
      <ToolProcessingModal
        {...processing}
        onClose={() => setProcessing(prev => ({ ...prev, isProcessing: false }))}
        onCancel={() => {
          setProcessing(prev => ({ ...prev, isProcessing: false }))
          console.log('Cancelled')
        }}
        color="#ef4444"
      />
    </>
  )
}
```

---

## Component 4: ToolKeyboardShortcuts

**Purpose**: Display keyboard shortcuts in an accessible modal dialog.

### Props

```typescript
interface ToolKeyboardShortcutsProps {
  shortcuts: ToolKeyboardShortcut[]
  trigger?: React.ReactNode        // Custom trigger button
  title?: string                   // Dialog title
  filterByPlatform?: boolean       // Show platform-specific only
}

interface ToolKeyboardShortcut {
  key: string                      // e.g., "Ctrl+S"
  description: string
  category?: string                // Grouping category
  platform?: 'mac' | 'windows' | 'linux' | 'all'
}
```

### Example

```typescript
import { ToolKeyboardShortcuts } from '@/components/features/tool-components'

const shortcuts = [
  { key: 'Ctrl+S', description: 'Save file', category: 'File Operations' },
  { key: 'Ctrl+O', description: 'Open file', category: 'File Operations' },
  { key: 'Ctrl+Z', description: 'Undo', category: 'Editing' },
  { key: 'Ctrl+Y', description: 'Redo', category: 'Editing' },
  { key: 'Ctrl+F', description: 'Find', category: 'Search' },
  { key: 'Ctrl+K', description: 'Command palette', category: 'Navigation' },
]

function TextEditor() {
  return (
    <div>
      <ToolKeyboardShortcuts
        shortcuts={shortcuts}
        title="Keyboard Shortcuts"
        filterByPlatform
      />
    </div>
  )
}
```

---

## Component 5: ToolMobilePicker

**Purpose**: Mobile-optimized bottom sheet for selections.

### Props

```typescript
interface ToolMobilePickerProps {
  label: string                    // Button label
  title: string                    // Dialog title
  description?: string             // Dialog description
  children: React.ReactNode        // Dialog content
  disabled?: boolean
  color?: string                   // Theme color (hex)
}
```

### Example

```typescript
import { ToolMobilePicker } from '@/components/features/tool-components'
import { ToolOperationGrid } from '@/components/features/tool-components'

function MobileToolSelector() {
  const [selected, setSelected] = useState('merge')
  
  const getLabel = () => {
    const op = operations.find(o => o.id === selected)
    return op?.label || 'Select Operation'
  }

  return (
    <div className="md:hidden">
      <ToolMobilePicker
        label={`Operation: ${getLabel()}`}
        title="Choose Operation"
        description="Select a PDF operation to perform"
        color="#ef4444"
      >
        <ToolOperationGrid
          operations={operations}
          selectedOperation={selected}
          onOperationChange={setSelected}
        />
      </ToolMobilePicker>
    </div>
  )
}
```

---

## Component 6: ToolDragList

**Purpose**: Drag-and-drop reorderable list with keyboard support.

### Props

```typescript
interface ToolDragListProps<T extends ToolDragItem> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, isDragging: boolean) => React.ReactNode
  keyExtractor?: (item: T) => string
  renderHandle?: (isDragging: boolean) => React.ReactNode
  showHandle?: boolean
  disabled?: boolean
}

interface ToolDragItem {
  id: string
  [key: string]: any
}
```

### Example

```typescript
import { ToolDragList } from '@/components/features/tool-components'

interface File {
  id: string
  name: string
  size: number
}

function FileList() {
  const [files, setFiles] = useState<File[]>([
    { id: '1', name: 'document.pdf', size: 1024 },
    { id: '2', name: 'image.jpg', size: 2048 },
    { id: '3', name: 'data.csv', size: 512 },
  ])

  return (
    <ToolDragList
      items={files}
      onReorder={setFiles}
      renderItem={(file, isDragging) => (
        <div className={isDragging ? 'opacity-50' : ''}>
          <h4 className="font-semibold">{file.name}</h4>
          <p className="text-sm text-gray-500">{file.size} bytes</p>
        </div>
      )}
      keyExtractor={(file) => file.id}
      showHandle
    />
  )
}
```

---

## Design Tokens

### Animations

```typescript
import { TOOL_ANIMATIONS } from '@/components/features/tool-components'

// Usage in motion components
<motion.div {...TOOL_ANIMATIONS.fadeIn}>
<motion.div {...TOOL_ANIMATIONS.fadeInFast}>
<motion.div {...TOOL_ANIMATIONS.stagger(0.1)}>
<motion.div {...TOOL_ANIMATIONS.bottomSheet}>
<motion.div {...TOOL_ANIMATIONS.scale}>
<motion.div {...TOOL_ANIMATIONS.slideIn}>
```

### Layout

```typescript
import { TOOL_LAYOUT } from '@/components/features/tool-components'

// Page container
<main className={css(TOOL_LAYOUT.page)}>

// Card styles
<Card className={css(TOOL_LAYOUT.card)}>

// Grid layout
<div className={css(TOOL_LAYOUT.grid)}>
```

### Colors

```typescript
import { TOOL_COLORS } from '@/components/features/tool-components'

const myOperation = {
  id: 'merge',
  color: TOOL_COLORS.primary,    // #ef4444
  icon: Merge,
}
```

### Touch Targets

```typescript
import { TOUCH_TARGET } from '@/components/features/tool-components'

<button style={{ minHeight: TOUCH_TARGET.minHeight }}>
```

---

## Best Practices

### 1. Always Use Empty States

```typescript
{files.length === 0 ? (
  <ToolEmptyState
    icon={FileText}
    title="No Files"
    description="Upload files to get started"
    tips={['Tip 1', 'Tip 2']}
  />
) : (
  <FileGrid files={files} />
)}
```

### 2. Track Analytics

```typescript
<ToolOperationGrid
  operations={ops}
  selectedOperation={mode}
  onOperationChange={setMode}
  analyticsCategory="my_tool_name"  // Always provide this
/>
```

### 3. Mobile-First Responsive

```typescript
{/* Desktop: Show grid directly */}
<div className="hidden md:block">
  <ToolOperationGrid operations={ops} selected={mode} onChange={setMode} />
</div>

{/* Mobile: Use bottom sheet picker */}
<div className="md:hidden">
  <ToolMobilePicker label={`Mode: ${modeLabel}`} title="Choose Mode">
    <ToolOperationGrid operations={ops} selected={mode} onChange={setMode} />
  </ToolMobilePicker>
</div>
```

### 4. Accessibility

- All components support keyboard navigation
- ARIA labels are included
- Touch targets meet 44px minimum
- Color contrast is WCAG AA compliant

### 5. Error Handling

```typescript
<ToolProcessingModal
  isProcessing={processing}
  progress={progress}
  status="Processing..."
  error={error}  // Show error state
  onClose={() => setError(null)}
/>
```

---

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react'
import { ToolEmptyState } from '@/components/features/tool-components'
import { FileText } from 'lucide-react'

test('renders empty state', () => {
  render(
    <ToolEmptyState
      icon={FileText}
      title="No Files"
      description="Upload to start"
    />
  )
  
  expect(screen.getByText('No Files')).toBeInTheDocument()
})
```

---

## Migration Guide

### From PDF Tools Components

If you're currently using PDF Tools components directly:

**Before:**
```typescript
import { OperationGrid } from '@/app/tools/pdf-tools/components/OperationGrid'
```

**After:**
```typescript
import { ToolOperationGrid } from '@/components/features/tool-components'
```

---

## Roadmap

### v1.1 (Q1 2026)
- [ ] ToolFileUploader component
- [ ] ToolResultsPanel component
- [ ] ToolSettingsDialog component

### v1.2 (Q2 2026)
- [ ] Dark/light mode support
- [ ] Custom theming API
- [ ] Storybook integration

---

## Support

- **Issues**: Open on GitHub
- **Questions**: Create a discussion
- **Contributions**: See CONTRIBUTING.md

---

## License

MIT - See LICENSE file for details
