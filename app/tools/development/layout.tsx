import { DevelopmentWorkspaceChrome } from '@/components/features/tools/DevelopmentWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function DevelopmentToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ w: 'full' })}>
      <DevelopmentWorkspaceChrome />
      {children}
    </div>
  )
}
