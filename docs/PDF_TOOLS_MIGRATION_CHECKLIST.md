# PDF Tools Migration Checklist

Use this checklist to integrate the new UI/UX components into your PDF Tools page.

---

## Pre-Migration Checklist

- [ ] **Backup current page:** Copy `app/tools/pdf-tools/page.tsx` to `page.tsx.backup`
- [ ] **Review components:** Check all new components in `app/tools/pdf-tools/components/`
- [ ] **Test build:** Run `pnpm build` to ensure no existing errors
- [ ] **Create feature branch:** `git checkout -b feat/pdf-tools-ui-improvements`

---

## Step-by-Step Migration

### ✅ Step 1: Add Imports (5 min)

**File:** `app/tools/pdf-tools/page.tsx`  
**Location:** After existing imports (around line 40)

```typescript
// Add these new imports
import { EmptyState } from './components/EmptyState'
import { KeyboardShortcutsDialog } from './components/KeyboardShortcutsDialog'
import { MobileOperationPicker } from './components/MobileOperationPicker'
import { OperationGrid } from './components/OperationGrid'
import { ProcessingModal } from './components/ProcessingModal'
import { ReorderablePDFList } from './components/ReorderablePDFList'
```

**Verification:**
```bash
pnpm exec tsc --noEmit  # Should have no import errors
```

---

### ✅ Step 2: Update Operation Selection (10 min)

**File:** `app/tools/pdf-tools/page.tsx`  
**Location:** Lines ~1693-1744 (inside Settings Panel CardContent)

**Find this code:**
```typescript
<div id="operation-select" className={css({ spaceY: '2' })}>
  {operations.map((op) => (
    <Button
      key={op.value}
      variant={operation === op.value ? 'default' : 'outline'}
      size="sm"
      onClick={() => {
        setOperation(op.value as OperationType)
        trackEvent({
          action: 'operation_changed',
          category: 'pdf_tools',
          label: op.value,
        })
      }}
      className={css({
        w: 'full',
        justifyContent: 'start',
        gap: '2',
        ...(operation === op.value
          ? {
              borderColor: 'red.500/50',
              bg: 'red.500/20',
              color: 'red.200',
            }
          : {
              borderColor: 'gray.700',
            }),
      })}
    >
      <op.icon className={css({ h: '4', w: '4' })} />
      {op.label}
    </Button>
  ))}
</div>
```

**Replace with:**
```typescript
{/* Desktop: Grid Layout */}
<div className={css({ display: { base: 'none', lg: 'block' } })}>
  <OperationGrid
    selectedOperation={operation}
    onOperationChange={setOperation}
    disabled={isProcessing}
  />
</div>

{/* Mobile: Bottom Sheet */}
<div className={css({ display: { base: 'block', lg: 'none' } })}>
  <MobileOperationPicker
    selectedOperation={operation}
    onOperationChange={setOperation}
    operationLabel={operations.find(op => op.value === operation)?.label || 'Select Operation'}
    disabled={isProcessing}
  />
</div>
```

**Verification:**
- [ ] Desktop: See categorized grid
- [ ] Mobile: See bottom sheet button
- [ ] Click operation: Should select and update settings panel

---

### ✅ Step 3: Replace File List (15 min)

**File:** `app/tools/pdf-tools/page.tsx`  
**Location:** Lines ~2382-2600 (PDF Files section in CardContent)

**Find this code:**
```typescript
<div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
  {/* Drag & Drop Zone */}
  {pdfs.length === 0 ? (
    <DragDropZone
      onFilesSelected={handleFilesSelected}
      accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
      maxSize={100 * 1024 * 1024}
      multiple
    />
  ) : (
    <>
      <DragDropZone
        onFilesSelected={handleFilesSelected}
        accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
        maxSize={100 * 1024 * 1024}
        multiple
        className={css({ py: '8' })}
      />

      <div className={css({ maxH: '[600px]', spaceY: '3', overflowY: 'auto', pr: '2' })}>
        <AnimatePresence>
          {pdfs.map((pdf) => (
            <motion.div key={pdf.id} ...>
              {/* Long file card code */}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )}
</div>
```

