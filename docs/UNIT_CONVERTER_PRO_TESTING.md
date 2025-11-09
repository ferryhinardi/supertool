# Unit Converter Pro - Manual Testing Guide

**Testing URL:** http://localhost:3000/tools/unit-converter

## Overview
This guide covers comprehensive manual testing for all three Unit Converter Pro features:
1. Conversion History
2. Enhanced Formula Display
3. Multi-Step Conversions

---

## Feature 1: Conversion History

### Test Cases

#### TC1.1: Basic History Saving
**Steps:**
1. Navigate to Unit Converter
2. Perform a conversion (e.g., 100 km to miles)
3. Perform another conversion (e.g., 50 kg to lbs)
4. Scroll down to "Conversion History" card (purple theme)
5. Verify both conversions appear in the history list

**Expected Results:**
- History shows both conversions with timestamps
- Most recent conversion is at the top
- Each entry shows: category badge, values with units, and timestamp

#### TC1.2: History Auto-Save (50 item limit)
**Steps:**
1. Perform 5 different conversions
2. Reload the page
3. Check history is still present

**Expected Results:**
- All 5 conversions persist after reload
- History is stored in localStorage

#### TC1.3: Export History to CSV
**Steps:**
1. Perform at least 3-5 conversions
2. Click "Export CSV" button in history card
3. Check downloaded file

**Expected Results:**
- CSV file downloads with name format: `unit-converter-history-YYYY-MM-DD.csv`
- File contains headers: Timestamp, Category, From Value, From Unit, To Value, To Unit
- All conversions are included with proper formatting
- Units show symbols (e.g., "km" not "kilometer")

#### TC1.4: Replay from History
**Steps:**
1. Perform a conversion (e.g., 100 °F to °C)
2. Change the inputs to something else
3. Click "Replay" button on the history item
4. Verify the main converter loads the saved values

**Expected Results:**
- Category changes to match history item
- From/To units update correctly
- Value is restored
- Conversion recalculates
- Toast notification: "Conversion loaded from history"

#### TC1.5: Clear History
**Steps:**
1. Have some conversions in history
2. Click "Clear History" button
3. Verify history is empty

**Expected Results:**
- History list becomes empty
- Toast notification: "History cleared"
- localStorage is cleared

#### TC1.6: Empty State
**Steps:**
1. Clear all history (or use incognito mode)
2. Check history card appearance

**Expected Results:**
- Shows History icon with message
- Shows "No conversions yet. Start converting to build your history."
- No export/clear buttons visible

---

## Feature 2: Enhanced Formula Display

### Test Cases

#### TC2.1: Formula Display - Temperature Conversions
**Steps:**
1. Select Temperature category
2. Convert 100°C to °F
3. Look for "Conversion Formula" section (blue theme)

**Expected Results:**
- Formula shown: `°F = (°C × 9/5) + 32`
- Quick reference shows: `1 °C = X °F`
- "Show Details" button is visible

#### TC2.2: Step-by-Step Calculation
**Steps:**
1. Perform same conversion (100°C to °F)
2. Click "Show Details" button
3. Verify step-by-step calculation appears

**Expected Results:**
- Section expands with animation
- Shows numbered steps:
  - Step 1: Multiply 100°C by 9/5 = 180
  - Step 2: Add 32 = 212°F
- Shows explanation of the formula
- Button text changes to "Hide Details"

#### TC2.3: Formula for Simple Unit Conversions
**Steps:**
1. Change to Length category
2. Convert 1 mile to kilometers
3. Check formula display

**Expected Results:**
- Formula shows conversion factor
- Step shows: `1 mi × 1.609344 = 1.609344 km`
- Quick reference accurate

#### TC2.4: Formula for Complex Conversions (via base unit)
**Steps:**
1. Select Length category
2. Convert inches to centimeters
3. Click "Show Details"

**Expected Results:**
- Shows conversion through base unit (meters)
- Step 1: Convert to base unit
- Step 2: Convert from base to target
- Explanation describes the process

#### TC2.5: Toggle Formula Details
**Steps:**
1. Perform any conversion with formula
2. Click "Show Details"
3. Click "Hide Details"

