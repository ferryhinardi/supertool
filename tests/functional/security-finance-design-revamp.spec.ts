import { expect, type Page, test } from '@playwright/test'

type FamilyTool = {
  path: string
  h1: string
  nav: string
}

const families = [
  {
    id: 'security',
    hub: '/tools/security',
    hubTitle: 'Security Tools',
    navName: 'Security tools',
    backLabel: 'Security Tools',
    tools: [
      {
        path: '/tools/security/password-generator',
        h1: 'Password Generator',
        nav: 'Password Generator',
      },
      {
        path: '/tools/security/password-strength',
        h1: 'Password Strength Analyzer',
        nav: 'Password Strength Analyzer',
      },
      {
        path: '/tools/security/hash-generator',
        h1: 'Hash Generator & Verifier',
        nav: 'Hash Generator & Verifier',
      },
      {
        path: '/tools/security/base64',
        h1: 'Base64 Encoder & Decoder',
        nav: 'Base64 Encoder & Decoder',
      },
      {
        path: '/tools/security/encryption-tool',
        h1: 'Encryption & Decryption Tool',
        nav: 'Encryption & Decryption Tool',
      },
      {
        path: '/tools/security/file-verifier',
        h1: 'File Integrity Verifier',
        nav: 'File Integrity Verifier',
      },
      {
        path: '/tools/security/ssl-checker',
        h1: 'SSL/TLS Certificate Checker',
        nav: 'SSL/TLS Certificate Checker',
      },
      {
        path: '/tools/security/steganography',
        h1: 'Text Steganography Tool',
        nav: 'Text Steganography Tool',
      },
    ] satisfies FamilyTool[],
  },
  {
    id: 'finance',
    hub: '/tools/finance',
    hubTitle: 'Finance Tools',
    navName: 'Finance tools',
    backLabel: 'Finance Tools',
    tools: [
      {
        path: '/tools/finance/currency-converter',
        h1: 'Currency Converter',
        nav: 'Currency Converter',
      },
      {
        path: '/tools/finance/loan-calculator',
        h1: 'Loan Calculator',
        nav: 'Loan & Mortgage Calculator',
      },
      {
        path: '/tools/finance/percentage-calculator',
        h1: 'Percentage Calculator',
        nav: 'Percentage Calculator',
      },
      {
        path: '/tools/finance/split-bill',
        h1: 'Split Bill Calculator',
        nav: 'Split Bill Calculator',
      },
      { path: '/tools/finance/tip-calculator', h1: 'Tip Calculator', nav: 'Tip Calculator' },
      { path: '/tools/finance/split-bill/history', h1: 'Bill History', nav: '' },
    ] satisfies FamilyTool[],
  },
  {
    id: 'design',
    hub: '/tools/design',
    hubTitle: 'Design & Visual Tools',
    navName: 'Design tools',
    backLabel: 'Design & Visual Tools',
    tools: [
      {
        path: '/tools/design/gradient-generator',
        h1: 'Gradient Generator',
        nav: 'Gradient Generator',
      },
      {
        path: '/tools/design/color-picker',
        h1: 'Color Picker & Palette Generator',
        nav: 'Color Picker & Palette Generator',
      },
      {
        path: '/tools/design/color-contrast',
        h1: 'Color Contrast Checker',
        nav: 'Color Contrast Checker',
      },
      {
        path: '/tools/design/device-mockup',
        h1: 'Create Professional Device Mockups',
        nav: 'Device Mockup Generator',
      },
      {
        path: '/tools/design/favicon-generator',
        h1: 'Favicon Generator',
        nav: 'Favicon Generator',
      },
      {
        path: '/tools/design/icon-search',
        h1: 'Search 1000+ Free Icons',
        nav: 'Icon Search & Download Hub',
      },
      {
        path: '/tools/design/image-metadata',
        h1: 'Image Metadata Viewer',
        nav: 'Image Metadata Viewer',
      },
      { path: '/tools/design/logo-maker', h1: 'Create Your Logo in Minutes', nav: 'Logo Maker' },
      { path: '/tools/design/photo-editor', h1: 'AI Photo Editor', nav: 'AI Photo Editor' },
      {
        path: '/tools/design/placeholder-generator',
        h1: 'Placeholder Image Generator',
        nav: 'Placeholder Image Generator',
      },
      {
        path: '/tools/design/screenshot-diff',
        h1: 'Screenshot Diff Tool',
        nav: 'Screenshot Diff Tool',
      },
      {
        path: '/tools/design/signature-generator',
        h1: 'Digital Signature Generator',
        nav: 'Digital Signature Generator',
      },
      {
        path: '/tools/design/social-media-resizer',
        h1: 'Social Media Image Resizer',
        nav: 'Social Media Image Resizer',
      },
      {
        path: '/tools/design/svg-optimizer',
        h1: 'SVG Optimizer & Editor',
        nav: 'SVG Optimizer & Editor',
      },
    ] satisfies FamilyTool[],
  },
] as const