**Replace with:**
```typescript
<div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
  {pdfs.length === 0 ? (
    <>
      <DragDropZone
        onFilesSelected={handleFilesSelected}
        accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
        maxSize={100 * 1024 * 1024}
        multiple
      />
      <EmptyState
        operation={operation}
        onUploadClick={() => fileInputRef.current?.click()}
      />
    </>
  ) : (
    <>
      <DragDropZone
        onFilesSelected={handleFilesSelected}
        accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
        maxSize={100 * 1024 * 1024}
        multiple
        className={css({ py: '8' })}
      />
      <ReorderablePDFList
        pdfs={pdfs}
        onReorder={setPdfs}
        onRemove={handleRemove}
        onDownload={handleDownload}
        formatBytes={formatBytes}
        renderThumbnail={(pdf) => <PDFThumbnail file={pdf.file} />}
        disabled={isProcessing}
      />
    </>
  )}
</div>
```

**Verification:**
- [ ] Empty state: Shows operation-specific tips
- [ ] File list: Shows drag handles
- [ ] Drag files: Can reorder
- [ ] Remove file: Button works
- [ ] Download: Button appears when complete

---

### ✅ Step 4: Add Processing Modal (5 min)

**File:** `app/tools/pdf-tools/page.tsx`  
**Location:** Before closing `</main>` tag (end of return statement, around line 2812)

**Find:**
```typescript
      </motion.div>
    </main>
  )
}
```

**Replace with:**
```typescript
      </motion.div>

      {/* Processing Modal */}
      <ProcessingModal
        pdfs={pdfs}
        operation={operation}
        isOpen={isProcessing && pdfs.some(p => p.status === 'processing')}
        onClose={() => {
          if (pdfs.every(p => p.status !== 'processing')) {
            setIsProcessing(false)
          }
        }}
        canClose={pdfs.every(p => p.status !== 'processing')}
      />
    </main>
  )
}
```

**Verification:**
- [ ] Start processing: Modal appears
- [ ] Shows progress per file
- [ ] Confetti on completion
- [ ] Can close after complete

---

### ✅ Step 5: Add Keyboard Shortcuts (3 min)

**File:** `app/tools/pdf-tools/page.tsx`  
**Location:** Header section, after description (around line 1534)

**Find:**
```typescript
        <p className={css({ mx: 'auto', maxW: '2xl', fontSize: 'lg', color: 'gray.400' })}>
          Merge, split, compress, watermark, and convert PDFs. Convert images to PDF with powerful
          browser-based tools. 100% secure - all processing happens on your device.
        </p>
      </motion.div>
```

**Replace with:**
```typescript
        <p className={css({ mx: 'auto', maxW: '2xl', fontSize: 'lg', color: 'gray.400' })}>
          Merge, split, compress, watermark, and convert PDFs. Convert images to PDF with powerful
          browser-based tools. 100% secure - all processing happens on your device.
        </p>

        {/* Keyboard Shortcuts */}
        <div className={css({ display: 'flex', justifyContent: 'center', mt: '4' })}>
          <KeyboardShortcutsDialog />
        </div>
      </motion.div>
```

**Verification:**
- [ ] Button appears in header
- [ ] Click: Opens modal
- [ ] Shows all shortcuts
- [ ] ESC: Closes modal

---

## Post-Migration Testing

### Functional Tests

- [ ] **Upload Files**
  - [ ] Drag and drop works
  - [ ] Click to upload works
  - [ ] Multiple files accepted
  - [ ] Shows file cards

- [ ] **Reorder Files**
  - [ ] Can drag to reorder
  - [ ] Touch reorder works on mobile
  - [ ] Order persists

- [ ] **Operations**
  - [ ] Each operation selectable
  - [ ] Settings update per operation
  - [ ] Process button enabled/disabled correctly

- [ ] **Processing**
  - [ ] Modal shows during processing
  - [ ] Progress updates
  - [ ] Confetti on success
  - [ ] Can download after complete

- [ ] **Mobile**
  - [ ] Bottom sheet opens/closes
  - [ ] Operations selectable
  - [ ] Files manageable
  - [ ] Processing modal responsive

- [ ] **Keyboard**
  - [ ] Tab navigation works
  - [ ] All shortcuts functional
  - [ ] ESC closes modals
  - [ ] Focus visible

### Visual Tests

