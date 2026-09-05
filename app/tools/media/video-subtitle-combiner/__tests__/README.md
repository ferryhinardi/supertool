# Video Subtitle Combiner - Test Suite Documentation

## Overview
Comprehensive test suite for the Video Subtitle Combiner tool, covering upload functionality, file validation, API integration, and browser interactions.

## Test Files Created

### 1. `upload.test.tsx` - Upload Function Tests
**Location**: `app/tools/video-subtitle-combiner/__tests__/upload.test.tsx`

**Purpose**: Unit and integration tests for upload functionality using @testing-library/react

**Test Coverage**:
- **Server Status Check** (4 tests)
  - Server availability on mount
  - Ready state transitions
  - Error state handling
  - Checking state display

- **Video File Upload** (4 tests)
  - Valid video file acceptance
  - Invalid file type rejection
  - File size limit validation (500MB)
  - File size display formatting

- **Subtitle File Upload** (3 tests)
  - SRT format validation
  - VTT format support
  - Timecode validation (`-->` requirement)

- **Process Button State** (5 tests)
  - Disabled when no files
  - Disabled with only video
  - Disabled with only subtitle
  - Enabled with both files
  - Disabled when server not ready

- **Video Processing** (4 tests)
  - API call with correct parameters
  - Processing state UI
  - Error handling and display
  - Success state and completion

- **Subtitle Styling Options** (1 test)
  - Styling parameters in API request

**Total**: 21 comprehensive tests

---

### 2. `page.integration.test.tsx` - Browser Integration Tests
**Location**: `app/tools/video-subtitle-combiner/__tests__/page.integration.test.tsx`

**Purpose**: Full browser environment integration tests with complete user workflows

**Test Coverage**:
- **Page Rendering** (3 tests)
  - Error-free rendering
  - All main sections present
  - Accessibility attributes

- **Server Status Integration** (5 tests)
  - Mount-time status check
  - Loading state
  - Ready state transition
  - Error state handling
  - Network error resilience

- **File Upload Integration** (5 tests)
  - Video file drag-and-drop
  - Subtitle file upload
  - Video type validation
  - Video size validation  
  - Subtitle format validation

- **Subtitle Styling Controls** (4 tests)
  - Font size slider
  - Font color picker
  - Background opacity
  - Position buttons (Top/Center/Bottom)

- **Video Processing Workflow** (5 tests)
  - Process button enable state
  - Full processing flow
  - Error handling
  - Download functionality
  - Completion state

- **File Management** (2 tests)
  - Individual file removal
  - Clear all functionality

- **Responsive Behavior** (3 tests)
  - Mobile viewport (375px)
  - Tablet viewport (768px)
  - Desktop viewport (1920px)

- **Keyboard Navigation** (1 test)
  - Tab navigation support

- **Memory Management** (1 test)
  - Object URL cleanup

**Total**: 29 comprehensive integration tests

---

## Running the Tests

### Run All Tests
```bash
pnpm test
```

### Run Specific Test File
```bash
# Upload tests only
pnpm test -- app/tools/video-subtitle-combiner/__tests__/upload.test.tsx

# Integration tests only
pnpm test -- app/tools/video-subtitle-combiner/__tests__/page.integration.test.tsx
```

### Run in CI Mode (no watch)
```bash
CI=true pnpm test
```

### Run with Coverage
```bash
pnpm test -- --coverage
```

---

## Test Architecture

### Mocking Strategy

**1. API Mocking**
```typescript
global.fetch = mockFetch as any
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ status: 'ok', ffmpeg: 'installed' }),
})
```

**2. Browser APIs**
```typescript
URL.createObjectURL = vi.fn(() => 'blob:mock-url')
URL.revokeObjectURL = vi.fn()
window.alert = vi.fn()
```

**3. Icon Components**
```typescript
vi.mock('lucide-react', () => ({
  Video: createMockIcon('Video'),
  FileText: createMockIcon('FileText'),
  // ... other icons
}))
```

**4. Animation Library**
```typescript
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))
```

---

## Key Test Patterns

