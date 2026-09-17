import { expect, test } from '@playwright/test'

/**
 * Regression suite for growth changes:
 * - Category hubs must not 404 (sitemap URLs)
 * - Soft support CTA present on high-intent tools
 */
const CATEGORY_HUBS = [
  '/tools/data',
  '/tools/development',
  '/tools/media',
  '/tools/productivity',
  '/tools/security',
  '/tools/finance',
  '/tools/design',
] as const

const SOFT_SUPPORT_TOOLS = [
  '/tools/productivity/case-converter',
  '/tools/data/json-beautify',
  '/tools/productivity/resume-builder',
  '/tools/productivity/text-summarizer',
  '/tools/productivity/ai-text-rewriter',
] as const

test.describe('Category hubs regression', () => {
  for (const path of CATEGORY_HUBS) {
    test(`${path} loads with hub heading and tool links`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `${path} HTTP status`).toBeLessThan(400)

      await expect(page.locator('h1').first()).toBeVisible()
      await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible()

      // At least one in-category tool card link
      const toolLinks = page.locator('main a[href^="/tools/"]')
      await expect(toolLinks.first()).toBeVisible()
      expect(await toolLinks.count()).toBeGreaterThan(0)
    })
  }
})

test.describe('Soft support CTA regression', () => {
  for (const path of SOFT_SUPPORT_TOOLS) {
    test(`${path} shows Support Us CTA to /support`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `${path} HTTP status`).toBeLessThan(400)

      const support = page.getByRole('link', { name: /Support Us/i }).first()
      await support.scrollIntoViewIfNeeded()
      await expect(support).toBeVisible()
      await expect(support).toHaveAttribute('href', '/support')
    })
  }
})

test.describe('Critical path smoke', () => {
  test('home page loads', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await expect(page.locator('body')).toBeVisible()
  })

  test('support page loads', async ({ page }) => {
    const response = await page.goto('/support', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('body')).toBeVisible()
  })
})