- [ ] Desktop (≥1024px): Operation grid 2-column
- [ ] Tablet (768-1023px): Operation grid adapts
- [ ] Mobile (<768px): Bottom sheet visible
- [ ] Colors match theme
- [ ] Animations smooth (60fps)
- [ ] No layout shifts

### Accessibility Tests

- [ ] Tab through all elements
- [ ] Screen reader announces changes
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA
- [ ] Touch targets ≥44px

### Browser Tests

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Rollback Plan (If Needed)

If issues arise, you can quickly rollback:

```bash
# 1. Restore backup
cp app/tools/pdf-tools/page.tsx.backup app/tools/pdf-tools/page.tsx

# 2. Verify build
pnpm build

# 3. Test locally
pnpm dev
```

**Or use git:**
```bash
git checkout main -- app/tools/pdf-tools/page.tsx
```

---

## Performance Checks

After migration, verify performance:

```bash
# 1. Check bundle size
pnpm build
# Look for pdf-tools page size (should be <300KB gzipped)

# 2. Run Lighthouse
# Open http://localhost:3000/tools/pdf-tools in Chrome
# DevTools > Lighthouse > Run audit
# Target scores:
#   Performance: >90
#   Accessibility: >95
#   Best Practices: >90
#   SEO: >90

# 3. Check for console errors
# Open DevTools > Console
# Should have no errors
```

---

## Common Issues & Solutions

### Issue 1: TypeScript Errors

**Error:** `Cannot find module './components/OperationGrid'`

**Solution:**
```bash
# Verify components exist
ls app/tools/pdf-tools/components/

# Should show:
# EmptyState.tsx
# KeyboardShortcutsDialog.tsx
# MobileOperationPicker.tsx
# OperationGrid.tsx
# ProcessingModal.tsx
# ReorderablePDFList.tsx
```

### Issue 2: Drag-and-Drop Not Working

**Error:** Files don't reorder when dragged

**Solution:**
- Check `@dnd-kit` is installed: `pnpm list @dnd-kit/core`
- Verify `setPdfs` is passed correctly
- Check browser console for errors

### Issue 3: Bottom Sheet Not Showing on Mobile

**Error:** Still see desktop grid on mobile

**Solution:**
- Check CSS breakpoint: `display: { base: 'block', lg: 'none' }`
- Verify `vaul` is installed: `pnpm list vaul`
- Test with DevTools mobile emulation

### Issue 4: Confetti Not Triggering

**Error:** No confetti on completion

**Solution:**
- Check `canvas-confetti` installed: `pnpm list canvas-confetti`
- Verify modal is open when processing completes
- Check browser blocks canvas (rare)

### Issue 5: Build Errors

**Error:** Build fails with type errors

**Solution:**
```bash
# Clean and rebuild
rm -rf .next
pnpm build

# Check TypeScript
pnpm exec tsc --noEmit
```

---

## Next Steps After Migration

1. **Monitor Analytics**
   - Track operation selection method (grid vs list)
   - Monitor task completion time
   - Check mobile usage increase

2. **Gather Feedback**
   - Ask users about new UI
   - Note any confusion points
   - Collect feature requests

3. **Plan Phase 2**
   - Preset system
   - Before/after comparison
   - Session recovery
   - Web Workers

4. **Optimize**
   - Add virtual scrolling if >100 files
   - Move processing to Web Worker
   - Lazy load heavy components

---

## Success Criteria

Migration is successful when:

- [ ] All tests pass
- [ ] No console errors
- [ ] Lighthouse score >90
- [ ] Mobile usable
- [ ] Keyboard navigation works
- [ ] Drag-and-drop smooth
- [ ] Processing feedback clear
- [ ] No regressions in existing features

---

## Support

**Need help?**
- Review: `docs/PDF_TOOLS_IMPLEMENTATION_COMPLETE.md`
- Check: `docs/PDF_TOOLS_UI_UX_IMPROVEMENT_PLAN.md`
- Test components in isolation first

**Found a bug?**
- Document the issue
- Check browser console
- Try rollback plan
- Review common issues above

---

**Estimated Migration Time:** 30-45 minutes  
**Difficulty:** Medium  
**Risk:** Low (backward compatible, easy rollback)

Good luck! 🚀
