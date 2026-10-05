import { expect, test } from '@playwright/test'

import { countActiveToolRoutes, getAllActiveRouteTargets } from '../mobile/sidebar-audit-targets'
import {
  type FunctionalCheckResult,
  runSidebarFunctionalCheck,
  writeFunctionalReport,
} from './sidebar-functional.shared'

const activeRoutePages = getAllActiveRouteTargets()
const expectedPageCount = countActiveToolRoutes() + 2

test.use({
  browserName: 'chromium',
  hasTouch: true,
  isMobile: true,
  viewport: { width: 375, height: 667 },
})

test.describe.configure({ mode: 'serial', timeout: 90 * 60 * 1000 })

test('all active routes functional audit', async ({ page }) => {
  expect(activeRoutePages).toHaveLength(expectedPageCount)

  const results: FunctionalCheckResult[] = []
  const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000'

  try {
    for (const target of activeRoutePages) {
      await test.step(`${target.kind}: ${target.title}`, async () => {
        results.push(await runSidebarFunctionalCheck(page, target))
      })
    }
  } finally {
    writeFunctionalReport(results, baseUrl)
  }

  const failures = results.filter((result) => result.status === 'failed')
  expect(failures, formatFailureSummary(failures)).toEqual([])
})

test('mobile sidebar navigation smoke', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Toggle menu' }).click()
  await expect(page.getByRole('link', { name: 'Home' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Support Us' }).first()).toBeVisible()

  const sampleTool = activeRoutePages.find((target) => target.kind === 'tool')
  expect(sampleTool).toBeDefined()
  if (!sampleTool) {
    return
  }

  await page.getByRole('link', { name: sampleTool.title }).first().click()
  await expect(page).toHaveURL(new RegExp(`${escapeForRegExp(sampleTool.href)}$`))
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(
    new RegExp(escapeForRegExp(sampleTool.title.split(' ')[0]), 'i')
  )
})

function escapeForRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function formatFailureSummary(failures: { title: string; href: string; error?: string }[]) {
  if (failures.length === 0) {
    return ''
  }

  return failures
    .map((failure) => `${failure.title} (${failure.href}): ${failure.error ?? 'failed'}`)
    .join('\n')
}