**Expected Results:**
- Details expand/collapse smoothly with animation
- Button text toggles correctly
- Content remains visible when expanded

---

## Feature 3: Multi-Step Conversions

### Test Cases

#### TC3.1: Empty State
**Steps:**
1. Scroll to "Multi-Step Conversions" card (teal theme)
2. Verify empty state appearance

**Expected Results:**
- Shows GitBranch icon
- Title: "Create a Conversion Chain"
- Description with example: "Miles → Kilometers → Meters → Centimeters"
- "Start Chain" button visible

#### TC3.2: Initialize Chain
**Steps:**
1. Click "Start Chain" button
2. Verify chain initializes

**Expected Results:**
- Chain starts with 2 steps
- First step: uses current fromUnit, shows "Start" badge
- Second step: uses current toUnit, shows "Result" badge
- Starting value input shows 100 (default)
- Arrow icons between steps

#### TC3.3: Add Steps to Chain
**Steps:**
1. Start a chain in Length category
2. Click "Add Step" button
3. Verify new step is added

**Expected Results:**
- New step appears at the end
- Gets "Step N" badge (gray theme)
- Arrow appears before it
- Automatically selects a different unit
- Conversion calculates automatically

#### TC3.4: Change Starting Value
**Steps:**
1. Create a chain with 3+ steps
2. Change "Starting Value" input to 50
3. Observe recalculation

**Expected Results:**
- All steps recalculate in real-time
- Values cascade through the chain
- Final result updates correctly

#### TC3.5: Change Unit in Chain
**Steps:**
1. Create chain: km → m → cm
2. Change middle step from meters to feet
3. Verify recalculation

**Expected Results:**
- Chain becomes: km → ft → cm
- Values recalculate for all steps after the changed unit
- Results remain accurate

#### TC3.6: Remove Step from Chain
**Steps:**
1. Create a chain with 4+ steps
2. Click X button on a middle step
3. Verify step is removed

**Expected Results:**
- Step disappears
- Remaining steps reconnect
- Values recalculate through new chain
- Cannot remove first step (no X button)

#### TC3.7: Chain Summary Panel
**Steps:**
1. Create a chain with multiple steps
2. Look at bottom of chain card for summary

**Expected Results:**
- Shows complete transformation path
- Format: "Starting Value → Step 1 → Step 2 → Final Result"
- Uses unit symbols
- Shows final conversion clearly

#### TC3.8: Clear Chain
**Steps:**
1. Create a chain with multiple steps
2. Click "Clear Chain" button
3. Verify reset

**Expected Results:**
- All steps removed
- Returns to empty state
- Starting value resets to 100
- Toast notification appears

#### TC3.9: Long Chain (5+ steps)
**Steps:**
1. Create a chain in Length category
2. Add steps until you have 6+ conversions
3. Test: miles → km → m → cm → mm → micrometers

**Expected Results:**
- All steps calculate correctly
- Values get progressively smaller/larger
- Precision maintained (8 decimal places)
- UI remains clean and readable
- Arrows connect all steps

#### TC3.10: Chain with Different Categories
**Steps:**
1. Create chain in Temperature: °C → °F → K
2. Switch to Weight: kg → lbs → oz

**Expected Results:**
- Chain clears when category changes (expected behavior)
- New chain can be started in new category
- Conversions remain accurate

---

## Feature Integration Tests

### TC4.1: Using History with Formulas
**Steps:**
1. Perform a temperature conversion
2. Check formula is displayed
3. Verify it appears in history
4. Replay from history
5. Verify formula recalculates

**Expected Results:**
- Formula and history work together
- No conflicts or errors

### TC4.2: Chain Results Added to History
**Steps:**
1. Create a multi-step chain
2. Check if final result appears in history
3. Verify each step calculation

**Expected Results:**
- Regular conversions add to history
- Chain steps may/may not add (current implementation)
- No duplicate entries

### TC4.3: Using All Features Together
**Steps:**
1. Perform regular conversion
2. View formula details
3. Start a chain
4. Export history
5. Clear and replay from history

**Expected Results:**
- All features work simultaneously
- No performance issues
- No UI conflicts or overlaps

