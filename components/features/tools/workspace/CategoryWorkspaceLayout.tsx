import type { ReactNode } from 'react'
import type { ToolFamilyCategory } from '@/components/features/tools/ToolFamilyNav'
import { CategoryWorkspaceChrome } from '@/components/features/tools/workspace/CategoryWorkspaceChrome'
import { toolWorkspaceFrameClass } from '@/components/features/tools/workspace/tool-page-styles'

export interface CategoryWorkspaceLayoutProps {
  category: ToolFamilyCategory
  children: ReactNode
}

export function CategoryWorkspaceLayout({ category, children }: CategoryWorkspaceLayoutProps) {
  return (
    <div className={toolWorkspaceFrameClass}>
      <CategoryWorkspaceChrome category={category} />
      {children}
    </div>
  )
}
