import { DesignWorkspaceChrome } from '@/components/features/tools/DesignWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function DesignToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ w: 'full' })}>
      <DesignWorkspaceChrome />
      {children}
    </div>
  )
}