---

## Mobile Responsiveness Tests

### TC5.1: Mobile Portrait (375px width)
**Steps:**
1. Open DevTools, set to iPhone SE size
2. Test all features

**Expected Results:**
- Cards stack vertically
- Buttons remain accessible
- Chain steps display properly
- Formula details readable
- History list scrolls correctly

### TC5.2: Mobile Landscape (667px width)
**Steps:**
1. Rotate to landscape
2. Test multi-step chain

**Expected Results:**
- Layout adapts
- Chain flow remains clear
- No horizontal scroll issues

### TC5.3: Tablet (768px width)
**Steps:**
1. Set to iPad size
2. Test all features

**Expected Results:**
- Better spacing than mobile
- Cards may have side-by-side layout where appropriate

---

## Analytics Verification

### TC6.1: Track History Events
**Steps:**
1. Open browser DevTools Console
2. Perform history actions (export, replay, clear)
3. Check console for analytics events

**Expected Results:**
- `unit_converter_history_export`
- `unit_converter_history_replay`
- `unit_converter_history_clear`

### TC6.2: Track Formula Events
**Steps:**
1. Toggle formula details
2. Check console

**Expected Results:**
- `unit_converter_convert` with `action: 'toggle_formula'`

### TC6.3: Track Chain Events
**Steps:**
1. Add step, remove step, clear chain
2. Check console

**Expected Results:**
- `unit_converter_chain_add_step`
- `unit_converter_chain_remove_step`
- `unit_converter_chain_clear`

---

## Performance Tests

### TC7.1: Large History Performance
**Steps:**
1. Perform 50+ conversions (hit the limit)
2. Check history list performance
3. Export large CSV

**Expected Results:**
- List scrolls smoothly
- Export completes within 2 seconds
- No lag in UI

### TC7.2: Long Chain Performance
**Steps:**
1. Create a chain with 10+ steps
2. Change starting value rapidly
3. Observe recalculation speed

**Expected Results:**
- Calculations complete within 100ms
- No visible lag
- Values update smoothly

---

## Error Handling Tests

### TC8.1: Invalid Input Values
**Steps:**
1. Enter non-numeric value in chain input
2. Try converting

**Expected Results:**
- Handles gracefully
- Shows "Error" or NaN appropriately
- Doesn't crash

### TC8.2: Incompatible Unit Conversions
**Steps:**
1. Try to convert between different categories (edge case)

**Expected Results:**
- System prevents invalid conversions
- Units are category-locked

---

## Browser Compatibility

### TC9.1: Test in Chrome
- All features work
- Animations smooth
- CSV downloads correctly

### TC9.2: Test in Firefox
- All features work
- LocalStorage functions
- Export works

### TC9.3: Test in Safari
- All features work
- No webkit-specific issues

---

## Summary Checklist

- [ ] Conversion History saves and persists
- [ ] CSV export works and formats correctly
- [ ] Replay from history works
- [ ] Formula display is accurate
- [ ] Step-by-step calculations are correct
- [ ] Formula toggle works smoothly
- [ ] Multi-step chain initializes correctly
- [ ] Adding/removing steps works
- [ ] Chain recalculates properly
- [ ] Starting value updates cascade
- [ ] Summary panel is accurate
- [ ] Clear chain works
- [ ] All features work together
- [ ] Mobile responsive on all screen sizes
- [ ] Analytics events fire correctly
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] LocalStorage persists data
- [ ] All 3 feature cards have distinct color themes

---

## Known Issues / Notes

1. Chain does not persist in localStorage (by design - stateless feature)
2. History limited to 50 items (prevents localStorage bloat)
3. Formula may not show for all unit types (depends on conversion type)
4. Chain clears when category changes (expected behavior)

---

## Success Criteria

**All 3 features must:**
- Work independently without errors
- Work together without conflicts
- Be mobile responsive
- Track analytics correctly
- Provide good UX with smooth animations
- Handle edge cases gracefully

**Test Complete When:**
- All critical test cases (TC1-TC3) pass
- No console errors during normal use
- CSV export contains valid data
- Mobile layout is functional
- Performance is acceptable (no lag > 200ms)
