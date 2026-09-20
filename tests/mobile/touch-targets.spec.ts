import { test } from '@playwright/test'

import { tools } from '../../lib/data/tools'
import {
  collectPageResult,
  expectAuditCompleted,
  type PageTouchTargetResult,
  TOP_TWENTY_BACKLOG_PATH,
  TOP_TWENTY_EVIDENCE_PATH,
  writeTouchTargetArtifacts,
} from './touch-target-audit.shared'

const baselineTopTen = [
  {
    title: 'Unit Converter',
    href: '/tools/productivity/unit-converter',
    sourceFile: 'app/tools/productivity/unit-converter/page.tsx',
  },
  {
    title: 'JSON Beautifier & Formatter',
    href: '/tools/data/json-beautify',
    sourceFile: 'app/tools/data/json-beautify/page.tsx',
  },
  {
    title: 'Base64 Encoder & Decoder',
    href: '/tools/security/base64',
    sourceFile: 'app/tools/security/base64/page.tsx',
  },
  {
    title: 'URL Encoder/Decoder',
    href: '/tools/development/url-encoder',
    sourceFile: 'app/tools/development/url-encoder/page.tsx',
  },
  {
    title: 'QR Code Generator',
    href: '/tools/productivity/qr-code',
    sourceFile: 'app/tools/productivity/qr-code/page.tsx',
  },
  {
    title: 'Password Strength Analyzer',
    href: '/tools/security/password-strength',
    sourceFile: 'app/tools/security/password-strength/page.tsx',
  },
  {
    title: 'Color Picker & Palette Generator',
    href: '/tools/design/color-picker',
    sourceFile: 'app/tools/design/color-picker/page.tsx',
  },
  {
    title: 'Regex Tester',
    href: '/tools/development/regex-tester',
    sourceFile: 'app/tools/development/regex-tester/page.tsx',
  },
  {
    title: 'Markdown Editor & Preview',
    href: '/tools/productivity/markdown-editor',
    sourceFile: 'app/tools/productivity/markdown-editor/page.tsx',
  },
  {
    title: 'JWT Decoder & Inspector',
    href: '/tools/development/jwt-decoder',
    sourceFile: 'app/tools/development/jwt-decoder/page.tsx',
  },
]

const topTwentyTools = (() => {
  const seen = new Set(baselineTopTen.map((tool) => tool.href))
  const nextTen = tools
    .filter((tool) => tool.href.startsWith('/tools/'))
    .filter((tool) => !tool.comingSoon)
    .filter((tool) => !seen.has(tool.href))
    .slice(0, 10)
    .map((tool) => ({
      title: tool.title,
      href: tool.href,
      sourceFile: `app${tool.href}/page.tsx`,
    }))

  return [...baselineTopTen, ...nextTen]
})()

test.use({
  browserName: 'chromium',
  hasTouch: true,
  isMobile: true,
  viewport: { width: 375, height: 667 },
})

test('top tool mobile touch-target audit', async ({ page }) => {
  const results: PageTouchTargetResult[] = []

  try {
    for (const tool of topTwentyTools) {
      await test.step(tool.title, async () => {
        results.push(await collectPageResult(page, tool))
      })
    }
  } finally {
    writeTouchTargetArtifacts(results, {
      evidencePath: TOP_TWENTY_EVIDENCE_PATH,
      backlogPath: TOP_TWENTY_BACKLOG_PATH,
      auditDescription:
        'Playwright mobile touch-target audit across the curated top 20 tools (regression subset).',
      baseUrl: process.env.BASE_URL,
    })
  }

  expectAuditCompleted(results, topTwentyTools.length)
})
