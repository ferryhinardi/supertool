import type { Tool, ToolCategory } from '../../lib/data/tools'
import { tools } from '../../lib/data/tools'

/** Matches `SIDEBAR_CATEGORIES` order in `components/layout/Sidebar.tsx`. */
export const SIDEBAR_CATEGORY_ORDER: ToolCategory[] = [
  'productivity',
  'design',
  'media',
  'finance',
  'security',
  'data',
  'development',
]

export interface SidebarAuditTarget {
  title: string
  href: string
  sourceFile: string
  kind: 'nav' | 'tool'
}

function sortCategoryTools(categoryTools: Tool[]): Tool[] {
  return [...categoryTools].sort((a, b) => {
    const aPriority = a.sidebarPriority === 'high' ? 0 : 1
    const bPriority = b.sidebarPriority === 'high' ? 0 : 1
    if (aPriority !== bPriority) return aPriority - bPriority
    return a.title.localeCompare(b.title)
  })
}

/** Every route linked from the app sidebar (Home, Support, and active tools by category). */
export function getSidebarPageTargets(): SidebarAuditTarget[] {
  const activeTools = tools.filter((tool) => !tool.comingSoon)
  const pages: SidebarAuditTarget[] = [
    {
      title: 'Home',
      href: '/',
      sourceFile: 'app/page.tsx',
      kind: 'nav',
    },
    {
      title: 'Support Us',
      href: '/support',
      sourceFile: 'app/support/page.tsx',
      kind: 'nav',
    },
  ]

  for (const categoryId of SIDEBAR_CATEGORY_ORDER) {
    const categoryTools = activeTools.filter((tool) => tool.category === categoryId)
    for (const tool of sortCategoryTools(categoryTools)) {
      pages.push({
        title: tool.title,
        href: tool.href,
        sourceFile: `app${tool.href}/page.tsx`,
        kind: 'tool',
      })
    }
  }

  return pages
}
