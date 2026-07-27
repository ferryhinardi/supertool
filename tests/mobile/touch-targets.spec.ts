import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { expect, type Locator, type Page, test } from '@playwright/test'

import { tools } from '../../lib/data/tools'

interface ToolTarget {
  title: string
  href: string
  sourceFile: string
}

interface TouchTargetViolation {
  tool: string
  href: string
  sourceFile: string
  selector: string
  actualWidth: number
  actualHeight: number
  minimumWidth: number
  minimumHeight: number
}

interface ToolTouchTargetResult {
  title: string
  href: string
  sourceFile: string
  scannedElementCount: number
  visibleElementCount: number
  violationCount: number
  violations: TouchTargetViolation[]
}

const EVIDENCE_PATH = resolve(process.cwd(), '.sisyphus/evidence/touch-targets-2026-04.json')
const BACKLOG_PATH = resolve(process.cwd(), 'docs/TOUCH_TARGETS_BACKLOG.md')
const SELECTOR = 'button, a, input, select, [role="button"]'
const MIN_TOUCH_TARGET = 44

const baselineTopTen: ToolTarget[] = [
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

async function describeElement(locator: Locator) {
  return locator.evaluate((element) => {
    const tag = element.tagName.toLowerCase()
    const id = element.getAttribute('id')
    const testId = element.getAttribute('data-testid')
    const ariaLabel = element.getAttribute('aria-label')
    const title = element.getAttribute('title')
    const name = element.getAttribute('name')
    const role = element.getAttribute('role')
    const href = element instanceof HTMLAnchorElement ? element.getAttribute('href') : null
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)

    const segments = [tag]

    if (id) {
      segments.push(`#${id}`)
    }
    if (testId) {
      segments.push(`[data-testid="${testId}"]`)
    }
    if (ariaLabel) {
      segments.push(`[aria-label="${ariaLabel}"]`)
    }
    if (title) {
      segments.push(`[title="${title}"]`)
    }
    if (name) {
      segments.push(`[name="${name}"]`)
    }
    if (role) {
      segments.push(`[role="${role}"]`)
    }
    if (href) {
      segments.push(`[href="${href}"]`)
    }
    if (text) {
      segments.push(`{text="${text}"}`)
    }

    return segments.join('')
  })
}

async function collectToolResult(page: Page, tool: ToolTarget): Promise<ToolTouchTargetResult> {
  await page.goto(tool.href)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle').catch(() => undefined)

  const elements = page.locator(SELECTOR)
  const scannedElementCount = await elements.count()
  let visibleElementCount = 0
  const violations: TouchTargetViolation[] = []

  for (let index = 0; index < scannedElementCount; index += 1) {
    const element = elements.nth(index)
    const box = await element.boundingBox()

    if (!box || !(await element.isVisible().catch(() => false))) {
      continue
    }

    visibleElementCount += 1

    if (box.width >= MIN_TOUCH_TARGET && box.height >= MIN_TOUCH_TARGET) {
      continue
    }

    violations.push({
      tool: tool.title,
      href: tool.href,
      sourceFile: tool.sourceFile,
      selector: await describeElement(element),
      actualWidth: Number(box.width.toFixed(2)),
      actualHeight: Number(box.height.toFixed(2)),
      minimumWidth: MIN_TOUCH_TARGET,
      minimumHeight: MIN_TOUCH_TARGET,
    })
  }

  return {
    title: tool.title,
    href: tool.href,
    sourceFile: tool.sourceFile,
    scannedElementCount,
    visibleElementCount,
    violationCount: violations.length,
    violations,
  }
}

function writeArtifacts(results: ToolTouchTargetResult[]) {
  const violations = results.flatMap((result) => result.violations)
  const payload = {
    generatedAt: new Date().toISOString(),
    viewport: {
      device: 'iPhone SE',
      width: 375,
      height: 667,
    },
    minimumTouchTarget: {
      width: MIN_TOUCH_TARGET,
      height: MIN_TOUCH_TARGET,
    },
    scannedToolCount: results.length,
    scannedElementCount: results.reduce((total, result) => total + result.scannedElementCount, 0),
    visibleElementCount: results.reduce((total, result) => total + result.visibleElementCount, 0),
    violationCount: violations.length,
    toolResults: results,
    violations,
  }

  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true })
  writeFileSync(EVIDENCE_PATH, `${JSON.stringify(payload, null, 2)}\n`)

  const lines = [
    '# Touch Targets Backlog',
    '',
    'Generated from the Task 16 Playwright mobile audit across the top 20 tools.',
    '',
    `Viewport: iPhone SE 375x667. Minimum touch target: ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px.`,
    '',
  ]

  if (violations.length === 0) {
    lines.push('No touch-target violations were found in the current mobile sweep.', '')
  } else {
    for (const result of results) {
      if (result.violations.length === 0) {
        continue
      }

      lines.push(`## ${result.title}`)
      lines.push('')
      lines.push(`- Route: \`${result.href}\``)
      lines.push(`- Source: \`${result.sourceFile}\``)
      lines.push(`- Violations: ${result.violations.length}`)
      lines.push('')
      lines.push('| Selector | Actual Size | Required |')
      lines.push('| --- | --- | --- |')

      for (const violation of result.violations) {
        lines.push(
          `| \`${violation.selector.replace(/`/g, '\\`')}\` | ${violation.actualWidth}x${violation.actualHeight}px | ${violation.minimumWidth}x${violation.minimumHeight}px |`
        )
      }

      lines.push('')
    }
  }

  mkdirSync(dirname(BACKLOG_PATH), { recursive: true })
  writeFileSync(BACKLOG_PATH, `${lines.join('\n')}\n`)
}

test('top tool mobile touch-target audit', async ({ page }) => {
  const results: ToolTouchTargetResult[] = []

  try {
    for (const tool of topTwentyTools) {
      await test.step(tool.title, async () => {
        results.push(await collectToolResult(page, tool))
      })
    }
  } finally {
    writeArtifacts(results)
  }

  expect(results).toHaveLength(topTwentyTools.length)
})
