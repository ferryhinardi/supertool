import { test } from '@playwright/test'

import { getSidebarPageTargets } from './sidebar-audit-targets'
import {
  collectPageResult,
  expectAuditCompleted,
  type PageTouchTargetResult,
  SIDEBAR_ALL_BACKLOG_PATH,
  SIDEBAR_ALL_EVIDENCE_PATH,
  writeTouchTargetArtifacts,
} from './touch-target-audit.shared'

const sidebarPages = getSidebarPageTargets()

test.use({
  browserName: 'chromium',
  hasTouch: true,
  isMobile: true,
  viewport: { width: 375, height: 667 },
})

test.describe.configure({ mode: 'serial', timeout: 45 * 60 * 1000 })

test('all sidebar pages mobile touch-target audit', async ({ page }) => {
  const results: PageTouchTargetResult[] = []

  try {
    for (const target of sidebarPages) {
      await test.step(`${target.kind}: ${target.title}`, async () => {
        results.push(await collectPageResult(page, target))
      })
    }
  } finally {
    writeTouchTargetArtifacts(results, {
      evidencePath: SIDEBAR_ALL_EVIDENCE_PATH,
      backlogPath: SIDEBAR_ALL_BACKLOG_PATH,
      auditDescription:
        'Playwright mobile touch-target audit for every route linked from the app sidebar (Home, Support Us, and all active tools in sidebar category order).',
      baseUrl: process.env.BASE_URL,
    })
  }

  expectAuditCompleted(results, sidebarPages.length)
})
