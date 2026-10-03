import { DevelopmentWorkspaceChrome } from '@/components/features/tools/DevelopmentWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function DevelopmentToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ mx: 'auto', w: 'full', maxW: '7xl' })}>
      <DevelopmentWorkspaceChrome />
      {children}
    </div>
  )
}
