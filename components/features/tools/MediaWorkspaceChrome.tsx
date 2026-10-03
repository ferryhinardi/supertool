'use client'

import { Film } from 'lucide-react'
import { ToolFamilyNav } from '@/components/features/tools/ToolFamilyNav'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'
import { css } from '@/styled-system/css'

export function MediaWorkspaceChrome() {
  return (
    <div
      className={css({
        position: 'sticky',
        top: { base: '20', md: '0' },
        zIndex: '30',
        mx: { base: '-2', sm: '-4', md: '-8', lg: '-10', xl: '-12' },
      })}
    >
      <WorkspaceHeader title="Media Tools" icon={Film} accent="orange" />
      <ToolFamilyNav category="media" />
    </div>
  )
}
