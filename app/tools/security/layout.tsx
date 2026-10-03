import { SecurityWorkspaceChrome } from '@/components/features/tools/SecurityWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function SecurityToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ mx: 'auto', w: 'full', maxW: '7xl' })}>
      <SecurityWorkspaceChrome />
      {children}
    </div>
  )
}
