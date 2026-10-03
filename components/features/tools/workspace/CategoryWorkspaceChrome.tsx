'use client'

import type { LucideIcon } from 'lucide-react'
import { Code2, FileJson, Film, Palette, PiggyBank, Shield, Zap } from 'lucide-react'
import { type ToolFamilyCategory, ToolFamilyNav } from '@/components/features/tools/ToolFamilyNav'
import { categoryWorkspace } from '@/components/features/tools/workspace/category-workspace'
import { toolWorkspaceStickyClass } from '@/components/features/tools/workspace/tool-page-styles'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'
import type { AccentName } from '@/lib/design-system'

const chromeIcon: Record<ToolFamilyCategory, { icon: LucideIcon; accent: AccentName }> = {
  data: { icon: FileJson, accent: 'violet' },
  productivity: { icon: Zap, accent: 'amber' },
  development: { icon: Code2, accent: 'blue' },
  media: { icon: Film, accent: 'orange' },
  security: { icon: Shield, accent: 'emerald' },
  finance: { icon: PiggyBank, accent: 'emerald' },
  design: { icon: Palette, accent: 'violet' },
}

export interface CategoryWorkspaceChromeProps {
  category: ToolFamilyCategory
}

export function CategoryWorkspaceChrome({ category }: CategoryWorkspaceChromeProps) {
  const config = categoryWorkspace[category]
  const icon = chromeIcon[category]

  return (
    <div className={toolWorkspaceStickyClass}>
      <WorkspaceHeader title={config.workspaceTitle} icon={icon.icon} accent={icon.accent} />
      <ToolFamilyNav category={category} />
    </div>
  )
}