async function expectNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  )
  expect(overflow).toBe(false)
}

function ignoreConsoleNoise(entry: string) {
  return /rating stats|Failed to fetch|favicon|supabase|exchange rate|ERR_FAILED|net::/i.test(entry)
}

for (const family of families) {
  test.describe(`${family.id} family revamp`, () => {
    test('category hub keeps one family nav', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(family.hub)
      const nav = page.getByRole('navigation', { name: family.navName })
      await expect(nav).toHaveCount(1)
      const catalogCount = family.tools.filter((tool) => tool.nav.length > 0).length
      await expect(nav.getByRole('link')).toHaveCount(catalogCount)
      await expect(page.getByRole('heading', { level: 1, name: family.hubTitle })).toHaveCount(1)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expectNoPageOverflow(page)
      await page.screenshot({
        path: `/opt/cursor/artifacts/${family.id}-hub-desktop.png`,
        fullPage: false,
      })
    })

    for (const tool of family.tools) {
      test(`${tool.h1} uses one shared header`, async ({ page }) => {
        const consoleErrors: string[] = []
        page.on('console', (message) => {
          if (message.type() === 'error') consoleErrors.push(message.text())
        })

        const response = await page.goto(tool.path)
        expect(response?.status()).toBeLessThan(400)
        const nav = page.getByRole('navigation', { name: family.navName })
        await expect(nav).toHaveCount(1)
        if (tool.nav) {
          await expect(nav.getByRole('link', { name: tool.nav, exact: true })).toHaveAttribute(
            'aria-current',
            'page'
          )
        }
        await expect(
          page.getByRole('heading', { level: 1, name: tool.h1, exact: true })
        ).toHaveCount(1)
        await expect(page.locator('main h1')).toHaveCount(1)
        await expect(page.getByRole('link', { name: family.backLabel })).toHaveAttribute(
          'href',
          family.hub
        )
        await expectNoPageOverflow(page)

        const unexpected = consoleErrors.filter((entry) => !ignoreConsoleNoise(entry))
        expect(unexpected).toEqual([])
      })
    }
  })
}

test('finance and design canonical workflows work on desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/tools/finance/currency-converter')
  const amount = page.getByRole('textbox', { name: 'From', exact: true })
  await amount.fill('25')
  await expect(amount).toHaveValue('25')
  await expect(page.getByRole('textbox', { name: 'To', exact: true })).not.toHaveValue('')
  await page.screenshot({
    path: '/opt/cursor/artifacts/finance-currency-desktop.png',
    fullPage: false,
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/tools/finance/tip-calculator')
  await page.getByLabel('Bill amount in dollars').fill('80')
  await page.getByRole('button', { name: '20 percent tip' }).click()
  await expect(page.getByText('$16.00', { exact: true })).toBeVisible()
  await expectNoPageOverflow(page)
  await page.screenshot({
    path: '/opt/cursor/artifacts/finance-tip-mobile.png',
    fullPage: false,
  })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/tools/design/gradient-generator')
  await expect(page.getByRole('heading', { name: 'Preview', level: 2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Gradient Controls', level: 2 })).toBeVisible()
  await page.screenshot({
    path: '/opt/cursor/artifacts/design-gradient-desktop.png',
    fullPage: false,
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/tools/security/password-generator')
  await page.getByRole('button', { name: 'Generate Password' }).click()
  await expect(page.getByRole('button', { name: 'Copy password to clipboard' })).toBeVisible()
  await expectNoPageOverflow(page)
  await page.screenshot({
    path: '/opt/cursor/artifacts/security-password-mobile.png',
    fullPage: false,
  })
})