### 1. File Upload Testing
```typescript
const videoFile = new File(['video content'], 'test-video.mp4', {
  type: 'video/mp4',
})
const fileInput = screen.getAllByLabelText(/File upload/i)[0]
await user.upload(fileInput, videoFile)
```

### 2. Validation Testing
```typescript
// Size validation
Object.defineProperty(largeFile, 'size', { value: 600 * 1024 * 1024 })
await user.upload(fileInput, largeFile)
expect(window.alert).toHaveBeenCalledWith(
  expect.stringContaining('exceeds the')
)
```

### 3. Async State Testing
```typescript
await waitFor(() => {
  expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
})
```

### 4. Error Handling
```typescript
mockFetch.mockResolvedValueOnce({
  ok: false,
  json: async () => ({ error: 'FFmpeg processing failed' }),
})
// ... trigger action
await waitFor(() => {
  expect(screen.getByText(/FFmpeg processing failed/i)).toBeInTheDocument()
})
```

---

## Coverage Goals

### Target Coverage
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

### Critical Paths Covered
✅ Server status checking
✅ File upload and validation
✅ Video processing workflow
✅ Error handling at all levels
✅ User interactions (clicks, uploads, downloads)
✅ State transitions
✅ Responsive behavior
✅ Accessibility features
✅ Memory cleanup

---

## Test Dependencies

```json
{
  "@testing-library/react": "^16.0.1",
  "@testing-library/user-event": "^14.5.2",
  "vitest": "^4.0.13",
  "@vitest/browser-playwright": "^4.0.13",
  "jsdom": "^25.0.1"
}
```

---

## Troubleshooting

### Tests Time Out
- **Solution**: Increase timeout in `vitest.config.mts`
- Current: `testTimeout: 60000` (60 seconds)

### Mock Not Working
- **Solution**: Ensure mocks are defined before imports
- Use `vi.mock()` at top of file

### File Upload Not Triggering
- **Solution**: Check that `DragDropZone` is not disabled
- Verify server status is 'ready'

### Async Assertions Failing
- **Solution**: Always use `waitFor()` for async operations
- Don't assert immediately after async actions

---

## Best Practices

1. **Always clean up mocks**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks()
   })
   ```

2. **Use semantic queries**
   ```typescript
   screen.getByRole('button', { name: /Burn Subtitles/i })
   ```

3. **Test user behavior, not implementation**
   ```typescript
   // Good: Test what user sees
   expect(screen.getByText('Completed')).toBeInTheDocument()
   
   // Bad: Test internal state
   expect(component.state.status).toBe('completed')
   ```

4. **Mock at the right level**
   - Mock external APIs (fetch)
   - Don't mock internal components unless necessary

5. **Write descriptive test names**
   ```typescript
   it('should reject video file exceeding size limit', async () => {
     // ...
   })
   ```

---

## Future Improvements

### Potential Additions
- [ ] Visual regression tests for UI components
- [ ] E2E tests with real browser (Playwright)
- [ ] Performance benchmarks for large files
- [ ] Test coverage for edge cases (network interruptions)
- [ ] Accessibility audit tests (axe-core)

### Known Limitations
- **File size testing**: Uses mock size properties (not actual large files)
- **Video processing**: Mocked (doesn't test actual FFmpeg)
- **Network conditions**: Not simulated (slow connections, timeouts)

---

## Contributing

When adding new features, please:
1. Add corresponding tests
2. Maintain >80% coverage
3. Follow existing test patterns
4. Update this documentation

---

## Related Documentation
- [VIDEO_SUBTITLE_COMBINER_IMPLEMENTATION.md](../../../../../docs/archive/VIDEO_SUBTITLE_COMBINER_IMPLEMENTATION.md) - Implementation guide
- [API Route Documentation](../../../../../app/api/video-subtitle/route.ts) - API implementation
- [Component Documentation](../page.tsx) - Main component

---

**Last Updated**: 2025-11-30
**Test Suite Version**: 1.0.0
**Total Tests**: 50 tests across 2 files
