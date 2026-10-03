import { ToolFamilyNav } from '@/components/features/tools/ToolFamilyNav'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'
import { css } from '@/styled-system/css'

export default function DataToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ w: 'full' })}>
      <div
        className={css({
          position: 'sticky',
          top: { base: '20', md: '0' },
          zIndex: '30',
          mx: { base: '-2', sm: '-4', md: '-8', lg: '-10', xl: '-12' },
        })}
      >
        <WorkspaceHeader />
        <ToolFamilyNav />
      </div>
      {children}
    </div>
  )
}
