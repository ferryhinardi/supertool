import { FinanceWorkspaceChrome } from '@/components/features/tools/FinanceWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function FinanceToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ w: 'full' })}>
      <FinanceWorkspaceChrome />
      {children}
    </div>
  )
}
