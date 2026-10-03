import { expect, test } from '@playwright/test'

const dataTools = [
  { path: '/tools/data/csv-excel', title: 'CSV ↔ Excel Converter' },
  { path: '/tools/data/csv-merger', title: 'CSV Merger & Splitter' },
  { path: '/tools/data/date-formatter', title: 'Date Formatter & Parser' },
  { path: '/tools/data/json-beautify', title: 'JSON Beautifier & Formatter' },
  { path: '/tools/data/json-markdown-table', title: 'JSON to Markdown Table' },
  { path: '/tools/data/json-schema', title: 'JSON Schema Generator' },
  { path: '/tools/data/json-to-csv', title: 'JSON to CSV Converter' },
  { path: '/tools/data/markdown-table', title: 'Markdown Table Generator' },
  { path: '/tools/data/random-generator', title: 'Random Generator' },
  { path: '/tools/data/uuid-generator', title: 'UUID Generator & Validator' },
] as const

test.describe('data processing revamp', () => {
  test('json-to-csv keeps one content heading and stacks the workspace on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/tools/data/json-to-csv')

    const nav = page.getByRole('navigation', { name: 'Data processing tools' })
    await expect(nav).toHaveCount(1)
    await expect(nav.getByRole('link')).toHaveCount(10)
    await expect(nav.getByRole('link', { name: 'JSON to CSV Converter' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(
      'JSON to CSV Converter'
    )
    await expect(page.getByText('Valid', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'JSON Input' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'CSV Output Preview' })).toBeVisible()

    await page.setViewportSize({ width: 390, height: 844 })
    const inputBox = await page.getByRole('heading', { name: 'JSON Input' }).boundingBox()
    const outputBox = await page.getByRole('heading', { name: 'CSV Output Preview' }).boundingBox()
    if (!inputBox || !outputBox) {
      throw new Error('JSON and CSV panels were not measurable')
    }
    expect(outputBox.y).toBeGreaterThan(inputBox.y + inputBox.height - 8)
  })

  for (const tool of dataTools) {
    test(`${tool.path} uses the shared data header and family nav`, async ({ page }) => {
      await page.goto(tool.path)
      const nav = page.getByRole('navigation', { name: 'Data processing tools' })
      await expect(nav).toHaveCount(1)
      await expect(nav.getByRole('link', { name: tool.title })).toHaveAttribute(
        'aria-current',
        'page'
      )
      await expect(
        page.getByRole('main').getByRole('heading', { level: 1, name: tool.title })
      ).toBeVisible()
      await expect(page.getByRole('link', { name: 'Data Processing' }).first()).toHaveAttribute(
        'href',
        '/tools/data'
      )
    })
  }
})
