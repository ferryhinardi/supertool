'use client'

import { Shield } from 'lucide-react'
import { ToolFamilyNav } from '@/components/features/tools/ToolFamilyNav'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'
import { css } from '@/styled-system/css'

export function SecurityWorkspaceChrome() {
  return (
    <div
      className={css({
        position: 'sticky',
        top: { base: '20', md: '0' },
        zIndex: '30',
      })}
    >
      <WorkspaceHeader title="Security Tools" icon={Shield} accent="emerald" />
      <ToolFamilyNav category="security" />
    </div>
  )
}
