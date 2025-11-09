#!/bin/bash

# Script to add ToolSearch component to all tool pages
# This adds the import and component to pages that don't have it yet

set -e

PAGES_TO_UPDATE=(
"app/tools/ai-command-explainer/page.tsx"
"app/tools/ai-image-caption/page.tsx"
"app/tools/ai-json-analyzer/page.tsx"
"app/tools/ai-prompt-explainer/page.tsx"
"app/tools/ai-snippet-generator/page.tsx"
"app/tools/ai-text-rewriter/page.tsx"
"app/tools/api-tester/page.tsx"
"app/tools/base64/page.tsx"
"app/tools/batch-rename/page.tsx"
"app/tools/bmi-calculator/page.tsx"
"app/tools/browser-fingerprint/page.tsx"
"app/tools/clipboard-formatter/page.tsx"
"app/tools/clipboard-history/page.tsx"
"app/tools/color-contrast/page.tsx"
"app/tools/color-picker/page.tsx"
"app/tools/cron-expression/page.tsx"
"app/tools/csv-excel/page.tsx"
"app/tools/csv-merger/page.tsx"
"app/tools/currency-converter/page.tsx"
"app/tools/daily-note/page.tsx"
"app/tools/daily-task-summary/page.tsx"
"app/tools/date-formatter/page.tsx"
"app/tools/diff/page.tsx"
"app/tools/encryption-tool/page.tsx"
"app/tools/favicon-generator/page.tsx"
"app/tools/file-inspector/page.tsx"
"app/tools/gradient-generator/page.tsx"
"app/tools/grammar-checker/page.tsx"
"app/tools/hash-generator/page.tsx"
"app/tools/image-metadata/page.tsx"
"app/tools/image-optimizer/page.tsx"
"app/tools/invoice-generator/page.tsx"
"app/tools/ip-lookup/page.tsx"
"app/tools/json-markdown-table/page.tsx"
"app/tools/json-schema/page.tsx"
"app/tools/json-to-csv/page.tsx"
"app/tools/keyword-density/page.tsx"
"app/tools/loan-calculator/page.tsx"
"app/tools/markdown-editor/page.tsx"
"app/tools/password-strength/page.tsx"
"app/tools/pdf-tools/page.tsx"
"app/tools/percentage-calculator/page.tsx"
"app/tools/pomodoro/page.tsx"
"app/tools/prompt-formatter/page.tsx"
"app/tools/qr-code/page.tsx"
"app/tools/regex-tester/page.tsx"
"app/tools/screenshot-diff/page.tsx"
"app/tools/speed-test/page.tsx"
"app/tools/split-bill/history/page.tsx"
"app/tools/steganography/page.tsx"
"app/tools/stopwatch-timer/page.tsx"
"app/tools/tally-counter/page.tsx"
"app/tools/task-timer/page.tsx"
"app/tools/text-similarity/page.tsx"
"app/tools/text-summarizer/page.tsx"
"app/tools/text-transformer/page.tsx"
"app/tools/timezone-converter/page.tsx"
"app/tools/upload/page.tsx"
"app/tools/url-shortener/page.tsx"
"app/tools/uuid-generator/page.tsx"
"app/tools/video-converter/page.tsx"
"app/tools/website-screenshot/page.tsx"
"app/tools/yaml-json/page.tsx"
)

count=0
success=0
failed=0

for file in "${PAGES_TO_UPDATE[@]}"; do
  count=$((count + 1))
  echo "[$count/63] Processing: $file"
  
  # Check if file exists
  if [ ! -f "$file" ]; then
    echo "  ⚠️  File not found, skipping"
    failed=$((failed + 1))
    continue
  fi
  
  # Check if already has ToolSearch
  if grep -q "ToolSearch" "$file"; then
    echo "  ✓ Already has ToolSearch, skipping"
    success=$((success + 1))
    continue
  fi
  
  # Find the last import from @/components/ui/
  last_ui_import_line=$(grep -n "import.*from '@/components/ui/" "$file" | tail -1 | cut -d: -f1)
  
  if [ -z "$last_ui_import_line" ]; then
    echo "  ⚠️  No UI imports found, skipping"
    failed=$((failed + 1))
    continue
  fi
  
  # Add import after the last UI import
  sed -i.bak "${last_ui_import_line}a\\
import { ToolSearch } from '@/components/ui/tool-search'
" "$file"
  
  # Find the closing </main> tag
  main_close_line=$(grep -n "</main>" "$file" | tail -1 | cut -d: -f1)
  
  if [ -z "$main_close_line" ]; then
    echo "  ⚠️  No closing </main> found, skipping"
    # Restore backup
    mv "$file.bak" "$file"
    failed=$((failed + 1))
    continue
  fi
  
  # Add ToolSearch component before </main>
  sed -i.bak2 "${main_close_line}i\\
\\
      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}\\
      <ToolSearch />
" "$file"
  
  # Remove backup files
  rm -f "$file.bak" "$file.bak2"
  
  echo "  ✅ Added ToolSearch successfully"
  success=$((success + 1))
done

echo ""
echo "================================"
echo "Summary:"
echo "  Total: $count"
echo "  Success: $success"
echo "  Failed: $failed"
echo "================================"
