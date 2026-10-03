'use client'

import { Code2 } from 'lucide-react'
import { ToolFamilyNav } from '@/components/features/tools/ToolFamilyNav'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'
import { css } from '@/styled-system/css'

export function DevelopmentWorkspaceChrome() {
  return (
    <div
      className={css({
        position: 'sticky',
        top: { base: '20', md: '0' },
        zIndex: '30',
      })}
    >
      <WorkspaceHeader title="Developer Tools" icon={Code2} accent="blue" />
      <ToolFamilyNav category="development" />
    </div>
  )
}
