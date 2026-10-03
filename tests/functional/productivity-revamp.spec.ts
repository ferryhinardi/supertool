import { expect, test } from '@playwright/test'

const workflowPages = [
  { path: '/tools/productivity/case-converter', h1: 'Case Converter' },
  { path: '/tools/productivity/word-counter', h1: 'Word Counter Pro' },
  { path: '/tools/productivity/age-calculator', h1: 'Age Calculator' },
  { path: '/tools/productivity/pomodoro', h1: 'Pomodoro Timer' },
  { path: '/tools/productivity/resume-builder', h1: 'Resume Builder' },
  { path: '/tools/productivity/batch-rename', h1: 'Batch File Renamer' },
  { path: '/tools/productivity/daily-note', h1: 'Daily Note Generator' },
  { path: '/tools/productivity/markdown-editor', h1: 'Markdown Editor' },
] as const

test.describe('Productivity family revamp', () => {
  test('category hub keeps one family nav under the workspace header', async ({ page }) => {
    await page.goto('/tools/productivity')
    await expect(page.getByRole('navigation', { name: 'Productivity tools' })).toHaveCount(1)
    await expect(page.getByText('Productivity', { exact: true }).first()).toBeVisible()
    await expect(page.locator('main h1')).toHaveCount(1)
    const headerBox = await page.locator('header').first().boundingBox()
    const navBox = await page.getByRole('navigation', { name: 'Productivity tools' }).boundingBox()
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
      await expect(page.getByRole('navigation', { name: 'Productivity tools' })).toHaveCount(1)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.locator('main h1')).toHaveText(tool.h1)
      await expect(page.getByRole('link', { name: 'Productivity Tools' })).toHaveAttribute(
        'href',
        '/tools/productivity'
      )

      const unexpected = consoleErrors.filter(
        (entry) => !/rating stats|Failed to fetch/i.test(entry)
      )
      expect(unexpected).toEqual([])
    })
  }

  test('case converter converts text on a phone-sized viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/tools/productivity/case-converter')
    const navLink = page.getByRole('link', { name: /^Case Converter$/ })
    const box = await navLink.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)

    await page.getByLabel('Input text').fill('Hello World')
    await expect(page.getByText('helloWorld').first()).toBeVisible()
    await page.screenshot({
      path: '/opt/cursor/artifacts/productivity-case-converter-mobile.png',
      fullPage: false,
    })
  })

  test('case converter desktop workspace shows the primary result', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/tools/productivity/case-converter')
    await page.getByLabel('Input text').fill('Hello World')
    await expect(page.getByText('helloWorld').first()).toBeVisible()
    await page.screenshot({
      path: '/opt/cursor/artifacts/productivity-case-converter-desktop.png',
      fullPage: false,
    })
    await page.goto('/tools/productivity')
    await page.screenshot({
      path: '/opt/cursor/artifacts/productivity-hub-desktop.png',
      fullPage: false,
    })
  })
})
