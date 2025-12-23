#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.join(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')

const IMPORT_MAPPINGS = {
  '@/lib/auth/auth-store': '@/lib/auth/auth-store',
  '@/lib/auth/auth-types': '@/lib/auth/auth-types',
  '@/lib/auth/supabaseClient': '@/lib/auth/supabaseClient',
  '@/lib/media/ffmpeg-loader': '@/lib/media/ffmpeg-loader',
  '@/lib/media/video-compressor': '@/lib/media/video-compressor',
  '@/lib/tools/qr/qr-types': '@/lib/tools/qr/qr-types',
  '@/lib/tools/qr/qr-export-service': '@/lib/tools/qr/qr-export-service',
  '@/lib/tools/qr/qr-history-service': '@/lib/tools/qr/qr-history-service',
  '@/lib/tools/qr/qr-scanner-service': '@/lib/tools/qr/qr-scanner-service',
  '@/lib/tools/split-bill/split-bill-types': '@/lib/tools/split-bill/split-bill-types',
  '@/lib/tools/split-bill/split-bill-service': '@/lib/tools/split-bill/split-bill-service',
  '@/lib/tools/split-bill/split-bill-storage': '@/lib/tools/split-bill/split-bill-storage',
  '@/lib/tools/split-bill/split-bill-export': '@/lib/tools/split-bill/split-bill-export',
  '@/lib/tools/currency/currency': '@/lib/tools/currency/currency',
  '@/lib/tools/currency/currency-converter': '@/lib/tools/currency/currency-converter',
  '@/lib/tools/stopwatch/stopwatch-utils': '@/lib/tools/stopwatch/stopwatch-utils',
  '@/lib/services/analytics': '@/lib/services/analytics',
  '@/lib/services/rating-service': '@/lib/services/rating-service',
  '@/lib/services/recent-tools': '@/lib/services/recent-tools',
  '@/lib/data/tools': '@/lib/data/tools',
  '@/lib/data/metadata': '@/lib/data/metadata',
  '@/components/features/tools/RecentTools': '@/components/features/tools/RecentTools',
  '@/hooks/tools/useCurrencyConverter': '@/hooks/tools/useCurrencyConverter',
  '@/hooks/common/useFavorites': '@/hooks/common/useFavorites',
}

function log(msg, lvl = 'info') {
  console.log(`${lvl === 'success' ? '✅' : '📘'} ${msg}`)
}

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir)
  for (const item of items) {
    const fullPath = path.join(dir, item)
    if (item === 'node_modules' || item === '.next' || item === '.git') continue
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files)
    } else if (/\.(tsx?|jsx?)$/.test(item)) {
      files.push(fullPath)
    }
  }
  return files
}

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  let changed = false
  
  for (const [old, newPath] of Object.entries(IMPORT_MAPPINGS)) {
    const regex = new RegExp(`(['"])${old.replace(/\//g, '\\/')}\\1`, 'g')
    if (regex.test(content)) {
      content = content.replace(regex, `$1${newPath}$1`)
      changed = true
    }
  }
  
  if (changed) {
    if (!DRY_RUN) fs.writeFileSync(filePath, content)
    return true
  }
  return false
}

const files = getAllFiles(ROOT_DIR)
let count = 0
files.forEach(f => { if (updateFile(f)) count++ })
log(`Updated ${count} files`, 'success')
