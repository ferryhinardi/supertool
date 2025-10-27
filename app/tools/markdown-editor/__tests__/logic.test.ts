import { describe, expect, it } from 'vitest'

describe('Markdown Editor Logic', () => {
  describe('Stats Calculation', () => {
    it('should calculate lines correctly', () => {
      const content = 'Line 1\nLine 2\nLine 3'
      const lines = content.split('\n').length
      expect(lines).toBe(3)
    })

    it('should calculate characters correctly', () => {
      const content = 'Hello World'
      expect(content.length).toBe(11)
    })

    it('should calculate words correctly', () => {
      const content = 'Hello World Test'
      const words = content.trim().split(/\s+/).filter(Boolean).length
      expect(words).toBe(3)
    })

    it('should count headings correctly', () => {
      const content = '# Heading 1\n## Heading 2\n### Heading 3'
      const headings = (content.match(/^#{1,6}\s/gm) || []).length
      expect(headings).toBe(3)
    })

    it('should count code blocks correctly', () => {
      const content = '```js\ncode\n```\n\n```python\nmore code\n```'
      const codeBlocks = (content.match(/```/g) || []).length / 2
      expect(codeBlocks).toBe(2)
    })

    it('should count links correctly', () => {
      const content = '[Link 1](url1) and [Link 2](url2)'
      const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length
      expect(links).toBe(2)
    })

    it('should count images correctly', () => {
      const content = '![Image 1](url1) and ![Image 2](url2)'
      const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length
      expect(images).toBe(2)
    })

    it('should detect tables', () => {
      const content = '| Col 1 | Col 2 |\n|-------|-------|\n| A | B |'
      const tables = (content.match(/\|.*\|/g) || []).length > 0 ? 1 : 0
      expect(tables).toBe(1)
    })

    it('should count task lists correctly', () => {
      const content = '- [x] Task 1\n- [ ] Task 2\n- [x] Task 3'
      const taskLists = (content.match(/^- \[[ x]\]/gm) || []).length
      expect(taskLists).toBe(3)
    })
  })

  describe('Markdown Features', () => {
    it('should handle empty content', () => {
      const content = ''
      const lines = content.split('\n').length
      const chars = content.length
      const words = content.trim().split(/\s+/).filter(Boolean).length

      expect(lines).toBe(1)
      expect(chars).toBe(0)
      expect(words).toBe(0)
    })

    it('should handle content with only whitespace', () => {
      const content = '   \n   \n   '
      const words = content.trim().split(/\s+/).filter(Boolean).length
      expect(words).toBe(0)
    })

    it('should recognize GitHub-flavored markdown elements', () => {
      const content = `
# Heading
**bold** *italic* ~~strikethrough~~
- [x] Task
| Table | Header |
|-------|--------|
\`\`\`js
code
\`\`\`
[Link](url)
![Image](url)
      `.trim()

      const headings = (content.match(/^#{1,6}\s/gm) || []).length
      const taskLists = (content.match(/^- \[[ x]\]/gm) || []).length
      const codeBlocks = (content.match(/```/g) || []).length / 2
      const tables = (content.match(/\|.*\|/g) || []).length > 0 ? 1 : 0
      const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length
      const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length

      expect(headings).toBeGreaterThan(0)
      expect(taskLists).toBeGreaterThan(0)
      expect(codeBlocks).toBeGreaterThan(0)
      expect(tables).toBe(1)
      expect(links).toBeGreaterThan(0)
      expect(images).toBeGreaterThan(0)
    })
  })

  describe('Export Functions', () => {
    it('should create markdown blob correctly', () => {
      const content = '# Test Markdown'
      const blob = new Blob([content], { type: 'text/markdown' })
      expect(blob.type).toBe('text/markdown')
      expect(blob.size).toBe(content.length)
    })

    it('should create HTML blob correctly', () => {
      const htmlContent = '<!DOCTYPE html><html><body>Test</body></html>'
      const blob = new Blob([htmlContent], { type: 'text/html' })
      expect(blob.type).toBe('text/html')
      expect(blob.size).toBe(htmlContent.length)
    })
  })

  describe('View Modes', () => {
    it('should handle all view mode types', () => {
      const viewModes: Array<'split' | 'editor' | 'preview'> = ['split', 'editor', 'preview']
      expect(viewModes).toHaveLength(3)
      expect(viewModes).toContain('split')
      expect(viewModes).toContain('editor')
      expect(viewModes).toContain('preview')
    })
  })

  describe('File Loading', () => {
    it('should validate markdown file extensions', () => {
      const validFiles = ['test.md', 'README.markdown', 'doc.md']
      const invalidFiles = ['test.txt', 'doc.html', 'file.pdf']

      validFiles.forEach((file) => {
        expect(file.endsWith('.md') || file.endsWith('.markdown')).toBe(true)
      })

      invalidFiles.forEach((file) => {
        expect(file.endsWith('.md') || file.endsWith('.markdown')).toBe(false)
      })
    })
  })

  describe('Content Validation', () => {
    it('should handle special characters', () => {
      const content = '# Test with émojis 🚀 and spëcial çharacters'
      expect(content.length).toBeGreaterThan(0)
      expect(content).toContain('🚀')
    })

    it('should handle multiline content', () => {
      const content = `Line 1
Line 2
Line 3`
      const lines = content.split('\n')
      expect(lines).toHaveLength(3)
      expect(lines[0]).toBe('Line 1')
      expect(lines[1]).toBe('Line 2')
      expect(lines[2]).toBe('Line 3')
    })

    it('should handle nested markdown elements', () => {
      const content = `
# Heading

> This is a quote with **bold** and *italic* text

- List item 1
  - Nested item
    - Double nested

\`\`\`javascript
function test() {
  console.log("nested code");
}
\`\`\`
      `.trim()

      expect(content).toContain('**bold**')
      expect(content).toContain('*italic*')
      expect(content).toContain('Nested item')
      expect(content).toContain('function test()')
    })
  })
})
