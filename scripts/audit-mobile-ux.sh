#!/bin/bash

# Script to identify mobile UX issues in tool pages
# This helps prioritize which tools need fixes

echo "=== SuperTool Mobile UX Issues Audit ==="
echo ""

# Count tools with size="sm" issues
echo "1. BUTTON SIZING ISSUES (size='sm' instances):"
echo "================================================"
find app/tools -name "page.tsx" -exec grep -l 'size="sm"' {} \; | wc -l
echo "tools using size='sm' (should use minH instead)"
echo ""

# Count tools with inline styles
echo "2. INLINE STYLES ISSUES (style={{...}}):"
echo "=========================================="
find app/tools -name "page.tsx" -exec grep -l 'style={{' {} \; | wc -l
echo "tools with inline styles (should use Panda CSS)"
echo ""

# Count tools missing aria-labels on buttons
echo "3. ACCESSIBILITY ISSUES (missing aria-labels):"
echo "==============================================="
echo "Checking for icon-only buttons without aria-labels..."
grep -r '<Button' app/tools/*/page.tsx | grep -v 'aria-label' | wc -l
echo "button instances missing aria-labels"
echo ""

# Count grid layout issues
echo "4. GRID LAYOUT ISSUES (invalid base values):"
echo "============================================="
grep -r "base: '1'" app/tools/*/page.tsx | wc -l
echo "invalid grid base values found (should be '1fr')"
echo ""

# List tools by issue count
echo "5. TOP 10 TOOLS NEEDING FIXES (by issue count):"
echo "==============================================="
for tool in $(find app/tools -type d -maxdepth 1 | sort); do
  if [ -f "$tool/page.tsx" ]; then
    count=$(grep -c 'size="sm"' "$tool/page.tsx" 2>/dev/null || echo 0)
    count=$((count + $(grep -c 'style={{' "$tool/page.tsx" 2>/dev/null || echo 0)))
    count=$((count + $(grep -c "base: '1'" "$tool/page.tsx" 2>/dev/null || echo 0)))
    if [ "$count" -gt 0 ]; then
      echo "$count issues - $(basename $tool)"
    fi
  fi
done | sort -rn | head -10
echo ""

echo "=== End Audit ==="
