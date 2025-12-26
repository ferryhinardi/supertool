#!/usr/bin/env node

/**
 * Script to automatically add withTopPadding to CardContent components
 * that don't have a preceding CardHeader in the same Card.
 */

const fs = require('fs')
const { execSync } = require('child_process')

// Get all .tsx files that use CardContent
function getFilesWithCardContent() {
  try {
    const result = execSync('rg -l "CardContent" -g "*.tsx" app/', { encoding: 'utf-8' })
    return result.trim().split('\n').filter(Boolean)
  } catch (error) {
    console.error('Error finding files:', error.message)
    return []
  }
}

// Check if CardContent has a CardHeader directly before it (same level, not nested)
function needsWithTopPadding(content, cardContentIndex) {
  // Look backwards from CardContent to find the opening <Card tag
  const beforeContent = content.substring(0, cardContentIndex)
  
  // Find the last Card opening tag (must match <Card> or <Card with space/newline)
  // Use regex to avoid matching CardHeader or CardContent
  const cardMatches = [...beforeContent.matchAll(/<Card[\s>]/g)]
  if (cardMatches.length === 0) return false // No Card found
  
  const lastCardMatch = cardMatches[cardMatches.length - 1]
  const lastCardIndex = lastCardMatch.index
  
  // Now check if there's a CardHeader between this Card and our CardContent
  const betweenCardAndContent = content.substring(lastCardIndex, cardContentIndex)
  
  // Look for <CardHeader followed by space or >
  const hasCardHeader = /<CardHeader[\s>]/.test(betweenCardAndContent)
  
  // If there's a CardHeader, verify it's been closed (</CardHeader>)
  if (hasCardHeader) {
    const hasClosedCardHeader = betweenCardAndContent.includes('</CardHeader>')
    if (hasClosedCardHeader) {
      return false // Has complete CardHeader at same level, don't add withTopPadding
    }
  }
  
  // No CardHeader found or it's not closed, needs withTopPadding
  return true
}

// Process a single file
function processFile(filePath) {
  console.log(`Processing: ${filePath}`)
  
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false

  // Find all CardContent occurrences that don't already have withTopPadding
  const regex = /<CardContent(?!\s+withTopPadding)(\s|>)/g
  let match

  const replacements = []

  while ((match = regex.exec(content)) !== null) {
    const matchIndex = match.index
    
    // Check if this CardContent needs withTopPadding
    if (needsWithTopPadding(content, matchIndex)) {
      // Check what comes after CardContent - either space, newline, or >
      const afterCardContent = match[1]
      
      let replacement
      
      if (afterCardContent === '>') {
        // <CardContent> -> <CardContent withTopPadding>
        replacement = '<CardContent withTopPadding>'
      } else {
        // <CardContent className=... -> <CardContent withTopPadding className=...
        replacement = '<CardContent withTopPadding' + afterCardContent
      }

      replacements.push({
        start: matchIndex,
        end: matchIndex + match[0].length,
        replacement: replacement
      })
    }
  }

  // Apply replacements in reverse order to maintain correct indices
  if (replacements.length > 0) {
    replacements.reverse().forEach(({ start, end, replacement }) => {
      content = content.substring(0, start) + replacement + content.substring(end)
    })
    
    fs.writeFileSync(filePath, content, 'utf-8')
    modified = true
    console.log(`  ✓ Fixed ${replacements.length} instance(s)`)
  } else {
    console.log(`  - No changes needed`)
  }

  return { filePath, modified, count: replacements.length }
}

// Main execution
function main() {
  console.log('🔍 Finding files with CardContent...\n')
  
  const files = getFilesWithCardContent()
  console.log(`Found ${files.length} files to process\n`)
  
  const results = []
  let totalFixed = 0
  let filesModified = 0

  files.forEach(file => {
    const result = processFile(file)
    results.push(result)
    if (result.modified) {
      filesModified++
      totalFixed += result.count
    }
  })

  console.log('\n' + '='.repeat(60))
  console.log('Summary:')
  console.log('='.repeat(60))
  console.log(`Total files processed: ${files.length}`)
  console.log(`Files modified: ${filesModified}`)
  console.log(`Total instances fixed: ${totalFixed}`)
  console.log('='.repeat(60))

  if (filesModified > 0) {
    console.log('\n✅ All fixes applied successfully!')
    console.log('\nNext steps:')
    console.log('1. Run: pnpm exec tsc --noEmit')
    console.log('2. Run: pnpm lint')
    console.log('3. Review changes with: git diff')
  }
}

main()
