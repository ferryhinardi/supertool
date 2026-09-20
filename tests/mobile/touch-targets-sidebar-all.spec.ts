import { expect, test } from '@playwright/test'

import { countActiveToolRoutes, getAllActiveRouteTargets } from './sidebar-audit-targets'
import {
  collectPageResult,
  expectAuditCompleted,
  type PageTouchTargetResult,
  SIDEBAR_ALL_BACKLOG_PATH,
  SIDEBAR_ALL_EVIDENCE_PATH,
  writeTouchTargetArtifacts,
} from './touch-target-audit.shared'

const activeRoutePages = getAllActiveRouteTargets()
const expectedPageCount = countActiveToolRoutes() + 2

test.use({
  browserName: 'chromium',
  hasTouch: true,
  isMobile: true,
  viewport: { width: 375, height: 667 },
})

test.describe.configure({ mode: 'serial', timeout: 45 * 60 * 1000 })

test('all active routes mobile touch-target audit', async ({ page }) => {
  expect(activeRoutePages).toHaveLength(expectedPageCount)

  const results: PageTouchTargetResult[] = []

  try {
    for (const target of activeRoutePages) {
      await test.step(`${target.kind}: ${target.title}`, async () => {
        results.push(await collectPageResult(page, target))
      })
    }
  } finally {
    writeTouchTargetArtifacts(results, {
      evidencePath: SIDEBAR_ALL_EVIDENCE_PATH,
      backlogPath: SIDEBAR_ALL_BACKLOG_PATH,
      auditDescription:
        'Playwright mobile touch-target audit for `/`, `/support`, and every active `/tools/*` route.',
      baseUrl: process.env.BASE_URL,
    })
  }

  expectAuditCompleted(results, expectedPageCount)
})
