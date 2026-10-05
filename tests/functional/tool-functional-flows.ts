import { expect, type Page } from '@playwright/test'

import type { SidebarAuditTarget } from '../mobile/sidebar-audit-targets'

export type ToolFunctionalFlow = (page: Page, target: SidebarAuditTarget) => Promise<void>

export function pageContentHeading(page: Page) {
  return page.locator('main').getByRole('heading', { level: 1 }).first()
}

const HEADING_ALIASES: Record<string, string[]> = {
  '/tools/productivity/privacy-policy-generator': ['legal', 'privacy', 'policy', 'document'],
}

export async function assertToolHeading(page: Page, title: string, href?: string) {
  const heading = pageContentHeading(page)
  await expect(heading).toBeVisible()
  const headingText = await heading.innerText()
  const titleTokens = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2)
  const headingLower = headingText.toLowerCase()
  const aliasTokens = href ? (HEADING_ALIASES[href] ?? []) : []
  const matched =
    titleTokens.some((token) => headingLower.includes(token)) ||
    aliasTokens.some((token) => headingLower.includes(token))
  expect(
    matched,
    `Expected page h1 to relate to "${title}", got "${headingText.replace(/\s+/g, ' ').trim()}"`
  ).toBe(true)
}

async function assertInteractiveSurface(page: Page) {
  const surface = page.locator('main').first()
  if (await surface.count()) {
    const controls = surface.locator(
      'button, textarea, input, select, [role="button"], [contenteditable="true"]'
    )
    expect(await controls.count()).toBeGreaterThan(0)
    return
  }

  const homeControls = page.locator(
    'a[href^="/tools/"]:visible, button:visible, input:visible, textarea:visible'
  )
  expect(await homeControls.count()).toBeGreaterThan(0)
}

export async function defaultToolFunctionalFlow(page: Page, target: SidebarAuditTarget) {
  await assertToolHeading(page, target.title, target.href)
  await assertInteractiveSurface(page)
}

const flows: Record<string, ToolFunctionalFlow> = {
  '/': async (page) => {
    await expect(pageContentHeading(page)).toContainText(/SuperTool/i)
    await expect(page.locator('a[href^="/tools/"]').first()).toBeVisible()
  },
  '/support': async (page) => {
    await expect(page.locator('main').getByRole('heading', { level: 1 })).toContainText(
      /Support SuperTool/i
    )
    await expect(page.getByText(/Fund hosting/i)).toBeVisible()
  },
  '/tools/security/base64': async (page, target) => {
    await assertToolHeading(page, target.title, target.href)
    await page.getByRole('textbox', { name: 'Text to encode' }).fill('Hello')
    await page.getByRole('button', { name: /Encode to Base64/i }).click()
    await expect(page.getByRole('textbox', { name: 'Base64 encoded output' })).not.toHaveValue('')
  },
  '/tools/development/url-encoder': async (page, target) => {
    await assertToolHeading(page, target.title, target.href)
    await page.getByRole('textbox').first().fill('hello world')
    await expect(page.getByRole('textbox').nth(1)).not.toHaveValue('')
  },
}

export function getToolFunctionalFlow(href: string): ToolFunctionalFlow {
  return flows[href] ?? defaultToolFunctionalFlow
}
