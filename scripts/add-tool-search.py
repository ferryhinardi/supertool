#!/usr/bin/env python3
"""
Script to add ToolSearch component to all tool pages that don't have it yet.
Adds import statement and component before closing </main> tag.
"""

import os
import re
from pathlib import Path

# Pages that need ToolSearch
PAGES_TO_UPDATE = [
    "app/tools/ai-command-explainer/page.tsx",
    "app/tools/ai-image-caption/page.tsx",
    "app/tools/ai-json-analyzer/page.tsx",
    "app/tools/ai-prompt-explainer/page.tsx",
    "app/tools/ai-snippet-generator/page.tsx",
    "app/tools/ai-text-rewriter/page.tsx",
    "app/tools/api-tester/page.tsx",
    "app/tools/base64/page.tsx",
    "app/tools/batch-rename/page.tsx",
    "app/tools/bmi-calculator/page.tsx",
    "app/tools/browser-fingerprint/page.tsx",
    "app/tools/clipboard-formatter/page.tsx",
    "app/tools/clipboard-history/page.tsx",
    "app/tools/color-contrast/page.tsx",
    "app/tools/color-picker/page.tsx",
    "app/tools/cron-expression/page.tsx",
    "app/tools/csv-excel/page.tsx",
    "app/tools/csv-merger/page.tsx",
    "app/tools/currency-converter/page.tsx",
    "app/tools/daily-note/page.tsx",
    "app/tools/daily-task-summary/page.tsx",
    "app/tools/date-formatter/page.tsx",
    "app/tools/diff/page.tsx",
    "app/tools/encryption-tool/page.tsx",
    "app/tools/favicon-generator/page.tsx",
    "app/tools/file-inspector/page.tsx",
    "app/tools/gradient-generator/page.tsx",
    "app/tools/grammar-checker/page.tsx",
    "app/tools/hash-generator/page.tsx",
    "app/tools/image-metadata/page.tsx",
    "app/tools/image-optimizer/page.tsx",
    "app/tools/invoice-generator/page.tsx",
    "app/tools/ip-lookup/page.tsx",
    "app/tools/json-markdown-table/page.tsx",
    "app/tools/json-schema/page.tsx",
    "app/tools/json-to-csv/page.tsx",
    "app/tools/keyword-density/page.tsx",
    "app/tools/loan-calculator/page.tsx",
    "app/tools/markdown-editor/page.tsx",
    "app/tools/password-strength/page.tsx",
    "app/tools/pdf-tools/page.tsx",
    "app/tools/percentage-calculator/page.tsx",
    "app/tools/pomodoro/page.tsx",
    "app/tools/prompt-formatter/page.tsx",
    "app/tools/qr-code/page.tsx",
    "app/tools/regex-tester/page.tsx",
    "app/tools/screenshot-diff/page.tsx",
    "app/tools/speed-test/page.tsx",
    "app/tools/split-bill/history/page.tsx",
    "app/tools/steganography/page.tsx",
    "app/tools/stopwatch-timer/page.tsx",
    "app/tools/tally-counter/page.tsx",
    "app/tools/task-timer/page.tsx",
    "app/tools/text-similarity/page.tsx",
    "app/tools/text-summarizer/page.tsx",
    "app/tools/text-transformer/page.tsx",
    "app/tools/timezone-converter/page.tsx",
    "app/tools/upload/page.tsx",
    "app/tools/url-shortener/page.tsx",
    "app/tools/uuid-generator/page.tsx",
    "app/tools/video-converter/page.tsx",
    "app/tools/website-screenshot/page.tsx",
    "app/tools/yaml-json/page.tsx",
]

def add_tool_search(file_path):
    """Add ToolSearch import and component to a file."""
    
    if not os.path.exists(file_path):
        return False, "File not found"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has ToolSearch
    if 'ToolSearch' in content:
        return True, "Already has ToolSearch"
    
    # Find last UI import line to add our import after it
    ui_import_pattern = r"(import .+ from '@/components/ui/[^']+'\n)"
    ui_imports = list(re.finditer(ui_import_pattern, content))
    
    if not ui_imports:
        return False, "No UI imports found"
    
    # Add import after the last UI import
    last_import = ui_imports[-1]
    insert_pos = last_import.end()
    
    new_import = "import { ToolSearch } from '@/components/ui/tool-search'\n"
    content = content[:insert_pos] + new_import + content[insert_pos:]
    
    # Find closing </main> tag and add component before it
    # Look for the last occurrence
    main_close_matches = list(re.finditer(r'(\s*)</main>', content))
    
    if not main_close_matches:
        return False, "No closing </main> found"
    
    last_main = main_close_matches[-1]
    indent = last_main.group(1)  # Capture the indentation
    insert_pos = last_main.start()
    
    component_code = f"\n{indent}{{/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}}\n{indent}<ToolSearch />\n{indent}"
    content = content[:insert_pos] + component_code + content[insert_pos:]
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True, "Added successfully"

def main():
    success_count = 0
    failed_count = 0
    skipped_count = 0
    
    total = len(PAGES_TO_UPDATE)
    
    print(f"Processing {total} pages...\n")
    
    for i, page in enumerate(PAGES_TO_UPDATE, 1):
        print(f"[{i}/{total}] {page}")
        
        success, message = add_tool_search(page)
        
        if success:
            if "Already has" in message:
                print(f"  ✓ {message}")
                skipped_count += 1
            else:
                print(f"  ✅ {message}")
                success_count += 1
        else:
            print(f"  ⚠️  {message}")
            failed_count += 1
    
    print("\n" + "="*50)
    print("Summary:")
    print(f"  Total: {total}")
    print(f"  Added: {success_count}")
    print(f"  Skipped: {skipped_count}")
    print(f"  Failed: {failed_count}")
    print("="*50)

if __name__ == "__main__":
    main()
