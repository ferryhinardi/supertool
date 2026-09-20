import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { expect, type Page } from '@playwright/test'

import type { SidebarAuditTarget } from '../mobile/sidebar-audit-targets'
import { attachConsoleGuard } from './console-guard'
import { getToolFunctionalFlow } from './tool-functional-flows'

export interface FunctionalCheckResult {
  title: string
  href: string
  kind: SidebarAuditTarget['kind']
  status: 'passed' | 'failed'
  httpStatus: number | null
  durationMs: number
  error?: string
  consoleErrors: string[]
}

export const SIDEBAR_FUNCTIONAL_EVIDENCE_PATH = resolve(
  process.cwd(),
  '.sisyphus/evidence/sidebar-functional-all.json'
)
export const SIDEBAR_FUNCTIONAL_REPORT_PATH = resolve(
  process.cwd(),
  'docs/planning/SIDEBAR_FUNCTIONAL_REPORT.md'
)

export async function runSidebarFunctionalCheck(
  page: Page,
  target: SidebarAuditTarget
): Promise<FunctionalCheckResult> {
  const started = Date.now()
  const guard = attachConsoleGuard(page)
  let httpStatus: number | null = null

  try {
    const response = await page.goto(target.href, { waitUntil: 'domcontentloaded' })
    httpStatus = response?.status() ?? null
    expect(httpStatus, `${target.href} HTTP status`).toBeLessThan(400)

    const flow = getToolFunctionalFlow(target.href)
    await flow(page, target)

    if (guard.errors.length > 0) {
      throw new Error(`Console errors: ${guard.errors.join(' | ')}`)
    }

    return {
      title: target.title,
      href: target.href,
      kind: target.kind,
      status: 'passed',
      httpStatus,
      durationMs: Date.now() - started,
      consoleErrors: [],
    }
  } catch (error) {
    return {
      title: target.title,
      href: target.href,
      kind: target.kind,
      status: 'failed',
      httpStatus,
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
      consoleErrors: [...guard.errors],
    }
  } finally {
    guard.dispose()
  }
}

export function writeFunctionalReport(results: FunctionalCheckResult[], baseUrl: string) {
  const passed = results.filter((result) => result.status === 'passed')
  const failed = results.filter((result) => result.status === 'failed')

  const payload = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    pageCount: results.length,
    passedCount: passed.length,
    failedCount: failed.length,
    results,
  }

  mkdirSync(dirname(SIDEBAR_FUNCTIONAL_EVIDENCE_PATH), { recursive: true })
  writeFileSync(SIDEBAR_FUNCTIONAL_EVIDENCE_PATH, `${JSON.stringify(payload, null, 2)}\n`)

  const lines = [
    '# Sidebar Functional Test Report',
    '',
    'Playwright functional smoke + interaction checks for `/`, `/support`, and every active `/tools/*` route.',
    '',
    `Generated: ${payload.generatedAt}`,
    `Base URL: \`${baseUrl}\``,
    '',
    `**Summary:** ${results.length} pages — **${passed.length} passed**, **${failed.length} failed**.`,
    '',
  ]

  if (failed.length === 0) {
    lines.push('All sidebar routes passed functional checks.', '')
  } else {
    lines.push('## Failures', '')
    for (const result of failed) {
      lines.push(`### ${result.title}`)
      lines.push('')
      lines.push(`- Route: \`${result.href}\``)
      lines.push(`- HTTP: ${result.httpStatus ?? 'n/a'}`)
      lines.push(`- Error: ${result.error ?? 'unknown'}`)
      if (result.consoleErrors.length > 0) {
        lines.push(`- Console: ${result.consoleErrors.join('; ')}`)
      }
      lines.push('')
    }
  }

  lines.push('## Passed routes', '')
  lines.push('| Page | Route | Duration |')
  lines.push('| --- | --- | --- |')
  for (const result of passed) {
    lines.push(`| ${result.title} | \`${result.href}\` | ${result.durationMs}ms |`)
  }
  lines.push('')

  mkdirSync(dirname(SIDEBAR_FUNCTIONAL_REPORT_PATH), { recursive: true })
  writeFileSync(SIDEBAR_FUNCTIONAL_REPORT_PATH, `${lines.join('\n')}\n`)
}
