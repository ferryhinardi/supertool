'use client'

import { Palette } from 'lucide-react'
import { ToolFamilyNav } from '@/components/features/tools/ToolFamilyNav'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'
import { css } from '@/styled-system/css'

export function DesignWorkspaceChrome() {
  return (
    <div
      className={css({
        position: 'sticky',
        top: { base: '20', md: '0' },
        zIndex: '30',
      })}
    >
      <WorkspaceHeader title="Design & Visual Tools" icon={Palette} accent="violet" />
      <ToolFamilyNav category="design" />
    </div>
  )
}
