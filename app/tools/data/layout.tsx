import { ToolFamilyNav } from '@/components/features/tools/ToolFamilyNav'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'
import { css } from '@/styled-system/css'

export default function DataToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ mx: 'auto', w: 'full', maxW: '7xl' })}>
      <div
        className={css({
          position: 'sticky',
          top: { base: '20', md: '0' },
          zIndex: '30',
        })}
      >
        <WorkspaceHeader />
        <ToolFamilyNav />
      </div>
      {children}
    </div>
  )
}
