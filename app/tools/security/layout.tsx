import { SecurityWorkspaceChrome } from '@/components/features/tools/SecurityWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function SecurityToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ w: 'full' })}>
      <SecurityWorkspaceChrome />
      {children}
    </div>
  )
}
