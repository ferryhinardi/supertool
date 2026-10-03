import { expect, test } from '@playwright/test'

const workflowPages = [
  { path: '/tools/development/regex-tester', h1: 'Regex Tester' },
  { path: '/tools/development/api-tester', h1: 'API Request Tester' },
  { path: '/tools/development/cron-builder', h1: 'Cron Expression Builder' },
  { path: '/tools/development/sql-formatter', h1: 'SQL Formatter' },
  { path: '/tools/development/ai-command-explainer', h1: 'AI Command Explainer' },
  { path: '/tools/development/ip-lookup', h1: 'IP Address Lookup' },
] as const

test.describe('Development family revamp', () => {
  test('category hub keeps one family nav under the workspace header', async ({ page }) => {
    await page.goto('/tools/development')
    await expect(page.getByRole('navigation', { name: 'Development tools' })).toHaveCount(1)
    await expect(page.getByText('Developer Tools', { exact: true }).first()).toBeVisible()
    await expect(page.locator('main h1')).toHaveCount(1)
    const headerBox = await page.locator('header').first().boundingBox()
    const navBox = await page.getByRole('navigation', { name: 'Development tools' }).boundingBox()
    expect(headerBox).not.toBeNull()
    expect(navBox).not.toBeNull()
    if (headerBox && navBox) {
      expect(navBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1)
    }
  })

  for (const tool of workflowPages) {
    test(`${tool.h1} uses the shared header once`, async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text())
      })

      const response = await page.goto(tool.path)
      expect(response?.status()).toBeLessThan(400)
      await expect(page.getByRole('navigation', { name: 'Development tools' })).toHaveCount(1)
      await expect(page.getByRole('heading', { level: 1, name: tool.h1, exact: true })).toHaveCount(
        1
      )
      await expect(page.getByRole('link', { name: 'Developer Tools' })).toHaveAttribute(
        'href',
        '/tools/development'
      )

      const unexpected = consoleErrors.filter(
        (entry) => !/rating stats|Failed to fetch|favicon/i.test(entry)
      )
      expect(unexpected).toEqual([])
    })
  }

  test('regex tester matches text and stays within the viewport on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/tools/development/regex-tester')
    const navLink = page
      .getByRole('navigation', { name: 'Development tools' })
      .getByRole('link', { name: /^Regex Tester$/ })
    const box = await navLink.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)

    await page.getByLabel('Pattern').fill('foo')
    await page.getByLabel('Text to match against').fill('foo bar foo')
    await expect(page.getByText('2 matches found')).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    )
    expect(overflow).toBe(false)
    await page.screenshot({
      path: '/opt/cursor/artifacts/development-regex-mobile.png',
      fullPage: false,
    })
  })

  test('regex tester desktop workspace and keyboard focus on family nav', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/tools/development/regex-tester')
    await page.getByLabel('Pattern').fill('\\d+')
    await page.getByLabel('Text to match against').fill('order 42')
    await expect(page.getByText('1 match found')).toBeVisible()
    await page.screenshot({
      path: '/opt/cursor/artifacts/development-regex-desktop.png',
      fullPage: false,
    })

    await page.goto('/tools/development/api-tester')
    await expect(page.getByRole('heading', { level: 1, name: 'API Request Tester' })).toBeVisible()
    await page.screenshot({
      path: '/opt/cursor/artifacts/development-api-tester-desktop.png',
      fullPage: false,
    })

    await page.goto('/tools/development/cron-builder')
    await expect(page.getByText('Generated Expression')).toBeVisible()
    await page.screenshot({
      path: '/opt/cursor/artifacts/development-cron-builder-desktop.png',
      fullPage: false,
    })

    const firstLink = page
      .getByRole('navigation', { name: 'Development tools' })
      .getByRole('link')
      .first()
    await firstLink.focus()
    await expect(firstLink).toBeFocused()
  })
})
