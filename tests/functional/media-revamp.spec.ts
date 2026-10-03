import { expect, test } from '@playwright/test'

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

const workflowPages = [
  { path: '/tools/media/image-optimizer', h1: 'Image Optimizer & Converter' },
  { path: '/tools/media/video-converter', h1: 'Video Converter & Compressor' },
  { path: '/tools/media/image-to-pdf', h1: 'Image to PDF Converter' },
  { path: '/tools/media/video-subtitle-combiner', h1: 'Video Subtitle Combiner' },
  { path: '/tools/media/meme-generator', h1: 'Meme Generator' },
  { path: '/tools/media/ai-image-caption', h1: 'AI Image Caption Generator' },
  { path: '/tools/media/image-format-converter', h1: 'Image Format Converter' },
  { path: '/tools/media/qr-code-scanner', h1: 'QR Code Scanner' },
  { path: '/tools/media/image-to-text', h1: 'Image to Text Converter' },
  { path: '/tools/media/svg-to-png', h1: 'SVG to PNG Converter' },
  { path: '/tools/media/background-remover', h1: 'Background Remover' },
] as const

async function expectNoPageOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  )
  expect(overflow).toBe(false)
}

test.describe('Media family revamp', () => {
  test('category hub keeps one family nav under the workspace header', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/tools/media')
    const nav = page.getByRole('navigation', { name: 'Media tools' })
    await expect(nav).toHaveCount(1)
    await expect(nav.getByRole('link')).toHaveCount(workflowPages.length)
    await expect(page.getByRole('heading', { level: 1, name: 'Media Tools' })).toHaveCount(1)
    await expect(page.locator('main h1')).toHaveCount(1)

    const headerBox = await page.locator('header').first().boundingBox()
    const navBox = await nav.boundingBox()
    expect(headerBox).not.toBeNull()
    expect(navBox).not.toBeNull()
    if (headerBox && navBox) {
      expect(navBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1)
    }
    await expectNoPageOverflow(page)
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-hub-desktop.png',
      fullPage: false,
    })
  })

  for (const tool of workflowPages) {
    test(`${tool.h1} uses the shared header once`, async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text())
      })

      const response = await page.goto(tool.path)
      expect(response?.status()).toBeLessThan(400)
      const nav = page.getByRole('navigation', { name: 'Media tools' })
      await expect(nav).toHaveCount(1)
      await expect(nav.getByRole('link', { name: tool.h1 })).toHaveAttribute('aria-current', 'page')
      await expect(page.getByRole('heading', { level: 1, name: tool.h1, exact: true })).toHaveCount(
        1
      )
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.getByRole('link', { name: 'Media Tools' })).toHaveAttribute(
        'href',
        '/tools/media'
      )

      const headerBox = await page.locator('header').first().boundingBox()
      const navBox = await nav.boundingBox()
      expect(headerBox).not.toBeNull()
      expect(navBox).not.toBeNull()
      if (headerBox && navBox) {
        expect(navBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1)
      }

      const unexpected = consoleErrors.filter(
        (entry) => !/rating stats|Failed to fetch|favicon|supabase/i.test(entry)
      )
      expect(unexpected).toEqual([])
    })
  }

  test('image optimizer accepts a keyboard upload and ignores a non-image', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/tools/media/image-optimizer')
    await expect(page.getByRole('button', { name: 'avif' })).toBeVisible()

    const zone = page.getByRole('button', { name: /Click to upload/i })
    await zone.focus()
    await expect(zone).toBeFocused()
    const box = await zone.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)

    const rejectedChooser = page.waitForEvent('filechooser')
    await page.keyboard.press('Enter')
    await (await rejectedChooser).setFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    })
    await expect(page.getByText('Images (0)')).toBeVisible()

    const acceptedChooser = page.waitForEvent('filechooser')
    await zone.focus()
    await page.keyboard.press('Enter')
    await (await acceptedChooser).setFiles({
      name: 'pixel.png',
      mimeType: 'image/png',
      buffer: TINY_PNG,
    })
    await expect(page.getByText('Images (1)')).toBeVisible()
    await expect(page.getByText('pixel.png')).toBeVisible()
    await expectNoPageOverflow(page)
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-image-optimizer-desktop.png',
      fullPage: false,
    })
  })

  test('image format converter rejects a non-image and previews a valid upload', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/tools/media/image-format-converter')
    const upload = page.getByRole('button', { name: 'Upload image file' })
    await upload.focus()
    await expect(upload).toBeFocused()

    const rejectedChooser = page.waitForEvent('filechooser')
    await page.keyboard.press('Enter')
    await (await rejectedChooser).setFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    })
    await expect(page.getByText('Please upload a valid image file')).toBeVisible()

    const acceptedChooser = page.waitForEvent('filechooser')
    await upload.focus()
    await page.keyboard.press('Enter')
    await (await acceptedChooser).setFiles({
      name: 'pixel.png',
      mimeType: 'image/png',
      buffer: TINY_PNG,
    })
    await expect(page.getByRole('button', { name: 'Convert Image' })).toBeVisible()
    await expectNoPageOverflow(page)
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-format-converter-desktop.png',
      fullPage: false,
    })
  })

  test('image optimizer, video converter, and meme generator fit a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    await page.goto('/tools/media/image-optimizer')
    const optimizerLink = page
      .getByRole('navigation', { name: 'Media tools' })
      .getByRole('link', { name: 'Image Optimizer & Converter' })
    const optimizerBox = await optimizerLink.boundingBox()
    expect(optimizerBox?.height ?? 0).toBeGreaterThanOrEqual(44)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Image Optimizer & Converter')
    await expectNoPageOverflow(page)
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-image-optimizer-mobile.png',
      fullPage: false,
    })

    await page.goto('/tools/media/video-converter')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Video Converter & Compressor')
    await expectNoPageOverflow(page)
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-video-converter-mobile.png',
      fullPage: false,
    })

    await page.goto('/tools/media/meme-generator')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meme Generator')
    await expectNoPageOverflow(page)
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-meme-generator-mobile.png',
      fullPage: false,
    })
  })

  test('qr scanner, image to pdf, and video converter stay in view on desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto('/tools/media/qr-code-scanner')
    await expect(page.getByRole('heading', { level: 1, name: 'QR Code Scanner' })).toBeVisible()
    await expect(page.getByText('Upload Image')).toBeVisible()
    await expectNoPageOverflow(page)
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-qr-scanner-desktop.png',
      fullPage: false,
    })

    await page.goto('/tools/media/image-to-pdf')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Image to PDF Converter' })
    ).toBeVisible()
    await expectNoPageOverflow(page)
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-image-to-pdf-desktop.png',
      fullPage: false,
    })

    await page.goto('/tools/media/video-converter')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Video Converter & Compressor' })
    ).toBeVisible()
    await expectNoPageOverflow(page)
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-video-converter-desktop.png',
      fullPage: false,
    })

    await page.goto('/tools/media/meme-generator')
    await expect(page.getByRole('heading', { level: 1, name: 'Meme Generator' })).toBeVisible()
    await page.screenshot({
      path: '/opt/cursor/artifacts/media-meme-generator-desktop.png',
      fullPage: false,
    })

    const firstLink = page
      .getByRole('navigation', { name: 'Media tools' })
      .getByRole('link')
      .first()
    await firstLink.focus()
    await expect(firstLink).toBeFocused()
  })
})
