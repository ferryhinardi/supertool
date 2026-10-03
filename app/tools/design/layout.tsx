import { DesignWorkspaceChrome } from '@/components/features/tools/DesignWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function DesignToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ mx: 'auto', w: 'full', maxW: '7xl' })}>
      <DesignWorkspaceChrome />
      {children}
    </div>
  )
}
