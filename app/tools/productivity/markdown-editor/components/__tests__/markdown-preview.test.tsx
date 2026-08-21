import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownPreview } from '../markdown-preview'

const GFM_TABLE = ['| a | b |', '| --- | --- |', '| 1 | 2 |'].join('\n')

/**
 * Renders and waits for the client-side DOMPurify import to land, so assertions
 * run against the sanitized output rather than the first pre-hydration pass.
 */
async function renderPreview(content: string) {
  const { container } = render(<MarkdownPreview content={content} />)
  await waitFor(() => {
    expect(container.querySelector('.markdown-preview')).toBeInTheDocument()
  })
  return container
}

const scrollContainers = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.markdown-table-scroll'))

describe('MarkdownPreview table scroll containers', () => {
  it('wraps a markdown table in a scroll container', async () => {
    const container = await renderPreview(GFM_TABLE)

    await waitFor(() => {
      expect(scrollContainers(container)).toHaveLength(1)
    })
    expect(scrollContainers(container)[0].firstElementChild?.tagName).toBe('TABLE')
  })

  it('wraps sibling tables independently', async () => {
    const container = await renderPreview(`${GFM_TABLE}\n\ntext between\n\n${GFM_TABLE}`)

    await waitFor(() => {
      expect(scrollContainers(container)).toHaveLength(2)
    })
  })

  it('leaves content without tables untouched', async () => {
    const container = await renderPreview('Just a paragraph.')

    await waitFor(() => {
      expect(container.querySelector('p')).toBeInTheDocument()
    })
    expect(scrollContainers(container)).toHaveLength(0)
  })

  // Regression: a lazy /<table>([\s\S]*?)<\/table>/ match ends at the INNER
  // </table>, so the closing </div> was emitted inside the outer table and its
  // </table> was orphaned, making the browser restructure the whole block.
  it('wraps only the outer table when tables are nested', async () => {
    const nested = [
      '<table>',
      '<tr><td>',
      '<table><tr><td>inner cell</td></tr></table>',
      '</td></tr>',
      '</table>',
    ].join('')

    const container = await renderPreview(nested)

    await waitFor(() => {
      expect(container.querySelectorAll('table').length).toBeGreaterThanOrEqual(2)
    })

    const wrappers = scrollContainers(container)
    expect(wrappers).toHaveLength(1)

    // The outer table must be the wrapper's own child, with the inner table still
    // nested inside it - not hoisted out by parser recovery.
    const outerTable = wrappers[0].firstElementChild
    expect(outerTable?.tagName).toBe('TABLE')
    expect(outerTable?.querySelector('table')).not.toBeNull()

    // No table may sit outside the wrapper.
    for (const table of Array.from(container.querySelectorAll('table'))) {
      expect(wrappers[0].contains(table)).toBe(true)
    }
  })
})
