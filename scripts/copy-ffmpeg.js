#!/usr/bin/env node

const { copyFileSync, mkdirSync, existsSync } = require('node:fs')
const { join } = require('node:path')

// Copy FFmpeg binary to the output directory for Vercel deployment
const sourceFile = join(__dirname, '..', 'bin', 'ffmpeg')
const targetDir = join(__dirname, '..', '.next', 'standalone', 'bin')
const targetFile = join(targetDir, 'ffmpeg')

console.log('📦 Copying FFmpeg binary for deployment...')
console.log('   Source:', sourceFile)
console.log('   Target:', targetFile)

try {
  // Create target directory if it doesn't exist
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
    console.log('   ✅ Created target directory')
  }

  // Copy the binary
  copyFileSync(sourceFile, targetFile)
  console.log('   ✅ FFmpeg binary copied successfully!')
} catch (error) {
  console.error('   ❌ Failed to copy FFmpeg binary:', error.message)
  process.exit(1)
}
