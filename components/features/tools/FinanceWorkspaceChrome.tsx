'use client'

import { PiggyBank } from 'lucide-react'
import { ToolFamilyNav } from '@/components/features/tools/ToolFamilyNav'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'
import { css } from '@/styled-system/css'

export function FinanceWorkspaceChrome() {
  return (
    <div
      className={css({
        position: 'sticky',
        top: { base: '20', md: '0' },
        zIndex: '30',
      })}
    >
      <WorkspaceHeader title="Finance Tools" icon={PiggyBank} accent="emerald" />
      <ToolFamilyNav category="finance" />
    </div>
  )
}
