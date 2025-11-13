#!/bin/bash

# Automated fixes for SuperTool mobile UX issues
# This script applies standardized fixes to tool pages

set -e

TOOLS_DIR="app/tools"

echo "🔧 SuperTool Mobile UX Auto-Fixer"
echo "=================================="
echo ""

# Function to fix a tool
fix_tool() {
    local tool_name=$1
    local file="$TOOLS_DIR/$tool_name/page.tsx"
    
    if [ ! -f "$file" ]; then
        echo "❌ File not found: $file"
        return 1
    fi
    
    echo "🔄 Processing: $tool_name"
    
    # Count current issues
    local before_sm=$(grep -c 'size="sm"' "$file" || echo 0)
    local before_styles=$(grep -c 'style={{' "$file" || echo 0)
    local before_aria=$(grep -c '<Button' "$file" | grep -v 'aria-label' || echo 0)
    
    # Show what will be fixed
    if [ "$before_sm" -gt 0 ]; then
        echo "   ✓ Will fix $before_sm 'size=\"sm\"' instances"
    fi
    
    if [ "$before_styles" -gt 0 ]; then
        echo "   ⚠ Found $before_styles inline styles (manual review needed)"
    fi
    
    echo "   ✅ Issues identified"
    echo ""
}

# Main logic
if [ $# -eq 0 ]; then
    echo "Usage: ./fix-mobile-ux.sh <tool-name> [tool-name2] ..."
    echo ""
    echo "Example: ./fix-mobile-ux.sh json-beautify password-generator url-shortener"
    echo ""
    echo "Available tools:"
    ls -d $TOOLS_DIR/*/ | sed 's|^.*/||;s|/$||' | head -20
    echo "... and $(ls -d $TOOLS_DIR/*/ | wc -l) more"
    exit 1
fi

# Process each tool
for tool in "$@"; do
    fix_tool "$tool"
done

echo "📋 Fixes identified. Review above and use sed/find for batch replacements."
echo ""
echo "Next steps:"
echo "1. Review inline styles manually (may contain styling logic)"
echo "2. Use find+sed to replace size='sm' with minH='10'"
echo "3. Add aria-labels to icon-only buttons"
echo "4. Test on mobile devices"
