import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { expect, type Locator, type Page } from '@playwright/test'

export interface AuditTarget {
  title: string
  href: string
  sourceFile: string
}

export interface TouchTargetViolation {
  tool: string
  href: string
  sourceFile: string
  selector: string
  actualWidth: number
  actualHeight: number
  minimumWidth: number
  minimumHeight: number
}

export interface PageTouchTargetResult {
  title: string
  href: string
  sourceFile: string
  scannedElementCount: number
  visibleElementCount: number
  violationCount: number
  violations: TouchTargetViolation[]
}

export const SELECTOR = 'button, a, input, select, [role="button"]'
export const MIN_TOUCH_TARGET = 44

/** Next.js Dev Tools chrome is not product UI and inflates violation counts (~20 per sweep). */
export async function isNextJsDevToolsElement(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    if (element.id === 'next-logo') {
      return true
    }

    if (element.getAttribute('aria-label') === 'Open Next.js Dev Tools') {
      return true
    }

    return element.closest('[data-nextjs-dev-tools]') !== null
  })
}

export async function describeElement(locator: Locator) {
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

export async function collectPageResult(
  page: Page,
  target: AuditTarget
): Promise<PageTouchTargetResult> {
  const response = await page.goto(target.href, { waitUntil: 'domcontentloaded' })
  if (response && response.status() >= 400) {
    throw new Error(`Failed to load ${target.href}: HTTP ${response.status()}`)
  }

  await page.waitForLoadState('load').catch(() => undefined)

  const elements = page.locator(SELECTOR)
  const scannedElementCount = await elements.count()
  let visibleElementCount = 0
  const violations: TouchTargetViolation[] = []

  for (let index = 0; index < scannedElementCount; index += 1) {
    const element = elements.nth(index)

    if (await isNextJsDevToolsElement(element)) {
      continue
    }

    const box = await element.boundingBox()

    if (!box || !(await element.isVisible().catch(() => false))) {
      continue
    }

    visibleElementCount += 1

    if (box.width >= MIN_TOUCH_TARGET && box.height >= MIN_TOUCH_TARGET) {
      continue
    }

    violations.push({
      tool: target.title,
      href: target.href,
      sourceFile: target.sourceFile,
      selector: await describeElement(element),
      actualWidth: Number(box.width.toFixed(2)),
      actualHeight: Number(box.height.toFixed(2)),
      minimumWidth: MIN_TOUCH_TARGET,
      minimumHeight: MIN_TOUCH_TARGET,
    })
  }

  return {
    title: target.title,
    href: target.href,
    sourceFile: target.sourceFile,
    scannedElementCount,
    visibleElementCount,
    violationCount: violations.length,
    violations,
  }
}

export interface WriteArtifactsOptions {
  evidencePath: string
  backlogPath: string
  auditDescription: string
  baseUrl?: string
}

export function writeTouchTargetArtifacts(
  results: PageTouchTargetResult[],
  options: WriteArtifactsOptions
) {
  const violations = results.flatMap((result) => result.violations)
  const payload = {
    generatedAt: new Date().toISOString(),
    baseUrl: options.baseUrl ?? process.env.BASE_URL ?? 'http://127.0.0.1:3000',
    viewport: {
      device: 'iPhone SE',
      width: 375,
      height: 667,
    },
    minimumTouchTarget: {
      width: MIN_TOUCH_TARGET,
      height: MIN_TOUCH_TARGET,
    },
    scannedPageCount: results.length,
    scannedElementCount: results.reduce((total, result) => total + result.scannedElementCount, 0),
    visibleElementCount: results.reduce((total, result) => total + result.visibleElementCount, 0),
    violationCount: violations.length,
    pageResults: results,
    violations,
  }

  mkdirSync(dirname(options.evidencePath), { recursive: true })
  writeFileSync(options.evidencePath, `${JSON.stringify(payload, null, 2)}\n`)

  const lines = [
    '# Touch Targets Backlog',
    '',
    options.auditDescription,
    '',
    `Generated: ${payload.generatedAt}`,
    `Base URL: \`${payload.baseUrl}\``,
    '',
    `Viewport: iPhone SE 375x667. Minimum touch target: ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px.`,
    '',
    `**Summary:** ${results.length} sidebar pages scanned, **${violations.length} violations** total.`,
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

  mkdirSync(dirname(options.backlogPath), { recursive: true })
  writeFileSync(options.backlogPath, `${lines.join('\n')}\n`)
}

export function expectAuditCompleted(results: PageTouchTargetResult[], expectedCount: number) {
  expect(results).toHaveLength(expectedCount)
}

export const TOP_TWENTY_EVIDENCE_PATH = resolve(
  process.cwd(),
  '.sisyphus/evidence/touch-targets-top-20.json'
)
export const TOP_TWENTY_BACKLOG_PATH = resolve(
  process.cwd(),
  'docs/planning/TOUCH_TARGETS_BACKLOG.md'
)
export const SIDEBAR_ALL_EVIDENCE_PATH = resolve(
  process.cwd(),
  '.sisyphus/evidence/touch-targets-sidebar-all.json'
)
export const SIDEBAR_ALL_BACKLOG_PATH = resolve(
  process.cwd(),
  'docs/planning/TOUCH_TARGETS_SIDEBAR_ALL.md'
)
