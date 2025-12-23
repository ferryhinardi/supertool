#!/usr/bin/env node

/**
 * SuperTool Structure Migration Script
 * 
 * This script reorganizes the project structure to make it more maintainable:
 * 1. Groups tools by category (data, media, development, security, productivity, finance, design)
 * 2. Organizes components by feature domain
 * 3. Restructures lib utilities by domain
 * 4. Organizes documentation by type
 * 
 * Usage: node scripts/migrate-structure.js [--dry-run] [--backup]
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const ROOT_DIR = path.join(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')
const CREATE_BACKUP = process.argv.includes('--backup')
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

// Tool category mappings from lib/tools.ts
const TOOL_CATEGORIES = {
  // Data tools
  data: [
    'json-beautify',
    'json-to-csv',
    'json-schema',
    'uuid-generator',
    'date-formatter',
    'csv-merger',
    'csv-excel',
    'json-markdown-table',
  ],
  
  // Media tools
  media: [
    'image-optimizer',
    'video-converter',
    'image-to-pdf',
    'video-subtitle-combiner',
    'ai-image-caption',
  ],
  
  // Development tools
  development: [
    'diff',
    'api-tester',
    'jwt-decoder',
    'jwt-debugger',
    'yaml-json',
    'dockerfile-formatter',
    'cron-expression',
    'regex-tester',
    'browser-fingerprint',
    'speed-test',
    'ip-lookup',
    'website-screenshot',
    'file-inspector',
    'prompt-formatter',
    'ai-json-analyzer',
    'ai-command-explainer',
    'ai-prompt-explainer',
    'ai-snippet-generator',
  ],
  
  // Security tools
  security: [
    'base64',
    'password-generator',
    'encryption-tool',
    'hash-generator',
    'ssl-checker',
    'password-strength',
    'steganography',
    'file-verifier',
  ],
  
  // Productivity tools
  productivity: [
    'markdown-editor',
    'url-shortener',
    'text-transformer',
    'upload',
    'qr-code',
    'unit-converter',
    'timezone-converter',
    'pomodoro',
    'age-calculator',
    'invoice-generator',
    'pdf-tools',
    'bmi-calculator',
    'stopwatch-timer',
    'tally-counter',
    'daily-task-summary',
    'clipboard-history',
    'daily-note',
    'batch-rename',
    'clipboard-formatter',
    'task-timer',
    'grammar-checker',
    'text-summarizer',
    'keyword-density',
    'text-similarity',
    'ai-text-rewriter',
  ],
  
  // Finance tools
  finance: [
    'split-bill',
    'currency-converter',
    'tip-calculator',
    'percentage-calculator',
    'loan-calculator',
  ],
  
  // Design tools
  design: [
    'gradient-generator',
    'color-picker',
    'favicon-generator',
    'screenshot-diff',
    'svg-optimizer',
    'image-metadata',
    'color-contrast',
    'photo-editor',
    'signature-generator',
  ],
}

// Component reorganization
const COMPONENT_MOVES = {
  'components/features/RecentTools.tsx': 'components/features/tools/RecentTools.tsx',
  'components/features/ToolDragList.tsx': 'components/features/tools/ToolDragList.tsx',
  'components/features/ToolEmptyState.tsx': 'components/features/tools/ToolEmptyState.tsx',
  'components/features/ToolKeyboardShortcuts.tsx': 'components/features/tools/ToolKeyboardShortcuts.tsx',
  'components/features/ToolMobilePicker.tsx': 'components/features/tools/ToolMobilePicker.tsx',
  'components/features/ToolOperationGrid.tsx': 'components/features/tools/ToolOperationGrid.tsx',
  'components/features/ToolProcessingModal.tsx': 'components/features/tools/ToolProcessingModal.tsx',
  
  'components/features/AdBanner.tsx': 'components/features/ads/AdBanner.tsx',
  'components/features/AdContainer.tsx': 'components/features/ads/AdContainer.tsx',
  'components/features/CarbonAd.tsx': 'components/features/ads/CarbonAd.tsx',
  'components/features/EthicalAd.tsx': 'components/features/ads/EthicalAd.tsx',
  'components/features/AffiliateSuggestion.tsx': 'components/features/ads/AffiliateSuggestion.tsx',
  
  'components/features/FFmpegProvider.tsx': 'components/features/media/FFmpegProvider.tsx',
  'components/features/DragDropZone.tsx': 'components/features/media/DragDropZone.tsx',
  'components/features/PDFEditor.tsx': 'components/features/media/PDFEditor.tsx',
  'components/features/ReceiptScanner.tsx': 'components/features/media/ReceiptScanner.tsx',
  'components/features/ItemPreviewModal.tsx': 'components/features/media/ItemPreviewModal.tsx',
  
  'components/features/CurrencyConverter.tsx': 'components/features/currency/CurrencyConverter.tsx',
  
  'components/features/FeedbackDialog.tsx': 'components/features/shared/FeedbackDialog.tsx',
  'components/features/ShortcutsHelp.tsx': 'components/features/shared/ShortcutsHelp.tsx',
  'components/features/TemplatesSelector.tsx': 'components/features/shared/TemplatesSelector.tsx',
  'components/features/TreatMeDialog.tsx': 'components/features/shared/TreatMeDialog.tsx',
}

// Lib reorganization
const LIB_MOVES = {
  // Auth utilities
  'lib/auth-store.ts': 'lib/auth/auth-store.ts',
  'lib/auth-types.ts': 'lib/auth/auth-types.ts',
  'lib/supabaseClient.ts': 'lib/auth/supabaseClient.ts',
  
  // Media utilities
  'lib/ffmpeg-loader.ts': 'lib/media/ffmpeg-loader.ts',
  'lib/video-compressor.ts': 'lib/media/video-compressor.ts',
  
  // Tool-specific utilities (QR)
  'lib/qr-types.ts': 'lib/tools/qr/qr-types.ts',
  'lib/qr-export-service.ts': 'lib/tools/qr/qr-export-service.ts',
  'lib/qr-history-service.ts': 'lib/tools/qr/qr-history-service.ts',
  'lib/qr-scanner-service.ts': 'lib/tools/qr/qr-scanner-service.ts',
  
  // Split bill utilities
  'lib/split-bill-types.ts': 'lib/tools/split-bill/split-bill-types.ts',
  'lib/split-bill-service.ts': 'lib/tools/split-bill/split-bill-service.ts',
  'lib/split-bill-storage.ts': 'lib/tools/split-bill/split-bill-storage.ts',
  'lib/split-bill-export.tsx': 'lib/tools/split-bill/split-bill-export.tsx',
  'lib/split-bill-export-legacy.ts': 'lib/tools/split-bill/split-bill-export-legacy.ts',
  'lib/split-bill-a11y.ts': 'lib/tools/split-bill/split-bill-a11y.ts',
  'lib/split-bill-shortcuts.ts': 'lib/tools/split-bill/split-bill-shortcuts.ts',
  'lib/receipt-parser.ts': 'lib/tools/split-bill/receipt-parser.ts',
  
  // Currency utilities
  'lib/currency.ts': 'lib/tools/currency/currency.ts',
  'lib/currency-converter.ts': 'lib/tools/currency/currency-converter.ts',
  
  // Stopwatch utilities
  'lib/stopwatch-utils.ts': 'lib/tools/stopwatch/stopwatch-utils.ts',
  
  // Services
  'lib/analytics.ts': 'lib/services/analytics.ts',
  'lib/rating-service.ts': 'lib/services/rating-service.ts',
  'lib/recent-tools.ts': 'lib/services/recent-tools.ts',
  'lib/ads-config.ts': 'lib/services/ads-config.ts',
  
  // Data management
  'lib/tools.ts': 'lib/data/tools.ts',
  'lib/metadata.ts': 'lib/data/metadata.ts',
  'lib/structured-data.ts': 'lib/data/structured-data.ts',
  'lib/tool-components-types.ts': 'lib/data/tool-components-types.ts',
}

// Hooks reorganization
const HOOK_MOVES = {
  'hooks/useCurrencyConverter.ts': 'hooks/tools/useCurrencyConverter.ts',
  'hooks/useRecentTools.ts': 'hooks/tools/useRecentTools.ts',
  'hooks/useToolHistory.ts': 'hooks/tools/useToolHistory.ts',
  
  'hooks/useFavorites.ts': 'hooks/common/useFavorites.ts',
  'hooks/useKeyboardShortcuts.ts': 'hooks/common/useKeyboardShortcuts.ts',
  'hooks/useSwipeGesture.ts': 'hooks/common/useSwipeGesture.ts',
}

// Documentation reorganization
const DOC_CATEGORIES = {
  setup: [
    'AUTH_IMPLEMENTATION_PLAN.md',
    'CI_CD_SETUP.md',
    'DOMAIN_SETUP_GODADDY.md',
    'DNS_QUICK_FIX.md',
    'SECRETS_SETUP.md',
  ],
  architecture: [
    'ARK_UI_HOMEPAGE_REDESIGN.md',
    'COMPREHENSIVE_IMPROVEMENT_PLAN.md',
    'APP_MIGRATION_STATUS.md',
    'PROJECT_STATUS.md',
    'MIGRATION_PROGRESS.md',
  ],
  features: [
    'ADS_INTEGRATION.md',
    'ANALYTICS.md',
    'AUTH_FLOWS.md',
    'FEEDBACK_SYSTEM.md',
    'SPECULATION_RULES_INTEGRATION.md',
  ],
}

// Utility functions
function log(message, level = 'info') {
  const prefix = {
    info: '📘',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    dry: '🔍',
  }[level] || 'ℹ️'
  
  console.log(`${prefix} ${message}`)
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    if (DRY_RUN) {
      log(`Would create directory: ${dirPath}`, 'dry')
    } else {
      fs.mkdirSync(dirPath, { recursive: true })
      log(`Created directory: ${dirPath}`, 'success')
    }
  }
}

function moveFile(source, destination) {
  const sourcePath = path.join(ROOT_DIR, source)
  const destPath = path.join(ROOT_DIR, destination)
  
  if (!fs.existsSync(sourcePath)) {
    log(`Source not found: ${source}`, 'warning')
    return false
  }
  
  if (DRY_RUN) {
    log(`Would move: ${source} → ${destination}`, 'dry')
    return true
  }
  
  try {
    ensureDir(path.dirname(destPath))
    
    // Use git mv if in a git repository
    try {
      execSync(`git mv "${sourcePath}" "${destPath}"`, { cwd: ROOT_DIR })
      log(`Moved (git): ${source} → ${destination}`, 'success')
    } catch {
      // Fallback to regular move
      fs.renameSync(sourcePath, destPath)
      log(`Moved: ${source} → ${destination}`, 'success')
    }
    
    return true
  } catch (error) {
    log(`Failed to move ${source}: ${error.message}`, 'error')
    return false
  }
}

function moveDirectory(source, destination) {
  const sourcePath = path.join(ROOT_DIR, source)
  const destPath = path.join(ROOT_DIR, destination)
  
  if (!fs.existsSync(sourcePath)) {
    log(`Source directory not found: ${source}`, 'warning')
    return false
  }
  
  if (DRY_RUN) {
    log(`Would move directory: ${source} → ${destination}`, 'dry')
    return true
  }
  
  try {
    ensureDir(path.dirname(destPath))
    
    // Use git mv for directories
    try {
      execSync(`git mv "${sourcePath}" "${destPath}"`, { cwd: ROOT_DIR })
      log(`Moved directory (git): ${source} → ${destination}`, 'success')
    } catch {
      fs.renameSync(sourcePath, destPath)
      log(`Moved directory: ${source} → ${destination}`, 'success')
    }
    
    return true
  } catch (error) {
    log(`Failed to move directory ${source}: ${error.message}`, 'error')
    return false
  }
}

function createBackup() {
  if (!CREATE_BACKUP || DRY_RUN) {
    return
  }
  
  const backupDir = path.join(ROOT_DIR, `backup-${TIMESTAMP}`)
  log(`Creating backup at: ${backupDir}`, 'info')
  
  try {
    fs.mkdirSync(backupDir, { recursive: true })
    
    // Backup key directories
    const dirsToBackup = ['app/tools', 'components/features', 'lib', 'hooks', 'docs']
    
    for (const dir of dirsToBackup) {
      const sourcePath = path.join(ROOT_DIR, dir)
      const destPath = path.join(backupDir, dir)
      
      if (fs.existsSync(sourcePath)) {
        execSync(`cp -r "${sourcePath}" "${destPath}"`, { cwd: ROOT_DIR })
      }
    }
    
    log(`Backup created successfully at: ${backupDir}`, 'success')
  } catch (error) {
    log(`Failed to create backup: ${error.message}`, 'error')
    process.exit(1)
  }
}

// Migration steps
function migrateTools() {
  log('\n📦 Step 1: Migrating Tools by Category...', 'info')
  
  let moved = 0
  let failed = 0
  
  for (const [category, tools] of Object.entries(TOOL_CATEGORIES)) {
    log(`\nProcessing ${category} tools...`, 'info')
    
    for (const toolName of tools) {
      const source = `app/tools/${toolName}`
      const destination = `app/tools/${category}/${toolName}`
      
      if (moveDirectory(source, destination)) {
        moved++
      } else {
        failed++
      }
    }
  }
  
  log(`\nTools migration complete: ${moved} moved, ${failed} failed`, moved > 0 ? 'success' : 'warning')
}

function migrateComponents() {
  log('\n🧩 Step 2: Migrating Components...', 'info')
  
  let moved = 0
  let failed = 0
  
  for (const [source, destination] of Object.entries(COMPONENT_MOVES)) {
    if (moveFile(source, destination)) {
      moved++
    } else {
      failed++
    }
  }
  
  log(`\nComponents migration complete: ${moved} moved, ${failed} failed`, moved > 0 ? 'success' : 'warning')
}

function migrateLib() {
  log('\n📚 Step 3: Migrating Lib Utilities...', 'info')
  
  let moved = 0
  let failed = 0
  
  for (const [source, destination] of Object.entries(LIB_MOVES)) {
    if (moveFile(source, destination)) {
      moved++
    } else {
      failed++
    }
  }
  
  log(`\nLib migration complete: ${moved} moved, ${failed} failed`, moved > 0 ? 'success' : 'warning')
}

function migrateHooks() {
  log('\n🪝 Step 4: Migrating Hooks...', 'info')
  
  let moved = 0
  let failed = 0
  
  for (const [source, destination] of Object.entries(HOOK_MOVES)) {
    if (moveFile(source, destination)) {
      moved++
    } else {
      failed++
    }
  }
  
  log(`\nHooks migration complete: ${moved} moved, ${failed} failed`, moved > 0 ? 'success' : 'warning')
}

function migrateDocs() {
  log('\n📖 Step 5: Migrating Documentation...', 'info')
  
  let moved = 0
  let failed = 0
  
  for (const [category, docs] of Object.entries(DOC_CATEGORIES)) {
    for (const doc of docs) {
      const source = `docs/${doc}`
      const destination = `docs/${category}/${doc}`
      
      if (moveFile(source, destination)) {
        moved++
      } else {
        failed++
      }
    }
  }
  
  log(`\nDocs migration complete: ${moved} moved, ${failed} failed`, moved > 0 ? 'success' : 'warning')
}

// Main execution
function main() {
  log('🚀 SuperTool Structure Migration Script', 'info')
  log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE'}`, DRY_RUN ? 'warning' : 'info')
  log(`Backup: ${CREATE_BACKUP ? 'Enabled' : 'Disabled'}`, 'info')
  
  if (!DRY_RUN) {
    console.log('\n⚠️  WARNING: This will reorganize your project structure!')
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
    
    // Give user time to cancel
    execSync('sleep 5')
  }
  
  // Create backup if requested
  if (CREATE_BACKUP && !DRY_RUN) {
    createBackup()
  }
  
  // Run migrations
  migrateTools()
  migrateComponents()
  migrateLib()
  migrateHooks()
  migrateDocs()
  
  log('\n🎉 Migration complete!', 'success')
  
  if (DRY_RUN) {
    log('\nThis was a dry run. Run without --dry-run to apply changes.', 'info')
  } else {
    log('\nNext steps:', 'info')
    log('1. Run: node scripts/update-imports.js', 'info')
    log('2. Run: pnpm lint', 'info')
    log('3. Run: pnpm exec tsc --noEmit', 'info')
    log('4. Run: pnpm test', 'info')
    log('5. Run: pnpm build', 'info')
  }
}

// Run the migration
main()
