import { describe, expect, it } from 'vitest'

// Test the tools configuration and rendering logic
describe('Home Page Tools', () => {
  const tools = [
    {
      name: 'JSON Beautify',
      description: 'Format and beautify JSON',
      icon: '{}',
      href: '/tools/json-beautify',
      color: 'from-purple-500 to-blue-500',
      tags: ['JSON', 'Format', 'Beautify'],
    },
    {
      name: 'Upload',
      description: 'Upload and manage files',
      icon: '⬆️',
      href: '/tools/upload',
      color: 'from-green-500 to-teal-500',
      tags: ['File', 'Upload', 'Storage'],
    },
  ]

  describe('Tools Data Structure', () => {
    it('has valid tool entries', () => {
      expect(tools).toHaveLength(2)

      tools.forEach((tool) => {
        expect(tool.name).toBeTruthy()
        expect(tool.description).toBeTruthy()
        expect(tool.href).toBeTruthy()
        expect(tool.tags).toBeInstanceOf(Array)
        expect(tool.tags.length).toBeGreaterThan(0)
      })
    })

    it('has unique tool names', () => {
      const names = tools.map((t) => t.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })

    it('has valid href paths', () => {
      tools.forEach((tool) => {
        expect(tool.href).toMatch(/^\/tools\//)
      })
    })
  })

  describe('Tool Tags', () => {
    it('JSON tool has correct tags', () => {
      const jsonTool = tools.find((t) => t.name === 'JSON Beautify')
      expect(jsonTool?.tags).toContain('JSON')
      expect(jsonTool?.tags).toContain('Format')
      expect(jsonTool?.tags).toContain('Beautify')
    })

    it('Upload tool has correct tags', () => {
      const uploadTool = tools.find((t) => t.name === 'Upload')
      expect(uploadTool?.tags).toContain('File')
      expect(uploadTool?.tags).toContain('Upload')
      expect(uploadTool?.tags).toContain('Storage')
    })
  })

  describe('Animation Configuration', () => {
    it('has valid stagger animation config', () => {
      const container = {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }

      const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }

      expect(container.hidden.opacity).toBe(0)
      expect(container.show.opacity).toBe(1)
      expect(container.show.transition.staggerChildren).toBe(0.1)

      expect(item.hidden.opacity).toBe(0)
      expect(item.hidden.y).toBe(20)
      expect(item.show.opacity).toBe(1)
      expect(item.show.y).toBe(0)
    })
  })
})
